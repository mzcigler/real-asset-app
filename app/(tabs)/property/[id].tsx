import AddTaskModal from '@/components/AddTaskModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FileItem from '@/components/FileItem';
import FilterChips from '@/components/FilterChips';
import IconButton from '@/components/IconButton';
import SegmentedControl from '@/components/SegmentedControl';
import SelectionActions from '@/components/SelectionActions';
import TaskItem from '@/components/TaskItem';
import UploadExtractPopup from '@/components/upload/UploadExtractPopup';
import { MAX_WIDTH, SCREEN_PADDING } from '@/theme/layout';
import { useSelectionMode } from '@/hooks/useSelectionMode';
import { supabase } from '@/services/supabase';
import { deleteFiles, downloadFile, fetchFilesForProperty } from '@/services/fileService';
import { createTask, deleteTasks, fetchTasksForProperty, updateTask } from '@/services/taskService';
import { useTheme } from '@/theme/ThemeContext';
import { DBTask, FileRecord, TaskType } from '@/types';
import { dbTaskToTaskType, sortByDueDate, toDateString } from '@/utils/taskUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Section = 'tasks' | 'files';

export default function PropertyDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState('');
  const [tasks, setTasks] = useState<DBTask[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [allPropertyFiles, setAllPropertyFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('tasks');
  const [uploadVisible, setUploadVisible] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);

  const [taskFileFilter, setTaskFileFilter] = useState<string | null>(null);
  const [pendingDeleteTaskIds, setPendingDeleteTaskIds] = useState<string[]>([]);
  const [pendingDeleteFileIds, setPendingDeleteFileIds] = useState<string[]>([]);

  const taskSel = useSelectionMode();
  const fileSel = useSelectionMode();

  useEffect(() => {
    taskSel.cancel();
    fileSel.cancel();
    setTaskFileFilter(null);
  }, [section]);

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

      const allFiles = await fetchFilesForProperty(id);
      setAllPropertyFiles(allFiles);
      setFiles(allFiles);

      setTasks(await fetchTasksForProperty(id));
    } catch (err) {
      console.error('Failed to load property data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Task actions ──────────────────────────────────────────────────────────

  const handleAddTask = async (title: string, description: string, dueDate: Date | null, _propertyId?: string, fileId?: string) => {
    if (!userId) return;
    const newTask = await createTask(userId, title, description || null, dueDate, id, fileId);
    setTasks((prev) => sortByDueDate([...prev, newTask]));
    setAddTaskVisible(false);
  };

  const handleUpdateTask = async (taskId: string, updated: TaskType) => {
    await updateTask(taskId, updated.title, updated.description ?? null, updated.dueDate ?? null, undefined, updated.fileId);
    setTasks((prev) =>
      sortByDueDate(prev.map((t) =>
        t.id === taskId
          ? { ...t, title: updated.title, description: updated.description ?? null, due_date: toDateString(updated.dueDate ?? null), file_id: updated.fileId ?? null }
          : t,
      )),
    );
  };

  const handleDeleteTasksConfirm = async () => {
    await deleteTasks(pendingDeleteTaskIds);
    setTasks((prev) => prev.filter((t) => !pendingDeleteTaskIds.includes(t.id)));
    setPendingDeleteTaskIds([]);
    taskSel.cancel();
  };

  // ── File actions ──────────────────────────────────────────────────────────

  const handleDeleteFilesConfirm = async () => {
    const filesToDelete = files.filter((f) => pendingDeleteFileIds.includes(f.id));
    await deleteFiles(filesToDelete);
    setFiles((prev) => prev.filter((f) => !pendingDeleteFileIds.includes(f.id)));
    setTasks((prev) => prev.map((t) =>
      t.file_id && pendingDeleteFileIds.includes(t.file_id) ? { ...t, file_id: null } : t,
    ));
    setPendingDeleteFileIds([]);
    fileSel.cancel();
  };

  const handleDownload = (filePath: string, fileName: string) => {
    downloadFile(filePath, fileName).catch((err) => console.error('Download failed:', err));
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeSelectionMode = section === 'tasks' ? taskSel.selectionMode : fileSel.selectionMode;
  const activeSelectedIds = section === 'tasks' ? taskSel.selectedIds : fileSel.selectedIds;

  const handleCancelSelection = () => section === 'tasks' ? taskSel.cancel() : fileSel.cancel();
  const handleDeleteSelected = () => {
    if (section === 'tasks' && taskSel.selectedIds.length > 0) setPendingDeleteTaskIds(taskSel.selectedIds);
    if (section === 'files' && fileSel.selectedIds.length > 0) setPendingDeleteFileIds(fileSel.selectedIds);
  };

  const taskFileOptions: FileRecord[] = allPropertyFiles.filter((f) =>
    tasks.some((t) => t.file_id != null && t.file_id === f.id),
  );

  const displayedTasks = taskFileFilter
    ? tasks.filter((t) => t.file_id === taskFileFilter)
    : tasks;

  const tasksTabLabel = taskFileFilter
    ? `Tasks (${displayedTasks.length}/${tasks.length})`
    : `Tasks (${tasks.length})`;

  const pendingTaskTitle = tasks.find((t) => t.id === pendingDeleteTaskIds[0])?.title;
  const pendingFileName = files.find((f) => f.id === pendingDeleteFileIds[0])?.file_name;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll}>
        <View style={styles.paddingWrap}>
          <View style={styles.maxWidth}>

            <View style={styles.backRow}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} style={styles.backBtn} hitSlop={8}>
                <MaterialIcons name="arrow-back" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.propertyName, { color: colors.textPrimary }]} numberOfLines={1}>
                {propertyName || 'Property'}
              </Text>
            </View>

            <View style={styles.tabsRow}>
              <SegmentedControl
                style={styles.tabs}
                tabs={[
                  { label: tasksTabLabel, value: 'tasks' },
                  { label: `Files (${files.length})`, value: 'files' },
                ]}
                selected={section}
                onSelect={(v) => setSection(v as Section)}
              />
              {activeSelectionMode ? (
                <SelectionActions
                  selectedCount={activeSelectedIds.length}
                  onCancel={handleCancelSelection}
                  onDelete={handleDeleteSelected}
                />
              ) : (
                <IconButton
                  icon="add"
                  size={36}
                  onPress={() => section === 'tasks' ? setAddTaskVisible(true) : setUploadVisible(true)}
                />
              )}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.info} style={{ marginTop: 40 }} />
            ) : section === 'tasks' ? (
              <>
                <FilterChips
                  options={[
                    { label: 'All', value: null },
                    ...taskFileOptions.map((f) => ({ label: f.file_name, value: f.id })),
                  ]}
                  selected={taskFileFilter}
                  onSelect={setTaskFileFilter}
                />
                {displayedTasks.length === 0 && (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No tasks yet.</Text>
                )}
                {displayedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={dbTaskToTaskType(task)}
                    onUpdate={(updated) => handleUpdateTask(task.id, updated)}
                    onDelete={() => setPendingDeleteTaskIds([task.id])}
                    selected={taskSel.selectedIds.includes(task.id)}
                    selectionMode={taskSel.selectionMode}
                    onLongPress={() => taskSel.selectionMode ? taskSel.toggle(task.id) : taskSel.enter(task.id)}
                    files={allPropertyFiles}
                  />
                ))}
              </>
            ) : (
              <>
                {files.length === 0 && (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>No files yet.</Text>
                )}
                {files.map((file) => (
                  <FileItem
                    key={file.id}
                    fileName={file.file_name}
                    onOpen={() => handleDownload(file.file_path, file.file_name)}
                    onDelete={() => setPendingDeleteFileIds([file.id])}
                    selected={fileSel.selectedIds.includes(file.id)}
                    selectionMode={fileSel.selectionMode}
                    onLongPress={() => fileSel.selectionMode ? fileSel.toggle(file.id) : fileSel.enter(file.id)}
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
        files={allPropertyFiles}
      />

      <UploadExtractPopup
        visible={uploadVisible}
        userId={userId!}
        initialPropertyId={id}
        onClose={() => setUploadVisible(false)}
        onSuccess={() => loadData()}
      />

      <ConfirmDeleteModal
        visible={pendingDeleteTaskIds.length > 0}
        title={pendingDeleteTaskIds.length === 1 ? 'Delete Task' : `Delete ${pendingDeleteTaskIds.length} Tasks`}
        message={
          pendingDeleteTaskIds.length === 1
            ? `Are you sure you want to delete "${pendingTaskTitle}"? This cannot be undone.`
            : `Are you sure you want to delete ${pendingDeleteTaskIds.length} tasks? This cannot be undone.`
        }
        onConfirm={handleDeleteTasksConfirm}
        onCancel={() => setPendingDeleteTaskIds([])}
      />

      <ConfirmDeleteModal
        visible={pendingDeleteFileIds.length > 0}
        title={pendingDeleteFileIds.length === 1 ? 'Delete File' : `Delete ${pendingDeleteFileIds.length} Files`}
        message={
          pendingDeleteFileIds.length === 1
            ? `Are you sure you want to delete "${pendingFileName}"? All linked tasks will also be deleted. This cannot be undone.`
            : `Are you sure you want to delete ${pendingDeleteFileIds.length} files and all their linked tasks? This cannot be undone.`
        }
        onConfirm={handleDeleteFilesConfirm}
        onCancel={() => setPendingDeleteFileIds([])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  paddingWrap: {
    padding: SCREEN_PADDING,
    alignItems: 'center',
  },
  maxWidth: {
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backBtn: { padding: 4 },
  propertyName: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tabs: { flex: 1 },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});
