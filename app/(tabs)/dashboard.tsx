import AddPropertyPopup from '@/components/dashboard/AddPropertyPopup';
import AddTaskModal from '@/components/AddTaskModal';
import Button from '@/components/Button';
import CompleteTaskModal, { CompleteResult } from '@/components/CompleteTaskModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FilterChips from '@/components/FilterChips';
import InfoPopup from '@/components/InfoPopup';
import PageContainer from '@/components/PageContainer';
import PropertyScrollRow from '@/components/dashboard/PropertyScrollRow';
import RenameModal from '@/components/RenameModal';
import SectionHeader from '@/components/SectionHeader';
import TaskItem from '@/components/TaskItem';
import UploadExtractPopup from '@/components/upload/UploadExtractPopup';
import { useSelectionMode } from '@/hooks/useSelectionMode';
import { supabase } from '@/services/supabase';
import { deleteProperties, fetchProperties, renameProperty } from '@/services/propertyService';
import { completeTask, createTask, deleteTasks, fetchAllTasksForUser, updateTask } from '@/services/taskService';
import { useTheme } from '@/theme/ThemeContext';
import { Property, RecurAnchor, RecurFrequency, TaskRow, TaskType } from '@/types';
import { dbTaskToTaskType, sortByDueDate, toDateString } from '@/utils/taskUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [allTasks, setAllTasks] = useState<TaskRow[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [propertyFilter, setPropertyFilter] = useState<string | null>(null);
  const [fileFilter, setFileFilter] = useState<string | null>(null);

  const [uploadVisible, setUploadVisible] = useState(false);
  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);

  const [renamingProperty, setRenamingProperty] = useState<Property | null>(null);
  const [pendingDeletePropertyIds, setPendingDeletePropertyIds] = useState<string[]>([]);
  const [pendingDeleteTaskIds, setPendingDeleteTaskIds] = useState<string[]>([]);
  const [completingTask, setCompletingTask] = useState<TaskRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleDeletePropertiesConfirm = async (cascade?: boolean) => {
    const count = pendingDeletePropertyIds.length;
    setDeleteLoading(true);
    await deleteProperties(pendingDeletePropertyIds, cascade ?? true);
    setProperties((prev) => prev.filter((p) => !pendingDeletePropertyIds.includes(p.id)));
    if (cascade) {
      // Reload tasks since cascaded deletes may have removed linked tasks and files
      if (userId) loadTasks(userId);
    }
    setPendingDeletePropertyIds([]);
    propertySel.cancel();
    setDeleteLoading(false);
    setSuccessMessage(count === 1 ? 'Property deleted' : `${count} properties deleted`);
  };

  // ── Task actions ──────────────────────────────────────────────────────────

  const handleAddTask = async (title: string, description: string, dueDate: Date | null, propertyId?: string, fileId?: string, recurFrequency?: RecurFrequency | null, recurAnchor?: RecurAnchor | null) => {
    if (!userId) return;
    const newTask = await createTask(userId, title, description || null, dueDate, propertyId, fileId, recurFrequency, recurAnchor);
    const propertyName = propertyId ? (properties.find((p) => p.id === propertyId)?.name || '') : '';
    setAllTasks((prev) => sortByDueDate([...prev, { ...newTask, propertyName, fileName: '' }]));
    setAddTaskVisible(false);
  };

  const handleUpdateTask = async (taskId: string, updated: TaskType) => {
    await updateTask(taskId, updated.title, updated.description ?? null, updated.dueDate ?? null, updated.propertyId, updated.fileId, updated.recurFrequency, updated.recurAnchor);
    setAllTasks((prev) =>
      sortByDueDate(prev.map((t) => {
        if (t.id !== taskId) return t;
        const propertyName = updated.propertyId
          ? (properties.find((p) => p.id === updated.propertyId)?.name || '')
          : '';
        return {
          ...t,
          title: updated.title,
          description: updated.description ?? null,
          due_date: toDateString(updated.dueDate ?? null),
          property_id: updated.propertyId ?? null,
          file_id: updated.fileId ?? null,
          recur_frequency: updated.recurFrequency ?? null,
          recur_anchor: updated.recurAnchor ?? null,
          propertyName,
        };
      })),
    );
  };

  const handleCompleteTask = async (result: CompleteResult) => {
    if (!completingTask || !userId) return;
    const nextTask = await completeTask(completingTask, userId, result.nextDueDate, result.newFrequency, result.newAnchor);
    setAllTasks((prev) => {
      const without = prev.filter((t) => t.id !== completingTask.id);
      if (!nextTask) return without;
      const propertyName = nextTask.property_id ? (properties.find((p) => p.id === nextTask.property_id)?.name || '') : '';
      return sortByDueDate([...without, { ...nextTask, propertyName, fileName: '' }]);
    });
    setCompletingTask(null);
    setSuccessMessage('Task completed!');
  };

  const handleDeleteTasksConfirm = async () => {
    const count = pendingDeleteTaskIds.length;
    setDeleteLoading(true);
    await deleteTasks(pendingDeleteTaskIds);
    setAllTasks((prev) => prev.filter((t) => !pendingDeleteTaskIds.includes(t.id)));
    setPendingDeleteTaskIds([]);
    taskSel.cancel();
    setDeleteLoading(false);
    setSuccessMessage(count === 1 ? 'Task deleted' : `${count} tasks deleted`);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const tasksFilteredByProperty = propertyFilter
    ? allTasks.filter((t) => t.property_id === propertyFilter)
    : allTasks;

  const displayedTasks = fileFilter
    ? tasksFilteredByProperty.filter((t) => t.file_id === fileFilter)
    : tasksFilteredByProperty;

  const filesForProperty: { id: string; name: string }[] = propertyFilter
    ? Array.from(
        new Map(
          tasksFilteredByProperty
            .filter((t) => t.file_id != null && t.fileName)
            .map((t) => [t.file_id!, { id: t.file_id!, name: t.fileName }]),
        ).values(),
      )
    : [];

  const pendingDeletePropertyName = properties.find((p) => p.id === pendingDeletePropertyIds[0])?.name;
  const pendingDeleteTaskTitle = allTasks.find((t) => t.id === pendingDeleteTaskIds[0])?.title;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: colors.textPrimary }]}>My Dashboard</Text>
        <Button
          title="Upload Doc"
          leftIcon={<MaterialIcons name="cloud-upload" size={16} color="#fff" />}
          variant="primary"
          size="sm"
          onPress={() => setUploadVisible(true)}
        />
      </View>

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
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No properties yet.</Text>
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

      {!loadingTasks && properties.length > 0 && (
        <FilterChips
          options={[
            { label: 'All', value: null },
            ...properties.map((p) => ({ label: p.name, value: p.id })),
          ]}
          selected={propertyFilter}
          onSelect={handlePropertyFilterSelect}
        />
      )}

      {!loadingTasks && propertyFilter !== null && filesForProperty.length > 0 && (
        <FilterChips
          options={[
            { label: 'All files', value: null },
            ...filesForProperty.map((f) => ({ label: f.name, value: f.id })),
          ]}
          selected={fileFilter}
          onSelect={setFileFilter}
        />
      )}

      {loadingTasks ? (
        <ActivityIndicator size="small" color={colors.success} style={{ marginVertical: 12 }} />
      ) : displayedTasks.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No upcoming tasks.</Text>
      ) : (
        displayedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={dbTaskToTaskType(task)}
            propertyName={task.propertyName}
            onUpdate={(updated) => handleUpdateTask(task.id, updated)}
            onDelete={() => setPendingDeleteTaskIds([task.id])}
            onTap={() => setCompletingTask(task)}
            selected={taskSel.selectedIds.includes(task.id)}
            selectionMode={taskSel.selectionMode}
            onLongPress={() => taskSel.selectionMode ? taskSel.toggle(task.id) : taskSel.enter(task.id)}
            properties={properties}
          />
        ))
      )}

      <AddTaskModal
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
        onAdd={handleAddTask}
        properties={properties}
      />

      <UploadExtractPopup
        visible={uploadVisible}
        userId={userId ?? ''}
        onClose={() => setUploadVisible(false)}
        onSuccess={() => { if (userId) loadTasks(userId); }}
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
        loading={deleteLoading}
        loadingLabel={pendingDeletePropertyIds.length === 1 ? 'Deleting property...' : `Deleting ${pendingDeletePropertyIds.length} properties...`}
        cascadeLabel="Also delete all linked tasks and files"
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
        loading={deleteLoading}
        loadingLabel={pendingDeleteTaskIds.length === 1 ? 'Deleting task...' : `Deleting ${pendingDeleteTaskIds.length} tasks...`}
      />

      <CompleteTaskModal
        visible={!!completingTask}
        task={completingTask ? dbTaskToTaskType(completingTask) : null}
        onClose={() => setCompletingTask(null)}
        onComplete={handleCompleteTask}
      />

      <InfoPopup
        visible={!!successMessage}
        type="success"
        message={successMessage ?? ''}
        onClose={() => setSuccessMessage(null)}
        autoDismiss={2500}
        showConfirm={false}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    flex: 1,
  },
  emptyText: {
    marginBottom: 8,
  },
});
