// app/index.tsx
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.replace('(tabs)/home'); // user logged in
      } else {
        router.replace('(auth)/login'); // not logged in
      }
    };
    redirect();
  }, []);

  return null;
}