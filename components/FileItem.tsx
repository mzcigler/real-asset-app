import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  fileName: string;
  onOpen: () => void;
  onDelete: () => void;
};

export default function FileItem({ fileName, onOpen, onDelete }: Props) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        onPress={onOpen}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}
      >
        <Text style={{ fontSize: 20 }}>📄</Text>
        <Text style={{ fontSize: 14, color: '#111827', flex: 1 }} numberOfLines={1}>
          {fileName}
        </Text>
        <MaterialIcons name="file-download" size={20} color="#2563eb" />
      </TouchableOpacity>
      <View style={{ width: 1, height: 36, backgroundColor: '#f3f4f6' }} />
      <TouchableOpacity
        onPress={onDelete}
        style={{ paddingHorizontal: 14, paddingVertical: 14 }}
      >
        <MaterialIcons name="delete-outline" size={18} color="#d1d5db" />
      </TouchableOpacity>
    </View>
  );
}
