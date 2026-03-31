import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DateInput } from './DateInput';
import { TaskType } from './types';

type Property = { id: string; name: string };

type TaskItemProps = {
  task: TaskType;
  onUpdate: (updatedTask: TaskType) => void;
  onDelete: () => void;
  readOnly?: boolean;
  propertyName?: string;
  properties?: Property[];
  propertyId?: string;
  selected?: boolean;
  selectionMode?: boolean;
  onLongPress?: () => void;
};

function getUrgencyColor(dueDate: Date | null): string {
  if (!dueDate) return '#d1d5db';
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return '#ef4444';   // past due
  if (days <= 30) return '#f59e0b'; // within month
  return '#22c55e';                 // farther in future
}

export default function TaskItem({ task, onUpdate, onDelete, readOnly, propertyName, selected, selectionMode, onLongPress }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | null>(
    task.dueDate ? new Date(task.dueDate) : null
  );

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
  }, [task]);

  // Exit editing if selection mode activates
  useEffect(() => {
    if (selectionMode) setEditing(false);
  }, [selectionMode]);

  const handleSave = () => {
    onUpdate({ ...task, title, description, dueDate });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setEditing(false);
  };

  return (
    <View
      style={{
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? '#2563eb' : '#e5e7eb',
        borderRadius: 10,
        backgroundColor: 'white',
        marginBottom: 6,
        overflow: 'hidden',
      }}
    >
      {editing ? (
        <View style={{ padding: 12, gap: 8 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            style={{
              fontWeight: '600',
              fontSize: 14,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 7,
            }}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            style={{
              fontSize: 13,
              color: '#374151',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 7,
            }}
          />
          <DateInput value={dueDate} onChange={(date: Date | null) => setDueDate(date)} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSave}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#15803d', borderRadius: 8, paddingVertical: 7 }}
            >
              <MaterialIcons name="check" size={14} color="white" />
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 7 }}
            >
              <MaterialIcons name="close" size={14} color="#6b7280" />
              <Text style={{ color: '#6b7280', fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={selectionMode ? onLongPress : undefined}
          onLongPress={!selectionMode ? onLongPress : undefined}
          delayLongPress={400}
          activeOpacity={selectionMode ? 0.7 : 1}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 }}
        >
          {selectionMode ? (
            <View style={{
              width: 20, height: 20, borderRadius: 10, marginRight: 10, flexShrink: 0,
              backgroundColor: selected ? '#2563eb' : 'white',
              borderWidth: 2, borderColor: selected ? '#2563eb' : '#d1d5db',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {selected && <MaterialIcons name="check" size={12} color="white" />}
            </View>
          ) : (
            <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: getUrgencyColor(dueDate), marginRight: 10, flexShrink: 0 }} />
          )}

          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontWeight: '600', fontSize: 14, color: '#111827' }}>{task.title}</Text>
            {task.description ? (
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }} numberOfLines={1}>{task.description}</Text>
            ) : null}
            {(dueDate || propertyName) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                {dueDate ? <Text style={{ fontSize: 11, color: '#9ca3af' }}>Due {dueDate.toISOString().split('T')[0]}</Text> : null}
                {dueDate && propertyName ? <Text style={{ fontSize: 11, color: '#d1d5db' }}>·</Text> : null}
                {propertyName ? <Text style={{ fontSize: 11, color: '#9ca3af' }}>{propertyName}</Text> : null}
              </View>
            ) : null}
          </View>

          {!readOnly && !selectionMode && (
            <>
              <TouchableOpacity onPress={() => setEditing(true)} style={{ padding: 6 }} hitSlop={6}>
                <MaterialIcons name="edit" size={15} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={{ padding: 6 }} hitSlop={6}>
                <MaterialIcons name="delete-outline" size={15} color="#d1d5db" />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
