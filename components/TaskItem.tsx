import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  // Exit editing when selection mode activates
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
      style={{
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.info : colors.border,
        borderRadius: 10,
        backgroundColor: colors.surface,
        marginBottom: 6,
        overflow: 'hidden',
      }}
    >
      {editing ? (
        <View style={{ padding: 12, gap: 8 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor={colors.inputPlaceholder}
            style={{
              fontWeight: '600',
              fontSize: 14,
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 7,
              color: colors.textPrimary,
              backgroundColor: colors.inputBackground,
            }}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            placeholderTextColor={colors.inputPlaceholder}
            style={{
              fontSize: 13,
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 7,
              color: colors.textSecondary,
              backgroundColor: colors.inputBackground,
            }}
          />
          <DateInput value={dueDate} onChange={(date: Date | null) => setDueDate(date)} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 4, backgroundColor: colors.success, borderRadius: 8, paddingVertical: 7,
              }}
            >
              <MaterialIcons name="check" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 4, backgroundColor: colors.borderLight, borderRadius: 8, paddingVertical: 7,
              }}
            >
              <MaterialIcons name="close" size={14} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={selectionMode ? onLongPress : undefined}
          onLongPress={!selectionMode ? onLongPress : undefined}
          delayLongPress={400}
          activeOpacity={selectionMode ? 0.7 : 1}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
        >
          {selectionMode ? (
            <View
              style={{
                width: 20, height: 20, borderRadius: 10, marginRight: 10, flexShrink: 0,
                backgroundColor: selected ? colors.info : colors.surface,
                borderWidth: 2, borderColor: selected ? colors.info : colors.inputBorder,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {selected && <MaterialIcons name="check" size={12} color="#fff" />}
            </View>
          ) : (
            <View
              style={{
                width: 11, height: 11, borderRadius: 6,
                backgroundColor: getUrgencyColor(dueDate, colors),
                marginRight: 10, flexShrink: 0,
              }}
            />
          )}

          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontWeight: '600', fontSize: 14, color: colors.textPrimary }}>{task.title}</Text>
            {task.description ? (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }} numberOfLines={1}>
                {task.description}
              </Text>
            ) : null}
            {(dueDate || propertyName) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                {dueDate ? (
                  <Text style={{ fontSize: 11, color: colors.textDisabled }}>
                    Due {dueDate.toISOString().split('T')[0]}
                  </Text>
                ) : null}
                {dueDate && propertyName ? (
                  <Text style={{ fontSize: 11, color: colors.border }}>·</Text>
                ) : null}
                {propertyName ? (
                  <Text style={{ fontSize: 11, color: colors.textDisabled }}>{propertyName}</Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {!readOnly && !selectionMode && (
            <>
              <TouchableOpacity onPress={() => setEditing(true)} style={{ padding: 6 }} hitSlop={6}>
                <MaterialIcons name="edit" size={15} color={colors.textDisabled} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={{ padding: 6 }} hitSlop={6}>
                <MaterialIcons name="delete-outline" size={15} color={colors.border} />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
