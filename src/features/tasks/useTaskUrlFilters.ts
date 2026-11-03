import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { Priority, TaskStatus } from './model';

export type SortKey = 'priority' | 'date';

export interface UrlFilters {
  q: string;
  status?: TaskStatus;
  priority?: Priority;
  sort: SortKey;
}

const STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'done'];
const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high'];

export function parseFilters(search: string): UrlFilters {
  const params = new URLSearchParams(search);
  const status = params.get('status');
  const priority = params.get('priority');
  return {
    q: params.get('q') ?? '',
    status: STATUSES.find((s) => s === status),
    priority: PRIORITIES.find((p) => p === priority),
    sort: params.get('sort') === 'date' ? 'date' : 'priority',
  };
}

function buildSearch(filters: UrlFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.sort !== 'priority') params.set('sort', filters.sort);
  const text = params.toString();
  return text ? `?${text}` : '';
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

const getSnapshot = () => window.location.search;

export function useTaskUrlFilters() {
  const search = useSyncExternalStore(subscribe, getSnapshot);
  const filters = useMemo(() => parseFilters(search), [search]);

  const setFilters = useCallback((changes: Partial<UrlFilters>) => {
    const next = { ...parseFilters(window.location.search), ...changes };
    const url = `${window.location.pathname}${buildSearch(next)}`;
    window.history.replaceState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  return { filters, setFilters };
}