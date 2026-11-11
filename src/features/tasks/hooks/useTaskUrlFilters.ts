import { useCallback, useMemo, useSyncExternalStore } from 'react';
import  { type Priority, type TaskStatus, STATUSES, PRIORITIES, type SortKey } from '../model/types';


export interface UrlFilters {
  q: string;
  status?: TaskStatus;
  priority?: Priority;
  sort: SortKey;
}


export function parseFilters(search: string): UrlFilters {
  const params = new URLSearchParams(search);
  const status = params.get('status');
  const priority = params.get('priority');
  return {
    q: params.get('q') ?? '',
    status: STATUSES.find((s) => s === status),
    priority: PRIORITIES.find((p) => p === priority),
    sort: params.get('sort') === 'priority' ? 'priority' : 'date',
  };
}

function buildSearch(filters: UrlFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.sort !== 'date') params.set('sort', filters.sort);
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