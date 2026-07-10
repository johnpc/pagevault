/* Test helpers: a fake PocketBase client + a render wrapper with QueryClient +
 * MemoryRouter, so components exercise their real hooks/API against in-memory
 * data. Not shipped logic — lives under src/test and is excluded from coverage
 * targets by being test-only. */
import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

export interface FakeRecord {
  id: string;
  [k: string]: unknown;
}

/** A single fake collection backed by an array, with the subset of the
 * PocketBase record API the app uses. */
export function fakeCollection(seed: FakeRecord[] = []) {
  let rows = [...seed];
  let n = seed.length;
  return {
    rows: () => rows,
    getFullList: vi.fn(async () => [...rows]),
    getOne: vi.fn(async (id: string) => rows.find((r) => r.id === id)),
    create: vi.fn(async (data: FakeRecord) => {
      const rec = { ...data, id: data.id ?? `id${++n}` };
      rows.push(rec);
      return rec;
    }),
    update: vi.fn(async (id: string, patch: FakeRecord) => {
      rows = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
      return rows.find((r) => r.id === id);
    }),
    delete: vi.fn(async (id: string) => {
      rows = rows.filter((r) => r.id !== id);
      return true;
    }),
    authWithPassword: vi.fn(async () => ({ record: { id: 'u1', email: 'x@y.z' } })),
  };
}

export function renderWithProviders(ui: ReactNode, initialEntries: string[] = ['/']) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
