import { StandardButton } from '@/components/Buttons';
import UploadPopup from '@/components/UploadPopup';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace('(auth)/login'); }
      setUserId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  const handleUpload = async () => {
    setUploadVisible
  };

  return (

    <ScreenWrapper>
      <Text className="text-2xl font-bold mb-4">Welcome!</Text>
      <Text className="mb-4">User ID: {userId ?? 'Loading...'}</Text>
      <StandardButton
              title="Upload New Document" 
              onPress={() => setUploadVisible(true)}
              bgColor="bg-white"
              textColor="text-Black"
              fontWeight="font-semibold"
              customStyle="border border-blue-600 max-w-xs"
            />

      <UploadPopup
        visible={uploadVisible}
        userId={userId!}
        onClose={() => setUploadVisible(false)}
      />
    </ScreenWrapper>
  );
}