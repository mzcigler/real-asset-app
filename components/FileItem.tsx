import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, TouchableOpacity, View } from 'react-native';

type Props = {
  fileName: string;
  onOpen: () => void;
  onDelete: () => void;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
};

export default function FileItem({ fileName, onOpen, onDelete, selected, selectionMode, onLongPress }: Props) {
  const handlePress = () => {
    if (selectionMode) {
      onLongPress?.();
    } else {
      onOpen();
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? '#2563eb' : '#e5e7eb',
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={!selectionMode ? onLongPress : undefined}
        delayLongPress={400}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}
      >
        {selectionMode ? (
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: selected ? '#2563eb' : 'white',
            borderWidth: 2, borderColor: selected ? '#2563eb' : '#d1d5db',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {selected && <MaterialIcons name="check" size={13} color="white" />}
          </View>
        ) : (
          <Text style={{ fontSize: 20 }}>📄</Text>
        )}
        <Text style={{ fontSize: 14, color: '#111827', flex: 1 }} numberOfLines={1}>{fileName}</Text>
        {!selectionMode && <MaterialIcons name="file-download" size={20} color="#2563eb" />}
      </TouchableOpacity>

      {!selectionMode && (
        <>
          <View style={{ width: 1, height: 36, backgroundColor: '#f3f4f6' }} />
          <TouchableOpacity onPress={onDelete} style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
            <MaterialIcons name="delete-outline" size={18} color="#d1d5db" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
