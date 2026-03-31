import { useTheme } from '@/theme/ThemeContext';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
      style={{ marginBottom: 10 }}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value ?? '__null__'}
              onPress={() => onSelect(opt.value)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.primaryLight : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: isSelected ? colors.primary : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '400',
                }}
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
