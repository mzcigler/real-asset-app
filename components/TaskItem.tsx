import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
};

function getUrgencyColor(dueDate: Date | null): string {
  if (!dueDate) return '#d1d5db';
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return '#ef4444';   // overdue
  if (days <= 7) return '#ef4444';  // this week
  if (days <= 30) return '#f59e0b'; // this month
  if (days <= 365) return '#22c55e'; // this year
  return '#d1d5db'; // far future
}

export default function TaskItem({ task, onUpdate, onDelete, readOnly, propertyName }: TaskItemProps) {
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
        borderWidth: 1,
        borderColor: '#e5e7eb',
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
          <DateInput
            value={dueDate}
            onChange={(date: Date | null) => setDueDate(date)}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                backgroundColor: '#15803d',
                borderRadius: 8,
                paddingVertical: 7,
              }}
            >
              <MaterialIcons name="check" size={14} color="white" />
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
                paddingVertical: 7,
              }}
            >
              <MaterialIcons name="close" size={14} color="#6b7280" />
              <Text style={{ color: '#6b7280', fontSize: 13 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              backgroundColor: getUrgencyColor(dueDate),
              marginRight: 10,
              flexShrink: 0,
            }}
          />
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontWeight: '600', fontSize: 14, color: '#111827' }}>
              {task.title}
            </Text>
            {task.description ? (
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }} numberOfLines={1}>
                {task.description}
              </Text>
            ) : null}
            {(dueDate || propertyName) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
                {dueDate ? (
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>
                    Due {dueDate.toISOString().split('T')[0]}
                  </Text>
                ) : null}
                {dueDate && propertyName ? (
                  <Text style={{ fontSize: 11, color: '#d1d5db' }}>·</Text>
                ) : null}
                {propertyName ? (
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>{propertyName}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
          {!readOnly && (
            <>
              <TouchableOpacity onPress={() => setEditing(true)} style={{ padding: 6 }} hitSlop={6}>
                <MaterialIcons name="edit" size={15} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={{ padding: 6 }} hitSlop={6}>
                <MaterialIcons name="delete-outline" size={15} color="#d1d5db" />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}
