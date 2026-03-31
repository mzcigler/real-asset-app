import PropertySquareCard from '@/components/PropertySquareCard';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, ScrollView, View, useWindowDimensions } from 'react-native';

type Property = { id: string; name: string };

type Props = {
  properties: Property[];
  onPress: (id: string) => void;
  onRename: (property: Property) => void;
  onDelete: (property: Property) => void;
  selectedIds: string[];
  selectionMode: boolean;
  onToggleSelect: (id: string) => void;
  onEnterSelectionMode: (id: string) => void;
};

const TRACK_HEIGHT = 12;
const DASHBOARD_PADDING = 24; // matches dashboard padding: 24
const DASHBOARD_MAX_WIDTH = 480;

export default function PropertyScrollRow({ properties, onPress, onRename, onDelete, selectedIds, selectionMode, onToggleSelect, onEnterSelectionMode }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth - DASHBOARD_PADDING * 2, DASHBOARD_MAX_WIDTH);

  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(1);

  // Refs used during drag — avoid stale closures
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(1);
  const containerWidthRef = useRef(containerWidth);

  const canScroll = contentWidth > containerWidth;
  const thumbRatio = Math.min(1, containerWidth / contentWidth);
  const thumbWidth = Math.max(48, thumbRatio * containerWidth);
  const maxThumbLeft = containerWidth - thumbWidth;
  const maxScroll = contentWidth - containerWidth;
  const thumbLeft = canScroll && maxThumbLeft > 0 ? (scrollX / maxScroll) * maxThumbLeft : 0;

  // Keep refs in sync
  useEffect(() => { scrollXRef.current = scrollX; }, [scrollX]);
  useEffect(() => { contentWidthRef.current = contentWidth; }, [contentWidth]);
  useEffect(() => { containerWidthRef.current = containerWidth; }, [containerWidth]);


  // Web: mouse drag on scrollbar thumb
  const onThumbMouseDown = Platform.OS === 'web'
    ? (e: any) => {
        e.preventDefault();
        const startMouseX: number = e.clientX;
        const startThumbLeft = thumbLeft;

        const onMouseMove = (moveEvent: MouseEvent) => {
          const dx = moveEvent.clientX - startMouseX;
          const ml = containerWidthRef.current - Math.max(48, Math.min(1, containerWidthRef.current / contentWidthRef.current) * containerWidthRef.current);
          if (ml <= 0) return;
          const newThumbLeft = Math.max(0, Math.min(ml, startThumbLeft + dx));
          const maxSc = contentWidthRef.current - containerWidthRef.current;
          const newScrollX = (newThumbLeft / ml) * maxSc;
          scrollRef.current?.scrollTo({ x: newScrollX, animated: false });
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
    : undefined;

  // Native: PanResponder
  const thumbLeftAtGestureStart = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        thumbLeftAtGestureStart.current = thumbLeft;
      },
      onPanResponderMove: (_, gestureState) => {
        const ml = containerWidthRef.current - Math.max(48, Math.min(1, containerWidthRef.current / contentWidthRef.current) * containerWidthRef.current);
        const newThumbLeft = Math.max(0, Math.min(ml, thumbLeftAtGestureStart.current + gestureState.dx));
        const maxSc = contentWidthRef.current - containerWidthRef.current;
        if (maxSc <= 0 || ml <= 0) return;
        scrollRef.current?.scrollTo({ x: (newThumbLeft / ml) * maxSc, animated: false });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const thumbProps = Platform.OS === 'web'
    ? { onMouseDown: onThumbMouseDown }
    : panResponder.panHandlers;

  return (
    <View style={{ marginBottom: 4, width: containerWidth }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: containerWidth }}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        onContentSizeChange={(w) => setContentWidth(w)}
        scrollEventThrottle={16}
      >
        {properties.map((property) => (
          <PropertySquareCard
            key={property.id}
            name={property.name}
            onPress={() => onPress(property.id)}
            onRename={() => onRename(property)}
            onDelete={() => onDelete(property)}
            selected={selectedIds.includes(property.id)}
            selectionMode={selectionMode}
            onLongPress={() => selectionMode ? onToggleSelect(property.id) : onEnterSelectionMode(property.id)}
          />
        ))}
      </ScrollView>

      {canScroll && (
        <View
          style={{
            height: TRACK_HEIGHT,
            backgroundColor: '#d1d5db',
            borderRadius: TRACK_HEIGHT / 2,
            marginTop: 10,
            marginHorizontal: 2,
          }}
        >
          <View
            {...thumbProps}
            style={{
              position: 'absolute',
              top: 0,
              left: thumbLeft,
              width: thumbWidth,
              height: TRACK_HEIGHT,
              backgroundColor: '#4b5563',
              borderRadius: TRACK_HEIGHT / 2,
              cursor: 'grab' as any,
              userSelect: 'none' as any,
            }}
          />
        </View>
      )}
    </View>
  );
}
