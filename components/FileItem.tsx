import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Text, TouchableOpacity, View } from 'react-native';
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
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.info : colors.border,
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
          <View
            style={{
              width: 22, height: 22, borderRadius: 11,
              backgroundColor: selected ? colors.info : colors.surface,
              borderWidth: 2, borderColor: selected ? colors.info : colors.inputBorder,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {selected && <MaterialIcons name="check" size={13} color="#fff" />}
          </View>
        ) : (
          <Text style={{ fontSize: 20 }}>📄</Text>
        )}
        <Text style={{ fontSize: 14, color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
          {fileName}
        </Text>
        {!selectionMode && <MaterialIcons name="file-download" size={20} color={colors.info} />}
      </TouchableOpacity>

      {!selectionMode && (
        <>
          <View style={{ width: 1, height: 36, backgroundColor: colors.borderLight }} />
          <TouchableOpacity onPress={onDelete} style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
            <MaterialIcons name="delete-outline" size={18} color={colors.border} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
