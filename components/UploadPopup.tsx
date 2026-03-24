import { supabase } from '@/lib/supabase';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { StandardButton } from './Buttons';
import { FileUploadZone } from './FileUploadZone';
import { MultiLineInput } from './Inputs';

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
  const [uploading, setUploading] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const file = result.assets[0];
    setFileName(file.name);

    await uploadFile(file);
  };

  const uploadFile = async (file: any) => {
    try {
      setUploading(true);

      const response = await fetch(file.uri);
      const blob = await response.blob();

      const filePath = `${userId}/${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, blob);

      if (error) throw error;

      // optional: store in DB
      await supabase.from('documents').insert({
        user_id: userId,
        file_path: filePath,
      });

      setFileName(undefined);
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Trigger the modal to close immediately
    onClose();

    // Wait until the modal fade animation is done (~200ms for fade)
    setTimeout(() => {
      setFileName(undefined);
    }, 250); // slightly longer than animation for safety
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable
        className="flex-1 justify-center items-center bg-black/40"
        onPress={handleClose}
      >
        <Pressable onPress={() => {}}>
          <View className="bg-white rounded-xl p-6"
                style={{ width: 500, maxWidth: '90%' }}>
            <Text className="text-lg font-semibold mb-2">
                Upload a new file
            </Text>
            <FileUploadZone
              onPickFile={pickFile}
              onClearFile={() => setFileName(undefined)}
              uploading={uploading}
              fileName={fileName}
            />
            <Text className="font-bold mb-1">Description of the document:</Text>
            <Text className="font-normal text-xs mb-1">Include a basic description and/or specific 
              tasks, items or any additional information you want included in the file extraction 
              (no description means model will pull default tasks/notes from document) </Text>
            <MultiLineInput
              placeholderText="ex. House inspection report, describes what tasks in the house need
              action. For the HVAC replacement move it to next month instead of when the document suggests..."
              placeholderColor="text-gray-400"
              textColor="text-black"
              fontWeight='font-normal'
            />
            <StandardButton
              title="Extract information from file"
              onPress={handleClose}
              bgColor="bg-green-700"
              textColor="text-white"
              fontWeight="font-semibold"
            />
            <StandardButton
              title="Cancel"
              onPress={handleClose}
              bgColor="bg-gray-100"
              textColor="text-gray-800"
              fontWeight="font-semibold"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}