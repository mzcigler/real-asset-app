import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function ScreenWrapper({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center p-6 bg-gray-100">
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}