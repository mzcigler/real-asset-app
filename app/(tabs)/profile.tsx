import Button from '@/components/Button';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import PageContainer from '@/components/PageContainer';
import PhoneInput from '@/components/PhoneInput';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { fontSize, spacing } from '@/theme/tokens';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [areaCode, setAreaCode] = useState('+1');
  const [loading, setLoading] = useState(true);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupType, setPopupType] = useState<'error' | 'success' | 'warning'>('success');

  const showPopup = (type: typeof popupType, title: string, message: string) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/(auth)/login'); return; }

      setEmail(data.user.email ?? '');
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name ?? '');
        setLastName(profile.surname ?? '');
        if (profile.phone) {
          if (profile.phone.startsWith('+1')) {
            setAreaCode('+1');
            setPhone(profile.phone.replace('+1', ''));
          } else {
            setPhone(profile.phone);
          }
        }
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!userId) return;
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName,
      surname: lastName,
      phone: phone ? `${areaCode}${phone}` : '',
    });
    if (error) {
      showPopup('error', 'Update Failed', error.message);
    } else {
      showPopup('success', 'Saved', 'Profile updated successfully.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <PageContainer>
        <ActivityIndicator size="large" color={colors.success} style={{ marginTop: 40 }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>My Profile</Text>

      <Text style={[styles.email, { color: colors.textSecondary }]}>Email: {email}</Text>

      <View style={styles.nameRow}>
        <SingleLineInput
          placeholderText="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <SingleLineInput
          placeholderText="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={{ flex: 1, marginBottom: 0 }}
        />
      </View>

      <PhoneInput
        areaCode={areaCode}
        setAreaCode={setAreaCode}
        phone={phone}
        setPhone={setPhone}
      />

      <Button
        title="Save Changes"
        onPress={handleSave}
        variant="success"
        fullWidth
        style={{ marginBottom: 10 }}
      />
      <Button
        title="Change Password"
        onPress={() => router.push('/(auth)/change-password' as any)}
        variant="secondary"
        fullWidth
        style={{ marginBottom: 10 }}
      />
      <Button title="Logout" onPress={handleLogout} variant="danger" fullWidth />

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
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.h2,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  email: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  nameRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
