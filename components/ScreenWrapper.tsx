import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

/** Keyboard-aware scroll wrapper for auth screens */
export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: colors.background }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            backgroundColor: colors.background,
          }}
        >
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
