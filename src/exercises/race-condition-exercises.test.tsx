import { act, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FixedSearch, NaiveSearch, type Item } from './race-condition-exercises';


interface PendingRequest {
  url: string;
  respondWith: (items: Item[]) => void;
}

let pending: PendingRequest[] = [];

beforeEach(() => {
  pending = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (url: string, init?: RequestInit) =>
        new Promise<Response>((resolve, reject) => {
          pending.push({
            url,
            respondWith: (items) =>
              resolve(
                new Response(JSON.stringify(items), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }),
              ),
          });
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function runRaceScenario(Search: ComponentType<{ query: string }>) {
  const { rerender } = render(<Search query="a" />);
  rerender(<Search query="ab" />);

  expect(pending).toHaveLength(2);

  await act(async () => {
    pending[1].respondWith([{ id: 2, name: 'result for ab' }]);
  });
  expect(await screen.findByText('result for ab')).toBeInTheDocument();


  await act(async () => {
    pending[0].respondWith([{ id: 1, name: 'result for a' }]);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  expect(screen.getByText('result for ab')).toBeInTheDocument();
  expect(screen.queryByText('result for a')).not.toBeInTheDocument();
}

describe('race condition', () => {
  it.fails('NaiveSearch lets a slow old response overwrite the new one (bug)', async () => {
    await runRaceScenario(NaiveSearch);
  });

  it('FixedSearch ignores the old request because it was aborted', async () => {
    await runRaceScenario(FixedSearch);
  });

  it('FixedSearch aborts the previous request when the query changes', async () => {
    const { rerender } = render(<FixedSearch query="a" />);
    const firstSignal = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].signal as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    rerender(<FixedSearch query="ab" />);
    expect(firstSignal.aborted).toBe(true);
  });
});