import Button from '@/components/Button';
import InfoPopup from '@/components/InfoPopup';
import { SingleLineInput } from '@/components/Inputs';
import ScreenWrapper from '@/components/ScreenWrapper';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { fontSize, spacing } from '@/theme/tokens';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setPopupVisible(true);
      return;
    }
    router.replace('/(tabs)/dashboard');
  };

  return (
    <ScreenWrapper>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Text style={styles.themeToggleIcon}>{isDark ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <Text style={[styles.heading, { color: colors.textPrimary }]}>Login</Text>

      <View style={styles.form}>
        <SingleLineInput
          placeholderText="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <SingleLineInput
          placeholderText="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button
          title="Login"
          onPress={handleLogin}
          variant="primary"
          fullWidth
          style={{ marginBottom: 10 }}
        />
        <Button
          title="Create an account"
          onPress={() => router.push('/(auth)/register')}
          variant="secondary"
          fullWidth
        />
      </View>

      <InfoPopup
        visible={popupVisible}
        message={error}
        type="error"
        title="Login Failed"
        onClose={() => setPopupVisible(false)}
        showConfirm={false}
        cancelText="Close"
        autoDismiss={5000}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  themeToggle: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    padding: spacing.sm,
  },
  themeToggleIcon: {
    fontSize: 20,
  },
  heading: {
    fontSize: fontSize.h1,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    maxWidth: 320,
  },
});
