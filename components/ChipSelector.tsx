/**
 * Labeled chip selector — wraps FilterChips with an optional label above.
 * Used in forms/modals where the user picks one value from a set.
 * For standalone filter bars without a label, use FilterChips directly.
 */
import FilterChips, { ChipOption } from './FilterChips';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/tokens';
import { StyleSheet, Text, View } from 'react-native';

export type { ChipOption };

type Props = {
  label?: string;
  options: ChipOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
};

export default function ChipSelector({ label, options, selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}
      <FilterChips options={options} selected={selected} onSelect={onSelect} variant="success" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  label: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
});
