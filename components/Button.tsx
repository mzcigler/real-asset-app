/**
 * Primary button component.
 *
 * All app buttons should use this component so visual changes can be made
 * in one place. Variants map to colors defined in theme/colors.ts.
 *
 * Usage:
 *   <Button title="Save" variant="success" onPress={handleSave} fullWidth />
 *   <Button title="Delete" variant="danger" onPress={handleDelete} />
 *   <Button title="Cancel" variant="secondary" onPress={handleCancel} />
 *   <Button title="Upload" variant="outline" onPress={handleUpload} fullWidth />
 */
import { useTheme } from '@/theme/ThemeContext';
import { Colors } from '@/theme/colors';
import { INPUT_HEIGHT, buttonSizes } from '@/theme/tokens';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'secondary'
  | 'outline';

type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  /** Match height of SingleLineInput */
  matchInputHeight?: boolean;
  /** Optional text styling (for X button, etc) */
  textStyle?: TextStyle;
  /** Icon rendered to the left of the title */
  leftIcon?: React.ReactNode;
};

function resolveColors(variant: ButtonVariant, colors: Colors, disabled: boolean) {
  if (disabled) {
    return { bg: colors.border, text: colors.textDisabled, borderColor: 'transparent', bordered: false };
  }
  switch (variant) {
    case 'primary': return { bg: colors.primary, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'success': return { bg: colors.success, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'danger': return { bg: colors.danger, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'warning': return { bg: colors.warning, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'info': return { bg: colors.info, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'secondary': return { bg: colors.surface, text: colors.textSecondary, borderColor: colors.border, bordered: true };
    case 'outline': return { bg: 'transparent', text: colors.info, borderColor: colors.info, bordered: true };
  }
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  matchInputHeight = false,
  textStyle,
  leftIcon,
}: ButtonProps) {
  const { colors } = useTheme();
  const c = resolveColors(variant, colors, disabled || loading);
  const s = buttonSizes[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          backgroundColor: c.bg,
          borderRadius: s.borderRadius,
          paddingVertical: matchInputHeight ? 0 : s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          ...(matchInputHeight && { height: INPUT_HEIGHT }),
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          borderWidth: c.bordered ? 1 : 0,
          borderColor: c.borderColor,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={c.text} />}
      {!loading && leftIcon}

      <Text
        style={[
          { color: c.text, fontSize: s.fontSize, fontWeight: '600', textAlign: 'center', lineHeight: matchInputHeight ? INPUT_HEIGHT : undefined },
          textStyle,
        ]}
      >
        {loading ? 'Loading…' : title}
      </Text>
    </TouchableOpacity>
  );
}