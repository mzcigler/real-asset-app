import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type PopupType = 'warning' | 'error' | 'success';

type Props = {
  visible: boolean;
  type?: PopupType;
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  showConfirm?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
  autoDismiss?: number;
  dismissOnBackdropPress?: boolean;
};

export default function InfoPopup({
  visible,
  type = 'error',
  title,
  message,
  onClose,
  confirmText = 'OK',
  showConfirm = true,
  cancelText,
  onConfirm,
  autoDismiss,
  dismissOnBackdropPress = true,
}: Props) {
  const { colors } = useTheme();

  useEffect(() => {
    if (visible && autoDismiss) {
      const timer = setTimeout(onClose, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismiss]);

  const titleColor =
    type === 'success' ? colors.success :
    type === 'warning' ? colors.warning :
    colors.danger;

  const confirmBg =
    type === 'success' ? colors.success :
    type === 'warning' ? colors.warning :
    colors.danger;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={dismissOnBackdropPress ? onClose : undefined}
      >
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          {title && (
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          )}
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <View style={styles.btnGroup}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.borderLight }]}
                onPress={onClose}
              >
                <Text style={[styles.btnText, { color: colors.textSecondary }]}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            {showConfirm && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: confirmBg }]}
                onPress={() => { onConfirm?.(); onClose(); }}
              >
                <Text style={[styles.btnText, { color: '#fff' }]}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  box: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  btnGroup: {
    gap: 10,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '600',
  },
});
