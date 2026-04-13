import ChipSelector from '@/components/ChipSelector';
import { DateInput } from '@/components/DateInput';
import Dropdown from '@/components/Dropdown';
import { ANCHOR_OPTIONS, FREQ_OPTIONS } from '@/constants/recurrence';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { FileRecord, Property, RecurAnchor, RecurFrequency } from '@/types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from './Button';
import { LoadingModal } from './LoadingModal';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    title: string,
    description: string,
    dueDate: Date | null,
    propertyId?: string,
    fileId?: string,
    recurFrequency?: RecurFrequency | null,
    recurAnchor?: RecurAnchor | null,
  ) => Promise<void>;
  /** Dashboard: shows property picker */
  properties?: Property[];
  /** Property detail: pre-loaded files for file picker */
  files?: FileRecord[];
};

export default function AddTaskModal({ visible, onClose, onAdd, properties, files: propFiles }: Props) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [recurFrequency, setRecurFrequency] = useState<RecurFrequency | null>(null);
  const [recurAnchor, setRecurAnchor] = useState<RecurAnchor>('completion');
  const [saving, setSaving] = useState(false);

  const availableFiles = usePropertyFiles(
    selectedPropertyId,
    propFiles,
    selectedFileId,
    () => setSelectedFileId(null),
  );

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd(
        title.trim(),
        description.trim(),
        dueDate,
        selectedPropertyId ?? undefined,
        selectedFileId ?? undefined,
        recurFrequency,
        recurFrequency ? recurAnchor : null,
      );
      reset();
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate(null);
    setSelectedPropertyId(null);
    setSelectedFileId(null);
    setRecurFrequency(null);
    setRecurAnchor('completion');
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <>
      <LoadingModal visible={saving} message="Saving task…" />
      <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.box, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>New Task</Text>

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

            <Text style={[styles.label, { color: colors.textMuted }]}>Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={colors.inputPlaceholder}
              autoFocus
              style={[styles.input, {
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
                backgroundColor: colors.inputBackground,
              }]}
            />

            <Text style={[styles.label, { color: colors.textMuted }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional"
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              style={[styles.input, styles.inputMulti, {
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
                backgroundColor: colors.inputBackground,
              }]}
            />

            <DateInput value={dueDate} onChange={setDueDate} />

            <View style={styles.recurrenceSection}>
              <View style={styles.dropLabelRow}>
                <Text style={[styles.dropLabel, { color: colors.textMuted }]}>Repeats</Text>
                {recurFrequency && (
                  <TouchableOpacity onPress={() => setRecurFrequency(null)} hitSlop={8}>
                    <MaterialIcons name="close" size={13} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <Dropdown
                options={FREQ_OPTIONS}
                selected={recurFrequency}
                onSelect={(v) => setRecurFrequency(v as RecurFrequency | null)}
                placeholder="No recurrence"
                size="sm"
              />
              {recurFrequency && (
                <>
                  <View style={styles.gap} />
                  <Dropdown
                    label="Schedule from"
                    options={ANCHOR_OPTIONS}
                    selected={recurAnchor}
                    onSelect={(v) => setRecurAnchor((v as RecurAnchor) ?? 'completion')}
                    size="sm"
                  />
                </>
              )}
            </View>

            <View style={styles.btnRow}>
              <Button
                title={saving ? 'Saving…' : 'Add'}
                onPress={handleAdd}
                variant="success"
                disabled={saving || !title.trim()}
                style={{ flex: 1 }}
              />
              <Button title="Cancel" onPress={handleCancel} variant="secondary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 340,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.md + 2,
  },
  label: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  inputMulti: {
    minHeight: 60,
  },
  recurrenceSection: {
    marginTop: spacing.md,
  },
  gap: {
    height: spacing.sm,
  },
  dropLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dropLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
    marginTop: spacing.lg,
  },
});
