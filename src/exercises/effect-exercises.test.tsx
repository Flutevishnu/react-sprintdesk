import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectionStatus, FocusTimer, TaskQuickFind } from './effect-exercises';

describe('ConnectionStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows Online or Offline as the browser changes', () => {
    const onLine = vi.spyOn(Navigator.prototype, 'onLine', 'get');
    onLine.mockReturnValue(true);
    render(<ConnectionStatus />);

    expect(screen.getByRole('status')).toHaveTextContent('Online');

    onLine.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Offline');

    onLine.mockReturnValue(true);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Online');
  });

  it('removes its listeners when it unmounts', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<ConnectionStatus />);
    unmount();

    for (const type of ['online', 'offline']) {
      const added = addSpy.mock.calls.filter(([t]) => t === type).map(([, handler]) => handler);
      const removed = removeSpy.mock.calls
        .filter(([t]) => t === type)
        .map(([, handler]) => handler);

      expect(added.length).toBeGreaterThan(0);
      for (const handler of added) {
        expect(removed).toContain(handler);
      }
    }
  });

  it('does not leave listeners behind after many mounts', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    for (let i = 0; i < 3; i++) {
      render(<ConnectionStatus />).unmount();
    }

    for (const type of ['online', 'offline']) {
      const added = addSpy.mock.calls.filter(([t]) => t === type).length;
      const removed = removeSpy.mock.calls.filter(([t]) => t === type).length;

      expect(added).toBe(3);
      expect(removed).toBe(added);
    }
  });
});

describe('FocusTimer', () => {
  // Fake timers let the test move the clock forward instantly.
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at 0 seconds', () => {
    render(<FocusTimer />);

    expect(screen.getByText('0s focused')).toBeInTheDocument();
  });

  it('increases by one every second', () => {
    render(<FocusTimer />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('3s focused')).toBeInTheDocument();
  });

  it('pauses on Stop and resumes from the current value on Start', () => {
    render(<FocusTimer />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('2s focused')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('2s focused')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('3s focused')).toBeInTheDocument();
  });

  it('clears its interval when it unmounts', () => {
    const { unmount } = render(<FocusTimer />);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('TaskQuickFind', () => {
  type Tasks = ComponentProps<typeof TaskQuickFind>['tasks'];

  function makeTasks(): Tasks {
    return [
      { id: '1', title: 'Write report', status: 'todo' },
      { id: '2', title: 'Review pull request', status: 'in_progress' },
      { id: '3', title: 'Fix login bug', status: 'done' },
    ];
  }

  it('lists every task and the count at the start', () => {
    render(<TaskQuickFind tasks={makeTasks()} />);

    expect(screen.getByText('3 matching')).toBeInTheDocument();
    expect(screen.getByText('Write report')).toBeInTheDocument();
  });

  it('filters by the typed text, ignoring upper and lower case', async () => {
    const user = userEvent.setup();
    render(<TaskQuickFind tasks={makeTasks()} />);

    await user.type(screen.getByLabelText('Find a task'), 'REPORT');

    expect(screen.getByText('1 matching')).toBeInTheDocument();
    expect(screen.getByText('Write report')).toBeInTheDocument();
    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
  });

  it('shows 0 matching when nothing matches', async () => {
    const user = userEvent.setup();
    render(<TaskQuickFind tasks={makeTasks()} />);

    await user.type(screen.getByLabelText('Find a task'), 'zzz');

    expect(screen.getByText('0 matching')).toBeInTheDocument();
  });

  it('updates the list when the tasks prop changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TaskQuickFind tasks={makeTasks()} />);

    await user.type(screen.getByLabelText('Find a task'), 'report');
    expect(screen.getByText('1 matching')).toBeInTheDocument();

    rerender(
      <TaskQuickFind
        tasks={[...makeTasks(), { id: '4', title: 'Send report to Ada', status: 'todo' }]}
      />,
    );

    expect(screen.getByText('2 matching')).toBeInTheDocument();
    expect(screen.getByText('Send report to Ada')).toBeInTheDocument();
  });
});