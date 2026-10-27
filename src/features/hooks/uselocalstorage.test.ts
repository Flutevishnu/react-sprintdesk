import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from './uselocalstorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the initial value when nothing is saved', () => {
    const { result } = renderHook(() => useLocalStorage('name', 'Ada'));

    expect(result.current[0]).toBe('Ada');
  });

  it('reads a value that was saved before', () => {
    window.localStorage.setItem('name', JSON.stringify('Grace'));

    const { result } = renderHook(() => useLocalStorage('name', 'Ada'));

    expect(result.current[0]).toBe('Grace');
  });

  it('saves the new value when it changes', () => {
    const { result } = renderHook(() => useLocalStorage('name', 'Ada'));

    act(() => {
      result.current[1]('Linus');
    });

    expect(result.current[0]).toBe('Linus');
    expect(window.localStorage.getItem('name')).toBe(JSON.stringify('Linus'));
  });

  it('supports an updater function like useState', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1));

    act(() => {
      result.current[1]((current) => current + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('stores objects and arrays', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('ids', []));

    act(() => {
      result.current[1]([1, 2, 3]);
    });

    expect(JSON.parse(window.localStorage.getItem('ids') ?? 'null')).toEqual([1, 2, 3]);
  });

  it('falls back to the initial value when the saved JSON is broken', () => {
    window.localStorage.setItem('name', '{not valid json');

    const { result } = renderHook(() => useLocalStorage('name', 'Ada'));

    expect(result.current[0]).toBe('Ada');
  });

  it('keeps the value after the component is mounted again', () => {
    const first = renderHook(() => useLocalStorage('name', 'Ada'));
    act(() => {
      first.result.current[1]('Linus');
    });
    first.unmount();

    const second = renderHook(() => useLocalStorage('name', 'Ada'));

    expect(second.result.current[0]).toBe('Linus');
  });
});