import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { StandardButton } from './Buttons';
import { LoadingModal } from './LoadingModal';
import TaskItem from './TaskItem';
import { TaskType } from './types';

type TaskConfirmationPopupProps = {
  visible: boolean;
  tasks: TaskType[];
  fileId: string | undefined; 
  onClose: (saved: boolean) => void; // indicate whether tasks were saved or not
};

export default function TaskConfirmationPopup({
  visible,
  tasks: initialTasks,
  fileId,
  onClose,
}: TaskConfirmationPopupProps) {
  const [tasks, setTasks] = useState<TaskType[]>(initialTasks);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setTasks(initialTasks); // reset tasks when modal opens
  }, [initialTasks, visible]);

  const handleUpdateTask = (index: number, updatedTask: TaskType) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  const handleDeleteTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { title: '', description: '', dueDate: null }]);
  };

  const handleConfirm = async () => {
    if (!fileId) return;
    setSaving(true);
    try {
      for (const task of tasks) {
        const dueDateStr = task.dueDate
          ? task.dueDate.toISOString().slice(0, 10)
          : null;

        await supabase.from('tasks').insert({
          file_id: fileId,
          title: task.title,
          description: task.description,
          due_date: dueDateStr,
        });
      }

      onClose(true); // ✅ indicate tasks were saved
    } catch (err) {
      console.error("Error saving tasks:", err);
      onClose(false); // fail-safe: indicate tasks not saved
    } finally {
      setSaving(false);
    }
  };

  const handleTryAgain = () => {
    onClose(false); // just close, no save
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 500, maxWidth: '90%', backgroundColor: 'white', borderRadius: 16, padding: 24, maxHeight: '80%' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Confirm Extracted Tasks</Text>

          <ScrollView style={{ marginBottom: 12 }}>
            {tasks.map((task, index) => (
              <TaskItem
                key={index}
                task={task}
                onUpdate={(updatedTask) => handleUpdateTask(index, updatedTask)}
                onDelete={() => handleDeleteTask(index)}
              />
            ))}
          </ScrollView>

          <StandardButton
            title="Add Task"
            onPress={handleAddTask}
            bgColor="bg-blue-600"
            textColor="text-white"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <StandardButton
              title="Confirm"
              onPress={handleConfirm}
              bgColor="bg-green-700"
              textColor="text-white"
              disabled={saving}
            />
            <StandardButton
              title="Try Again"
              onPress={handleTryAgain}
              bgColor="bg-gray-200"
              textColor="text-gray-800"
              disabled={saving}
            />
          </View>
            <LoadingModal
                visible={saving}
                message="Uploading tasks..."
                onCancel={() => {
                    setSaving(false);
                }}
            />
        </View>
      </View>
    </Modal>
  );
}