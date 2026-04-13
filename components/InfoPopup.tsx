import Button, { ButtonVariant } from '@/components/Button';
import { fontSize, radius, spacing } from '@/theme/tokens';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

  const hasButtons = showConfirm || !!cancelText;
  const isSuccess = type === 'success';

  const titleColor =
    type === 'success' ? colors.success :
    type === 'warning' ? colors.warning :
    colors.danger;

  const iconName =
    type === 'success' ? 'check-circle' :
    type === 'warning' ? 'warning' :
    'error';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={dismissOnBackdropPress ? onClose : undefined}
      >
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: isSuccess ? colors.successLight : 'transparent' }]}>
            <MaterialIcons
              name={iconName}
              size={isSuccess ? 48 : 32}
              color={titleColor}
            />
          </View>

          {title && (
            <Text style={[styles.title, { color: titleColor, fontSize: isSuccess ? fontSize.xxl : fontSize.xl }]}>
              {title}
            </Text>
          )}

          <Text style={[
            styles.message,
            {
              color: colors.textSecondary,
              fontSize: isSuccess ? fontSize.md : fontSize.lg,
              marginBottom: hasButtons ? spacing.lg : 0,
            },
          ]}>
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
    padding: spacing.lg,
  },
  box: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  iconWrap: {
    borderRadius: 999,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  btnGroup: {
    gap: spacing.sm + 2,
    width: '100%',
  },
});
