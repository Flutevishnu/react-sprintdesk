import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchTasks, type TaskFilters } from './tasksApi';
import { type Task } from '../../features/tasks/model';
const taskRoot = ['tasks'] as const;

export const taskKeys = {
  all: taskRoot,
  lists: () => ['tasks', 'list'] as const,
  list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
};

export function useTasksQuery(
  filters: TaskFilters = {},
  options: { throwOnError?: boolean } = {},
) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ signal }) => fetchTasks(filters, signal),
    placeholderData: keepPreviousData,
    structuralSharing: (oldData, newData) => {
      const previous = new Map(
        ((oldData as Task[] | undefined) ?? []).map((t) => [t.id, t]),
      );
      return (newData as Task[]).map((next) => {
        const prev = previous.get(next.id);
        const same =
          prev !== undefined &&
          prev.name === next.name &&
          prev.description === next.description &&
          prev.status === next.status &&
          prev.priority === next.priority &&
          prev.assignee === next.assignee &&
          prev.createdAt.getTime() === next.createdAt.getTime();
        return same ? prev : next;
      });
    },
    throwOnError: options.throwOnError
      ? (_error, query) => query.state.data === undefined
      : false,

  });
}