import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Modal</Text>
      <Link href="/" dismissTo style={{ marginTop: 15, paddingVertical: 15 }}>
        <Text style={{ color: '#2563eb' }}>Go to home screen</Text>
      </Link>
    </View>
  );
}
