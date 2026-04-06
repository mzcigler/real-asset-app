import { extractTasks } from '@/services/extractionService';
import { supabase } from '@/services/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '@/components/Button';
import { FileUploadZone } from './FileUploadZone';
import { MultiLineInput } from '@/components/Inputs';
import { LoadingModal } from '@/components/LoadingModal';
import PropertyDropdown from './PropertiesDropdown';
import TaskConfirmationPopup from './TaskConfirmationPopup';
import { useTheme } from '@/theme/ThemeContext';
import { TaskType } from '@/types';

type Props = {
  visible: boolean;
  userId: string;
  onClose: () => void;
  initialPropertyId?: string;
};

export default function UploadExtractPopup({ visible, userId, onClose, initialPropertyId }: Props) {
  const { colors } = useTheme();
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileId, setFileId] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [desc, setDesc] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(initialPropertyId ?? null);
  const [extractedTasks, setExtractedTasks] = useState<TaskType[]>([]);
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  const isDisabled = uploading || extracting || !selectedFile || !selectedProperty;

  useEffect(() => {
    setExtracting(false);
    if (extractedTasks && extractedTasks.length > 0) {
      setShowTaskPopup(true);
    }
  }, [extractedTasks]);

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

  const uploadFile = async (file: any, propertyId: string): Promise<string> => {
    setUploading(true);
    try {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const filePath = `${propertyId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(filePath, blob);
      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('files')
        .insert({ property_id: propertyId, file_path: filePath, file_name: file.name })
        .select('id')
        .single();
      if (dbError) throw dbError;

      setFileId(data.id);
      return filePath;
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setFileName(undefined);
      setSelectedFile(null);
      setDesc('');
      setSelectedProperty(initialPropertyId ?? null);
    }, 250);
  };

  const handleExtract = async () => {
    if (!selectedFile || !selectedProperty) return;
    try {
      const uploadedPath = await uploadFile(selectedFile, selectedProperty);
      setExtracting(true);
      const rawTasks = await extractTasks(
        desc !== '' ? desc : 'No additional description, just the file',
        uploadedPath,
      );
      const tasks: TaskType[] = rawTasks.map((task) => {
        let dueDate: Date | null = null;
        if (task.dueDate) {
          const [year, month, day] = task.dueDate.split('-').map(Number);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            dueDate = new Date(year, month - 1, day);
          }
        }
        return { ...task, dueDate };
      });
      setExtractedTasks(tasks);
    } catch (err) {
      console.error('Error extracting tasks:', err);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.box, { backgroundColor: colors.surface }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Upload a new file
            </Text>

            <FileUploadZone
              onPickFile={pickFile}
              onClearFile={() => { setFileName(undefined); setSelectedFile(null); }}
              uploading={uploading}
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
              Include a basic description and/or specific tasks you want extracted. Leave blank to auto-extract from the document.
            </Text>

            <MultiLineInput
              placeholderText="e.g. House inspection report — focus on action items…"
              value={desc}
              onChangeText={setDesc}
            />

            <Button
              title="Upload & Extract Tasks"
              onPress={handleExtract}
              variant={isDisabled ? 'secondary' : 'success'}
              disabled={isDisabled}
              fullWidth
              style={{ marginBottom: 10 }}
            />
            <Button title="Cancel" onPress={handleClose} variant="secondary" fullWidth />

            <LoadingModal
              visible={uploading || extracting}
              message={uploading ? 'Uploading file…' : 'Extracting tasks from file…'}
              onCancel={() => { setUploading(false); setExtracting(false); }}
            />
          </View>
        </ScrollView>

        <TaskConfirmationPopup
          visible={showTaskPopup}
          tasks={extractedTasks}
          fileId={fileId}
          onClose={(saved) => {
            setShowTaskPopup(false);
            setExtractedTasks([]);
            if (saved) handleClose();
          }}
        />
      </View>
    </Modal>
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
    borderRadius: 16,
    padding: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descLabel: {
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  descHint: {
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 18,
  },
});
