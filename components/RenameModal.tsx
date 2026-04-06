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

import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
            <TouchableOpacity
              onPress={handleSave}
              disabled={!value.trim()}
              style={[styles.btn, { backgroundColor: value.trim() ? colors.info : colors.border }]}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.btn, { backgroundColor: colors.borderLight }]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
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
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '600',
  },
  cancelText: {
    fontWeight: '500',
  },
});
