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
import { ScrollView, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { MAX_WIDTH, SCREEN_PADDING } from '@/constants/layout';

type Props = {
  children: ReactNode;
  /** Use a plain View instead of ScrollView (for pages that manage their own scroll) */
  noScroll?: boolean;
  style?: ViewStyle;
};

export default function PageContainer({ children, noScroll = false, style }: Props) {
  const { colors } = useTheme();

  const inner = (
    <View style={[{ width: '100%', maxWidth: MAX_WIDTH }, style]}>
      {children}
    </View>
  );

  if (noScroll) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', padding: SCREEN_PADDING }}>
        {inner}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ alignItems: 'center', padding: SCREEN_PADDING }}
    >
      {inner}
    </ScrollView>
  );
}
