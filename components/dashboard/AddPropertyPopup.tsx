import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '@/components/Button';
import InfoPopup from '@/components/InfoPopup';
import { LoadingModal } from '@/components/LoadingModal';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { createProperty } from '@/services/propertyService';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPropertyAdded?: () => void;
};

export default function AddPropertyPopup({ visible, onClose, onPropertyAdded }: Props) {
  const { colors } = useTheme();
  const [propertyName, setPropertyName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!propertyName.trim()) return;
    try {
      setAdding(true);
      await createProperty(propertyName.trim());
      setPropertyName('');
      onClose();
      onPropertyAdded?.();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to add property. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleCancel = () => {
    setPropertyName('');
    onClose();
  };

  return (
    <>
      <LoadingModal visible={adding} message="Adding property…" />
      <InfoPopup
        visible={!!error}
        type="error"
        title="Error"
        message={error ?? ''}
        onClose={() => setError(null)}
      />
      <Modal transparent visible={visible} animationType="fade">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.box, { backgroundColor: colors.surface }]}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Add New Property
              </Text>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Property Name</Text>
              <TextInput
                value={propertyName}
                onChangeText={setPropertyName}
                placeholder="e.g. Main House, Condo #3…"
                placeholderTextColor={colors.inputPlaceholder}
                autoFocus
                onSubmitEditing={handleAdd}
                style={[styles.input, {
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                  backgroundColor: colors.inputBackground,
                }]}
              />
              <Button
                title={adding ? 'Adding…' : 'Add Property'}
                onPress={handleAdd}
                variant="success"
                disabled={adding || !propertyName.trim()}
                fullWidth
                style={{ marginBottom: spacing.sm + 2 }}
              />
              <Button title="Cancel" onPress={handleCancel} variant="secondary" fullWidth />
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 400,
    maxWidth: '90%',
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs + 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    marginBottom: spacing.lg,
    fontSize: fontSize.lg,
  },
});
