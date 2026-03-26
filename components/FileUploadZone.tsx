import { MaterialIcons } from '@expo/vector-icons'; // standard file upload icon
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StandardButton } from './Buttons';
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
  const [hovered, setHovered] = useState(false);

  const hasFile = Boolean(fileName);

  return (
    <View style={styles.wrapper}>
      {!hasFile && (
        // Dashed drop zone if no file selected
        <TouchableOpacity
          style={[styles.dropZone, hovered && styles.dropZoneHovered]}
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
            color="#94a3b8"
            style={{ marginBottom: 6 }}
          />
          <Text style={styles.dropZoneText}>Click to upload file</Text>
          <Text style={styles.dropZoneText}>(.pdf or .txt)</Text>
        </TouchableOpacity>
      )}

      {/* Document Name row */}
      <View style={styles.metaRow}>
        <Text className="mb-1 font-semibold">
          File Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Input takes 3/4 of the width */}
        <View style={{ flex: 3 }}>
            <SingleLineInput
            placeholderText="Select a file..."
            value={fileName ?? ""}
            placeholderColor="text-gray-400"
            textColor="text-black"
            fontWeight="font-semibold"
            customStyle="w-full"
            />
        </View>

        {/* Clear button takes 1/4 */}
        {hasFile && (
            <View style={{ flex: 1 }}>
            <StandardButton
                title="Clear file"
                onPress={onClearFile}
                bgColor="bg-red-600"
                textColor="text-white"
                fontWeight="font-semibold"
                customStyle="w-full"
            />
            </View>
        )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 0,
    backgroundColor: '#ffffff',
  },
  dropZone: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    marginBottom: 20,
  },
  dropZoneHovered: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  dropZoneText: {
    fontSize: 14,
    color: '#64748b',
  },
  metaRow: {
    marginBottom: 12,
  },

  required: {
    color: '#ef4444',
  },
  fileName: {
    marginTop: 4,
    fontSize: 13,
    color: '#475569',
    textDecorationLine: 'underline',
  },
});