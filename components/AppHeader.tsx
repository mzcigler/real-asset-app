import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { supabase } from '@/lib/supabase';

const BREAKPOINT = 768;
const TEAL = '#0f766e';

export default function AppHeader() {
  const { width } = useWindowDimensions();
  const isWide = width >= BREAKPOINT;
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (path: string) => {
    router.push(path as any);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
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
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
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
          <MaterialIcons name="home" size={32} color={TEAL} />
          <Text style={{ fontSize: 12, fontWeight: '800', color: TEAL, letterSpacing: 2, marginTop: -2 }}>
            BENi
          </Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {isWide ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <NavLink label="Dashboard" active={isDashboard} onPress={() => navigate('/(tabs)/dashboard')} />
            <NavLink label="Profile" active={isProfile} onPress={() => navigate('/(tabs)/profile')} />
            <View style={{ width: 1, height: 20, backgroundColor: '#e5e7eb', marginHorizontal: 8 }} />
            <TouchableOpacity
              onPress={handleSignOut}
              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 }}
            >
              <Text style={{ fontSize: 14, color: '#ef4444', fontWeight: '500' }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setMenuOpen((v) => !v)} style={{ padding: 8 }} hitSlop={8}>
            <MaterialIcons name={menuOpen ? 'close' : 'menu'} size={26} color="#374151" />
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile dropdown */}
      {!isWide && menuOpen && (
        <>
          <View
            style={{
              backgroundColor: 'white',
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
              paddingVertical: 6,
            }}
          >
            <DropdownItem label="Dashboard" icon="dashboard" active={isDashboard} onPress={() => navigate('/(tabs)/dashboard')} />
            <DropdownItem label="Profile" icon="person" active={isProfile} onPress={() => navigate('/(tabs)/profile')} />
            <View style={{ height: 1, backgroundColor: '#f3f4f6', marginHorizontal: 20, marginVertical: 4 }} />
            <TouchableOpacity
              onPress={handleSignOut}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 }}
            >
              <MaterialIcons name="logout" size={18} color="#ef4444" />
              <Text style={{ fontSize: 15, color: '#ef4444', fontWeight: '500' }}>Sign out</Text>
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

function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: active ? '#f0fdf4' : 'transparent',
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: active ? '600' : '400', color: active ? TEAL : '#374151' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DropdownItem({
  label, icon, active, onPress,
}: { label: string; icon: any; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: active ? '#f0fdf4' : 'transparent',
      }}
    >
      <MaterialIcons name={icon} size={18} color={active ? TEAL : '#6b7280'} />
      <Text style={{ fontSize: 15, fontWeight: active ? '600' : '400', color: active ? TEAL : '#374151' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
