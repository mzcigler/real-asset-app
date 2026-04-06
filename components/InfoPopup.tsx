import Button, { ButtonVariant } from '@/components/Button';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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

function typeToVariant(type: PopupType): ButtonVariant {
  if (type === 'success') return 'success';
  if (type === 'warning') return 'warning';
  return 'danger';
}

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

  const hasButtons = showConfirm || !!cancelText;

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
          <Text style={[styles.message, { color: colors.textSecondary, marginBottom: hasButtons ? 20 : 0 }]}>
            {message}
          </Text>
          {hasButtons && (
            <View style={styles.btnGroup}>
              {cancelText && (
                <Button title={cancelText} onPress={onClose} variant="secondary" fullWidth />
              )}
              {showConfirm && (
                <Button
                  title={confirmText}
                  onPress={() => { onConfirm?.(); onClose(); }}
                  variant={typeToVariant(type)}
                  fullWidth
                />
              )}
            </View>
          )}
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
    textAlign: 'center',
    lineHeight: 22,
  },
  btnGroup: {
    gap: 10,
  },
});
