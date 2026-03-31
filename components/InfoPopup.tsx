import { useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
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
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay, padding: 16 }}
        onPress={dismissOnBackdropPress ? onClose : undefined}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 320,
          }}
        >
          {title && (
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: titleColor }}>
              {title}
            </Text>
          )}

          <Text style={{ fontSize: 15, marginBottom: 20, textAlign: 'center', color: colors.textSecondary, lineHeight: 22 }}>
            {message}
          </Text>

          <View style={{ gap: 10 }}>
            {cancelText && (
              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.borderLight, alignItems: 'center' }}
                onPress={onClose}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            {showConfirm && (
              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, backgroundColor: confirmBg, alignItems: 'center' }}
                onPress={() => { onConfirm?.(); onClose(); }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
