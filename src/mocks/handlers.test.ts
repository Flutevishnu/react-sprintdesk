import { describe, expect, it } from 'vitest';
import { http, ApiError } from '../shared/lib/http';
import type { TaskDto } from '../features/tasks/api/schema';

const errorOf = (promise: Promise<unknown>) =>
  promise.catch((error: unknown) => error);

describe('MSW task handlers', () => {
  it('GET /api/tasks returns the seed data', async () => {
    const tasks = await http.get<TaskDto[]>('/api/tasks');
    expect(tasks).toHaveLength(5);
  });

  it('GET filters by status', async () => {
    const tasks = await http.get<TaskDto[]>('/api/tasks?status=done');
    expect(tasks).toHaveLength(1);
    expect(tasks.every((task) => task.status === 'done')).toBe(true);
  });

  it('GET filters by search text', async () => {
    const tasks = await http.get<TaskDto[]>('/api/tasks?q=login');
    expect(tasks.map((task) => task.name)).toEqual(['Design login page']);
  });

  it('POST creates a task and answers 201', async () => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New task' }),
    });
    expect(response.status).toBe(201);

    const created = (await response.json()) as TaskDto;
    expect(created).toMatchObject({
      name: 'New task',
      status: 'todo',
      priority: 'medium',
    });

    const all = await http.get<TaskDto[]>('/api/tasks');
    expect(all).toHaveLength(6);
  });

  it('POST with an empty name answers 400', async () => {
    const error = await errorOf(http.post('/api/tasks', { name: '   ' }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Validation failed' });
  });

  it('Post with title more than 100 characters return 400', async () => {
    const error = await errorOf(http.post('/api/tasks', { name: 'a'.repeat(101) }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Validation failed' });
  })

  it('Post with description more than 1000 characters return 400', async () => {
    const error = await errorOf(http.post('/api/tasks', { name: 'a'.repeat(3), description: 'a'.repeat(1001) }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Validation failed' });
  })


  it('PATCH changes only the given fields', async () => {
    const updated = await http.patch<TaskDto>('/api/tasks/1', {
      status: 'in_progress',
    });
    expect(updated.status).toBe('in_progress');
    expect(updated.name).toBe('Set up project');
  });

  it('PATCH on an unknown id answers 404', async () => {
    const error = await errorOf(http.patch('/api/tasks/999', { name: 'xabe' }));
    expect(error).toMatchObject({ status: 404, message: 'Task not found' });
  });

  it('Patch with title more than 100 characters return 400', async () => {
    const error = await errorOf(http.patch('/api/tasks/1', { name: 'a'.repeat(101) }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Validation failed' });
  })

  it('Patch with description more than 1000 characters return 400', async () => {
    const error = await errorOf(http.patch('/api/tasks/1', { name: 'a'.repeat(3), description: 'a'.repeat(1001) }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, message: 'Validation failed' });
  })

  it('DELETE removes the task and answers 204', async () => {
    const result = await http.delete('/api/tasks/1');
    expect(result).toBeUndefined();

    const all = await http.get<TaskDto[]>('/api/tasks');
    expect(all).toHaveLength(4);
  });

  it('DELETE on an unknown id answers 404', async () => {
    const error = await errorOf(http.delete('/api/tasks/999'));
    expect(error).toMatchObject({ status: 404 });
  });

  it('?fail=500 makes GET fail on purpose', async () => {
    const error = await errorOf(http.get('/api/tasks?fail=500'));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, message: 'Simulated 500 error' });
  });

  it('?fail=503 also works on POST', async () => {
    const error = await errorOf(http.post('/api/tasks?fail=503', { name: 'x' }));
    expect(error).toMatchObject({ status: 503 });
  });

  it('POST with an invalid name answers 400 with a field error', async () => {
    const error = await errorOf(http.post('/api/tasks', { name: 'ab' }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      fieldErrors: { name: 'Title must be at least 3 characters' },
    });
  });

  it('GET returns an empty list when nothing matches', async () => {
    const tasks = await http.get<TaskDto[]>('/api/tasks?q=zzz');
    expect(tasks).toEqual([]);
  });

  
});