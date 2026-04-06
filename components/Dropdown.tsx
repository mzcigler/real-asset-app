import { useTheme } from '@/theme/ThemeContext';
import { dropdownSizes } from '@/theme/tokens';
import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';

export type DropdownOption = {
  label: string;
  value: string | null;
};

type DropdownSize = 'sm' | 'md' | 'lg';

type Props = {
  options: DropdownOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  size?: DropdownSize;
  style?: ViewStyle;
};

export default function Dropdown({
  options,
  selected,
  onSelect,
  label,
  placeholder = 'Select...',
  size = 'md',
  style,
}: Props) {
  const { colors } = useTheme();
  const s = dropdownSizes[size];

  return (
    <View style={style}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted, fontSize: s.labelSize }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.pickerWrap,
        {
          height: s.height,
          borderRadius: s.borderRadius,
          borderColor: colors.inputBorder,
          backgroundColor: colors.inputBackground,
        },
      ]}>
        <Picker
          selectedValue={selected ?? ''}
          onValueChange={(val: string) => onSelect(val || null)}
          style={[
            styles.picker,
            {
              height: s.height,
              color: colors.textPrimary,
              backgroundColor: colors.inputBackground,
              fontSize: s.fontSize,
              ...Platform.select({ ios: { paddingVertical: 0 } }),
            },
          ]}
          itemStyle={{ color: colors.textPrimary, fontSize: s.fontSize }}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((opt) => (
            <Picker.Item
              key={opt.value ?? '__null__'}
              label={opt.label}
              value={opt.value ?? ''}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerWrap: {
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    paddingHorizontal: 12,
  },
});
