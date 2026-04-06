import HorizontalScrollWithBar from '@/components/HorizontalScrollWithBar';
import { useTheme } from '@/theme/ThemeContext';
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
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
});
