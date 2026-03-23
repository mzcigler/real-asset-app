import { StandardButton } from '@/components/Buttons';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import PhoneInput from '@/components/PhoneInput';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native'; // Picker for area codes
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaCode, setAreaCode] = useState('+1'); // default area code
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'error' | 'success' | 'warning'>('error');
  const [popupTitle, setPopupTitle] = useState('');
  const router = useRouter();

const handleRegister = async () => {
  setPopupMessage('');
  setPopupTitle('');

  // Sign up user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });

  if (signUpError) {
    setPopupType('error');
    setPopupTitle('Registration Failed');
    setPopupMessage(signUpError.message);
    setPopupVisible(true);
    return;
  }

  // Check if email already exists
  if (signUpData.user && signUpData.user.identities?.length === 0) {
    setPopupType('warning');
    setPopupTitle('Registration Incomplete');
    setPopupMessage('Email already in use. Please select a new email or log in.');
    setPopupVisible(true);
    return; // stay on register page
  }

  // Get authenticated user info (after signup)
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    setPopupType('error');
    setPopupTitle('Registration Failed');
    setPopupMessage('Could not retrieve user ID. Please try logging in.');
    setPopupVisible(true);
    return;
  }

  // Insert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    first_name: firstName || '',
    surname: lastName || '',
    phone: phone ? `${areaCode}${phone}` : '',
  });

  if (profileError) {
    setPopupType('error');
    setPopupTitle('Profile Error');
    setPopupMessage(profileError.message + ', please sign in to update profile');
    setPopupVisible(true);
    return;
  }

  // Success popup
  setPopupType('success');
  setPopupTitle('Registration Successful');
  setPopupMessage('Account created! Please check your email to confirm your account.');
  setPopupVisible(true);

  setTimeout(() => {
    router.replace('/(auth)/login');
  }, 3000);
};

  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-100">
      <Text className="text-2xl font-bold mb-4">Register</Text>
      
      <View className="flex-row w-full max-w-xs space-x-2">
        <SingleLineInput
          placeholderText="First Name"
          value={firstName}
          onChangeText={setFirstName}
          textColor="text-black"
          fontWeight="font-semibold"
          customStyle="flex-1"
        />

        <SingleLineInput
          placeholderText="Last Name"
          value={lastName}
          onChangeText={setLastName}
          textColor="text-black"
          fontWeight="font-semibold"
          customStyle="flex-1"
        />
      </View>
      
      <PhoneInput
        areaCode={areaCode}
        setAreaCode={setAreaCode}
        phone={phone}
        setPhone={setPhone}
      />

      <SingleLineInput
        placeholderText="Email (required)"
        value={email}
        onChangeText={setEmail}
        textColor="text-black"
        fontWeight="font-semibold"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <SingleLineInput
        placeholderText="Password (required)"
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
        customStyle="border border-blue-600 max-w-xs"
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