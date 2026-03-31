import AppHeader from '@/components/AppHeader';
import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function TabLayout() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/(auth)/login');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/(auth)/login');
      } else {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading || !user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <AppHeader />
      <Slot />
    </View>
  );
}
