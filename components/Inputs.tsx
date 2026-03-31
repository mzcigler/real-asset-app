import { Platform, TextInput, TextInputProps } from 'react-native';
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
        {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
          width: '100%',
          backgroundColor: colors.inputBackground,
          color: colors.textPrimary,
          fontSize: 14,
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
        {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginBottom: 12,
          width: '100%',
          minHeight: 80,
          backgroundColor: colors.inputBackground,
          color: colors.textPrimary,
          fontSize: 14,
        },
        Platform.OS === 'web' ? ({ resize: 'vertical', overflow: 'auto' } as any) : {},
        style,
      ]}
      {...props}
    />
  );
}
