import AddPropertyPopup from '@/components/AddPropertyPopup';
import AddTaskModal from '@/components/AddTaskModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FilterChips from '@/components/FilterChips';
import PageContainer from '@/components/PageContainer';
import PropertyScrollRow from '@/components/PropertyScrollRow';
import RenameModal from '@/components/RenameModal';
import TaskItem from '@/components/TaskItem';
import UploadExtractPopup from '@/components/UploadExtractPopup';
import { useSelectionMode } from '@/hooks/useSelectionMode';
import { deleteProperties, fetchProperties, renameProperty } from '@/services/propertyService';
import {
  createTask,
  deleteTasks,
  fetchAllTasksForUser,
  getOrCreateManualFileId,
  updateTask,
} from '@/services/taskService';
import { useTheme } from '@/theme/ThemeContext';
import { Property, TaskRow, TaskType } from '@/types';
import { sortByDueDate, toDateString } from '@/utils/taskUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [allTasks, setAllTasks] = useState<TaskRow[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Filter state
  const [propertyFilter, setPropertyFilter] = useState<string | null>(null);
  const [fileFilter, setFileFilter] = useState<string | null>(null);

  // Modal visibility
  const [uploadVisible, setUploadVisible] = useState(false);
  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);

  // Rename property
  const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);

  // Delete confirmation targets
  const [pendingDeletePropertyIds, setPendingDeletePropertyIds] = useState<string[]>([]);
  const [pendingDeleteTaskIds, setPendingDeleteTaskIds] = useState<string[]>([]);

  // Selection modes
  const propertySel = useSelectionMode();
  const taskSel = useSelectionMode();

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/(auth)/login'); return; }
      setUserId(data.user.id);
      loadProperties(data.user.id);
      loadTasks(data.user.id);
    });
  }, []);

  const loadProperties = async (uid: string) => {
    setLoadingProperties(true);
    setProperties(await fetchProperties(uid));
    setLoadingProperties(false);
  };

  const loadTasks = async (uid: string) => {
    setLoadingTasks(true);
    setAllTasks(await fetchAllTasksForUser(uid));
    setLoadingTasks(false);
  };

  // ── Property filter resets file filter ────────────────────────────────────

  const handlePropertyFilterSelect = (v: string | null) => {
    setPropertyFilter(v);
    setFileFilter(null);
  };

  // ── Property actions ──────────────────────────────────────────────────────

  const handleRenameConfirm = async (newName: string) => {
    if (!renamingProperty) return;
    await renameProperty(renamingProperty.id, newName);
    setProperties((prev) => prev.map((p) => p.id === renamingProperty.id ? { ...p, name: newName } : p));
    setRenamingProperty(null);
  };

  const handleDeletePropertiesConfirm = async () => {
    await deleteProperties(pendingDeletePropertyIds);
    setProperties((prev) => prev.filter((p) => !pendingDeletePropertyIds.includes(p.id)));
    setPendingDeletePropertyIds([]);
    propertySel.cancel();
  };

  // ── Task actions ──────────────────────────────────────────────────────────

  const handleAddTask = async (title: string, description: string, dueDate: Date | null, propertyId?: string) => {
    if (!propertyId) return;
    const fileId = await getOrCreateManualFileId(propertyId);
    const newTask = await createTask(fileId, title, description || null, dueDate);
    const propertyName = properties.find((p) => p.id === propertyId)?.name || '';
    setAllTasks((prev) => sortByDueDate([...prev, { ...newTask, propertyName, fileName: '__manual__' }]));
    setAddTaskVisible(false);
  };

  const handleUpdateTask = async (taskId: string, updated: TaskType) => {
    await updateTask(taskId, updated.title, updated.description ?? null, updated.dueDate ?? null);
    setAllTasks((prev) =>
      sortByDueDate(prev.map((t) =>
        t.id === taskId
          ? { ...t, title: updated.title, description: updated.description ?? null, due_date: toDateString(updated.dueDate ?? null) }
          : t,
      )),
    );
  };

  const handleDeleteTasksConfirm = async () => {
    await deleteTasks(pendingDeleteTaskIds);
    setAllTasks((prev) => prev.filter((t) => !pendingDeleteTaskIds.includes(t.id)));
    setPendingDeleteTaskIds([]);
    taskSel.cancel();
  };

  // ── Derived filter values ─────────────────────────────────────────────────

  const tasksFilteredByProperty = propertyFilter
    ? allTasks.filter((t) => t.propertyName === propertyFilter)
    : allTasks;

  const displayedTasks = fileFilter
    ? tasksFilteredByProperty.filter((t) => t.file_id === fileFilter)
    : tasksFilteredByProperty;

  // Unique files for the currently selected property (for file filter chips)
  const filesForProperty: { id: string; name: string }[] = propertyFilter
    ? Array.from(
        new Map(
          tasksFilteredByProperty
            .filter((t) => t.file_id)
            .map((t) => [t.file_id, { id: t.file_id, name: t.fileName }]),
        ).values(),
      )
    : [];

  // ── Helpers ───────────────────────────────────────────────────────────────

  const pendingDeletePropertyName = properties.find((p) => p.id === pendingDeletePropertyIds[0])?.name;
  const pendingDeleteTaskTitle = allTasks.find((t) => t.id === pendingDeleteTaskIds[0])?.title;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: 'bold', flex: 1, color: colors.textPrimary }}>
          My Dashboard
        </Text>
        <TouchableOpacity
          onPress={() => setUploadVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.primary }}
        >
          <MaterialIcons name="cloud-upload" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Upload Doc</Text>
        </TouchableOpacity>
      </View>

      {/* ── My Properties ──────────────────────────────────────────────── */}
      <SectionHeader
        title="My Properties"
        selectionMode={propertySel.selectionMode}
        selectedCount={propertySel.selectedIds.length}
        onAdd={() => setAddPropertyVisible(true)}
        onCancelSelection={propertySel.cancel}
        onDeleteSelected={() => {
          if (propertySel.selectedIds.length > 0) setPendingDeletePropertyIds(propertySel.selectedIds);
        }}
      />

      {loadingProperties ? (
        <ActivityIndicator size="small" color={colors.success} style={{ marginVertical: 12 }} />
      ) : properties.length === 0 ? (
        <Text style={{ color: colors.textMuted, marginBottom: 8 }}>No properties yet.</Text>
      ) : (
        <PropertyScrollRow
          properties={properties}
          onPress={(id) => router.push(`/(tabs)/property/${id}` as any)}
          onRename={(property) => setRenamingProperty(property)}
          onDelete={(property) => setPendingDeletePropertyIds([property.id])}
          selectedIds={propertySel.selectedIds}
          selectionMode={propertySel.selectionMode}
          onToggleSelect={propertySel.toggle}
          onEnterSelectionMode={propertySel.enter}
        />
      )}

      {/* ── Upcoming Tasks ─────────────────────────────────────────────── */}
      <SectionHeader
        title="Upcoming Tasks"
        selectionMode={taskSel.selectionMode}
        selectedCount={taskSel.selectedIds.length}
        onAdd={() => setAddTaskVisible(true)}
        onCancelSelection={taskSel.cancel}
        onDeleteSelected={() => {
          if (taskSel.selectedIds.length > 0) setPendingDeleteTaskIds(taskSel.selectedIds);
        }}
      />

      {/* Property filter chips */}
      {!loadingTasks && properties.length > 0 && (
        <FilterChips
          options={[
            { label: 'All', value: null },
            ...properties.map((p) => ({ label: p.name, value: p.name })),
          ]}
          selected={propertyFilter}
          onSelect={handlePropertyFilterSelect}
        />
      )}

      {/* File filter chips — only when a property is selected and it has >1 unique files */}
      {!loadingTasks && propertyFilter !== null && filesForProperty.length > 1 && (
        <FilterChips
          options={[
            { label: 'All files', value: null },
            ...filesForProperty.map((f) => ({
              label: f.name === '__manual__' ? 'Manual' : f.name,
              value: f.id,
            })),
          ]}
          selected={fileFilter}
          onSelect={setFileFilter}
        />
      )}

      {loadingTasks ? (
        <ActivityIndicator size="small" color={colors.success} style={{ marginVertical: 12 }} />
      ) : displayedTasks.length === 0 ? (
        <Text style={{ color: colors.textMuted, marginBottom: 8 }}>No upcoming tasks.</Text>
      ) : (
        displayedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={{ id: task.id, title: task.title, description: task.description ?? undefined, dueDate: task.due_date ? new Date(task.due_date) : null }}
            propertyName={task.propertyName}
            onUpdate={(updated) => handleUpdateTask(task.id, updated)}
            onDelete={() => setPendingDeleteTaskIds([task.id])}
            selected={taskSel.selectedIds.includes(task.id)}
            selectionMode={taskSel.selectionMode}
            onLongPress={() => taskSel.selectionMode ? taskSel.toggle(task.id) : taskSel.enter(task.id)}
          />
        ))
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
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
        onPropertyAdded={() => { if (userId) loadProperties(userId); }}
      />

      <RenameModal
        visible={!!renamingProperty}
        title="Rename Property"
        initialValue={renamingProperty?.name ?? ''}
        onSave={handleRenameConfirm}
        onClose={() => setRenamingProperty(null)}
      />

      <ConfirmDeleteModal
        visible={pendingDeletePropertyIds.length > 0}
        title={pendingDeletePropertyIds.length === 1 ? 'Delete Property' : `Delete ${pendingDeletePropertyIds.length} Properties`}
        message={
          pendingDeletePropertyIds.length === 1
            ? `Are you sure you want to delete "${pendingDeletePropertyName}"? This cannot be undone.`
            : `Are you sure you want to delete ${pendingDeletePropertyIds.length} properties? This cannot be undone.`
        }
        onConfirm={handleDeletePropertiesConfirm}
        onCancel={() => setPendingDeletePropertyIds([])}
      />

      <ConfirmDeleteModal
        visible={pendingDeleteTaskIds.length > 0}
        title={pendingDeleteTaskIds.length === 1 ? 'Delete Task' : `Delete ${pendingDeleteTaskIds.length} Tasks`}
        message={
          pendingDeleteTaskIds.length === 1
            ? `Are you sure you want to delete "${pendingDeleteTaskTitle}"? This cannot be undone.`
            : `Are you sure you want to delete ${pendingDeleteTaskIds.length} tasks? This cannot be undone.`
        }
        onConfirm={handleDeleteTasksConfirm}
        onCancel={() => setPendingDeleteTaskIds([])}
      />
    </PageContainer>
  );
}

// ─── Section header with add / selection-mode buttons ───────────────────────

type SectionHeaderProps = {
  title: string;
  selectionMode: boolean;
  selectedCount: number;
  onAdd: () => void;
  onCancelSelection: () => void;
  onDeleteSelected: () => void;
};

function SectionHeader({ title, selectionMode, selectedCount, onAdd, onCancelSelection, onDeleteSelected }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', flex: 1, color: colors.textPrimary }}>{title}</Text>
      {selectionMode ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={onCancelSelection}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.borderLight }}
          >
            <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDeleteSelected}
            disabled={selectedCount === 0}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: selectedCount > 0 ? colors.danger : colors.dangerDisabled }}
          >
            <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>
              Delete{selectedCount > 0 ? ` (${selectedCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onAdd}
          style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <MaterialIcons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
