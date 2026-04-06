import { Platform, StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type BaseInputProps = TextInputProps & {
  placeholderText?: string;
};

/** Single-line themed text input */
export function SingleLineInput({
  placeholderText = '',
  style,
  ...props
}: BaseInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholder={placeholderText}
      placeholderTextColor={colors.inputPlaceholder}
      numberOfLines={1}
      style={[
        styles.base,
        {
          borderColor: colors.inputBorder,
          backgroundColor: colors.inputBackground,
          color: colors.textPrimary,
        },
        style,
      ]}
      {...props}
    />
  );
}

/** Multi-line themed text input */
export function MultiLineInput({
  placeholderText = '',
  style,
  ...props
}: BaseInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholder={placeholderText}
      placeholderTextColor={colors.inputPlaceholder}
      multiline
      textAlignVertical="top"
      scrollEnabled
      style={[
        styles.base,
        styles.multiLine,
        {
          borderColor: colors.inputBorder,
          backgroundColor: colors.inputBackground,
          color: colors.textPrimary,
        },
        Platform.OS === 'web' ? ({ resize: 'vertical', overflow: 'auto' } as any) : {},
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
    fontSize: 14,
  },
  multiLine: {
    minHeight: 80,
  },
});
