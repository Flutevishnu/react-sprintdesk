import { delay, http, HttpResponse } from 'msw';
import type { NewTaskDto, TaskPatchDto } from '../shared/api/types';
import type { TaskStatus } from '../features/tasks/model';
import { db } from './db';

function simulatedFailure(request: Request): Response | null {
  const fail = new URL(request.url).searchParams.get('fail');
  if (fail === null) return null;

  const status = Number(fail);
  if (!Number.isInteger(status) || status < 400 || status > 599) return null;

  return HttpResponse.json(
    { message: `Simulated ${status} error` },
    { status },
  );
}

export const handlers = [
    http.get('/api/tasks', async ({ request }) => {
    await delay();
    const failure = simulatedFailure(request);
    if (failure) return failure;

    const params = new URL(request.url).searchParams;
    const status = params.get('status') as TaskStatus | null;
    const q = params.get('q')?.toLowerCase() ?? '';

    const tasks = db
      .all()
      .filter((task) => (status ? task.status === status : true))
      .filter((task) => task.name.toLowerCase().includes(q));

    return HttpResponse.json(tasks);
  }),

  http.post('/api/tasks', async ({ request }) => {
    await delay();
    const failure = simulatedFailure(request);
    if (failure) return failure;

    const body = (await request.json()) as Partial<NewTaskDto>;
    if (!body.name || body.name.trim() === '') {
      return HttpResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const created = db.create({ ...body, name: body.name.trim() } as NewTaskDto);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch('/api/tasks/:id', async ({ request, params }) => {
    await delay();
    const failure = simulatedFailure(request);
    if (failure) return failure;

    const patch = (await request.json()) as TaskPatchDto;
    const updated = db.update(Number(params.id), patch);
    if (!updated) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return HttpResponse.json(updated);
  }),

  http.delete('/api/tasks/:id', async ({ request, params }) => {
    await delay();
    const failure = simulatedFailure(request);
    if (failure) return failure;

    if (!db.remove(Number(params.id))) {
      return HttpResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),
];