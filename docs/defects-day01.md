# Defects found in BrokenTaskList (Day 1, Hour 6)

## Defect 1: Duplicated derived state (completed count)

**Symptom:** The "X of Y completed" text went up every time I clicked a checkbox, even when I unticked a task. With 1 of 3 done, unticking that task showed "2 of 3 completed" instead of "0 of 3 completed".

**Root cause:** `completedCount` was stored in its own state, but it can be worked out from `tasks`. The React rule: don't store a value in state if it can be calculated from other state or props, because the two copies drift apart. `toggleTask` also always did `completedCount + 1`, whatever the task's new value was.

**Fix:** I removed the `completedCount` state and the `setCompletedCount` call. The count is now calculated while rendering: `const completedCount = tasks.filter((t) => t.done).length;`

**Test:** `decreases the completed count when a done task is unticked`. Before the fix the page said "2 of 3 completed".

## Defect 2: Unnecessary Effect (stale list)

**Symptom:** When I ticked a task, the tick did not show. When I deleted a task, it stayed on the screen even though the count changed. The list only became correct after I unticked and re ticked "Show completed".

**Root cause:** `visibleTasks` was stored in state and copied from `tasks` by a `useEffect` with the dependency array `[showCompleted]`. The Effect only ran when that checkbox changed, so the list kept showing old data. Two React rules are broken: don't use an Effect to calculate a value you can get during render, and an Effect must list everything it reads (here `tasks` was missing).

**Fix:** I deleted the `visibleTasks` state and the Effect, and calculate it during render: `const visibleTasks = showCompleted ? tasks : tasks.filter((t) => !t.done);`

**Tests:** `shows a task as ticked after it is toggled` and `removes a task from the list when it is deleted`. Before the fix both failed.

## Defect 3: Index used as key

**Symptom:** I typed a note in the Notes box of the second task and then deleted the first task. The note stayed in the same place on screen, so it ended up under a different task.

**Root cause:** `key={index}` ties a row to its position, not to the task. The React rule: keys must be stable and unique for each item. After a delete, React reused the row at each position, including the Notes input (which React doesn't control), so the typed text stayed while the task changed.

**Fix:** I changed the key to `key={task.id}`, so the row follows the task.

**Test:** `keeps typed notes with the right task after another task is deleted`. With `key={index}` put back, it failed because the note on  another task was empty.

## Defect 4: State mutation (adding a task)

**Symptom:** Adding a task seemed to work, because it appeared in the list. 

**Problem:** But `addTask` was changing the array that the parent passed in. In a test, that array grew from 3 to 4 items after one Add, and with a frozen array the click threw an error. The task only appeared because `setTitle('')` on the next line forced a rerender.

**Root cause:** `addTask` called `tasks.push(...)` and then `setTasks(tasks)`. The React rule: never change state directly, always make a new array. `push` changes the existing array, and giving React the same array back means it sees no new state. Since `tasks` starts as the `initialTasks` prop, this also changed the parent's data.

**Fix:** I build a new array instead: `setTasks([...tasks, newTask])`.

**Tests:** `does not change the parent array when a task is added` (before it said length 4 instead of 3) and `adds a task to a frozen array without throwing` (it threw `TypeError: Cannot add property 3, object is not extensible`).

## Defect 5: Prop mutation (sorting)

**Symptom:** "Sort by priority" looked fine. But if I ticked a task and then clicked Sort, the tick disappeared. If I deleted a task and then clicked Sort, the deleted task came back. The sort also reordered the parent's array.

**Root cause:** `sortByPriority` called `initialTasks.sort(...)`. `sort` changes an array in place, and `initialTasks` is a prop. The React rule: props are read only, never change them. It then did `setTasks([...initialTasks])`, which replaced the current `tasks` with the original data, so every change I made since loading was lost.

**Fix:** I sort a copy of the current state and leave the prop alone: `setTasks([...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]))`.

**Tests:** `keeps a ticked task after sorting`, `keeps a deleted task deleted after sorting`, `does not change the parent array when sorting` (the array was reordered) and `sorts a frozen array without throwing` (the click crashed with a `TypeError`). All four failed before the fix.