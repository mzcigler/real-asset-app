import { useState } from 'react';
import { Button, View } from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';

type DateInputProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
};

export function DateInput({ value, onChange }: DateInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      <Button
        title={value ? value.toISOString().split('T')[0] : 'Select Due Date'}
        onPress={() => setVisible(true)}
      />

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