import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
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
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.box, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.success} />
          <Text style={[
            styles.message,
            { color: colors.textPrimary, marginBottom: onCancel ? 16 : 0 },
          ]}>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    borderRadius: 12,
    padding: 24,
    width: 280,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});
