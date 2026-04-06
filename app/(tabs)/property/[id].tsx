import AddTaskModal from '@/components/AddTaskModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import FileItem from '@/components/FileItem';
import FilterChips from '@/components/FilterChips';
import TaskItem from '@/components/TaskItem';
import UploadExtractPopup from '@/components/upload/UploadExtractPopup';
import { MAX_WIDTH, SCREEN_PADDING } from '@/theme/layout';
import { useSelectionMode } from '@/hooks/useSelectionMode';
import { supabase } from '@/services/supabase';
import { deleteFiles, downloadFile, fetchFilesForProperty } from '@/services/fileService';
import { createTask, deleteTasks, fetchTasksForFiles, getOrCreateManualFileId, updateTask } from '@/services/taskService';
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
      setFiles(allFiles.filter((f) => f.file_name !== '__manual__'));

      const fileIds = allFiles.map((f) => f.id);
      setTasks(await fetchTasksForFiles(fileIds));
    } catch (err) {
      console.error('Failed to load property data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Task actions ──────────────────────────────────────────────────────────

  const handleAddTask = async (title: string, description: string, dueDate: Date | null) => {
    const fileId = await getOrCreateManualFileId(id);
    const newTask = await createTask(fileId, title, description || null, dueDate);
    setTasks((prev) => sortByDueDate([...prev, newTask]));
    setAddTaskVisible(false);
  };

  const handleUpdateTask = async (taskId: string, updated: TaskType) => {
    await updateTask(taskId, updated.title, updated.description ?? null, updated.dueDate ?? null);
    setTasks((prev) =>
      sortByDueDate(prev.map((t) =>
        t.id === taskId
          ? { ...t, title: updated.title, description: updated.description ?? null, due_date: toDateString(updated.dueDate ?? null) }
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
    setTasks((prev) => prev.filter((t) => !pendingDeleteFileIds.includes(t.file_id)));
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
    tasks.some((t) => t.file_id === f.id),
  );

  const displayedTasks = taskFileFilter
    ? tasks.filter((t) => t.file_id === taskFileFilter)
    : tasks;

  const pendingTaskTitle = tasks.find((t) => t.id === pendingDeleteTaskIds[0])?.title;
  const pendingFileName = files.find((f) => f.id === pendingDeleteFileIds[0])?.file_name;

  const tasksTabLabel = taskFileFilter
    ? `Tasks (${displayedTasks.length}/${tasks.length})`
    : `Tasks (${tasks.length})`;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scroll}>
        <View style={styles.paddingWrap}>
          <View style={styles.maxWidth}>

            {/* Back + property name */}
            <View style={styles.backRow}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/dashboard')}
                style={styles.backBtn}
                hitSlop={8}
              >
                <MaterialIcons name="arrow-back" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.propertyName, { color: colors.textPrimary }]} numberOfLines={1}>
                {propertyName || 'Property'}
              </Text>
            </View>

            {/* Section tabs + action buttons */}
            <View style={styles.tabsRow}>
              <View style={[styles.tabContainer, { backgroundColor: colors.borderLight }]}>
                {(['tasks', 'files'] as Section[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setSection(s)}
                    style={[
                      styles.tabBtn,
                      { backgroundColor: section === s ? colors.surface : 'transparent' },
                    ]}
                  >
                    <Text style={[styles.tabText, {
                      fontWeight: section === s ? '600' : '400',
                      color: section === s ? colors.textPrimary : colors.textMuted,
                    }]}>
                      {s === 'tasks' ? tasksTabLabel : `Files (${files.length})`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {activeSelectionMode ? (
                <View style={styles.selectionBtns}>
                  <TouchableOpacity
                    onPress={handleCancelSelection}
                    style={[styles.selectionCancelBtn, { backgroundColor: colors.borderLight }]}
                  >
                    <Text style={[styles.selectionBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleDeleteSelected}
                    disabled={activeSelectedIds.length === 0}
                    style={[styles.selectionDeleteBtn, { backgroundColor: activeSelectedIds.length > 0 ? colors.danger : colors.dangerDisabled }]}
                  >
                    <Text style={[styles.selectionBtnText, { color: '#fff' }]}>
                      Delete{activeSelectedIds.length > 0 ? ` (${activeSelectedIds.length})` : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => section === 'tasks' ? setAddTaskVisible(true) : setUploadVisible(true)}
                  style={[styles.addBtn, { backgroundColor: colors.primary }]}
                >
                  <MaterialIcons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.info} style={{ marginTop: 40 }} />
            ) : section === 'tasks' ? (
              <>
                {!loading && (
                  <FilterChips
                    options={[
                      { label: 'All', value: null },
                      ...taskFileOptions.map((f) => ({
                        label: f.file_name === '__manual__' ? 'Manual' : f.file_name,
                        value: f.id,
                      })),
                    ]}
                    selected={taskFileFilter}
                    onSelect={setTaskFileFilter}
                  />
                )}
                {displayedTasks.length === 0 && (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No tasks yet.
                  </Text>
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
                  />
                ))}
              </>
            ) : (
              <>
                {files.length === 0 && (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    No files yet.
                  </Text>
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
      />

      <UploadExtractPopup
        visible={uploadVisible}
        userId={userId!}
        initialPropertyId={id}
        onClose={() => { setUploadVisible(false); loadData(); }}
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
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
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
  backBtn: {
    padding: 4,
  },
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
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
  },
  selectionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  selectionCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectionDeleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
});
