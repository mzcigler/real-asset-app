import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, shadows, spacing } from '@/theme/tokens';

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
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.info : colors.border,
        },
      ]}
    >
      {/* Backdrop */}
      <View style={[styles.backdrop, { backgroundColor: colors.propertyBackdrop }]}>
        {/* Decorative blobs — intentional rgba, not theme colors */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />
        <View style={styles.blob4} />

        {selectionMode ? (
          <View
            style={[
              styles.selectionCheck,
              { backgroundColor: selected ? colors.info : 'rgba(255,255,255,0.3)' },
            ]}
          >
            {selected && <MaterialIcons name="check" size={13} color={colors.textInverse} />}
          </View>
        ) : (
          <TouchableOpacity
            ref={dotsRef}
            onPress={(e) => { e.stopPropagation(); handleDotsPress(); }}
            hitSlop={8}
            style={styles.dotsBtn}
          >
            <MaterialIcons name="more-vert" size={16} color={colors.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Name */}
      <View style={styles.nameSection}>
        <Text style={[styles.nameText, { color: colors.textPrimary }]} numberOfLines={2}>
          {name}
        </Text>
      </View>

      {/* Three-dot context menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menu,
              {
                top: menuPos.y + spacing.xs,
                right: menuPos.x,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); onRename(); }}
              style={styles.menuItem}
            >
              <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>Rename</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.borderLight }]} />
            <TouchableOpacity
              onPress={() => { setMenuVisible(false); onDelete(); }}
              style={styles.menuItem}
            >
              <MaterialIcons name="delete-outline" size={16} color={colors.danger} />
              <Text style={[styles.menuItemText, { color: colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  backdrop: {
    width: '100%',
    height: BACKDROP_HEIGHT,
    overflow: 'hidden',
  },
  // Decorative background blobs — sizes are intentional (width/2 = border radius for circle effect)
  blob1: { position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.07)', top: -30, left: -20 },
  blob2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -20, left: 30 },
  blob3: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.09)', top: -10, right: 10 },
  blob4: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -12, right: 30 },
  selectionCheck: {
    position: 'absolute',
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsBtn: {
    position: 'absolute',
    top: spacing.xs + 2,
    right: spacing.xs + 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    flex: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    borderRadius: radius.md,
    borderWidth: 1,
    ...shadows.lg,
    minWidth: 150,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuItemText: {
    fontSize: fontSize.lg,
  },
  menuDivider: {
    height: 1,
  },
});
