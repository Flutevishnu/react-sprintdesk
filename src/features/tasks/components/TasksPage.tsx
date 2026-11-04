import { useState } from 'react';
import {
  useCreateTask,
  useDeleteTask,
  useMoveTaskStatus,
  useUpdateTask,
} from '../../../shared/api/useTaskMutations';
import type { TaskFilters } from '../../../shared/api/tasksApi';
import { useTasksQuery } from '../../../shared/api/useTasksQuery';
import type { Priority, TaskStatus } from '../model';
import { useTaskUrlFilters, type SortKey } from '../useTaskUrlFilters';
import { viewTasks } from '../viewTasks';
import { TaskForm, type TaskFormValues } from './TaskForm';
import { useDebouncedValue } from '../../hooks/usedebouncedvalue';
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../../../lib/utils';
import { StatusCounts } from './StatusCounts';
import { TaskList } from './TaskList';


export function TasksPage() {
  const { filters, setFilters } = useTaskUrlFilters();
  const debouncedQ = useDebouncedValue(filters.q, 300);

  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createFormKey, setCreateFormKey] = useState(0);


  const serverFilters: TaskFilters = {};
  if (filters.status) serverFilters.status = filters.status;
  if (debouncedQ) serverFilters.q = debouncedQ;

  const list = useTasksQuery(serverFilters, { throwOnError: true });
  const all = useTasksQuery({}); 

  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const move = useMoveTaskStatus();

  const tasks = viewTasks(list.data ?? [], filters);
  const editing = all.data?.find((t) => t.id === editingId);

  function handleCreate(values: TaskFormValues) {
    create.mutate(values, { onSuccess: () => setCreateFormKey((k) => k + 1) });
  }

  function handleUpdate(id: number, values: TaskFormValues) {
    update.mutate({ id, changes: values }, { onSuccess: () => setEditingId(null) });
  }

  return (
    <main>
      {editing ? (
        <TaskForm
          key={editing.id}
          task={editing}
          isSubmitting={update.isPending}
          error={update.error?.message}
          onSubmit={(values) => handleUpdate(editing.id, values)}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <TaskForm
          key={createFormKey}
          isSubmitting={create.isPending}
          error={create.error?.message}
          onSubmit={handleCreate}
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
        <p>No tasks match your filters</p>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={setEditingId}
          onDelete={(id) => {
            remove.mutate(id);
            if (id === editingId) setEditingId(null);
          }}
          onStatusChange={(id, status) => move.mutate({ id, status })}
        />
      )}
    </main>
  );
}