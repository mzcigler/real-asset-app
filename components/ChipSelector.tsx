/**
 * Reusable horizontal chip group.
 * Used wherever the user picks one value from a small set of options.
 */
import { useTheme } from '@/theme/ThemeContext';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ChipOption = {
  label: string;
  value: string | null;
};

type Props = {
  /** Optional label rendered above the chips */
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value ?? '__null__'}
              onPress={() => onSelect(opt.value)}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? colors.success : colors.border,
                  backgroundColor: isSelected ? colors.successLight : 'transparent',
                },
              ]}
            >
              <Text style={[
                styles.chipText,
                {
                  color: isSelected ? colors.success : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
});
