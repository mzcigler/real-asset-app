import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';

type DateInputProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export function DateInput({ value, onChange }: DateInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
        }}
      >
        <MaterialIcons name="calendar-today" size={14} color="#6b7280" />
        <Text style={{ fontSize: 13, color: value ? '#111827' : '#9ca3af', flex: 1 }}>
          {value ? value.toISOString().split('T')[0] : 'Due date (optional)'}
        </Text>
        {value && (
          <TouchableOpacity onPress={() => onChange(null)} hitSlop={8}>
            <MaterialIcons name="close" size={14} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

        <DatePickerModal
        locale="en"
        mode="single"
        visible={visible}
        date={value || new Date()}
        onDismiss={() => setVisible(false)}
        onConfirm={(params) => {
        setVisible(false);

        // params.date is CalendarDate | undefined, NOT Date
        const calDate = params.date; 
        let pickedDate: Date | null = null;

        if (calDate) {
            // CalendarDate has year, month, day
            pickedDate = calDate; 
        }

        onChange(pickedDate); // pickedDate is Date | null
        }}
        />
    </View>
  );
}