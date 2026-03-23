import { useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

type InfoPopupProps = {
  visible: boolean;
  type?: 'warning' | 'error' | 'success'; // new: style type
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  showConfirm?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
  autoDismiss?: number;
  dismissOnBackdropPress?: boolean;
};

export default function InfoPopup({
  visible,
  type = 'error',
  title,
  message,
  onClose,
  confirmText = 'OK',
  showConfirm = true,
  cancelText,
  onConfirm,
  autoDismiss,
  dismissOnBackdropPress = true,
}: InfoPopupProps) {
  useEffect(() => {
    if (visible && autoDismiss) {
      const timer = setTimeout(() => {
        onClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [visible, autoDismiss]);

  // Colors based on type
  const titleColor =
    type === 'success' ? 'text-green-600' : type === 'warning' ? 'text-yellow-600' : 'text-red-600';
  const messageColor =
    type === 'success' ? 'text-green-800' : type === 'warning' ? 'text-yellow-800' : 'text-red-800';
  const confirmButtonColor =
    type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable
        className="flex-1 justify-center items-center bg-black/40 p-4"
        onPress={dismissOnBackdropPress ? onClose : undefined}
      >
        {/* Popup container */}
        <View className="bg-white rounded-xl p-6 w-full max-w-xs shadow-md">
          {/* Title */}
          {title && (
            <Text className={`text-xl font-bold mb-3 text-center ${titleColor}`}>
              {title}
            </Text>
          )}

          {/* Message */}
          <Text className={`text-base mb-6 text-center ${messageColor}`}>
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex-col space-y-3">
            {cancelText && (
              <TouchableOpacity
                className="px-4 py-3 rounded-lg bg-gray-200"
                onPress={onClose}
              >
                <Text className="text-gray-800 font-semibold text-center">{cancelText}</Text>
              </TouchableOpacity>
            )}
            {showConfirm && (
              <TouchableOpacity
                className={`px-4 py-3 rounded-lg ${confirmButtonColor}`}
                onPress={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                <Text className="text-white font-semibold text-center">{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}