/**
 * Reusable rename / text-input dialog.
 *
 * Usage:
 *   <RenameModal
 *     visible={!!renaming}
 *     title="Rename Property"
 *     initialValue={renaming?.name ?? ''}
 *     onSave={handleRename}
 *     onClose={() => setRenaming(null)}
 *   />
 */

import Button from '@/components/Button';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  visible: boolean;
  title?: string;
  initialValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
};

export default function RenameModal({
  visible,
  title = 'Rename',
  initialValue,
  onSave,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const handleSave = () => {
    if (value.trim()) onSave(value.trim());
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            onSubmitEditing={handleSave}
            style={[styles.input, {
              borderColor: colors.inputBorder,
              color: colors.textPrimary,
              backgroundColor: colors.inputBackground,
            }]}
          />
          <View style={styles.row}>
            <Button title="Save" onPress={handleSave} variant="info" disabled={!value.trim()} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={onClose} variant="secondary" style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 320,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginBottom: spacing.md + 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm + 2,
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
});
