import { StandardButton } from '@/components/Buttons';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import PhoneInput from '@/components/PhoneInput';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaCode, setAreaCode] = useState('+1');
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupType, setPopupType] = useState<'error' | 'success' | 'warning'>('success');

  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      setEmail(data.user?.email ?? '');

      if (!data.user) {
        router.replace('/(auth)/login');
        return;
      }

      setUserId(data.user.id);

      // 🔹 Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? '');
        setLastName(profile.surname ?? '');

        if (profile.phone) {
          // split +1 from number
          if (profile.phone.startsWith('+1')) {
            setAreaCode('+1');
            setPhone(profile.phone.replace('+1', ''));
          } else {
            setPhone(profile.phone);
          }
        }
      }
    };

    getUser();
  }, []);

  // 🔹 Save updates
  const handleSave = async () => {
    if (!userId) return;

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName,
      surname: lastName,
      phone: phone ? `${areaCode}${phone}` : '',
    });

    if (error) {
      setPopupType('error');
      setPopupTitle('Update Failed');
      setPopupMessage(error.message)
      setPopupVisible(true);
      return;
    }

    setPopupType('success');
    setPopupTitle('Success');
    setPopupMessage('Profile updated!');
    setPopupVisible(true);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return alert(error.message);
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper>
      <Text className="text-2xl font-bold mb-4">Profile</Text>

      <Text className="mb-4 font-bold">Email: {email ?? 'Loading...'}</Text>
      {/* First + Last Name */}
      <View className="flex-row w-full max-w-xs mb-3 space-x-2">
        <SingleLineInput
          placeholderText="First Name"
          value={firstName}
          onChangeText={setFirstName}
          customStyle="flex-1"
        />
        <SingleLineInput
          placeholderText="Last Name"
          value={lastName}
          onChangeText={setLastName}
          customStyle="flex-1"
        />
      </View>

      {/* Phone */}
      <PhoneInput
        areaCode={areaCode}
        setAreaCode={setAreaCode}
        phone={phone}
        setPhone={setPhone}
      />
      <StandardButton
        title="Save Changes"
        onPress={handleSave}
        bgColor="bg-green-600"
        textColor="text-white"
        fontWeight="font-bold"
        customStyle="w-full max-w-xs"
      />

      <StandardButton
        title="Change Password"
        onPress={() => router.push('/(auth)/change-password')}
        bgColor="bg-gray-700"
        textColor="text-white"
        fontWeight="font-semibold"
        customStyle="w-full max-w-xs"
      />

      <StandardButton
        title="Logout"
        onPress={handleLogout}
        bgColor="bg-red-600"
        textColor="text-white"
        fontWeight="font-semibold"
        customStyle="w-full max-w-xs"
      />
      <InfoPopup
        visible={popupVisible}
        message={popupMessage}
        title={popupTitle}
        type={popupType}
        onClose={() => setPopupVisible(false)}
        showConfirm={false}
        cancelText="Close"
        autoDismiss={3000}
      />
    </ScreenWrapper>
  );
}