import { StandardButton } from '@/components/Buttons';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'error' | 'success' | 'warning'>('error');
  const [popupTitle, setPopupTitle] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setPopupMessage('');
    setPopupTitle('');

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      // real Supabase errors (invalid email, weak password, etc.)
      setPopupType('error');
      setPopupTitle('Registration Failed');
      setPopupMessage(error.message);
      setPopupVisible(true);
      return;
    }

    // Check if email already exists
    if (data.user && data.user.identities?.length === 0) {
      setPopupType('warning');
      setPopupTitle('Registration Incomplete');
      setPopupMessage(
        'Email already in use. Please select a new email or log in.'
      );
      setPopupVisible(true);
      return; // stay on register page
    }

    // Success: new account created
    setPopupType('success');
    setPopupTitle('Registration Successful');
    setPopupMessage(
      'Account created! Please check your email to confirm your account.'
    );
    setPopupVisible(true);

    setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);
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

      <InfoPopup
        visible={popupVisible}
        message={popupMessage}
        title={popupTitle}
        type={popupType}
        onClose={() => setPopupVisible(false)}
        showConfirm={false}
        cancelText="Close"
        autoDismiss={5000}
      />
    </View>
  );
}