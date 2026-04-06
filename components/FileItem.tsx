import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';

type Props = {
  fileName: string;
  onOpen: () => void;
  onDelete: () => void;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
};

export default function FileItem({ fileName, onOpen, onDelete, selected, selectionMode, onLongPress }: Props) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (selectionMode) {
      onLongPress?.();
    } else {
      onOpen();
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.info : colors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={!selectionMode ? onLongPress : undefined}
        delayLongPress={400}
        style={styles.pressArea}
      >
        {selectionMode ? (
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: selected ? colors.info : colors.surface,
                borderColor: selected ? colors.info : colors.inputBorder,
              },
            ]}
          >
            {selected && <MaterialIcons name="check" size={13} color="#fff" />}
          </View>
        ) : (
          <Text style={styles.emoji}>📄</Text>
        )}
        <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
          {fileName}
        </Text>
        {!selectionMode && <MaterialIcons name="file-download" size={20} color={colors.info} />}
      </TouchableOpacity>

      {!selectionMode && (
        <>
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <MaterialIcons name="delete-outline" size={18} color={colors.border} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  fileName: {
    fontSize: 14,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
});
