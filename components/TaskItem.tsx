import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { StandardButton } from './Buttons';
import { DateInput } from './DateInput';
import { TaskType } from './types';

type TaskItemProps = {
  task: TaskType;
  onUpdate: (updatedTask: TaskType) => void;
  onDelete: () => void;
};

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
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
    onUpdate({ ...task, title, description, dueDate: dueDate });
    setEditing(false);
    };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
      }}
    >
      {editing ? (
        <>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 16 }}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            multiline
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 6,
              marginBottom: 6,
            }}
          />
            <DateInput
            value={dueDate ? new Date(dueDate) : null} // Date or null
            onChange={(date: Date | null) => setDueDate(date)} // keep as Date
            />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StandardButton
              title="Save"
              onPress={handleSave}
              bgColor="bg-green-700"
              textColor="text-white"
            />
            <StandardButton
              title="Cancel"
              onPress={() => setEditing(false)}
              bgColor="bg-gray-200"
              textColor="text-gray-800"
            />
          </View>
        </>
      ) : (
        <>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{task.title}</Text>
          <Text style={{ marginVertical: 4 }}>{task.description}</Text>
          {dueDate ? (
            <Text style={{ fontStyle: 'italic', color: '#555' }}>Due: {dueDate.toISOString().split('T')[0]}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <StandardButton
              title="Edit"
              onPress={() => setEditing(true)}
              bgColor="bg-yellow-500"
              textColor="text-white"
            />
            <StandardButton
              title="Delete"
              onPress={onDelete}
              bgColor="bg-red-600"
              textColor="text-white"
            />
          </View>
        </>
      )}
    </View>
  );
}