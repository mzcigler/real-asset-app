import { useTheme } from '@/theme/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from './Button';
import { SingleLineInput } from './Inputs';

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
    <View style={{ paddingVertical: 0 }}>
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
            style={{ marginBottom: 6 }}
          />
          <Text style={[styles.dropZoneText, { color: colors.textSecondary }]}>
            Click to upload file
          </Text>
          <Text style={[styles.dropZoneText, { color: colors.textSecondary }]}>
            (.pdf or .txt)
          </Text>
        </TouchableOpacity>
      )}

      {/* File input + Clear button */}
      <View style={styles.metaRow}>
        <Text style={{ marginBottom: 4, fontWeight: '600', color: colors.textPrimary }}>
          File Name <Text style={{ color: colors.danger }}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* File input */}
          <View style={{ flex: 3 }}>
            <SingleLineInput
              placeholderText="Select a file..."
              value={fileName ?? ''}
              editable={false}
              style={{ marginBottom: 0 }}
            />
          </View>

          {/* Clear X button */}
        {hasFile && (
          <Button
            title="✕"
            onPress={onClearFile}
            variant="danger"
            matchInputHeight
            style={{
              width: 40,  
              height: 40,
              padding: 0,
            }}
            textStyle={{
              fontSize: 16,
              marginTop: 5,
              textAlign: 'center',   // horizontal centering
            }}
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
  dropZoneText: {
    fontSize: 14,
  },
  metaRow: {
    marginBottom: 12,
  },
});