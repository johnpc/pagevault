/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Split the heavy vendors into their own chunks. They change far less
        // often than app code, so they stay cached across deploys and parse in
        // parallel.
        manualChunks: {
          pocketbase: ['pocketbase'],
          ionic: ['@ionic/react', '@ionic/react-router', 'ionicons'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  plugins: [react(), legacy()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Generous timeout so async hook/waitFor tests don't flake under the CPU
    // contention of the pre-commit hook (build + tests running together).
    testTimeout: 15000,
    // Acceptance tests live in e2e/ and run under Playwright, not Vitest.
    // .features-gen/ holds Playwright-BDD's generated specs — never Vitest's.
    exclude: ['node_modules', 'dist', 'e2e', '.features-gen', '.idea', '.git', '.cache', '.claude'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      // Measure EVERY source + seed LOGIC file, even untested ones.
      all: true,
      include: ['src/**/*.{ts,tsx}', 'seed/**/*.ts'],
      // Excluded: tests, type decls, setup — AND fixture DATA and the seed
      // runner entrypoint (side-effects on import; its logic lives in tested
      // helpers). Backend LOGIC (seed helpers) IS measured — fix low coverage
      // with tests, never an exclusion.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'src/setupTests.ts',
        // Test-only helpers (fake client + render wrapper) — not shipped logic.
        'src/test/**',
        // App entrypoints: pure wiring (provider tree, root render, service
        // worker registration) with no unit-testable branching — the analogue
        // of spork's excluded seed runner. Their children are all tested.
        'src/main.tsx',
        'src/App.tsx',
        'seed/fixtures/**',
        // Seed runner entrypoint: a side-effecting main() script (sign in,
        // mutate, exit) with no unit-testable surface — its logic lives in
        // tested helpers. Run manually.
        'seed/seed.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
