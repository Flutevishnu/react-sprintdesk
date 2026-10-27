import type { Task } from '../model';
import { STATUS_LABELS, STATUSES } from '../../../lib/utils';


export function StatusCounts({ tasks }: { tasks: Task[] }) {
  return (
    <ul aria-label="Task counts">
      {STATUSES.map((status) => (
        <li key={status}>
          {STATUS_LABELS[status]}: {tasks.filter((task) => task.status === status).length}
        </li>
      ))}
    </ul>
  );
}