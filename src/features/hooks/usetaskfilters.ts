import { useState } from 'react';
import type { Priority, Task, TaskStatus } from '../tasks/model';
import { useDebouncedValue } from './usedebouncedvalue';

export type StatusFilter = TaskStatus | 'all';
export type PriorityFilter = Priority | 'all';
export type SortBy = 'priority' | 'date';

export interface TaskFilterOptions {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  sortBy: SortBy;
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function filterAndSortTasks(tasks: Task[], options: TaskFilterOptions): Task[] {
  const search = options.search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (options.status !== 'all' && task.status !== options.status) return false;
    if (options.priority !== 'all' && task.priority !== options.priority) return false;
    if (search === '') return true;
    return (
      task.name.toLowerCase().includes(search) ||
      (task.description ?? '').toLowerCase().includes(search)
    );
  });

  return filtered.sort((a, b) => {
    if (options.sortBy === 'priority') {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function useTaskFilters(tasks: Task[], debounceMs = 300) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('priority');

  const debouncedSearch = useDebouncedValue(searchText, debounceMs);

  const visibleTasks = filterAndSortTasks(tasks, {
    search: debouncedSearch,
    status: statusFilter,
    priority: priorityFilter,
    sortBy,
  });

  return {
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    visibleTasks,
  };
}