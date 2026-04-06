// app/index.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/theme/ThemeContext';

export default function IndexRedirect() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const redirect = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    };
    redirect();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.success} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
