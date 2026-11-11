import  { type Task, STATUSES } from '../model/types';
import { STATUS_LABELS } from '../model/types';


export function StatusCounts({ tasks }: { tasks: Task[] }) {
  return (
    <ul aria-label="Task counts">
      {STATUSES.map((status) => (
        <li key={status}>
          {STATUS_LABELS[status]}: {tasks.filter((task) => task.status === status).length}
        </li>
      ))}
      <li>High Priority Tasks Not done: {tasks.filter((task) => task.priority === "high" && task.status !== 'done').length}</li>
    </ul>
  );
}