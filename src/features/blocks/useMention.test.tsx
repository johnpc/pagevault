import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createRef, type KeyboardEvent } from 'react';
import type { PageRecord } from '../../lib/pbClient';

const pages: PageRecord[] = [
  { id: '1', title: 'Trip plan', archived: false } as PageRecord,
  { id: '2', title: 'Travel', archived: false } as PageRecord,
];
vi.mock('../pages/pagesApi', () => ({ usePages: () => ({ data: pages }) }));

import { useMention } from './useMention';

const keyEvent = (key: string) => ({ key, preventDefault: vi.fn() }) as unknown as KeyboardEvent;

type MentionApi = ReturnType<typeof useMention>;

// The hook tracks the caret via onSelect (starts at 0), so place it at the end
// of the value — mirroring a user who just typed the @-query.
const caretTo = (result: { current: MentionApi }, pos: number) =>
  act(() =>
    result.current.onSelect({
      currentTarget: { selectionStart: pos },
    } as unknown as React.SyntheticEvent<HTMLTextAreaElement>),
  );

describe('useMention', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('is closed when there is no @-query', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useMention('cur', 'plain', vi.fn(), ref));
    caretTo(result, 5);
    expect(result.current.open).toBe(false);
    expect(result.current.onKeyDown(keyEvent('Enter'))).toBe(false);
  });

  it('opens with matches for an @-query and excludes the current page', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useMention('1', '@tr', vi.fn(), ref));
    caretTo(result, 3);
    expect(result.current.open).toBe(true);
    expect(result.current.matches.map((p) => p.id)).toEqual(['2']);
  });

  it('navigates the active index with arrows and consumes the key', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useMention('cur', '@t', vi.fn(), ref));
    caretTo(result, 2);
    expect(result.current.matches).toHaveLength(2);
    act(() => {
      expect(result.current.onKeyDown(keyEvent('ArrowDown'))).toBe(true);
    });
    expect(result.current.active).toBe(1);
  });

  it('Enter picks the active page and writes the mention token', () => {
    const setValue = vi.fn();
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useMention('1', 'see @tr', setValue, ref));
    caretTo(result, 7);
    act(() => {
      result.current.onKeyDown(keyEvent('Enter'));
    });
    expect(setValue).toHaveBeenCalledWith('see @[Travel](2)');
  });

  it('Escape consumes the key and resets the active index', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useMention('cur', '@t', vi.fn(), ref));
    caretTo(result, 2);
    act(() => {
      result.current.onKeyDown(keyEvent('ArrowDown'));
    });
    expect(result.current.active).toBe(1);
    let consumed = false;
    act(() => {
      consumed = result.current.onKeyDown(keyEvent('Escape')) === true;
    });
    expect(consumed).toBe(true);
    expect(result.current.active).toBe(0);
  });

  it('focuses the textarea and restores the caret after a pick (rAF)', async () => {
    // A real textarea in the ref exercises the requestAnimationFrame focus path.
    const el = document.createElement('textarea');
    el.value = 'see @tr';
    document.body.appendChild(el);
    const ref = { current: el };
    const { result } = renderHook(() => useMention('1', 'see @tr', vi.fn(), ref));
    caretTo(result, 7);
    act(() => {
      result.current.pick(result.current.matches[0]);
    });
    await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
    expect(document.activeElement).toBe(el);
    el.remove();
  });
});
