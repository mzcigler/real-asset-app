import { ActivityIndicator, Modal, Text, View } from 'react-native';
import Button from './Button';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  visible: boolean;
  message?: string;
  onCancel?: () => void;
};

export function LoadingModal({ visible, message, onCancel }: Props) {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay }}>
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 24,
            width: 280,
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.success} />
          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: onCancel ? 16 : 0, textAlign: 'center' }}>
            {message || 'Processing…'}
          </Text>
          {onCancel && (
            <Button title="Cancel" onPress={onCancel} variant="secondary" fullWidth />
          )}
        </View>
      </View>
    </Modal>
  );
}
