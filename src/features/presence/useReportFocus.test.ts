import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

const setFocused = vi.fn();
vi.mock('./usePresence', () => ({ useSetFocusedBlock: () => setFocused }));

import { useReportFocus } from './useReportFocus';

describe('useReportFocus', () => {
  it('reports the block id on focus', () => {
    const { result } = renderHook(() => useReportFocus('b7'));
    result.current.onFocus();
    expect(setFocused).toHaveBeenCalledWith('b7');
  });
});
