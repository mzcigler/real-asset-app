import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DateInput } from './DateInput';
import { useTheme } from '@/theme/ThemeContext';
import { TaskType } from '@/types';

type TaskItemProps = {
  task: TaskType;
  onUpdate: (updatedTask: TaskType) => void;
  onDelete: () => void;
  readOnly?: boolean;
  propertyName?: string;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
};

function getUrgencyColor(dueDate: Date | null, colors: ReturnType<typeof useTheme>['colors']): string {
  if (!dueDate) return colors.urgencyNone;
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return colors.urgencyPast;
  if (days <= 30) return colors.urgencyMonth;
  return colors.urgencyFuture;
}

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  readOnly,
  propertyName,
  selected,
  selectionMode,
  onLongPress,
}: TaskItemProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
  }, [task]);

  useEffect(() => {
    if (selectionMode) setEditing(false);
  }, [selectionMode]);

  const handleSave = () => {
    onUpdate({ ...task, title, description, dueDate });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setEditing(false);
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.info : colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      {editing ? (
        <View style={styles.editContainer}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.editInput, {
              borderColor: colors.inputBorder,
              color: colors.textPrimary,
              backgroundColor: colors.inputBackground,
            }]}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.editInput, {
              borderColor: colors.inputBorder,
              color: colors.textSecondary,
              backgroundColor: colors.inputBackground,
            }]}
          />
          <DateInput value={dueDate} onChange={(date: Date | null) => setDueDate(date)} />
          <View style={styles.editBtnRow}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.editBtn, { backgroundColor: colors.success }]}
            >
              <MaterialIcons name="check" size={14} color="#fff" />
              <Text style={[styles.editBtnText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.editBtn, { backgroundColor: colors.borderLight }]}
            >
              <MaterialIcons name="close" size={14} color={colors.textMuted} />
              <Text style={[styles.editBtnText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={selectionMode ? onLongPress : undefined}
          onLongPress={!selectionMode ? onLongPress : undefined}
          delayLongPress={400}
          activeOpacity={selectionMode ? 0.7 : 1}
          style={styles.viewRow}
        >
          {selectionMode ? (
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: selected ? colors.info : colors.surface,
                  borderColor: selected ? colors.info : colors.inputBorder,
                },
              ]}
            >
              {selected && <MaterialIcons name="check" size={12} color="#fff" />}
            </View>
          ) : (
            <View
              style={[
                styles.urgencyDot,
                { backgroundColor: getUrgencyColor(dueDate, colors) },
              ]}
            />
          )}

          <View style={styles.content}>
            <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{task.title}</Text>
            {task.description ? (
              <Text style={[styles.taskDesc, { color: colors.textMuted }]} numberOfLines={1}>
                {task.description}
              </Text>
            ) : null}
            {(dueDate || propertyName) ? (
              <View style={styles.metaRow}>
                {dueDate ? (
                  <Text style={[styles.metaText, { color: colors.textDisabled }]}>
                    Due {dueDate.toISOString().split('T')[0]}
                  </Text>
                ) : null}
                {dueDate && propertyName ? (
                  <Text style={[styles.metaText, { color: colors.border }]}>·</Text>
                ) : null}
                {propertyName ? (
                  <Text style={[styles.metaText, { color: colors.textDisabled }]}>{propertyName}</Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {!readOnly && !selectionMode && (
            <>
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.iconBtn} hitSlop={6}>
                <MaterialIcons name="edit" size={15} color={colors.textDisabled} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={styles.iconBtn} hitSlop={6}>
                <MaterialIcons name="delete-outline" size={15} color={colors.border} />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  editContainer: {
    padding: 12,
    gap: 8,
  },
  editInput: {
    fontWeight: '600',
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    paddingVertical: 7,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    flexShrink: 0,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 10,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  taskDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  iconBtn: {
    padding: 6,
  },
});
