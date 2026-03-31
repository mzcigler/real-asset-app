import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

const INPUT_HEIGHT = 40;

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
      <Text
        style={{
          fontWeight: '600',
          marginTop: 6,
          marginBottom: 6,
          color: colors.textPrimary,
        }}
      >
        Select Property:
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 12,
          backgroundColor: colors.inputBackground,
          height: INPUT_HEIGHT,
          justifyContent: 'center',
        }}
      >
        <Picker
          selectedValue={selectedProperty ?? ''}
          onValueChange={(itemValue: string) => onSelect(itemValue || null)}
          style={{
            color: colors.textPrimary,       // text color for both themes
            height: INPUT_HEIGHT,             // match container
            paddingHorizontal: 12,            // padding inside picker
            backgroundColor: colors.inputBackground,
            ...Platform.select({
              ios: { paddingVertical: 0 },    // iOS tweaks
              android: {},                     // Android uses paddingHorizontal
            }),
          }}
          itemStyle={{
            fontSize: 14,
            color: colors.textPrimary,        // ensures text matches theme
          }}
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