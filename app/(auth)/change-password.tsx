import Button from '@/components/Button';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import ScreenWrapper from '@/components/ScreenWrapper';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { fontSize, spacing } from '@/theme/tokens';
import { StyleSheet, Text, View } from 'react-native';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupType, setPopupType] = useState<'error' | 'success'>('error');

  const showPopup = (type: typeof popupType, title: string, message: string) => {
    setPopupType(type);
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSave = async () => {
    if (password !== confirmPassword) {
      showPopup('error', 'Password Mismatch', 'Passwords do not match.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      showPopup('error', 'Update Failed', error.message);
    } else {
      showPopup('success', 'Password Changed', 'Your password has been updated.');
      setTimeout(() => router.back(), 2500);
    }
  };

  return (
    <ScreenWrapper>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>Change Password</Text>

      <View style={styles.form}>
        <SingleLineInput
          placeholderText="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        <SingleLineInput
          placeholderText="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        {(passwordsMatch || passwordsMismatch) && (
          <Text style={[styles.matchText, { color: passwordsMatch ? colors.success : colors.danger }]}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </Text>
        )}

        <Button
          title="Save Password"
          onPress={handleSave}
          variant="success"
          fullWidth
          style={{ marginTop: 12, marginBottom: 10 }}
          disabled={!password || !passwordsMatch}
        />
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
          fullWidth
        />
      </View>

      <InfoPopup
        visible={popupVisible}
        message={popupMessage}
        title={popupTitle}
        type={popupType}
        onClose={() => setPopupVisible(false)}
        showConfirm={false}
        cancelText="Close"
        autoDismiss={popupType === 'success' ? 2500 : 5000}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.h1,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
  matchText: {
    fontSize: 12,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
});
