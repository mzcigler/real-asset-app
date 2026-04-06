import { SingleLineInput } from '@/components/Inputs';
import { useTheme } from '@/theme/ThemeContext';
import { StyleSheet, Text, View } from 'react-native';

type PhoneInputProps = {
  areaCode: string;
  setAreaCode: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
};

export default function PhoneInput({ areaCode, setAreaCode, phone, setPhone }: PhoneInputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.codeBox, {
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
      }]}>
        <Text style={styles.flag}>🇨🇦</Text>
        <Text style={[styles.codeText, { color: colors.textPrimary }]}>{areaCode}</Text>
      </View>
      <View style={styles.phoneInput}>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 78,
    marginRight: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  flag: {
    fontSize: 14,
    marginRight: 4,
  },
  codeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  phoneInput: {
    flex: 1,
  },
});
