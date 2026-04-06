/**
 * Standard page wrapper used by all main screens.
 *
 * Provides:
 *  - Themed background color
 *  - Centered content with max-width (MAX_WIDTH from constants/layout.ts)
 *  - Standard horizontal padding (SCREEN_PADDING)
 *  - Optional ScrollView or plain View
 *
 * To change the max width of the entire app, edit MAX_WIDTH in constants/layout.ts.
 */

import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { MAX_WIDTH, SCREEN_PADDING } from '@/theme/layout';

type Props = {
  children: ReactNode;
  /** Use a plain View instead of ScrollView (for pages that manage their own scroll) */
  noScroll?: boolean;
  style?: ViewStyle;
};

export default function PageContainer({ children, noScroll = false, style }: Props) {
  const { colors } = useTheme();

  const inner = (
    <View style={[styles.inner, style]}>
      {children}
    </View>
  );

  if (noScroll) {
    return (
      <View style={[styles.noScrollWrap, { backgroundColor: colors.background }]}>
        {inner}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  noScrollWrap: {
    flex: 1,
    alignItems: 'center',
    padding: SCREEN_PADDING,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: SCREEN_PADDING,
  },
});
