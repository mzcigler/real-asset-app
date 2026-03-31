import { DateInput } from '@/components/DateInput';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LoadingModal } from './LoadingModal';
import Button from './Button';
import { useTheme } from '@/theme/ThemeContext';
import { Property } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, dueDate: Date | null, propertyId?: string) => Promise<void>;
  /** When provided, shows a property selector (used from dashboard) */
  properties?: Property[];
};

export default function AddTaskModal({ visible, onClose, onAdd, properties }: Props) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = !!title.trim() && (!properties || !!selectedPropertyId);

  const handleAdd = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onAdd(title.trim(), description.trim(), dueDate, selectedPropertyId ?? undefined);
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
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <>
      <LoadingModal visible={saving} message="Saving task…" />
      <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: 340, backgroundColor: colors.surface, borderRadius: 16, padding: 24 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 14, color: colors.textPrimary }}>
              New Task
            </Text>

            {/* Property selector (dashboard only) */}
            {properties && (
              <>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>Property *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {properties.map((p) => {
                      const isSelected = selectedPropertyId === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => setSelectedPropertyId(p.id)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.success : colors.border,
                            backgroundColor: isSelected ? colors.successLight : colors.surface,
                          }}
                        >
                          <Text style={{
                            fontSize: 13,
                            color: isSelected ? colors.success : colors.textSecondary,
                            fontWeight: isSelected ? '600' : '400',
                          }}>
                            {p.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            )}

            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              placeholderTextColor={colors.inputPlaceholder}
              autoFocus
              style={{
                borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                padding: 10, fontSize: 14, marginBottom: 12,
                color: colors.textPrimary, backgroundColor: colors.inputBackground,
              }}
            />

            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4 }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional"
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              style={{
                borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8,
                padding: 10, fontSize: 14, marginBottom: 12, minHeight: 60,
                color: colors.textPrimary, backgroundColor: colors.inputBackground,
              }}
            />

            <DateInput value={dueDate} onChange={setDueDate} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Button
                title={saving ? 'Saving…' : 'Add'}
                onPress={handleAdd}
                variant="success"
                disabled={saving || !canSubmit}
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
