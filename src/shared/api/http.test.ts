import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, http } from './http';

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('http client', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns parsed JSON on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1 }]));
    const data = await http.get('/api/tasks');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('sends a JSON body and header on POST', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 2 }, 201));
    await http.post('/api/tasks', { name: 'A' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'A' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('throws ApiError with status and server message on 404', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Task not found' }, 404));
    const error = await http.get('/api/tasks/9').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: 'Task not found' });
  });

  it('falls back to statusText when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('boom', { status: 500, statusText: 'Internal Server Error' }),
    );
    const error = await http.get('/api/tasks').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, message: 'Internal Server Error' });
  });

  it('returns undefined for 204 No Content', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const result = await http.delete('/api/tasks/1');
    expect(result).toBeUndefined();
  });

  it('passes the abort signal to fetch', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    const controller = new AbortController();
    await http.get('/api/tasks', controller.signal);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it('lets network failures through as plain errors, not ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await http.get('/api/tasks').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect(error).not.toBeInstanceOf(ApiError);
  });
});