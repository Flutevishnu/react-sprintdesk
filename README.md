# react-sprintdesk

A small React + TypeScript project built for Day 1 of the bootcamp. It covers modern JavaScript utilities, a typed task model, a React rendering study, and the refactor of a deliberately broken task list.

## Tech stack

- React + TypeScript (Vite 8, `react-ts` template)
- Vitest + jsdom + Testing Library (`@testing-library/react`, `user-event`, `jest-dom`)
- ESLint

## Requirements

- Node.js 22.12 or lastest version
- npm

## Setup

```cmd
git clone https://github.com/Flutevishnu/react-sprintdesk.git
cd react-sprintdesk
npm ci
npm run dev
```

## Scripts


| Command                 | What it does                          |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start the Vite dev server             |
| `npm run lint`          | Run ESLint on the whole project       |
| `npm run typecheck`     | Type check with `tsc -b`              |
| `npm run test`          | Run all tests once                    |
| `npm run test:coverage` | Run the tests with a coverage report  |
| `npm run build`         | Type check, then build for production |


