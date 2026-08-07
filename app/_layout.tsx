import ExtractionOverlay from '@/components/upload/ExtractionOverlay';
import { ExtractionProvider } from '@/contexts/ExtractionContext';
import { ThemeProvider } from '@/theme/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';
import { supabase } from '@/services/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <ThemeProvider>
      <ExtractionProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        {/* Mounted above the navigator so document processing survives navigation. */}
        <ExtractionOverlay />
      </ExtractionProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
