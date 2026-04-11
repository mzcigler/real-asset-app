import { useTheme } from '@/theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IconButton from '@/components/IconButton';
import { SingleLineInput } from '@/components/Inputs';

interface FileUploadZoneProps {
  onPickFile: () => void;
  onClearFile: () => void;
  uploading?: boolean;
  fileName?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onPickFile,
  onClearFile,
  uploading = false,
  fileName,
}) => {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);

  const hasFile = Boolean(fileName);

  return (
    <View>
      {/* Dropzone */}
      {!hasFile && (
        <TouchableOpacity
          style={[
            styles.dropZone,
            { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground },
            hovered && { borderColor: colors.info, backgroundColor: colors.surface },
          ]}
          onPress={onPickFile}
          activeOpacity={0.75}
          {...(Platform.OS === 'web'
            ? {
                onMouseEnter: () => setHovered(true),
                onMouseLeave: () => setHovered(false),
              }
            : {})}
        >
          <MaterialIcons
            name="file-upload"
            size={28}
            color={colors.textMuted}
            style={styles.dropZoneIcon}
          />
          <Text style={[styles.dropZoneText, { color: colors.textSecondary }]}>
            Click to upload file
          </Text>
          <Text style={[styles.dropZoneText, { color: colors.textSecondary }]}>
            (.pdf or .txt)
          </Text>
        </TouchableOpacity>
      )}

      {/* File name + Clear button */}
      <View style={styles.metaRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          File Name <Text style={{ color: colors.danger }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <SingleLineInput
              placeholderText="Select a file..."
              value={fileName ?? ''}
              editable={false}
              style={{ marginBottom: 0 }}
            />
          </View>
          {hasFile && (
            <IconButton
              icon="close"
              iconSize={18}
              size={40}
              onPress={onClearFile}
              variant="danger"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dropZoneIcon: {
    marginBottom: 6,
  },
  dropZoneText: {
    fontSize: 14,
  },
  metaRow: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrap: {
    flex: 3,
  },
});
