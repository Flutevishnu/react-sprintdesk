import type { Task, TaskStatus } from '../model';
import { PRIORITY_LABELS, STATUS_LABELS, STATUSES } from '../../../lib/utils';

interface TaskListProps {
  tasks: Task[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
  return (
    <ul aria-label="Tasks">
      {tasks.map((task) => (
        <li key={task.id}>
          <strong>{task.name}</strong> <small>({PRIORITY_LABELS[task.priority]})</small>
          {task.description !== '' && <p>{task.description}</p>}

          <select
            aria-label={`Status of ${task.name}`}
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <button type="button" aria-label={`Edit ${task.name}`} onClick={() => onEdit(task.id)}>
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete ${task.name}`}
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}