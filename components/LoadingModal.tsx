import { ActivityIndicator, Modal, Text, View } from 'react-native';
import { StandardButton } from './Buttons';


type LoadingModalProps = {
  visible: boolean;
  message?: string;
  onCancel?: () => void; // optional cancel button
};

export const LoadingModal = ({ visible, message, onCancel }: LoadingModalProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl p-6 w-80 flex items-center">
          <ActivityIndicator size="large" color="#10B981" /> 
          <Text className="text-gray-900 text-lg font-semibold mt-4 mb-4 text-center">
            {message || "Processing..."}
          </Text>
          {onCancel && (
            <StandardButton
              title="Cancel" 
              onPress={onCancel}
              bgColor="bg-gray-200"
              textColor="text-black"
              fontWeight="font-bold"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};