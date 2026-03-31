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
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ width: 320, backgroundColor: colors.surface, borderRadius: 16, padding: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 14, color: colors.textPrimary }}>
            {title}
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            autoFocus
            onSubmitEditing={handleSave}
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              borderRadius: 8,
              padding: 10,
              fontSize: 15,
              marginBottom: 16,
              color: colors.textPrimary,
              backgroundColor: colors.inputBackground,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!value.trim()}
              style={{
                flex: 1,
                backgroundColor: value.trim() ? colors.info : colors.border,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{ flex: 1, backgroundColor: colors.borderLight, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
