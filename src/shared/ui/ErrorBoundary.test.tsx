import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the fallback when a child throws, and recovers on reset', () => {
    let shouldThrow = true;
    const Bomb = () => {
      if (shouldThrow) throw new Error('Kaboom');
      return <p>All good</p>;
    };

    render(
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div role="alert">
            {error.message}
            <button type="button" onClick={reset}>
              Retry
            </button>
          </div>
        )}
      >
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Kaboom');

    shouldThrow = false; 
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('calls onReset when the fallback resets', () => {
    const onReset = vi.fn();
    const Bomb = () => {
      throw new Error('Kaboom');
    };

    render(
      <ErrorBoundary
        onReset={onReset}
        fallback={({ reset }) => (
          <button type="button" onClick={reset}>
            Retry
          </button>
        )}
      >
        <Bomb />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});