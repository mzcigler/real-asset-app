import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

type PropertyCardProps = {
  name: string;
  onPress: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export default function PropertyCard({ name, onPress, onRename, onDelete }: PropertyCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const dotsRef = useRef<View>(null);

  const handleDotsPress = () => {
    dotsRef.current?.measure((_fx, _fy, width, height, px, py) => {
      const screenWidth = Dimensions.get('window').width;
      setMenuPos({ x: screenWidth - px - width, y: py + height });
      setMenuVisible(true);
    });
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 }}
      >
        <Text style={{ fontSize: 20 }}>🏠</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }}>{name}</Text>
        <MaterialIcons name="chevron-right" size={20} color="#d1d5db" />
      </TouchableOpacity>

      <View style={{ width: 1, height: 36, backgroundColor: '#f3f4f6' }} />

      <TouchableOpacity
        ref={dotsRef}
        onPress={handleDotsPress}
        style={{ paddingHorizontal: 14, paddingVertical: 16 }}
        hitSlop={4}
      >
        <MaterialIcons name="more-vert" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setMenuVisible(false)}
        >
          <View
            style={{
              position: 'absolute',
              top: menuPos.y + 4,
              right: menuPos.x,
              backgroundColor: 'white',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 6,
              minWidth: 150,
              overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); onRename(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <MaterialIcons name="edit" size={16} color="#374151" />
              <Text style={{ fontSize: 15, color: '#111827' }}>Rename</Text>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />

            <TouchableOpacity
              onPress={() => { setMenuVisible(false); onDelete(); }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <MaterialIcons name="delete-outline" size={16} color="#ef4444" />
              <Text style={{ fontSize: 15, color: '#ef4444' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
