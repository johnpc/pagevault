// jest-dom adds custom matchers for asserting on DOM nodes.
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';
import { beforeEach } from 'vitest';

// Raise the default async timeout so waitFor assertions don't flake under the
// CPU contention of the pre-commit hook / CI (build + tests running together).
configure({ asyncUtilTimeout: 5000 });

// Isolate localStorage between tests (theme choice, auth store) so state from
// one test never leaks into the next.
beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom without storage — nothing to clear */
  }
});

// Mock matchMedia (Ionic + theme code + useIsMobile query it).
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
    };
  };
