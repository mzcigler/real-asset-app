import AddTaskModal from '@/components/AddTaskModal';
import FileItem from '@/components/FileItem';
import TaskItem from '@/components/TaskItem';
import { TaskType } from '@/components/types';
import UploadExtractPopup from '@/components/UploadExtractPopup';
import { supabase } from '@/lib/supabase';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type DBTask = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  file_id: string;
};

type FileRecord = {
  id: string;
  file_name: string;
  file_path: string;
};

type Section = 'tasks' | 'files';

function dbTaskToTaskType(t: DBTask): TaskType {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    dueDate: t.due_date ? new Date(t.due_date) : null,
  };
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState('');
  const [tasks, setTasks] = useState<DBTask[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('tasks');
  const [uploadVisible, setUploadVisible] = useState(false);

  const [addTaskVisible, setAddTaskVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: property } = await supabase
        .from('properties')
        .select('name')
        .eq('id', id)
        .single();

      if (property) setPropertyName(property.name);

      const { data: fileData } = await supabase
        .from('files')
        .select('id, file_name, file_path')
        .eq('property_id', id);

      const fetchedFiles: FileRecord[] = fileData || [];
      setFiles(fetchedFiles);

      if (fetchedFiles.length > 0) {
        const fileIds = fetchedFiles.map((f) => f.id);
        const { data: taskData } = await supabase
          .from('tasks')
          .select('id, title, description, due_date, file_id')
          .in('file_id', fileIds);

        setTasks(taskData || []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to load property data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Find or create a hidden __manual__ file record to hold manually added tasks
  const getOrCreateManualFileId = async (): Promise<string | null> => {
    const { data: existing } = await supabase
      .from('files')
      .select('id')
      .eq('property_id', id)
      .eq('file_name', '__manual__')
      .maybeSingle();

    if (existing) return existing.id;

    const { data: created } = await supabase
      .from('files')
      .insert({ property_id: id, file_name: '__manual__', file_path: '' })
      .select('id')
      .single();

    return created?.id ?? null;
  };

  const handleAddTask = async (title: string, description: string, dueDate: Date | null) => {
    const fileId = await getOrCreateManualFileId();
    if (!fileId) throw new Error('Could not get file id');

    const dueDateStr = dueDate ? dueDate.toISOString().slice(0, 10) : null;

    const { data, error } = await supabase
      .from('tasks')
      .insert({ file_id: fileId, title, description: description || null, due_date: dueDateStr })
      .select('id, title, description, due_date, file_id')
      .single();

    if (error) throw error;

    setTasks((prev) => [...prev, data]);
    setAddTaskVisible(false);
  };

  const handleUpdateTask = async (taskId: string, updated: TaskType) => {
    const dueDateStr = updated.dueDate ? updated.dueDate.toISOString().slice(0, 10) : null;

    const { error } = await supabase
      .from('tasks')
      .update({ title: updated.title, description: updated.description ?? null, due_date: dueDateStr })
      .eq('id', taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, title: updated.title, description: updated.description ?? null, due_date: dueDateStr }
            : t
        )
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleOpenFile = async (filePath: string) => {
    try {
      const { data } = await supabase.storage.from('user_files').createSignedUrl(filePath, 60);
      if (data?.signedUrl) await WebBrowser.openBrowserAsync(data.signedUrl);
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from('user_files').remove([filePath]);
    await supabase.from('tasks').delete().eq('file_id', fileId);
    await supabase.from('files').delete().eq('id', fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setTasks((prev) => prev.filter((t) => t.file_id !== fileId));
  };

  const visibleFiles = files.filter((f) => f.file_name !== '__manual__');

  return (
    <>
      <Stack.Screen options={{ title: propertyName || 'Property' }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        <View style={{ padding: 16, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 480 }}>
          {/* Section tabs + add button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                backgroundColor: '#e5e7eb',
                borderRadius: 10,
                padding: 4,
              }}
            >
              {(['tasks', 'files'] as Section[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSection(s)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: section === s ? 'white' : 'transparent',
                  }}
                >
                  <Text style={{ fontWeight: section === s ? '600' : '400', color: section === s ? '#111827' : '#6b7280' }}>
                    {s === 'tasks' ? `Tasks (${tasks.length})` : `Files (${visibleFiles.length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => section === 'tasks' ? setAddTaskVisible(true) : setUploadVisible(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#15803d',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="add" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : section === 'tasks' ? (
            <>
              {tasks.length === 0 && (
                <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16, marginBottom: 16 }}>
                  No tasks yet.
                </Text>
              )}
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={dbTaskToTaskType(task)}
                  onUpdate={(updated) => handleUpdateTask(task.id, updated)}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </>
          ) : (
            <>
              {visibleFiles.length === 0 && (
                <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16, marginBottom: 16 }}>
                  No files yet.
                </Text>
              )}
              {visibleFiles.map((file) => (
                <FileItem
                  key={file.id}
                  fileName={file.file_name}
                  onOpen={() => handleOpenFile(file.file_path)}
                  onDelete={() => handleDeleteFile(file.id, file.file_path)}
                />
              ))}
            </>
          )}
        </View>
        </View>
      </ScrollView>

      <AddTaskModal
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
        onAdd={handleAddTask}
      />

      <UploadExtractPopup
        visible={uploadVisible}
        userId={userId!}
        initialPropertyId={id}
        onClose={() => { setUploadVisible(false); loadData(); }}
      />
    </>
  );
}
