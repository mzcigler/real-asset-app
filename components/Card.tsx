/**
 * Standard surface card — the app's one card look (concept design's Card).
 *
 * All boxed content (dashboard sections, stat tiles, etc.) should use this so
 * the card look is changeable in one place. Pass `style` for layout overrides
 * (width, margins, flex).
 */
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { radius, shadows, spacing } from '@/theme/tokens';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Card({ children, style }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.sm,
  },
});
