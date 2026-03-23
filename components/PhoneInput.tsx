import { SingleLineInput } from '@/components/Inputs';
import { Text, View } from 'react-native';

type PhoneInputProps = {
  areaCode: string;
  setAreaCode: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
};

export default function PhoneInput({ areaCode, setAreaCode, phone, setPhone } : PhoneInputProps) {
  return (
    <View className="flex-row w-full max-w-xs items-center">
      {/* TODO add morn area code add flags to assets */}
      <View className="flex-row items-center justify-center w-1/4 mr-2 mb-3 border border-gray-400 rounded-lg bg-white"
            style={{ height: 44, paddingHorizontal: 12 }}>
        <Text className="text-md mr-2">🇨🇦</Text> 
        <Text className="text-black text-md font-semibold">{areaCode}</Text>
      </View>

      <SingleLineInput 
        placeholderText="Phone Number"
        value={phone}
        onChangeText={setPhone}
        textColor="text-black"
        fontWeight="font-semibold"
        keyboardType="phone-pad"
        customStyle="flex-1"
      />
    </View>
  );
}