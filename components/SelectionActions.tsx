import Button from './Button';
import { StyleSheet, View } from 'react-native';

type Props = {
  selectedCount: number;
  onCancel: () => void;
  onDelete: () => void;
};

export default function SelectionActions({ selectedCount, onCancel, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Button title="Cancel" onPress={onCancel} variant="secondary" size="sm" />
      <Button
        title={selectedCount > 0 ? `Delete (${selectedCount})` : 'Delete'}
        onPress={onDelete}
        variant="danger"
        size="sm"
        disabled={selectedCount === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
