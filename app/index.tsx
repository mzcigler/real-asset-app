// app/index.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('(auth)/login'); // not logged in
      }
    };
    redirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}