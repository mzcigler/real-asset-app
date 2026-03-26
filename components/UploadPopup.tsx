import { extractTasks } from '@/functions/ExtractTasksFromText';
import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { StandardButton } from './Buttons';
import { FileUploadZone } from './FileUploadZone';
import { MultiLineInput } from './Inputs';
import { LoadingModal } from './LoadingModal';

type UploadPopupProps = {
  visible: boolean;
  userId: string;
  onClose: () => void;
};

export default function UploadPopup({
  visible,
  userId,
  onClose,
}: UploadPopupProps) {
  const [fileName, setFileName] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<any>(null); // NEW: store full file object
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [desc, setDesc] = useState<string>(''); // assuming desc is from an input

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

  const uploadFile = async (file: any): Promise<string> => {
    try {
      setUploading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const filePath = `${userId}/${Date.now()}-${file.name}`; // local variable

      // Upload to correct bucket
      const { error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Store reference in DB
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: userId,
          file_path: filePath,
          file_name: file.name,
        });

      if (dbError) throw dbError;

      return filePath; // <-- return path
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
      setSelectedFile(null); // also clear file state
    }, 250);
  };

  const handleExtractTasksFromFile = async () => {
    if (!selectedFile) return;

    try {
      // Upload file and get the actual path
      const uploadedFilePath = await uploadFile(selectedFile);
      setExtracting(true);
      // Now pass description + file path to your extractTasks function
      console.log(uploadedFilePath);
      const tasks = await extractTasks(
        desc !== "" ? desc : "No additional description, just the file",
        uploadedFilePath
      );      
      setExtracting(false)
      console.log("Extracted tasks:", tasks);
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
              onClearFile={() => setFileName(undefined)}
              uploading={uploading}
              fileName={fileName}
            />

            <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Description of the document:</Text>
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
              disabled={uploading || extracting || !selectedFile}
              bgColor={uploading || extracting || !selectedFile ? "bg-gray-400" : "bg-green-700"}
              textColor={uploading || extracting || !selectedFile ? "text-gray-200" : "text-white"}
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
      </View>
    </Modal>
  );
}