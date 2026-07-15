import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createRef, type KeyboardEvent } from 'react';
import { useSlashMenu } from './useSlashMenu';

const keyEvent = (key: string) => ({ key, preventDefault: vi.fn() }) as unknown as KeyboardEvent;

type SlashApi = ReturnType<typeof useSlashMenu>;

// The hook tracks the caret via onSelect (starts at 0), so place it at the end
// of the value — mirroring a user who just typed the /query.
const caretTo = (result: { current: SlashApi }, pos: number) =>
  act(() =>
    result.current.onSelect({
      currentTarget: { selectionStart: pos },
    } as unknown as React.SyntheticEvent<HTMLTextAreaElement>),
  );

describe('useSlashMenu', () => {
  it('is closed when disabled (non-text block)', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(false, '/quo', ref, { convert: vi.fn() }));
    caretTo(result, 4);
    expect(result.current.open).toBe(false);
  });

  it('opens on a mid-line /query and filters commands', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(true, 'hi /quote', ref, { convert: vi.fn() }));
    caretTo(result, 9);
    expect(result.current.open).toBe(true);
    expect(result.current.matches.map((c) => c.type)).toEqual(['quote']);
  });

  it('does not open inside a URL', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(true, 'http://x', ref, { convert: vi.fn() }));
    caretTo(result, 7);
    expect(result.current.open).toBe(false);
  });

  it('picking converts the block and strips the /query, keeping surrounding text', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const convert = vi.fn();
    const { result } = renderHook(() => useSlashMenu(true, 'note /quote', ref, { convert }));
    caretTo(result, 11);
    act(() => result.current.pick('quote'));
    // "/quote" (index 5..11) is removed, leaving "note ".
    expect(convert).toHaveBeenCalledWith('quote', 'note ');
  });

  it('stays open with zero matches (No results), but does not consume ↑/↓/Enter', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(true, '/zzz', ref, { convert: vi.fn() }));
    caretTo(result, 4);
    expect(result.current.open).toBe(true);
    expect(result.current.matches).toHaveLength(0);
    // With no matches, movement/pick keys fall through to the textarea…
    expect(result.current.onKeyDown(keyEvent('ArrowDown'))).toBe(false);
    expect(result.current.onKeyDown(keyEvent('Enter'))).toBe(false);
    // …but Escape still dismisses the (empty) menu.
    let consumed = false;
    act(() => {
      consumed = result.current.onKeyDown(keyEvent('Escape'));
    });
    expect(consumed).toBe(true);
    expect(result.current.open).toBe(false);
  });

  it('Arrow keys move the active index and are consumed', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(true, '/', ref, { convert: vi.fn() }));
    caretTo(result, 1);
    expect(result.current.active).toBe(0);
    act(() => {
      expect(result.current.onKeyDown(keyEvent('ArrowDown'))).toBe(true);
    });
    expect(result.current.active).toBe(1);
  });

  it('Escape closes the menu but keeps the typed /query', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(true, '/quo', ref, { convert: vi.fn() }));
    caretTo(result, 4);
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.onKeyDown(keyEvent('Escape'));
    });
    // Menu is dismissed for this slash (the text is untouched — the caller never
    // clears value), and Escape was consumed.
    expect(result.current.open).toBe(false);
  });

  it('does not consume keys when closed', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { result } = renderHook(() => useSlashMenu(true, 'plain', ref, { convert: vi.fn() }));
    caretTo(result, 5);
    expect(result.current.onKeyDown(keyEvent('Enter'))).toBe(false);
  });
});
