import ChipSelector from '@/components/ChipSelector';
import { fetchFilesForProperty } from '@/services/fileService';
import { useTheme } from '@/theme/ThemeContext';
import { FileRecord, Property, TaskType } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from './Button';
import { DateInput } from './DateInput';

type TaskItemProps = {
  task: TaskType;
  onUpdate: (updatedTask: TaskType) => void;
  onDelete: () => void;
  readOnly?: boolean;
  propertyName?: string;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
  /** Dashboard: pass all properties so user can change property in edit mode */
  properties?: Property[];
  /** Property detail: pass pre-loaded files for the current property */
  files?: FileRecord[];
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
  properties,
  files: propFiles,
}: TaskItemProps) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(task.propertyId ?? null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(task.fileId ?? null);
  const [availableFiles, setAvailableFiles] = useState<FileRecord[]>(propFiles || []);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setSelectedPropertyId(task.propertyId ?? null);
    setSelectedFileId(task.fileId ?? null);
  }, [task]);

  useEffect(() => {
    if (selectionMode) setEditing(false);
  }, [selectionMode]);

  // Dashboard mode: fetch files when selected property changes
  useEffect(() => {
    if (!properties) return;
    setSelectedFileId(null);
    setAvailableFiles([]);
    if (!selectedPropertyId) return;
    fetchFilesForProperty(selectedPropertyId).then(setAvailableFiles);
  }, [selectedPropertyId, properties]);

  // Property detail mode: use pre-loaded files
  useEffect(() => {
    if (propFiles) setAvailableFiles(propFiles);
  }, [propFiles]);

  const handleSave = () => {
    onUpdate({ ...task, title, description, dueDate, propertyId: selectedPropertyId, fileId: selectedFileId });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setSelectedPropertyId(task.propertyId ?? null);
    setSelectedFileId(task.fileId ?? null);
    setAvailableFiles(propFiles || []);
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
          <Text style={[styles.editHeader, { color: colors.textPrimary }]}>Edit Task</Text>

          {properties && (
            <ChipSelector
              label="Property"
              options={[
                { label: 'None', value: null },
                ...properties.map((p) => ({ label: p.name, value: p.id })),
              ]}
              selected={selectedPropertyId}
              onSelect={setSelectedPropertyId}
            />
          )}

          {availableFiles.length > 0 && (
            <ChipSelector
              label="Link to file"
              options={[
                { label: 'None', value: null },
                ...availableFiles.map((f) => ({ label: f.file_name, value: f.id })),
              ]}
              selected={selectedFileId}
              onSelect={setSelectedFileId}
            />
          )}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor={colors.inputPlaceholder}
            style={[styles.input, {
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
            style={[styles.input, {
              borderColor: colors.inputBorder,
              color: colors.textSecondary,
              backgroundColor: colors.inputBackground,
            }]}
          />
          <DateInput value={dueDate} onChange={setDueDate} />

          <View style={styles.btnRow}>
            <Button title="Save" onPress={handleSave} variant="success" style={{ flex: 1 }} />
            <Button title="Cancel" onPress={handleCancel} variant="secondary" style={{ flex: 1 }} />
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
            <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(dueDate, colors) }]} />
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
                {dueDate && (
                  <Text style={[styles.metaText, { color: colors.textDisabled }]}>
                    Due {dueDate.toISOString().split('T')[0]}
                  </Text>
                )}
                {dueDate && propertyName && (
                  <Text style={[styles.metaText, { color: colors.border }]}>·</Text>
                )}
                {propertyName && (
                  <Text style={[styles.metaText, { color: colors.textDisabled }]}>{propertyName}</Text>
                )}
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
  editHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  input: {
    fontWeight: '600',
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
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
