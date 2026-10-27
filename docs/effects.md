# Effect notes (Day 2, Hour 6)

## Bug 1: ConnectionStatus (missing cleanup)

**Symptom:** The status text worked, but every time the component was mounted it added two more `online` and `offline` listeners to `window`, and they were never removed. After many mounts, many dead listeners were still running.

**Root cause:** The Effect subscribes to an outside system (`window` events) but does not return a cleanup function. React rule broken: an Effect that sets something up must undo it in its cleanup, so it can be stopped and started again safely (this is what Strict Mode's extra mount, cleanup, mount checks).

**Fix:** The Effect now returns a function that calls `removeEventListener` for both events with the same `update` handler.

**Tests:** In `src/exercises/effect-exercises.test.tsx`: `removes its listeners when it unmounts` and `does not leave listeners behind after many mounts`. The test `shows Online or Offline as the browser changes` protects the normal behaviour.

## Bug 2: FocusTimer (stale closure)

**Symptom:** The counter went 0, 1 and then stayed at 1. It never reached 2.

**Root cause:** The interval callback used `setSeconds(seconds + 1)`. The Effect ran once per value of `running`, so the callback only saw the `seconds` of that render, which was `0`. Every tick computed `0 + 1`. This is a stale closure. React rule broken: an Effect must list every reactive value it reads, and the missing `seconds` was hidden because the dependency array was `[running]`.

**Fix:** I used the updater form, `setSeconds((s) => s + 1)`. It always receives the latest value, so the Effect no longer reads `seconds` at all, and `[running]` is correct. I did not add `seconds` to the dependency array, because that would restart the interval on every tick.

**Tests:** `increases by one every second` (fake timers, 3000 ms, expects "3s focused") and `pauses on Stop and resumes from the current value on Start`. The test `clears its interval when it unmounts` checks that the cleanup still works.

## Bug 3: TaskQuickFind (unnecessary Effect and a new object in the dependencies)

**Symptom:** The component re-rendered in a loop, and React stopped it with a "Maximum update depth exceeded" error.

**Root cause:** Two problems.

1. `matches` was stored in state and copied from `tasks` by an Effect. It can be calculated from `tasks` and `query`, so it should not be state. React rule broken: do not use an Effect to transform data for rendering.
2. `options` was a new object on every render, and it was in the dependency array. The Effect therefore ran after every render, called `setMatches` with a new array, and caused another render, forever.

**Fix:** I deleted the `matches` state, the `options` object and the Effect. Now `matches` is calculated during render: `tasks.filter((t) => t.title.toLowerCase().includes(normalizedQuery))`. Because it is always calculated from the current `tasks`, it also stays correct when the `tasks` prop changes. Moving `setMatches` into the change handler would not have done that.

**Tests:** `lists every task and the count at the start`, `filters by the typed text, ignoring upper and lower case`, `shows 0 matching when nothing matches` and `updates the list when the tasks prop changes`.