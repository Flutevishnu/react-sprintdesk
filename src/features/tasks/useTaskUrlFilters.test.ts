import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTaskUrlFilters } from './useTaskUrlFilters';

beforeEach(() => window.history.replaceState(null, '', '/'));

describe('useTaskUrlFilters', () => {
  it('uses defaults when the URL has no filters', () => {
    const { result } = renderHook(() => useTaskUrlFilters());
    expect(result.current.filters).toEqual({ q: '', sort: 'priority' });
  });

  it('reads filters from the URL', () => {
    window.history.replaceState(null, '', '/?status=done&sort=date&q=login');
    const { result } = renderHook(() => useTaskUrlFilters());
    expect(result.current.filters).toEqual({ q: 'login', status: 'done', sort: 'date' });
  });

  it('ignores invalid values in the URL', () => {
    window.history.replaceState(null, '', '/?status=banana&priority=urgent&sort=zzz');
    const { result } = renderHook(() => useTaskUrlFilters());
    expect(result.current.filters.status).toBeUndefined();
    expect(result.current.filters.priority).toBeUndefined();
    expect(result.current.filters.sort).toBe('priority');
  });

  it('writes changes to the URL and updates the filters', () => {
    const { result } = renderHook(() => useTaskUrlFilters());
    act(() => result.current.setFilters({ status: 'done', sort: 'date' }));
    expect(window.location.search).toBe('?status=done&sort=date');
    expect(result.current.filters.status).toBe('done');
  });

  it('removes a param when the filter is cleared or back to default', () => {
    window.history.replaceState(null, '', '/?status=done&sort=date');
    const { result } = renderHook(() => useTaskUrlFilters());
    act(() => result.current.setFilters({ status: undefined, sort: 'priority' }));
    expect(window.location.search).toBe('');
  });
});