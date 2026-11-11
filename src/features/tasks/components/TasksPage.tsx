import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  useCreateTask,
  useDeleteTask,
  useMoveTaskStatus,
  useUpdateTask,
} from '../api/useTaskMutations';
import type { TaskFilters } from '../api/tasksApi';
import { useTasksQuery } from '../api/useTasksQuery';
import  { type Priority, type TaskStatus, STATUSES, PRIORITIES } from '../model/types';
import { useTaskUrlFilters } from '../hooks/useTaskUrlFilters';
import { viewTasks } from '../model/viewTasks';
import { TaskForm } from './TaskForm';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { STATUS_LABELS, PRIORITY_LABELS, type SortKey, type PendingAction, type Task} from '../model/types';
import { StatusCounts } from './StatusCounts';
import { TaskList } from './TaskList';
import { ApiError } from '../../../shared/lib/http';
import type { TaskFormValues } from '../api/schema';
import { ConfirmDialog } from './ConfirmDialog';

export function TasksPage() {
  const { filters, setFilters } = useTaskUrlFilters();
  const debouncedQ = useDebouncedValue(filters.q, 300);

  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [pending, setPending] = useState<PendingAction | null>(null);


  const serverFilters: TaskFilters = {};
  if (filters.status) serverFilters.status = filters.status;
  if (debouncedQ) serverFilters.q = debouncedQ;

  const list = useTasksQuery(serverFilters, { throwOnError: true });
  const all = useTasksQuery({}); 

  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const move = useMoveTaskStatus();

  const createFieldErrors = create.error instanceof ApiError ? create.error.fieldErrors : undefined;
  const updateFieldErrors = update.error instanceof ApiError ? update.error.fieldErrors : undefined;



  const handleEdit = useCallback((id: number) => setEditingId(id), []);

  const { mutate: removeTask } = remove;
  const { mutate: moveStatus } = move;

  const allRef = useRef<Task[]>([]);

  useEffect(() => {
    allRef.current = all.data ?? []
  }, [all.data])

  const handleDelete = useCallback(
    (id: number) => {
      setPending({ kind: 'delete', id })
    },
    [],
  );
  const handleStatusChange = useCallback(
    (id: number, status: TaskStatus) => {
      const current = allRef.current.find((t) => t.id === id);
      if (current?.status === 'todo' && status === 'done') {
        setPending({ kind: 'complete', id });
        return;
      }
      moveStatus({ id, status });
    },
    [moveStatus],
  );

  const tasks = useMemo(() => viewTasks(list.data ?? [], filters), [list.data, filters]);
  const editing = all.data?.find((t) => t.id === editingId);

  function handleCreate(values: TaskFormValues) {
    create.mutate(values, { onSuccess: () => setCreateFormKey((k) => k + 1) });
  }

  function handleUpdate(id: number, values: TaskFormValues) {
    if (editing?.status === 'todo' && values.status === 'done') {
      setPending({ kind: 'complete-edit', id, values });
      return;
    }
    update.mutate({ id, changes: values }, { onSuccess: () => setEditingId(null) });
  
  }

  function confirmPending() {
    if (!pending) {
      return 
    }

    switch(pending.kind) {
      case 'delete': {
        const { id } = pending;
        removeTask(id);
        setEditingId((current) => (current === id ? null : current));
        break;
      }
      case 'complete':
        moveStatus({ id: pending.id, status: 'done' });
        break;
      case 'complete-edit': {
        const { id, values } = pending;
        update.mutate({ id, changes: values }, { onSuccess: () => setEditingId(null) });
        break;
      }
      default:
        throw new Error(`Unhandled case: ${JSON.stringify(pending)}`);
  
    }
    setPending(null);
  }

  const pendingName = all.data?.find((t) => t.id === pending?.id)?.name ?? 'this task';
  const dialog =
    pending?.kind === 'delete'
      ? { title: 'Delete task?', message: `"${pendingName}" will be deleted. This cannot be undone.`, confirmLabel: 'Delete' }
      : { title: 'Mark task as done?', message: `"${pendingName}" has not been started. Mark it as done anyway?`, confirmLabel: 'Mark as done' };

  return (
    <>
    <ConfirmDialog 
      open={pending !== null} 
      title={dialog.title} 
      message={dialog.message} 
      confirmLabel={dialog.confirmLabel}
      onConfirm={confirmPending} 
      onCancel={() => setPending(null)}
    />
    <main>
      {editing ? (
        <TaskForm
          key={editing.id}
          task={editing}
          isSubmitting={update.isPending}
          error={updateFieldErrors ? null : update.error?.message}
          onSubmit={(values) => handleUpdate(editing.id, values)}
          onCancel={() => setEditingId(null)}
          serverErrors={updateFieldErrors}
        />
      ) : (
        <TaskForm
          key={createFormKey}
          isSubmitting={create.isPending}
          error={createFieldErrors ? null : create.error?.message}
          onSubmit={handleCreate}
          serverErrors={createFieldErrors}
        />
      )}

      <h2>Tasks</h2>
      <StatusCounts tasks={all.data ?? []} />

      <div>
        <input
          aria-label="Search tasks"
          placeholder="Search tasks"
          value={filters.q}
          onChange={(e) => setFilters({ q: e.target.value })}
        />
        <select
          aria-label="Filter by status"
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters({ status: (e.target.value || undefined) as TaskStatus | undefined })
          }
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          aria-label="Filter by priority"
          value={filters.priority ?? ''}
          onChange={(e) =>
            setFilters({ priority: (e.target.value || undefined) as Priority | undefined })
          }
        >
          <option value="">All</option>
          {PRIORITIES.map((s) => (
            <option key={s} value={s}>{PRIORITY_LABELS[s]}</option>
          ))}
        </select>
        <select
          aria-label="Sort by"
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value as SortKey })}
        >
          <option value="priority">Priority (high first)</option>
          <option value="date">Newest first</option>
        </select>
      </div>

      {move.isError && <p role="alert">Could not change status: {move.error.message}</p>}
      {remove.isError && <p role="alert">Could not delete: {remove.error.message}</p>}
      {list.isFetching && !list.isPending && <p>Updating...</p>}

      {list.isPending ? (
        <p>Loading...</p>
      ) : all.data?.length === 0 ? (
        <p>No tasks yet. Add your first task above.</p>
      ) : tasks.length === 0 ? (
        <div>
          <p>No tasks match your filters</p>
          <button type='button' aria-label='Clear filter' onClick={() => {setFilters({
            status: undefined, 
            priority: undefined, 
            sort: 'date',
            q: undefined
            })}}>Clear Filters</button>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
    </main>
    </>
  );
}