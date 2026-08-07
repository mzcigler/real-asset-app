import ImageViewer from '@/components/ImageViewer';
import { getSignedImageUrls } from '@/services/fileService';
import { useTheme } from '@/theme/ThemeContext';
import { radius, spacing } from '@/theme/tokens';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type Props = {
  /** Storage paths in the user_files bucket. */
  imageRefs?: string[] | null;
  size?: number;
};

/**
 * Thumbnails of the images a task refers to, opening full screen when tapped.
 *
 * Kept separate from the task card so it can sit beside a card's own touch target rather
 * than inside it — nesting pressables makes react-native-web emit a button within a
 * button, and gives ambiguous hit targets on native.
 */
export default function TaskImageStrip({ imageRefs, size = 56 }: Props) {
  const { colors } = useTheme();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const paths = imageRefs ?? [];
  const pathKey = paths.join('|');

  useEffect(() => {
    if (!paths.length) return;
    let active = true;
    // Signed URLs expire, so they are resolved on mount rather than stored with the task.
    getSignedImageUrls(paths).then((result) => {
      if (active) setUrls(result);
    });
    return () => {
      active = false;
    };
  }, [pathKey]);

  if (!paths.length) return null;

  // Only images that actually resolved can be opened; a failed signature would otherwise
  // put a blank frame into the viewer's sequence.
  const resolved = paths.map((p) => urls[p]).filter(Boolean);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.strip}
        contentContainerStyle={styles.stripContent}
      >
        {paths.map((path, i) => {
          const uri = urls[path];
          const dims = { width: size, height: size };

          if (!uri) {
            return (
              <View
                key={path}
                style={[styles.thumb, dims, styles.placeholder, { backgroundColor: colors.border }]}
              />
            );
          }

          const indexInResolved = resolved.indexOf(uri);
          return (
            <Pressable
              key={path}
              onPress={() => setViewerIndex(indexInResolved < 0 ? 0 : indexInResolved)}
              accessibilityRole="button"
              accessibilityLabel={`Open image ${i + 1} of ${paths.length} full screen`}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Image
                source={{ uri }}
                style={[styles.thumb, dims, { borderColor: colors.border }]}
                resizeMode="cover"
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <ImageViewer
        visible={viewerIndex !== null}
        urls={resolved}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexGrow: 0,
  },
  stripContent: {
    gap: spacing.xs,
    paddingVertical: 2,
  },
  thumb: {
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  placeholder: {
    opacity: 0.4,
  },
});
