import { SingleLineInput } from '@/components/Inputs';
import { useTheme } from '@/theme/ThemeContext';
import { Text, View } from 'react-native';

type PhoneInputProps = {
  areaCode: string;
  setAreaCode: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
};

export default function PhoneInput({ areaCode, setAreaCode, phone, setPhone }: PhoneInputProps) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: 78,
          marginRight: 8,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          backgroundColor: colors.inputBackground,
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 14, marginRight: 4 }}>🇨🇦</Text>
        <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{areaCode}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <SingleLineInput
          placeholderText="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}
