# Performance

## Setup

- 500 seeded tasks (mock API), React Profiler `onRender` logged to the console.
- Measured in dev mode (StrictMode inflates absolute times), so only before/after comparisons in the same mode are meaningful.
- Median of 3 runs, largest commit. .

## Baseline

`actual` was almost equal to `base` in every update, so nothing was skipped. Any change re rendered all 500 rows.

## Results

| Scenario | Before | After | Change applied |
|---|---|---|---|
| A: type one letter | ~315 ms | ~222 ms | `useMemo` for the visible list |
| B: change one status | ~190 ms | ~20-28 ms in all commits | `memo(TaskRow)`, `memo(TaskList)`, `useCallback` handlers, custom `structuralSharing` |
| C: filter to "Done" | ~260 ms | ~28 ms + ~80 ms | same as B |
| 0: first load | ~308 ms | ~295 ms | none |
| D: filter back to "All" | ~270 ms | ~270 ms | none |

In B, `actual` stayed around 20-30 ms against `base` of ~370-390 ms, so `memo` skips about 93% of the work.

## Applied optimisations

- `useMemo` on `viewTasks(...)`, so typing does not rebuild the list.
- `TaskRow` wrapped in `memo`, with stable `useCallback` handlers in `TasksPage`. Without stable handlers, `memo` does nothing.
- Custom `structuralSharing` in `useTasksQuery` (see Finding).

## Finding

After the server answered, the refetch ran `toTask` again, which creates new task objects and new `Date`s. All 500 rows then re-rendered (500 `[row]` logs after one status change). TanStack Query's structural sharing does not treat equal `Date`s as the same.

Fix: a custom `structuralSharing` that returns the old task object when its fields are unchanged.

Result: scenario B's third commit (the refetch) dropped from ~177-207 ms to ~22-29 ms. `actual` stays ~20-30 ms against `base` ~370-390 ms in all three commits.

## Not improved

- First load and mounting rows (scenarios 0 and D): every row must be created once, and `memo` cannot skip new rows.
- Typing (A) still has a ~220 ms commit, because the debounced search changes the query and the list is refetched and re-rendered.