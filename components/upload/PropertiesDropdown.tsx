import { supabase } from '@/services/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { INPUT_HEIGHT } from '@/theme/tokens';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type PropertyDropdownProps = {
  userId: string;
  selectedProperty: string | null;
  onSelect: (propertyId: string | null) => void;
};

export default function PropertyDropdown({ userId, selectedProperty, onSelect }: PropertyDropdownProps) {
  const { colors } = useTheme();
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('properties')
      .select('id, name')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (!error) setProperties(data || []);
      });
  }, [userId]);

  return (
    <>
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        Select Property:
      </Text>

      <View style={[styles.pickerWrap, {
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
      }]}>
        <Picker
          selectedValue={selectedProperty ?? ''}
          onValueChange={(itemValue: string) => onSelect(itemValue || null)}
          style={[styles.picker, {
            color: colors.textPrimary,
            backgroundColor: colors.inputBackground,
            ...Platform.select({
              ios: { paddingVertical: 0 },
              android: {},
            }),
          }]}
          itemStyle={[styles.pickerItem, { color: colors.textPrimary }]}
        >
          <Picker.Item label="Select a property..." value="" />
          {properties.map((prop) => (
            <Picker.Item key={prop.id} label={prop.name} value={prop.id} />
          ))}
        </Picker>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 6,
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    height: INPUT_HEIGHT,
    justifyContent: 'center',
  },
  picker: {
    height: INPUT_HEIGHT,
    paddingHorizontal: 12,
  },
  pickerItem: {
    fontSize: 14,
  },
});
