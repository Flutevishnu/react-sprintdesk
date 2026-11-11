import { memo } from 'react';
import type { Task, TaskStatus } from '../model/types';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export const TaskList = memo(function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
  return (
    <ul aria-label="Tasks">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
      ))}
    </ul>
  );
});