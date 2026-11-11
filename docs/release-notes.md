# SprintDesk Lite: Release Notes

Release date: 2026-11-11

## Summary

SprintDesk Lite is a single-team task board built with React 19, TypeScript and Vite.
Tasks are server state (TanStack Query) served by a mock API (MSW). It replaces the
spreadsheet workflow described in `sprintdesk-brief.md`.

## Features

- **Create, edit, delete, complete tasks** through the API layer, validated with Zod
and React Hook Form (title 3-100 characters, description up to 1000).
- **Status flow** todo, in progress, done. Moving `todo` straight to `done` asks for
confirmation. Status changes are optimistic and roll back with a message on failure.
- **Delete confirmation** with an accessible dialog (focus moves in, Escape cancels,
focus returns to the opener).
- **Search** over title and description, case-insensitive, debounced (300 ms).
- **Filters** by status and priority, combined with search, stored in the URL.
"Clear filters" resets search, status and priority.
- **Sort** by created date (default, newest first) or by priority.
- **Dashboard counts** per status, plus high-priority tasks not done. Counts always
cover all tasks.
- **Empty states** for "no tasks yet" and "no tasks match your filters".
- **Persistence:** the mock backend saves its data in `localStorage`, so data survives
a refresh. Components never touch storage.
- **Resilience:** error boundary with Retry, input kept when a save fails, duplicate
submit prevented, malformed or duplicate-id tasks from the server are skipped.
- **Accessibility:** labelled controls, errors linked with `aria-describedby`,
keyboard operable, axe checks in tests.
- **Performance:** stays responsive with 500 tasks (see `docs/performance.md`).

## Architecture

- `src/app`, `src/features/tasks/{api,model,components,hooks}`, `src/shared/{ui,lib}`,
`src/mocks`. Features do not import another feature's internals.

## Quality

- Tests:  passing (run `npm run test`).
- Statement coverage of `src/features`: % (`npm run test:coverage`, threshold 80%).
- `npm run lint`, `npm run typecheck` and `npm run build` pass from a fresh clone.

## Known limitations

- The backend is a mock. Data lives in the browser's `localStorage` (key
`sprintdesk.mock-db`) and is not shared between users or browsers.
- No users, assignees, comments, attachments or drag and drop (out of scope).
- A task deleted elsewhere closes its edit form silently (no message).
- Focus after a confirmed delete falls back to the page, because the opener is gone.
- First render of 500 tasks is not optimised (~300 ms in dev mode).

## Open questions

See `docs/acceptance-criteria.md`.