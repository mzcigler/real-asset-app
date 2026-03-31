import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { StandardButton } from './Buttons';
import { LoadingModal } from './LoadingModal';

type AddPropertyPopupProps = {
  visible: boolean;
  onClose: () => void;
  onPropertyAdded?: () => void;
};

export default function AddPropertyPopup({
  visible,
  onClose,
  onPropertyAdded,
}: AddPropertyPopupProps) {
  const [propertyName, setPropertyName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddProperty = async () => {
    if (!propertyName.trim()) return;

    try {
      setAdding(true);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error('User not logged in');

      const { error } = await supabase.from('properties').insert([
        {
          name: propertyName.trim(),
          user_id: userId,
        },
      ]);

      if (error) throw error;

      setPropertyName('');
      onClose();
      if (onPropertyAdded) onPropertyAdded();
    } catch (err: any) {
      console.error('Failed to add property:', err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
    <LoadingModal visible={adding} message="Adding property..." />
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: 400,
              maxWidth: '90%',
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Add New Property
            </Text>

            <Text style={{ marginBottom: 6 }}>Property Name:</Text>
            <TextInput
              value={propertyName}
              onChangeText={setPropertyName}
              placeholder="Ex. Main House, Condo #3..."
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 8,
                marginBottom: 16,
              }}
            />

            <StandardButton
              title={adding ? 'Adding...' : 'Add Property'}
              onPress={handleAddProperty}
              disabled={adding || !propertyName.trim()}
              bgColor={adding || !propertyName.trim() ? 'bg-gray-400' : 'bg-green-700'}
              textColor="text-white"
              fontWeight="font-semibold"
            />

            <StandardButton
              title="Cancel"
              onPress={onClose}
              bgColor="bg-gray-100"
              textColor="text-gray-800"
              fontWeight="font-semibold"
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
    </>
  );
}