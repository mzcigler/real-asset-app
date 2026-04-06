import Button from './Button';
import ChipSelector from '@/components/ChipSelector';
import { DateInput } from '@/components/DateInput';
import { fetchFilesForProperty } from '@/services/fileService';
import { useTheme } from '@/theme/ThemeContext';
import { FileRecord, Property } from '@/types';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [availableFiles, setAvailableFiles] = useState<FileRecord[]>(propFiles || []);
  const [saving, setSaving] = useState(false);

  // Dashboard mode: fetch files when selected property changes
  useEffect(() => {
    setSelectedFileId(null);
    setAvailableFiles([]);
    if (!selectedPropertyId) return;
    fetchFilesForProperty(selectedPropertyId).then(setAvailableFiles);
  }, [selectedPropertyId]);

  // Property detail mode: use pre-loaded files
  useEffect(() => {
    if (propFiles) setAvailableFiles(propFiles);
  }, [propFiles]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd(title.trim(), description.trim(), dueDate, selectedPropertyId ?? undefined, selectedFileId ?? undefined);
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
    setAvailableFiles([]);
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
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  inputMulti: {
    minHeight: 60,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
});
