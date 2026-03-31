import { DateInput } from '@/components/DateInput';
import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LoadingModal } from './LoadingModal';

type Property = { id: string; name: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, dueDate: Date | null, propertyId?: string) => Promise<void>;
  properties?: Property[];
};

export default function AddTaskModal({ visible, onClose, onAdd, properties }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canSubmit = !!title.trim() && (!properties || !!selectedPropertyId);

  const handleAdd = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onAdd(title.trim(), description.trim(), dueDate, selectedPropertyId ?? undefined);
      setTitle('');
      setDescription('');
      setDueDate(null);
      setSelectedPropertyId(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setDueDate(null);
    setSelectedPropertyId(null);
    onClose();
  };

  return (
    <>
    <LoadingModal visible={saving} message="Saving task..." />
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 340, backgroundColor: 'white', borderRadius: 16, padding: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 14 }}>New Task</Text>

          {properties && (
            <>
              <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Property *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {properties.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelectedPropertyId(p.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: selectedPropertyId === p.id ? '#15803d' : '#d1d5db',
                        backgroundColor: selectedPropertyId === p.id ? '#f0fdf4' : 'white',
                      }}
                    >
                      <Text style={{ fontSize: 13, color: selectedPropertyId === p.id ? '#15803d' : '#374151', fontWeight: selectedPropertyId === p.id ? '600' : '400' }}>
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            autoFocus
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12 }}
          />

          <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Optional"
            multiline
            style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12, minHeight: 60 }}
          />

          <DateInput value={dueDate} onChange={setDueDate} />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={saving || !canSubmit}
              style={{
                flex: 1,
                backgroundColor: saving || !canSubmit ? '#d1d5db' : '#15803d',
                borderRadius: 8,
                paddingVertical: 11,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>{saving ? 'Saving...' : 'Add'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={{ flex: 1, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 11, alignItems: 'center' }}
            >
              <Text style={{ color: '#374151' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}
