import { supabase } from '@/lib/supabase';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

type PropertyDropdownProps = {
  userId: string;
  selectedProperty: string | null;
  onSelect: (propertyId: string | null) => void;
};

export default function PropertyDropdown({
  userId,
  selectedProperty,
  onSelect,
}: PropertyDropdownProps) {
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching properties:", error);
      } else {
        setProperties(data || []);
      }
    };

    fetchProperties();
  }, [userId]);

  return (
    <>
      <Text style={{ fontWeight: 'bold', marginTop: 6, marginBottom: 6 }}>
        Select Property:
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 12,
          backgroundColor: 'white',
        }}
      >
        <Picker
          style={{
            height: 50, // make it "fatter"
            paddingHorizontal: 12,
          }}
          itemStyle={{
            fontSize: 16, // slightly larger text
          }}
            selectedValue={selectedProperty ?? ""}
            onValueChange={(itemValue: string) => onSelect(itemValue || null)}
        >
          <Picker.Item label="Select a property..." value="" />
          {properties.map((prop) => (
            <Picker.Item
              key={prop.id}
              label={prop.name}
              value={prop.id}
            />
          ))}
        </Picker>
      </View>
    </>
  );
}