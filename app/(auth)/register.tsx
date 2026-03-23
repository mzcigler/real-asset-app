import { StandardButton } from '@/components/Buttons';
import { SingleLineInput } from '@/components/Inputs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert('Registration failed', error.message);
    Alert.alert('Check your email', 'We sent you a confirmation link');
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-100">
      <Text className="text-2xl font-bold mb-4">Register</Text>
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
        title="Register" 
        onPress={handleRegister}
        customStyle="bg-green-500 max-w-xs"
      />
      <StandardButton
        title="Back to login" 
        onPress={() => router.push('/(auth)/login')}
        bgColor="bg-white"
        textColor="text-blue-600"
        fontWeight="font-bold"
        customStyle="border border-blue-600 max-w-48"
      />
    </View>
  );
}