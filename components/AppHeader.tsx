import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { BREAKPOINT } from '@/constants/layout';

export default function AppHeader() {
  const { width } = useWindowDimensions();
  const isWide = width >= BREAKPOINT;
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (path: string) => {
    router.push(path as any);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    const { supabase } = await import('@/lib/supabase');
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
    setMenuOpen(false);
  };

  const isDashboard = pathname === '/dashboard' || pathname === '/(tabs)/dashboard';
  const isProfile = pathname === '/profile' || pathname === '/(tabs)/profile';

  return (
    <View style={{ zIndex: 200 }}>
      <View
        style={{
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: colors.headerBorder,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          height: 68,
        }}
      >
        {/* Logo */}
        <TouchableOpacity
          onPress={() => navigate('/(tabs)/dashboard')}
          style={{ flexDirection: 'column', alignItems: 'center', paddingVertical: 4 }}
        >
          <MaterialIcons name="home" size={32} color={colors.primary} />
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 2, marginTop: -2 }}>
            BENi
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {isWide ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <NavLink label="Dashboard" active={isDashboard} onPress={() => navigate('/(tabs)/dashboard')} />
            <NavLink label="Profile" active={isProfile} onPress={() => navigate('/(tabs)/profile')} />
            <View style={{ width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 8 }} />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} colors={colors} />
            <TouchableOpacity
              onPress={handleSignOut}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 }}
            >
              <Text style={{ fontSize: 14, color: colors.danger, fontWeight: '500' }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} colors={colors} />
            <TouchableOpacity onPress={() => setMenuOpen((v) => !v)} style={{ padding: 8 }} hitSlop={8}>
              <MaterialIcons name={menuOpen ? 'close' : 'menu'} size={26} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mobile dropdown */}
      {!isWide && menuOpen && (
        <>
          <View
            style={{
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 6,
            }}
          >
            <DropdownItem
              label="Dashboard"
              icon="dashboard"
              active={isDashboard}
              onPress={() => navigate('/(tabs)/dashboard')}
            />
            <DropdownItem
              label="Profile"
              icon="person"
              active={isProfile}
              onPress={() => navigate('/(tabs)/profile')}
            />
            <View style={{ height: 1, backgroundColor: colors.borderLight, marginHorizontal: 20, marginVertical: 4 }} />
            <TouchableOpacity
              onPress={handleSignOut}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 }}
            >
              <MaterialIcons name="logout" size={18} color={colors.danger} />
              <Text style={{ fontSize: 15, color: colors.danger, fontWeight: '500' }}>Sign out</Text>
            </TouchableOpacity>
          </View>
          {/* Dismiss overlay */}
          <Pressable
            onPress={() => setMenuOpen(false)}
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, bottom: -9999 }}
          />
        </>
      )}
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: active ? colors.primaryLight : 'transparent',
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: active ? '600' : '400', color: active ? colors.primary : colors.textSecondary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DropdownItem({
  label, icon, active, onPress,
}: { label: string; icon: any; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: active ? colors.primaryLight : 'transparent',
      }}
    >
      <MaterialIcons name={icon} size={18} color={active ? colors.primary : colors.textMuted} />
      <Text style={{ fontSize: 15, fontWeight: active ? '600' : '400', color: active ? colors.primary : colors.textSecondary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ThemeToggle({ isDark, onToggle, colors }: { isDark: boolean; onToggle: () => void; colors: any }) {
  return (
    <TouchableOpacity onPress={onToggle} style={{ padding: 8, borderRadius: 8 }} hitSlop={8}>
      <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}
