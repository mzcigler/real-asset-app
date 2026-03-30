import { extractTasks } from '@/functions/ExtractTasksFromText';
import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { StandardButton } from './Buttons';
import { FileUploadZone } from './FileUploadZone';
import { MultiLineInput } from './Inputs';
import { LoadingModal } from './LoadingModal';
import PropertyDropdown from './PropertiesDropdown';
import TaskConfirmationPopup from './TaskConfirmationPopup';
import { TaskType } from './types';

type UploadExtractPopupProps = {
  visible: boolean;
  userId: string;
  onClose: () => void;
  initialPropertyId?: string;
};

export default function UploadExtractPopup({
  visible,
  userId,
  onClose,
  initialPropertyId,
}: UploadExtractPopupProps) {
  const [fileName, setFileName] = useState<string | undefined>();
  const [fileId, setFileId] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<any>(null); // NEW: store full file object
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [desc, setDesc] = useState<string>(''); // assuming desc is from an input
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
      type: ["application/pdf", "text/plain"], // only allow PDF + TXT
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const file = result.assets[0];
    setFileName(file.name);
    setSelectedFile(file);
  };

  const uploadFile = async (file: any, propertyId: string): Promise<string> => {
    try {
      setUploading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const filePath = `${propertyId}/${Date.now()}-${file.name}`; // use propertyId folder
      // Upload to correct bucket
      const { error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Insert file record & get the inserted id
      const { data, error: dbError } = await supabase
        .from('files')
        .insert({
          property_id: propertyId,
          file_path: filePath,
          file_name: file.name,
        })
        .select('id')      // <--- get the inserted file id
        .single();

      if (dbError) throw dbError;
      setFileId(data.id);
      return filePath;
    } catch (err: any) {
      console.error("Upload failed:", err.message);
      throw err;
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

  const handleExtractTasksFromFile = async () => {
    if (!selectedFile || !selectedProperty) return;

    try {
      // Upload file and get the actual path
      const uploadedFilePath = await uploadFile(selectedFile, selectedProperty);
      setExtracting(true);

      const rawTasks = await extractTasks(
        desc !== "" ? desc : "No additional description, just the file",
        uploadedFilePath
      );

      const tasks: TaskType[] = rawTasks.map(task => {
        let dueDate: Date | null = null;
        if (task.dueDate) {
          const [year, month, day] = task.dueDate.split('-').map(Number);

          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            dueDate = new Date(year, month - 1, day);
          }
        }

        return {
          ...task,
          dueDate,
        };
      });

      setExtractedTasks(tasks);
    } catch (err) {
      console.error("Error extracting tasks:", err);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center', // centers horizontally
      }}>
        <ScrollView
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Modal content box */}
          <View style={{
            width: 500,
            maxWidth: '90%',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            alignSelf: 'center', // ensures horizontal centering on all platforms
          }}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Upload a new file
            </Text>

            <FileUploadZone
              onPickFile={pickFile}
              onClearFile={() => {
                setFileName(undefined);
                setSelectedFile(null);
              }}
              uploading={uploading}
              fileName={fileName}
            />
            <PropertyDropdown
              userId={userId}
              selectedProperty={selectedProperty}
              onSelect={setSelectedProperty}
            />
            <Text style={{ fontWeight: 'bold', marginTop: 6 }}>Description of the document:</Text>
            <Text style={{ fontSize: 12, marginBottom: 6 }}>
              Include a basic description and/or specific tasks, items, or any additional information
              you want included in the file extraction (no description means model will pull default tasks/notes from document)
            </Text>

            <MultiLineInput
              placeholderText="ex. House inspection report, describes what tasks in the house need action..."
              value={desc}
              onChangeText={setDesc}
              placeholderColor="text-gray-400"
              textColor="text-black"
              fontWeight="font-normal"
            />

            <StandardButton
              title="Upload & Extract Tasks"
              disabled={isDisabled}
              bgColor={isDisabled ? "bg-gray-400" : "bg-green-700"}
              textColor={isDisabled  ? "text-gray-200" : "text-white"}
              onPress={handleExtractTasksFromFile}
              fontWeight="font-semibold"
            />

            <StandardButton
              title="Cancel"
              onPress={handleClose}
              bgColor="bg-gray-100"
              textColor="text-gray-800"
              fontWeight="font-semibold"
            />

            <LoadingModal
              visible={uploading || extracting}
              message={uploading ? "Uploading file to your files..." : "Extracting tasks from file..."}
              onCancel={() => {
                setUploading(false);
                setExtracting(false);
              }}
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
            if (saved) {
              handleClose();
            }
          }}
        />
      </View>
    </Modal>
  );
}