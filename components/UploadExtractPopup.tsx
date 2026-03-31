import { extractTasks } from '@/functions/ExtractTasksFromText';
import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import Button from './Button';
import { FileUploadZone } from './FileUploadZone';
import { MultiLineInput } from './Inputs';
import { LoadingModal } from './LoadingModal';
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
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }}>
        <ScrollView
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: '90%',
              maxWidth: 500,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              alignSelf: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.textPrimary }}>
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

            <Text style={{ fontWeight: '600', marginTop: 6, marginBottom: 2, color: colors.textPrimary }}>
              Document description:
            </Text>
            <Text style={{ fontSize: 12, marginBottom: 6, color: colors.textMuted, lineHeight: 18 }}>
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
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="secondary"
              fullWidth
            />

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
