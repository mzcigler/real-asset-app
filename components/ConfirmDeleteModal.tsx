/**
 * Reusable delete confirmation dialog.
 *
 * Usage:
 *   <ConfirmDeleteModal
 *     visible={pendingIds.length > 0}
 *     title="Delete Property"
 *     message="Are you sure? This cannot be undone."
 *     onConfirm={handleDelete}
 *     onCancel={() => setPendingIds([])}
 *   />
 */

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
};

export default function ConfirmDeleteModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
}: Props) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ width: 320, backgroundColor: colors.surface, borderRadius: 16, padding: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 8, color: colors.textPrimary }}>
            {title}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 20, lineHeight: 20 }}>
            {message}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={onConfirm}
              style={{ flex: 1, backgroundColor: colors.danger, borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{confirmLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCancel}
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
