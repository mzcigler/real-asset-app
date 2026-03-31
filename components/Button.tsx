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
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
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
};

const INPUT_HEIGHT = 40;

function resolveColors(variant: ButtonVariant, colors: Colors, disabled: boolean) {
  if (disabled) {
    return { bg: colors.border, text: colors.textDisabled, borderColor: 'transparent', bordered: false };
  }
  switch (variant) {
    case 'primary': return { bg: colors.primary, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'success': return { bg: colors.success, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'danger': return { bg: colors.danger, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'info': return { bg: colors.info, text: '#fff', borderColor: 'transparent', bordered: false };
    case 'secondary': return { bg: colors.surface, text: colors.textSecondary, borderColor: colors.border, bordered: true };
    case 'outline': return { bg: 'transparent', text: colors.info, borderColor: colors.info, bordered: true };
  }
}

const sizes = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 13, borderRadius: 8 },
  md: { paddingVertical: 11, paddingHorizontal: 16, fontSize: 14, borderRadius: 10 },
  lg: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16, borderRadius: 12 },
};

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
}: ButtonProps) {
  const { colors } = useTheme();
  const c = resolveColors(variant, colors, disabled || loading);
  const s = sizes[size];

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