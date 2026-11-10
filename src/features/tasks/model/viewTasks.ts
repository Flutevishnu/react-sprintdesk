import type { Priority, Task } from './types';
import type { SortKey } from './types';

const RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function viewTasks(
  tasks: readonly Task[],
  view: { priority?: Priority; sort: SortKey },
): Task[] {
  const copy = view.priority
    ? tasks.filter((t) => t.priority === view.priority)
    : [...tasks];

  return copy.sort((a, b) =>
    view.sort === 'priority'
      ? RANK[a.priority] - RANK[b.priority]
      : b.createdAt.getTime() - a.createdAt.getTime(),
  );
}