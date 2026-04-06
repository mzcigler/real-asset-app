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
 *     loading={deleteLoading}
 *   />
 */

import Button from '@/components/Button';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
};

export default function ConfirmDeleteModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  loading = false,
  loadingLabel = 'Deleting...',
}: Props) {
  const { colors } = useTheme();

  // Freeze displayed content while the modal is closing (prevents "Delete 0" flash during fade-out)
  const [displayTitle, setDisplayTitle] = useState(title);
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    if (visible) {
      setDisplayTitle(title);
      setDisplayMessage(message);
    }
  }, [visible, title, message]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={loading ? undefined : onCancel}>
      <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{displayTitle}</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.danger} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>{loadingLabel}</Text>
            </View>
          ) : (
            <>
              <Text style={[styles.message, { color: colors.textMuted }]}>{displayMessage}</Text>
              <View style={styles.row}>
                <Button title={confirmLabel} onPress={onConfirm} variant="danger" style={{ flex: 1 }} />
                <Button title="Cancel" onPress={onCancel} variant="secondary" style={{ flex: 1 }} />
              </View>
            </>
          )}
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
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  loadingText: {
    fontSize: 14,
  },
});
