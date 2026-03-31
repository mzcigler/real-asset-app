import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, View } from 'react-native';
import Button from './Button';
import { LoadingModal } from './LoadingModal';
import { useTheme } from '@/theme/ThemeContext';
import { createProperty } from '@/services/propertyService';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPropertyAdded?: () => void;
};

export default function AddPropertyPopup({ visible, onClose, onPropertyAdded }: Props) {
  const { colors } = useTheme();
  const [propertyName, setPropertyName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!propertyName.trim()) return;
    try {
      setAdding(true);
      await createProperty(propertyName.trim());
      setPropertyName('');
      onClose();
      onPropertyAdded?.();
    } catch (err: any) {
      console.error('Failed to add property:', err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleCancel = () => {
    setPropertyName('');
    onClose();
  };

  return (
    <>
      <LoadingModal visible={adding} message="Adding property…" />
      <Modal transparent visible={visible} animationType="fade">
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center' }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                width: 400,
                maxWidth: '90%',
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.textPrimary }}>
                Add New Property
              </Text>

              <Text style={{ marginBottom: 6, color: colors.textSecondary }}>Property Name</Text>
              <TextInput
                value={propertyName}
                onChangeText={setPropertyName}
                placeholder="e.g. Main House, Condo #3…"
                placeholderTextColor={colors.inputPlaceholder}
                autoFocus
                onSubmitEditing={handleAdd}
                style={{
                  borderWidth: 1,
                  borderColor: colors.inputBorder,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                  fontSize: 15,
                  color: colors.textPrimary,
                  backgroundColor: colors.inputBackground,
                }}
              />

              <Button
                title={adding ? 'Adding…' : 'Add Property'}
                onPress={handleAdd}
                variant="success"
                disabled={adding || !propertyName.trim()}
                fullWidth
                style={{ marginBottom: 10 }}
              />
              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
