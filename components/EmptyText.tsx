/**
 * Standard muted empty-state message for lists ("No properties yet." etc.).
 */
import { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, spacing } from '@/theme/tokens';

export default function EmptyText({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.text, { color: colors.textMuted }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
  },
});
