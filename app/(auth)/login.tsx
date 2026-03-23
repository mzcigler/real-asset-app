import { StandardButton } from '@/components/Buttons';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');  
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message)
      setPopupVisible(true);
      return
    }
    router.replace('/(tabs)/home'); // Redirect to home on success
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-100">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <SingleLineInput
        placeholderText="Enter your email"
        value={email}
        onChangeText={setEmail}
        textColor="text-black"
        fontWeight="font-semibold"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <SingleLineInput
        placeholderText="Enter your password"
        value={password}
        onChangeText={setPassword}
        placeholderColor="text-gray-400"
        textColor="text-black"
        fontWeight="font-semibold"
        secureTextEntry
      />
      <StandardButton 
        title="Login" 
        onPress={handleLogin}
        customStyle="bg-blue-500 max-w-xs"
      />
      <StandardButton
        title="Create an account" 
        onPress={() => router.push('/(auth)/register')}
        bgColor="bg-white"
        textColor="text-blue-600"
        fontWeight="font-bold"
        customStyle="border border-blue-600 max-w-xs"
      />
      <InfoPopup
        visible={popupVisible}
        message={error}  
        type='error'      // now shows the actual Supabase error
        title="Login failed"
        onClose={() => setPopupVisible(false)}
        showConfirm={false}          // toggle confirm button
        cancelText="Cancel"
        autoDismiss={5000}          // auto-close after 5 seconds
      />
    </View>
  );
}