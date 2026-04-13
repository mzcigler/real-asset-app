import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type Tab = {
  label: string;
  value: string;
};

type Props = {
  tabs: Tab[];
  selected: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
};

export default function SegmentedControl({ tabs, selected, onSelect, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.borderLight }, style]}>
      {tabs.map((tab) => {
        const isSelected = selected === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            onPress={() => onSelect(tab.value)}
            style={[styles.tab, { backgroundColor: isSelected ? colors.surface : 'transparent' }]}
          >
            <Text style={[
              styles.label,
              {
                fontWeight: isSelected ? '600' : '400',
                color: isSelected ? colors.textPrimary : colors.textMuted,
              },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.md,
  },
});
