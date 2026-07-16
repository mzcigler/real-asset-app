import AddTaskModal from '@/components/AddTaskModal';
import Card from '@/components/Card';
import CompleteTaskModal, { CompleteResult } from '@/components/CompleteTaskModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import AddPropertyPopup from '@/components/dashboard/AddPropertyPopup';
import EmptyText from '@/components/EmptyText';
import IconButton from '@/components/IconButton';
import InfoPopup from '@/components/InfoPopup';
import PageContainer from '@/components/PageContainer';
import PageHeader from '@/components/PageHeader';
import TaskItem from '@/components/TaskItem';
import { fetchProperties } from '@/services/propertyService';
import { supabase } from '@/services/supabase';
import { completeTask, createTask, deleteTasks, fetchAllTasksForUser, updateTask } from '@/services/taskService';
import { BREAKPOINT, SIDEBAR_BREAKPOINT, SIDEBAR_WIDTH } from '@/theme/layout';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { Property, RecurAnchor, RecurFrequency, TaskRow, TaskType } from '@/types';
import { dbTaskToTaskType, sortByDueDate, toDateString } from '@/utils/taskUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { ComponentProps, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

/** How many items the dashboard previews before pointing to the full page */
const PROPERTY_PREVIEW_COUNT = 5;
const TASK_PREVIEW_COUNT = 6;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  // Column layout depends on the width actually left for content once the
  // persistent sidebar (if visible) has taken its share
  const contentWidth = width - (width >= SIDEBAR_BREAKPOINT ? SIDEBAR_WIDTH : 0);
  const isWide = contentWidth >= BREAKPOINT;

  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [allTasks, setAllTasks] = useState<TaskRow[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [addPropertyVisible, setAddPropertyVisible] = useState(false);
  const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [pendingDeleteTaskIds, setPendingDeleteTaskIds] = useState<string[]>([]);
  const [completingTask, setCompletingTask] = useState<TaskRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setDeleteLoading(false);
    setSuccessMessage(count === 1 ? 'Task deleted' : `${count} tasks deleted`);
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  const overdueCount = allTasks.filter((t) => t.due_date && new Date(t.due_date) < today).length;
  const dueSoonCount = allTasks.filter((t) => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d >= today && d <= in30Days;
  }).length;

  const previewTasks = allTasks.slice(0, TASK_PREVIEW_COUNT);
  const previewProperties = properties.slice(0, PROPERTY_PREVIEW_COUNT);
  const pendingDeleteTaskTitle = allTasks.find((t) => t.id === pendingDeleteTaskIds[0])?.title;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PageContainer>
      <PageHeader title="My Dashboard" subtitle="Own your home, Not just the keys." />

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatTile icon="apartment" label="Properties" value={loadingProperties ? '–' : properties.length} />
        <StatTile icon="assignment" label="Open Tasks" value={loadingTasks ? '–' : allTasks.length} />
        <StatTile icon="error-outline" label="Overdue" value={loadingTasks ? '–' : overdueCount} highlight={overdueCount > 0} />
        <StatTile icon="schedule" label="Due in 30 Days" value={loadingTasks ? '–' : dueSoonCount} />
      </View>

      {/* Two columns on desktop (properties | tasks preview), stacked on phone */}
      <View style={isWide && styles.columns}>
        <Card style={[styles.sectionCard, isWide && styles.propertiesCol]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>My Properties</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/properties' as any)}>
              <Text style={[styles.link, { color: colors.primary }]}>Manage</Text>
            </TouchableOpacity>
            <IconButton icon="add" onPress={() => setAddPropertyVisible(true)} size={30} />
          </View>

          {loadingProperties ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : properties.length === 0 ? (
            <EmptyText>No properties yet.</EmptyText>
          ) : (
            <>
              {previewProperties.map((property) => (
                <PropertyRow
                  key={property.id}
                  name={property.name}
                  onPress={() => router.push(`/(tabs)/property/${property.id}` as any)}
                />
              ))}
              {properties.length > PROPERTY_PREVIEW_COUNT && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/properties' as any)}>
                  <Text style={[styles.link, styles.moreLink, { color: colors.primary }]}>
                    View all {properties.length} properties
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Card>

        <Card style={[styles.sectionCard, isWide && styles.tasksCol]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Upcoming Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/maintenance' as any)}>
              <Text style={[styles.link, { color: colors.primary }]}>View all</Text>
            </TouchableOpacity>
            <IconButton icon="add" onPress={() => setAddTaskVisible(true)} size={30} />
          </View>

          {loadingTasks ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : previewTasks.length === 0 ? (
            <EmptyText>No upcoming tasks.</EmptyText>
          ) : (
            <>
              {previewTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={dbTaskToTaskType(task)}
                  propertyName={task.propertyName}
                  onUpdate={(updated) => handleUpdateTask(task.id, updated)}
                  onDelete={() => setPendingDeleteTaskIds([task.id])}
                  onTap={() => setCompletingTask(task)}
                  properties={properties}
                />
              ))}
              {allTasks.length > TASK_PREVIEW_COUNT && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/maintenance' as any)}>
                  <Text style={[styles.link, styles.moreLink, { color: colors.primary }]}>
                    View all {allTasks.length} tasks
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Card>
      </View>

      <AddTaskModal
        visible={addTaskVisible}
        onClose={() => setAddTaskVisible(false)}
        onAdd={handleAddTask}
        properties={properties}
      />

      <AddPropertyPopup
        visible={addPropertyVisible}
        onClose={() => setAddPropertyVisible(false)}
        onPropertyAdded={() => { if (userId) loadProperties(userId); }}
      />

      <ConfirmDeleteModal
        visible={pendingDeleteTaskIds.length > 0}
        title="Delete Task"
        message={`Are you sure you want to delete "${pendingDeleteTaskTitle}"? This cannot be undone.`}
        onConfirm={handleDeleteTasksConfirm}
        onCancel={() => setPendingDeleteTaskIds([])}
        loading={deleteLoading}
        loadingLabel="Deleting task..."
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTile({
  icon, label, value, highlight = false,
}: { icon: ComponentProps<typeof MaterialIcons>['name']; label: string; value: number | string; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <Card style={styles.statTile}>
      <View style={styles.statTop}>
        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
        <View style={[styles.statIconTile, { backgroundColor: highlight ? colors.dangerDisabled : colors.primaryLight }]}>
          <MaterialIcons name={icon} size={16} color={highlight ? colors.danger : colors.primary} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: highlight ? colors.danger : colors.textPrimary }]}>{value}</Text>
    </Card>
  );
}

function PropertyRow({ name, onPress }: { name: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.propertyRow} onPress={onPress}>
      <View style={[styles.propertyIconTile, { backgroundColor: colors.primaryLight }]}>
        <MaterialIcons name="apartment" size={18} color={colors.primary} />
      </View>
      <Text style={[styles.propertyName, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
      <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statTile: {
    flexGrow: 1,
    flexBasis: 150,
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  statIconTile: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: fontSize.h2,
    fontWeight: 'bold',
  },
  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
  },
  sectionCard: {
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    flex: 1,
  },
  link: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  moreLink: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  propertiesCol: {
    width: 340,
  },
  tasksCol: {
    flex: 1,
    minWidth: 0,
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  propertyIconTile: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyName: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});
