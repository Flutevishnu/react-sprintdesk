import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../mocks/server';
import { db } from "../mocks/db"

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers();
  db.reset();
  cleanup();
});
afterAll(() => server.close());