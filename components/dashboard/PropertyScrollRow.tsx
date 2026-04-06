import PropertySquareCard from './PropertySquareCard';
import HorizontalScrollWithBar from '@/components/HorizontalScrollWithBar';
import { StyleSheet } from 'react-native';
import { Property } from '@/types';

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

export default function PropertyScrollRow({
  properties, onPress, onRename, onDelete,
  selectedIds, selectionMode, onToggleSelect, onEnterSelectionMode,
}: Props) {
  return (
    <HorizontalScrollWithBar style={styles.container} contentContainerStyle={styles.scrollContent}>
      {properties.map((property) => (
        <PropertySquareCard
          key={property.id}
          name={property.name}
          onPress={() => onPress(property.id)}
          onRename={() => onRename(property)}
          onDelete={() => onDelete(property)}
          selected={selectedIds.includes(property.id)}
          selectionMode={selectionMode}
          onLongPress={() =>
            selectionMode ? onToggleSelect(property.id) : onEnterSelectionMode(property.id)
          }
        />
      ))}
    </HorizontalScrollWithBar>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 4,
  },
});
