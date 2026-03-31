import AddPropertyPopup from '@/components/AddPropertyPopup';
import AddTaskModal from '@/components/AddTaskModal';
import { StandardButton } from '@/components/Buttons';
import PropertyScrollRow from '@/components/PropertyScrollRow';
import TaskItem from '@/components/TaskItem';
import UploadExtractPopup from '@/components/UploadExtractPopup';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  file_id: string;
  propertyName: string;
};

type Property = {
  id: string;
  name: string;
};

export default function HomeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [allTasks, setAllTasks] = useState<TaskRow[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);
  const [renameText, setRenameText] = useState('');
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [taskSelectedIds, setTaskSelectedIds] = useState<string[]>([]);
  const [taskSelectionMode, setTaskSelectionMode] = useState(false);
  const [pendingDeleteTaskIds, setPendingDeleteTaskIds] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace('/(auth)/login'); return; }
      setUserId(data.user.id);
      fetchProperties(data.user.id);
      fetchAllTasks(data.user.id);
    };
    getUser();
  }, []);

  const fetchProperties = async (uid: string) => {
    setLoadingProperties(true);
    const { data } = await supabase
      .from('properties')
      .select('id, name')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    setProperties(data || []);
    setLoadingProperties(false);
  };

  const fetchAllTasks = async (uid: string) => {
    setLoadingTasks(true);
    const { data: propData } = await supabase
      .from('properties')
      .select('id, name')
      .eq('user_id', uid);

    if (!propData || propData.length === 0) {
      setAllTasks([]);
      setLoadingTasks(false);
      return;
    }

    const propMap = Object.fromEntries(propData.map((p) => [p.id, p.name]));

    const { data: fileData } = await supabase
      .from('files')
      .select('id, property_id')
      .in('property_id', propData.map((p) => p.id));

    if (!fileData || fileData.length === 0) {
      setAllTasks([]);
      setLoadingTasks(false);
      return;
    }

    const fileToProperty = Object.fromEntries(fileData.map((f) => [f.id, f.property_id]));

    const { data: taskData } = await supabase
      .from('tasks')
      .select('id, title, description, due_date, file_id')
      .in('file_id', fileData.map((f) => f.id));

    const tasks: TaskRow[] = (taskData || []).map((t) => ({
      ...t,
      propertyName: propMap[fileToProperty[t.file_id]] || '',
    }));

    tasks.sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    setAllTasks(tasks);
    setLoadingTasks(false);
  };

  const handleUpdateTask = async (taskId: string, updated: import('@/components/types').TaskType) => {
    const dueDateStr = updated.dueDate ? updated.dueDate.toISOString().slice(0, 10) : null;
    const { error } = await supabase
      .from('tasks')
      .update({ title: updated.title, description: updated.description ?? null, due_date: dueDateStr })
      .eq('id', taskId);
    if (!error) {
      setAllTasks((prev) =>
        [...prev.map((t) =>
          t.id === taskId
            ? { ...t, title: updated.title, description: updated.description ?? null, due_date: dueDateStr }
            : t
        )].sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        })
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setPendingDeleteTaskIds([taskId]);
  };

  const handleDeleteTasksConfirm = async () => {
    if (pendingDeleteTaskIds.length === 0) return;
    await supabase.from('tasks').delete().in('id', pendingDeleteTaskIds);
    setAllTasks((prev) => prev.filter((t) => !pendingDeleteTaskIds.includes(t.id)));
    setPendingDeleteTaskIds([]);
    setTaskSelectedIds([]);
    setTaskSelectionMode(false);
  };

  const handleEnterTaskSelectionMode = (id: string) => {
    setTaskSelectionMode(true);
    setTaskSelectedIds([id]);
  };

  const handleToggleTaskSelect = (id: string) => {
    setTaskSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCancelTaskSelection = () => {
    setTaskSelectionMode(false);
    setTaskSelectedIds([]);
  };

  const handleAddTask = async (title: string, description: string, dueDate: Date | null, propertyId?: string) => {
    if (!propertyId) return;
    const { data: existing } = await supabase.from('files').select('id').eq('property_id', propertyId).eq('file_name', '__manual__').maybeSingle();
    let fileId = existing?.id;
    if (!fileId) {
      const { data: created } = await supabase.from('files').insert({ property_id: propertyId, file_name: '__manual__', file_path: '' }).select('id').single();
      fileId = created?.id;
    }
    if (!fileId) throw new Error('Could not get file id');
    const dueDateStr = dueDate ? dueDate.toISOString().slice(0, 10) : null;
    const { data, error } = await supabase.from('tasks').insert({ file_id: fileId, title, description: description || null, due_date: dueDateStr }).select('id, title, description, due_date, file_id').single();
    if (error) throw error;
    const propertyName = properties.find((p) => p.id === propertyId)?.name || '';
    setAllTasks((prev) =>
      [...prev, { ...data, propertyName }].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
    );
    setAddTaskVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (pendingDeleteIds.length === 0) return;
    await supabase.from('properties').delete().in('id', pendingDeleteIds);
    setProperties((prev) => prev.filter((p) => !pendingDeleteIds.includes(p.id)));
    setPendingDeleteIds([]);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleEnterSelectionMode = (id: string) => {
    setSelectionMode(true);
    setSelectedIds([id]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const handleRenameConfirm = async () => {
    if (!renamingProperty || !renameText.trim()) return;
    const { error } = await supabase
      .from('properties')
      .update({ name: renameText.trim() })
      .eq('id', renamingProperty.id);

    if (!error) {
      setProperties((prev) =>
        prev.map((p) => (p.id === renamingProperty.id ? { ...p, name: renameText.trim() } : p))
      );
    }
    setRenamingProperty(null);
    setRenameText('');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6' }} contentContainerStyle={{ alignItems: 'center', padding: 24 }}>
      <View style={{ width: '100%', maxWidth: 480 }}>

        <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 16 }}>My Dashboard</Text>

        <StandardButton
          title="Upload New Document"
          onPress={() => setUploadVisible(true)}
          bgColor="bg-white"
          textColor="text-black"
          fontWeight="font-semibold"
          customStyle="border border-blue-600 w-full"
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', flex: 1 }}>My Properties</Text>
          {selectionMode ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleCancelSelection}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' }}
              >
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { if (selectedIds.length > 0) setPendingDeleteIds(selectedIds); }}
                disabled={selectedIds.length === 0}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: selectedIds.length > 0 ? '#dc2626' : '#fca5a5' }}
              >
                <Text style={{ fontSize: 13, color: 'white', fontWeight: '600' }}>Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setAddPropertyVisible(true)}
              style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcons name="add" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
        {loadingProperties ? (
          <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />
        ) : properties.length === 0 ? (
          <Text style={{ color: '#6b7280', marginBottom: 8 }}>No properties yet.</Text>
        ) : (
          <PropertyScrollRow
            properties={properties}
            onPress={(id) => router.push(`/property/${id}` as any)}
            onRename={(property) => { setRenameText(property.name); setRenamingProperty(property); }}
            onDelete={(property) => setPendingDeleteIds([property.id])}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            onToggleSelect={handleToggleSelect}
            onEnterSelectionMode={handleEnterSelectionMode}
          />
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', flex: 1 }}>Upcoming Tasks</Text>
          {taskSelectionMode ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleCancelTaskSelection}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f3f4f6' }}
              >
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { if (taskSelectedIds.length > 0) setPendingDeleteTaskIds(taskSelectedIds); }}
                disabled={taskSelectedIds.length === 0}
                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: taskSelectedIds.length > 0 ? '#dc2626' : '#fca5a5' }}
              >
                <Text style={{ fontSize: 13, color: 'white', fontWeight: '600' }}>Delete {taskSelectedIds.length > 0 ? `(${taskSelectedIds.length})` : ''}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setAddTaskVisible(true)}
              style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#15803d', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialIcons name="add" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {loadingTasks ? (
          <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 12 }} />
        ) : allTasks.length > 0 ? (
          <>
            {allTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={{
                  id: task.id,
                  title: task.title,
                  description: task.description ?? undefined,
                  dueDate: task.due_date ? new Date(task.due_date) : null,
                }}
                propertyName={task.propertyName}
                onUpdate={(updated) => handleUpdateTask(task.id, updated)}
                onDelete={() => handleDeleteTask(task.id)}
                selected={taskSelectedIds.includes(task.id)}
                selectionMode={taskSelectionMode}
                onLongPress={() => taskSelectionMode ? handleToggleTaskSelect(task.id) : handleEnterTaskSelectionMode(task.id)}
              />
            ))}
          </>
        ) : (
          <Text style={{ color: '#6b7280', marginBottom: 8 }}>No upcoming tasks.</Text>
        )}

      </View>

      <AddTaskModal
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
        onAdd={handleAddTask}
        properties={properties}
      />

      <UploadExtractPopup
        visible={uploadVisible}
        userId={userId!}
        onClose={() => setUploadVisible(false)}
      />
      <AddPropertyPopup
        visible={addPropertyVisible}
        onClose={() => setAddPropertyVisible(false)}
        onPropertyAdded={() => { if (userId) fetchProperties(userId); }}
      />

      {/* Delete confirmation modal */}
      <Modal
        transparent
        visible={pendingDeleteIds.length > 0}
        animationType="fade"
        onRequestClose={() => setPendingDeleteIds([])}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 320, backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 8 }}>
              {pendingDeleteIds.length === 1 ? 'Delete Property' : `Delete ${pendingDeleteIds.length} Properties`}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              {pendingDeleteIds.length === 1
                ? `Are you sure you want to delete "${properties.find(p => p.id === pendingDeleteIds[0])?.name}"? This cannot be undone.`
                : `Are you sure you want to delete ${pendingDeleteIds.length} properties? This cannot be undone.`}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleDeleteConfirm}
                style={{ flex: 1, backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPendingDeleteIds([])}
                style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task delete confirmation modal */}
      <Modal
        transparent
        visible={pendingDeleteTaskIds.length > 0}
        animationType="fade"
        onRequestClose={() => setPendingDeleteTaskIds([])}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 320, backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 8 }}>
              {pendingDeleteTaskIds.length === 1 ? 'Delete Task' : `Delete ${pendingDeleteTaskIds.length} Tasks`}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              {pendingDeleteTaskIds.length === 1
                ? `Are you sure you want to delete "${allTasks.find(t => t.id === pendingDeleteTaskIds[0])?.title}"? This cannot be undone.`
                : `Are you sure you want to delete ${pendingDeleteTaskIds.length} tasks? This cannot be undone.`}
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleDeleteTasksConfirm}
                style={{ flex: 1, backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPendingDeleteTaskIds([])}
                style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename modal */}
      <Modal
        transparent
        visible={!!renamingProperty}
        animationType="fade"
        onRequestClose={() => setRenamingProperty(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 320, backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 14 }}>Rename Property</Text>
            <TextInput
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 16 }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleRenameConfirm}
                disabled={!renameText.trim()}
                style={{ flex: 1, backgroundColor: renameText.trim() ? '#2563eb' : '#d1d5db', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setRenamingProperty(null); setRenameText(''); }}
                style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
