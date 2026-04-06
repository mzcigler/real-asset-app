import { useTheme } from '@/theme/ThemeContext';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ChipOption = {
  label: string;
  value: string | null;
};

type Props = {
  options: ChipOption[];
  selected: string | null;
  onSelect: (v: string | null) => void;
};

export default function FilterChips({ options, selected, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.row}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value ?? '__null__'}
              onPress={() => onSelect(opt.value)}
              style={[
                styles.chip,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 10,
  },
  scrollContent: {
    paddingRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
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
