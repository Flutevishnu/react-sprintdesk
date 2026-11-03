import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchTasks, type TaskFilters } from './tasksApi';

export const taskKeys = {
  all: ['tasks'] as const,
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
    throwOnError: options.throwOnError
      ? (_error, query) => query.state.data === undefined
      : false,

  });
}