import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { BREAKPOINT } from '@/theme/layout';

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
    const { supabase } = await import('@/services/supabase');
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
    setMenuOpen(false);
  };

  const isDashboard = pathname === '/dashboard' || pathname === '/(tabs)/dashboard';
  const isProfile = pathname === '/profile' || pathname === '/(tabs)/profile';

  return (
    <View style={styles.zWrap}>
      <View style={[styles.headerBar, { backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        {/* Logo */}
        <TouchableOpacity
          onPress={() => navigate('/(tabs)/dashboard')}
          style={styles.logoBtn}
        >
          <MaterialIcons name="home" size={32} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.primary }]}>BENi</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {isWide ? (
          <View style={styles.navRow}>
            <NavLink label="Dashboard" active={isDashboard} onPress={() => navigate('/(tabs)/dashboard')} />
            <NavLink label="Profile" active={isProfile} onPress={() => navigate('/(tabs)/profile')} />
            <View style={[styles.navDivider, { backgroundColor: colors.border }]} />
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} colors={colors} />
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
              <Text style={[styles.signOutText, { color: colors.danger }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mobileRow}>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} colors={colors} />
            <TouchableOpacity onPress={() => setMenuOpen((v) => !v)} style={styles.menuBtn} hitSlop={8}>
              <MaterialIcons name={menuOpen ? 'close' : 'menu'} size={26} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Mobile dropdown */}
      {!isWide && menuOpen && (
        <>
          <View style={[styles.dropdown, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
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
            <View style={[styles.dropdownDivider, { backgroundColor: colors.borderLight }]} />
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutItem}>
              <MaterialIcons name="logout" size={18} color={colors.danger} />
              <Text style={[styles.logoutText, { color: colors.danger }]}>Sign out</Text>
            </TouchableOpacity>
          </View>
          <Pressable onPress={() => setMenuOpen(false)} style={styles.dismissOverlay} />
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
      style={[styles.navLink, { backgroundColor: active ? colors.primaryLight : 'transparent' }]}
    >
      <Text style={[styles.navLinkText, {
        fontWeight: active ? '600' : '400',
        color: active ? colors.primary : colors.textSecondary,
      }]}>
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
      style={[styles.dropdownItem, { backgroundColor: active ? colors.primaryLight : 'transparent' }]}
    >
      <MaterialIcons name={icon} size={18} color={active ? colors.primary : colors.textMuted} />
      <Text style={[styles.dropdownItemText, {
        fontWeight: active ? '600' : '400',
        color: active ? colors.primary : colors.textSecondary,
      }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ThemeToggle({ isDark, onToggle, colors }: { isDark: boolean; onToggle: () => void; colors: any }) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.themeBtn} hitSlop={8}>
      <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  zWrap: {
    zIndex: 200,
  },
  headerBar: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 68,
  },
  logoBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 4,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: -2,
  },
  spacer: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 8,
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBtn: {
    padding: 8,
  },
  dropdown: {
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  dropdownDivider: {
    height: 1,
    marginHorizontal: 20,
    marginVertical: 4,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dismissOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    bottom: -9999,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navLinkText: {
    fontSize: 14,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 15,
  },
  themeBtn: {
    padding: 8,
    borderRadius: 8,
  },
});
