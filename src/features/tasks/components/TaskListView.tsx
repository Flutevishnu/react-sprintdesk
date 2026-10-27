import { useState, type ComponentProps } from 'react';
import {
  useTaskFilters,
  type PriorityFilter,
  type SortBy,
  type StatusFilter,
} from '../../hooks/usetaskfilters';
import type { TaskStatus } from '../model';
import { PRIORITIES, PRIORITY_LABELS, STATUSES, STATUS_LABELS } from '../../../lib/utils';
import { useTasks, useTasksDispatch } from '../useTasks';
import { StatusCounts } from './StatusCounts';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';


type FormValues = Parameters<ComponentProps<typeof TaskForm>['onSubmit']>[0];

export function TaskListView() {
  const tasks = useTasks();
  const dispatch = useTasksDispatch();
  const filters = useTaskFilters(tasks);

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const editingTask = tasks.find((task) => task.id === editingTaskId);

  function handleCreate(values: FormValues) {
    const id = Math.max(0, ...tasks.map((task) => task.id)) + 1;
    dispatch({ type: 'added', task: { ...values, id, createdAt: new Date() } });
  }

  function handleUpdate(values: FormValues) {
    if (editingTask === undefined) return;
    dispatch({ type: 'updated', id: editingTask.id, changes: values });
    setEditingTaskId(null);
  }

  function handleDelete(id: number) {
    dispatch({ type: 'deleted', id });
    if (id === editingTaskId) setEditingTaskId(null);
  }

  function handleStatusChange(id: number, status: TaskStatus) {
    dispatch({ type: 'status_moved', id, status });
  }

  return (
    <div>
      <section aria-labelledby="form-heading">
        <h2 id="form-heading">{editingTask ? 'Edit task' : 'Add a task'}</h2>
        {editingTask ? (
          <TaskForm
            key={editingTask.id}
            task={editingTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTaskId(null)}
          />
        ) : (
          <TaskForm key="create" onSubmit={handleCreate} />
        )}
      </section>

      <section aria-labelledby="tasks-heading">
        <h2 id="tasks-heading">Tasks</h2>

        <StatusCounts tasks={tasks} />

        <section aria-label="Filters">
          <label htmlFor="task-search">Search tasks</label>
          <input
            id="task-search"
            type="search"
            value={filters.searchText}
            onChange={(e) => filters.setSearchText(e.target.value)}
          />

          <label htmlFor="task-status-filter">Filter by status</label>
          <select
            id="task-status-filter"
            value={filters.statusFilter}
            onChange={(e) => filters.setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <label htmlFor="task-priority-filter">Filter by priority</label>
          <select
            id="task-priority-filter"
            value={filters.priorityFilter}
            onChange={(e) => filters.setPriorityFilter(e.target.value as PriorityFilter)}
          >
            <option value="all">All</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>

          <label htmlFor="task-sort">Sort by</label>
          <select
            id="task-sort"
            value={filters.sortBy}
            onChange={(e) => filters.setSortBy(e.target.value as SortBy)}
          >
            <option value="priority">Priority (high first)</option>
            <option value="date">Date (newest first)</option>
          </select>
        </section>

        {tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : filters.visibleTasks.length === 0 ? (
          <p>No tasks match your filters</p>
        ) : (
          <TaskList
            tasks={filters.visibleTasks}
            onEdit={setEditingTaskId}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </section>
    </div>
  );
}