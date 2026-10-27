# SprintDesk state map

## Stored state


| State                                 | Owner                                             | What it is                                                |
| ------------------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| `tasks`                               | `TasksProvider` (`useReducer` with `TaskReducer`) | The list of all tasks. Loaded from localStorage at start. |
| `searchText`                          | `TaskListView` (through `useTaskFilters`)         | The text typed in the search box.                         |
| `debounced` (the delayed search text) | `useDebouncedValue`, used by `useTaskFilters`     | `searchText` after the user stops typing for 300 ms.      |
| `statusFilter`                        | `TaskListView` (through `useTaskFilters`)         | `'all'` or one status.                                    |
| `priorityFilter`                      | `TaskListView` (through `useTaskFilters`)         | `'all'` or one priority.                                  |
| `sortBy`                              | `TaskListView` (through `useTaskFilters`)         | `'priority'` or `'date'`.                                 |
| `editingTaskId`                       | `TaskListView`                                    | The id of the task being edited, or `null` when creating. |
| `values`                              | `TaskForm`                                        | The form fields: name, description, priority, status.     |
| `nameTouched`                         | `TaskForm`                                        | `true` after the user leaves the title field.             |
| `submitAttempted`                     | `TaskForm`                                        | `true` after the user presses submit.                     |




## Derived values (calculated during render, not stored)


| Value               | Where            | Calculated from                                                       |
| ------------------- | ---------------- | --------------------------------------------------------------------- |
| `visibleTasks`      | `useTaskFilters` | `tasks`, debounced search, `statusFilter`, `priorityFilter`, `sortBy` |
| Count per status    | `StatusCounts`   | `tasks`                                                               |
| `editingTask`       | `TaskListView`   | `tasks` and `editingTaskId`                                           |
| Empty state message | `TaskListView`   | `tasks` and `visibleTasks`                                            |
| New task `id`       | `TaskListView`   | The largest id in `tasks`, plus 1                                     |
| `isEditmode`        | `TaskForm`       | Whether a `task` prop was passed                                      |
| `nameError`         | `TaskForm`       | `values.name` (must be 3 to 100 characters)                           |
| `showNameError`     | `TaskForm`       | `nameError`, `nameTouched` and `submitAttempted`                      |


