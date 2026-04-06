/**
 * A horizontal ScrollView that shows a draggable scrollbar track below the
 * content — on web only, and only when the content is wider than the container.
 * Native platforms use their own native scrollbar behaviour.
 *
 * Usage:
 *   <HorizontalScrollWithBar contentContainerStyle={styles.row}>
 *     {items}
 *   </HorizontalScrollWithBar>
 */
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

const TRACK_HEIGHT = 12;

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollEventThrottle?: number;
};

export default function HorizontalScrollWithBar({
  children,
  style,
  contentContainerStyle,
  scrollEventThrottle = 16,
}: Props) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [containerWidth, setContainerWidth] = useState(1);
  const [contentWidth, setContentWidth] = useState(1);
  const [scrollX, setScrollX] = useState(0);

  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(1);
  const containerWidthRef = useRef(1);
  useEffect(() => { scrollXRef.current = scrollX; }, [scrollX]);
  useEffect(() => { contentWidthRef.current = contentWidth; }, [contentWidth]);
  useEffect(() => { containerWidthRef.current = containerWidth; }, [containerWidth]);

  const canScroll = Platform.OS === 'web' && contentWidth > containerWidth;
  const thumbRatio = Math.min(1, containerWidth / contentWidth);
  const thumbWidth = Math.max(48, thumbRatio * containerWidth);
  const maxThumbLeft = containerWidth - thumbWidth;
  const maxScroll = contentWidth - containerWidth;
  const thumbLeft = canScroll && maxThumbLeft > 0 ? (scrollX / maxScroll) * maxThumbLeft : 0;

  const onThumbMouseDown = Platform.OS === 'web'
    ? (e: any) => {
        e.preventDefault();
        const startMouseX: number = e.clientX;
        const startThumbLeft = thumbLeft;

        const onMouseMove = (ev: MouseEvent) => {
          const dx = ev.clientX - startMouseX;
          const ml = containerWidthRef.current - Math.max(
            48,
            Math.min(1, containerWidthRef.current / contentWidthRef.current) * containerWidthRef.current,
          );
          if (ml <= 0) return;
          const newLeft = Math.max(0, Math.min(ml, startThumbLeft + dx));
          scrollRef.current?.scrollTo({ x: (newLeft / ml) * (contentWidthRef.current - containerWidthRef.current), animated: false });
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
    : undefined;

  const thumbLeftAtGestureStart = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { thumbLeftAtGestureStart.current = thumbLeft; },
      onPanResponderMove: (_, gs) => {
        const ml = containerWidthRef.current - Math.max(
          48,
          Math.min(1, containerWidthRef.current / contentWidthRef.current) * containerWidthRef.current,
        );
        const newLeft = Math.max(0, Math.min(ml, thumbLeftAtGestureStart.current + gs.dx));
        const maxSc = contentWidthRef.current - containerWidthRef.current;
        if (maxSc <= 0 || ml <= 0) return;
        scrollRef.current?.scrollTo({ x: (newLeft / ml) * maxSc, animated: false });
      },
      onPanResponderRelease: () => {},
    }),
  ).current;

  const thumbProps = Platform.OS === 'web'
    ? { onMouseDown: onThumbMouseDown }
    : panResponder.panHandlers;

  return (
    <View
      style={style}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        onContentSizeChange={(w) => setContentWidth(w)}
        scrollEventThrottle={scrollEventThrottle}
      >
        {children}
      </ScrollView>

      {canScroll && (
        <View style={[styles.track, { backgroundColor: colors.scrollTrack }]}>
          <View
            {...thumbProps}
            style={[
              styles.thumb,
              { left: thumbLeft, width: thumbWidth, backgroundColor: colors.scrollThumb },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    marginTop: 8,
    marginHorizontal: 2,
  },
  thumb: {
    position: 'absolute',
    top: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    cursor: 'grab' as any,
    userSelect: 'none' as any,
  },
});
