import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type Props = {
  visible: boolean;
  /** Resolved, displayable URLs. */
  urls: string[];
  /** Which one to show first. */
  initialIndex?: number;
  onClose: () => void;
};

/**
 * Full-screen viewer for images extracted from a document.
 *
 * A defect photograph is the evidence behind a task, so it needs to be readable at size —
 * a 56px thumbnail cannot tell you whether a crack is hairline or structural.
 */
export default function ImageViewer({ visible, urls, initialIndex = 0, onClose }: Props) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) setIndex(initialIndex);
  }, [visible, initialIndex]);

  if (!urls.length) return null;

  const safeIndex = Math.min(Math.max(index, 0), urls.length - 1);
  const multiple = urls.length > 1;

  const step = (delta: number) => setIndex((i) => (i + delta + urls.length) % urls.length);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Backdrop is its own layer so a tap anywhere off the image closes the viewer. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close image"
        />

        <Image
          source={{ uri: urls[safeIndex] }}
          style={{ width: width * 0.92, height: height * 0.78 }}
          resizeMode="contain"
          accessibilityLabel={`Image ${safeIndex + 1} of ${urls.length}`}
        />

        {multiple ? (
          <>
            <Pressable
              onPress={() => step(-1)}
              style={[styles.arrow, styles.left]}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Previous image"
            >
              <MaterialIcons name="chevron-left" size={30} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => step(1)}
              style={[styles.arrow, styles.right]}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Next image"
            >
              <MaterialIcons name="chevron-right" size={30} color="#fff" />
            </Pressable>
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {safeIndex + 1} / {urls.length}
              </Text>
            </View>
          </>
        ) : null}

        <Pressable
          onPress={onClose}
          style={[styles.close, { backgroundColor: colors.surface }]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close image"
        >
          <MaterialIcons name="close" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Deliberately near-opaque rather than themed: a photograph reads best against a
    // neutral dark ground in either theme.
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    borderRadius: radius.pill,
    padding: spacing.sm,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  left: { left: spacing.md },
  right: { right: spacing.md },
  counter: {
    position: 'absolute',
    bottom: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  counterText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontVariant: ['tabular-nums'],
  },
});
