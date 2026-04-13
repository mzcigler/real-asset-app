import { SingleLineInput } from '@/components/Inputs';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
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
    marginRight: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
  },
  flag: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  codeText: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  phoneInput: {
    flex: 1,
  },
});
