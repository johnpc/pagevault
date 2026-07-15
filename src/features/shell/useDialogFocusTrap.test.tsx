import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useDialogFocusTrap } from './useDialogFocusTrap';

function Dialog({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(ref, active);
  return (
    <div>
      <button data-testid="outside">outside</button>
      <div ref={ref}>
        <button data-testid="a">a</button>
        <button data-testid="b">b</button>
      </div>
    </div>
  );
}

describe('useDialogFocusTrap', () => {
  it('Tab from the last focusable cycles to the first (inside the dialog)', () => {
    const { getByTestId } = render(<Dialog active />);
    getByTestId('b').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(getByTestId('a'));
  });

  it('Shift+Tab from the first cycles to the last', () => {
    const { getByTestId } = render(<Dialog active />);
    getByTestId('a').focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(getByTestId('b'));
  });

  it('does nothing when inactive', () => {
    const { getByTestId } = render(<Dialog active={false} />);
    getByTestId('outside').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    // No trap → focus stays where the browser put it (unchanged by our handler).
    expect(document.activeElement).toBe(getByTestId('outside'));
  });

  it('ignores non-Tab keys', () => {
    const { getByTestId } = render(<Dialog active />);
    getByTestId('a').focus();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByTestId('a'));
  });
});
