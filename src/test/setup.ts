import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../mocks/server';
import { db } from "../mocks/db"
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
import "vitest-axe/extend-expect";
expect.extend(matchers);


beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers();
  db.reset();
  cleanup();
});
afterAll(() => server.close());