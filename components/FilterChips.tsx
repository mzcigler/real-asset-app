import HorizontalScrollWithBar from '@/components/HorizontalScrollWithBar';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export type ChipVariant = 'primary' | 'success';

export type ChipOption = {
  label: string;
  value: string | null;
};

type Props = {
  options: ChipOption[];
  selected: string | null;
  onSelect: (v: string | null) => void;
  variant?: ChipVariant;
};

export default function FilterChips({ options, selected, onSelect, variant = 'primary' }: Props) {
  const { colors } = useTheme();

  const activeColor = variant === 'success' ? colors.success : colors.primary;
  const activeBg = variant === 'success' ? colors.successLight : colors.primaryLight;

  return (
    <HorizontalScrollWithBar style={styles.scroll} contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value ?? '__null__'}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.chip,
              {
                borderColor: isSelected ? activeColor : colors.border,
                backgroundColor: isSelected ? activeBg : 'transparent',
              },
            ]}
          >
            <Text style={[
              styles.chipText,
              {
                color: isSelected ? activeColor : colors.textSecondary,
                fontWeight: isSelected ? '600' : '400',
              },
            ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </HorizontalScrollWithBar>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.sm + 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: fontSize.sm,
  },
});
