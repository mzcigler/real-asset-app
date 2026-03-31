import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  name: string;
  onPress: () => void;
  onRename: () => void;
  onDelete: () => void;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
};

const CARD_SIZE = 130;
const BACKDROP_HEIGHT = 76;

export default function PropertySquareCard({
  name, onPress, onRename, onDelete, selected, selectionMode, onLongPress,
}: Props) {
  const { colors } = useTheme();
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

  const handlePress = () => {
    if (selectionMode) {
      onLongPress?.();
    } else {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.85}
      style={{
        width: CARD_SIZE,
        height: CARD_SIZE,
        backgroundColor: colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.info : colors.border,
      }}
    >
      {/* Backdrop */}
      <View style={{ width: '100%', height: BACKDROP_HEIGHT, backgroundColor: colors.propertyBackdrop, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.07)', top: -30, left: -20 }} />
        <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -20, left: 30 }} />
        <View style={{ position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.09)', top: -10, right: 10 }} />
        <View style={{ position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -12, right: 30 }} />

        {selectionMode ? (
          <View
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: selected ? colors.info : 'rgba(255,255,255,0.3)',
              borderWidth: 2, borderColor: 'white',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {selected && <MaterialIcons name="check" size={13} color="#fff" />}
          </View>
        ) : (
          <TouchableOpacity
            ref={dotsRef}
            onPress={(e) => { e.stopPropagation(); handleDotsPress(); }}
            hitSlop={8}
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialIcons name="more-vert" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Name */}
      <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }} numberOfLines={2}>
          {name}
        </Text>
      </View>

      {/* Three-dot context menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
          <View
            style={{
              position: 'absolute', top: menuPos.y + 4, right: menuPos.x,
              backgroundColor: colors.surface, borderRadius: 10,
              borderWidth: 1, borderColor: colors.border,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
              minWidth: 150, overflow: 'hidden',
            }}
          >
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); onRename(); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 }}
            >
              <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
              <Text style={{ fontSize: 15, color: colors.textPrimary }}>Rename</Text>
            </TouchableOpacity>
            <View style={{ height: 1, backgroundColor: colors.borderLight }} />
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); onDelete(); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 }}
            >
              <MaterialIcons name="delete-outline" size={16} color={colors.danger} />
              <Text style={{ fontSize: 15, color: colors.danger }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
}
