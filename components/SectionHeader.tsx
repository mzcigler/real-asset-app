import IconButton from './IconButton';
import SelectionActions from './SelectionActions';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/tokens';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  selectionMode: boolean;
  selectedCount: number;
  onAdd: () => void;
  onCancelSelection: () => void;
  onDeleteSelected: () => void;
};

export default function SectionHeader({
  title,
  selectionMode,
  selectedCount,
  onAdd,
  onCancelSelection,
  onDeleteSelected,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {selectionMode ? (
        <SelectionActions
          selectedCount={selectedCount}
          onCancel={onCancelSelection}
          onDelete={onDeleteSelected}
        />
      ) : (
        <IconButton icon="add" onPress={onAdd} size={30} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    flex: 1,
  },
});
