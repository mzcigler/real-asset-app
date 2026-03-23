import { StandardButton } from '@/components/Buttons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace('(auth)/login'); }
      setUserId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return Alert.alert('Logout failed', error.message);
    router.replace('/(auth)/login');
  };

  return (

    <ScreenWrapper>
      <Text className="text-2xl font-bold mb-4">Welcome!</Text>
      <Text className="mb-4">User ID: {userId ?? 'Loading...'}</Text>
      <StandardButton
              title="Logout" 
              onPress={handleLogout}
              bgColor="bg-red-500"
              textColor="text-white"
              fontWeight="font-semibold"
              customStyle="border border-blue-600 max-w-36"
            />
    </ScreenWrapper>
  );
}