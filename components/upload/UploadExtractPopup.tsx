import { useExtraction } from '@/contexts/ExtractionContext';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/Button';
import InfoPopup from '@/components/InfoPopup';
import { FileUploadZone } from './FileUploadZone';
import { MultiLineInput } from '@/components/Inputs';
import PropertyDropdown from './PropertiesDropdown';
import { useTheme } from '@/theme/ThemeContext';
import { fontSize, radius, spacing } from '@/theme/tokens';

type PickedFile = DocumentPicker.DocumentPickerAsset;

type Props = {
  visible: boolean;
  userId: string;
  onClose: () => void;
  /** Called once the document has been queued — not when its tasks are saved. */
  onSuccess?: () => void;
  initialPropertyId?: string;
};

/**
 * Collects a file, a property and a description, then hands the work to the extraction
 * provider and closes.
 *
 * It deliberately does no processing itself: a large report takes tens of seconds, and
 * holding this dialog open for that long blocks the app for no reason. Progress and the
 * confirmation step live in ExtractionOverlay, mounted at the root.
 */
export default function UploadExtractPopup({
  visible,
  userId,
  onClose,
  onSuccess,
  initialPropertyId,
}: Props) {
  const { colors } = useTheme();
  const { startExtraction } = useExtraction();

  const [fileName, setFileName] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<PickedFile | null>(null);
  const [desc, setDesc] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(initialPropertyId ?? null);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !selectedFile || !selectedProperty;

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    setFileName(file.name);
    setSelectedFile(file);
  };

  const reset = () => {
    setFileName(undefined);
    setSelectedFile(null);
    setDesc('');
    setSelectedProperty(initialPropertyId ?? null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const handleExtract = () => {
    if (!selectedFile || !selectedProperty) return;
    try {
      startExtraction({
        userId,
        propertyId: selectedProperty,
        fileUri: selectedFile.uri,
        fileName: selectedFile.name,
        description: desc !== '' ? desc : 'No additional description, just the file',
      });
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err?.message ?? 'Could not start processing. Please try again.');
    }
  };

  return (
    <>
      <InfoPopup
        visible={!!error}
        type="error"
        title="Error"
        message={error ?? ''}
        onClose={() => setError(null)}
      />
      <Modal transparent visible={visible} animationType="fade">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.box, { backgroundColor: colors.surface }]}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Upload a new file</Text>

              <FileUploadZone
                onPickFile={pickFile}
                onClearFile={() => {
                  setFileName(undefined);
                  setSelectedFile(null);
                }}
                uploading={false}
                fileName={fileName}
              />

              <PropertyDropdown
                userId={userId}
                selectedProperty={selectedProperty}
                onSelect={setSelectedProperty}
              />

              <Text style={[styles.descLabel, { color: colors.textPrimary }]}>
                Document description:
              </Text>
              <Text style={[styles.descHint, { color: colors.textMuted }]}>
                Include a basic description and/or specific tasks you want extracted. Leave blank to
                auto-extract from the document.
              </Text>

              <MultiLineInput
                placeholderText="e.g. House inspection report — focus on action items…"
                value={desc}
                onChangeText={setDesc}
              />

              <Text style={[styles.backgroundHint, { color: colors.textMuted }]}>
                Processing runs in the background, so you can keep using the app — but leave it open
                until it finishes. You will be prompted to review the tasks when they are ready.
              </Text>

              <Button
                title="Upload & Extract Tasks"
                onPress={handleExtract}
                variant={isDisabled ? 'secondary' : 'success'}
                disabled={isDisabled}
                fullWidth
                style={{ marginBottom: spacing.sm + 2 }}
              />
              <Button title="Cancel" onPress={handleClose} variant="secondary" fullWidth />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    maxWidth: 500,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignSelf: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  descLabel: {
    fontWeight: '600',
    marginTop: spacing.xs + 2,
    marginBottom: 2,
  },
  descHint: {
    fontSize: 12,
    marginBottom: spacing.xs + 2,
    lineHeight: 18,
  },
  backgroundHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
