import AddTaskModal from '@/components/AddTaskModal';
import FileItem from '@/components/FileItem';
import TaskItem from '@/components/TaskItem';
import { TaskType } from '@/components/types';
import UploadExtractPopup from '@/components/UploadExtractPopup';
import { supabase } from '@/lib/supabase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

function sortTasks<T extends { due_date: string | null }>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}

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

  // Task selection
  const [taskSelectionMode, setTaskSelectionMode] = useState(false);
  const [taskSelectedIds, setTaskSelectedIds] = useState<string[]>([]);
  const [pendingDeleteTaskIds, setPendingDeleteTaskIds] = useState<string[]>([]);

  // File selection
  const [fileSelectionMode, setFileSelectionMode] = useState(false);
  const [fileSelectedIds, setFileSelectedIds] = useState<string[]>([]);
  const [pendingDeleteFileIds, setPendingDeleteFileIds] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    if (id) loadData();
  }, [id]);

  // Clear selection when switching tabs
  useEffect(() => {
    setTaskSelectionMode(false);
    setTaskSelectedIds([]);
    setFileSelectionMode(false);
    setFileSelectedIds([]);
  }, [section]);

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

        setTasks(sortTasks(taskData || []));
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to load property data:', err);
    } finally {
      setLoading(false);
    }
  };

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

    setTasks((prev) => sortTasks([...prev, data]));
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
        sortTasks(prev.map((t) =>
          t.id === taskId
            ? { ...t, title: updated.title, description: updated.description ?? null, due_date: dueDateStr }
            : t
        ))
      );
    }
  };

  // Task selection handlers
  const handleEnterTaskSelectionMode = (id: string) => {
    setTaskSelectionMode(true);
    setTaskSelectedIds([id]);
  };

  const handleToggleTaskSelect = (id: string) => {
    setTaskSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteTasksConfirm = async () => {
    if (pendingDeleteTaskIds.length === 0) return;
    await supabase.from('tasks').delete().in('id', pendingDeleteTaskIds);
    setTasks((prev) => prev.filter((t) => !pendingDeleteTaskIds.includes(t.id)));
    setPendingDeleteTaskIds([]);
    setTaskSelectedIds([]);
    setTaskSelectionMode(false);
  };

  // File selection handlers
  const handleEnterFileSelectionMode = (id: string) => {
    setFileSelectionMode(true);
    setFileSelectedIds([id]);
  };

  const handleToggleFileSelect = (id: string) => {
    setFileSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteFilesConfirm = async () => {
    if (pendingDeleteFileIds.length === 0) return;
    const filesToDelete = files.filter((f) => pendingDeleteFileIds.includes(f.id));
    await Promise.all(
      filesToDelete.map((f) => supabase.storage.from('user_files').remove([f.file_path]))
    );
    await supabase.from('tasks').delete().in('file_id', pendingDeleteFileIds);
    await supabase.from('files').delete().in('id', pendingDeleteFileIds);
    setFiles((prev) => prev.filter((f) => !pendingDeleteFileIds.includes(f.id)));
    setTasks((prev) => prev.filter((t) => !pendingDeleteFileIds.includes(t.file_id)));
    setPendingDeleteFileIds([]);
    setFileSelectedIds([]);
    setFileSelectionMode(false);
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from('user_files').download(filePath);

      if (error || !data) {
        console.error('Download error:', error);
        return;
      }

      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data);
      });

      const localUri = (FileSystem.cacheDirectory ?? '') + fileName;
      await FileSystem.writeAsStringAsync(localUri, base64, { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri);
      } else {
        console.warn('Sharing is not available on this device');
      }
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  const visibleFiles = files.filter((f) => f.file_name !== '__manual__');
  const activeSelectionMode = section === 'tasks' ? taskSelectionMode : fileSelectionMode;
  const activeSelectedIds = section === 'tasks' ? taskSelectedIds : fileSelectedIds;

  const handleCancelSelection = () => {
    if (section === 'tasks') {
      setTaskSelectionMode(false);
      setTaskSelectedIds([]);
    } else {
      setFileSelectionMode(false);
      setFileSelectedIds([]);
    }
  };

  const handleDeleteSelected = () => {
    if (section === 'tasks') {
      if (taskSelectedIds.length > 0) setPendingDeleteTaskIds(taskSelectedIds);
    } else {
      if (fileSelectedIds.length > 0) setPendingDeleteFileIds(fileSelectedIds);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: propertyName || 'Property' }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
        <View style={{ padding: 16, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 480 }}>
          {/* Section tabs + action buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 10, padding: 4 }}>
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

            {activeSelectionMode ? (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={handleCancelSelection}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f3f4f6' }}
                >
                  <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteSelected}
                  disabled={activeSelectedIds.length === 0}
                  style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: activeSelectedIds.length > 0 ? '#dc2626' : '#fca5a5' }}
                >
                  <Text style={{ fontSize: 13, color: 'white', fontWeight: '600' }}>
                    Delete{activeSelectedIds.length > 0 ? ` (${activeSelectedIds.length})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => section === 'tasks' ? setAddTaskVisible(true) : setUploadVisible(true)}
                style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center' }}
              >
                <MaterialIcons name="add" size={22} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
          ) : section === 'tasks' ? (
            <>
              {tasks.length === 0 && (
                <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16, marginBottom: 16 }}>No tasks yet.</Text>
              )}
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={dbTaskToTaskType(task)}
                  onUpdate={(updated) => handleUpdateTask(task.id, updated)}
                  onDelete={() => setPendingDeleteTaskIds([task.id])}
                  selected={taskSelectedIds.includes(task.id)}
                  selectionMode={taskSelectionMode}
                  onLongPress={() => taskSelectionMode ? handleToggleTaskSelect(task.id) : handleEnterTaskSelectionMode(task.id)}
                />
              ))}
            </>
          ) : (
            <>
              {visibleFiles.length === 0 && (
                <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 16, marginBottom: 16 }}>No files yet.</Text>
              )}
              {visibleFiles.map((file) => (
                <FileItem
                  key={file.id}
                  fileName={file.file_name}
                  onOpen={() => handleDownloadFile(file.file_path, file.file_name)}
                  onDelete={() => setPendingDeleteFileIds([file.id])}
                  selected={fileSelectedIds.includes(file.id)}
                  selectionMode={fileSelectionMode}
                  onLongPress={() => fileSelectionMode ? handleToggleFileSelect(file.id) : handleEnterFileSelectionMode(file.id)}
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

      {/* Task delete confirmation */}
      <Modal transparent visible={pendingDeleteTaskIds.length > 0} animationType="fade" onRequestClose={() => setPendingDeleteTaskIds([])}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 320, backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 8 }}>
              {pendingDeleteTaskIds.length === 1 ? 'Delete Task' : `Delete ${pendingDeleteTaskIds.length} Tasks`}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              {pendingDeleteTaskIds.length === 1
                ? `Are you sure you want to delete "${tasks.find(t => t.id === pendingDeleteTaskIds[0])?.title}"? This cannot be undone.`
                : `Are you sure you want to delete ${pendingDeleteTaskIds.length} tasks? This cannot be undone.`}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={handleDeleteTasksConfirm} style={{ flex: 1, backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPendingDeleteTaskIds([])} style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* File delete confirmation */}
      <Modal transparent visible={pendingDeleteFileIds.length > 0} animationType="fade" onRequestClose={() => setPendingDeleteFileIds([])}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 320, backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 8 }}>
              {pendingDeleteFileIds.length === 1 ? 'Delete File' : `Delete ${pendingDeleteFileIds.length} Files`}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              {pendingDeleteFileIds.length === 1
                ? `Are you sure you want to delete "${visibleFiles.find(f => f.id === pendingDeleteFileIds[0])?.file_name}"? All tasks linked to this file will also be deleted. This cannot be undone.`
                : `Are you sure you want to delete ${pendingDeleteFileIds.length} files and all their linked tasks? This cannot be undone.`}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={handleDeleteFilesConfirm} style={{ flex: 1, backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPendingDeleteFileIds([])} style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
