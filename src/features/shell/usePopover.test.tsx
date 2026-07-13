import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { usePopover } from './usePopover';

/** A minimal popover using the hook: a trigger + a two-item menu. */
function Harness() {
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  return (
    <div onKeyDown={onKeyDown}>
      <button ref={triggerRef} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Open
      </button>
      {open && (
        <ul ref={menuRef} aria-label="menu">
          <li>
            <button>First</button>
          </li>
          <li>
            <button>Second</button>
          </li>
        </ul>
      )}
      <button>Outside</button>
    </div>
  );
}

const openMenu = () => fireEvent.click(screen.getByRole('button', { name: 'Open' }));

describe('usePopover', () => {
  it('focuses the first menu item when opened', () => {
    render(<Harness />);
    act(openMenu);
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('Escape closes the menu and returns focus to the trigger', () => {
    render(<Harness />);
    act(openMenu);
    fireEvent.keyDown(screen.getByLabelText('menu'), { key: 'Escape' });
    expect(screen.queryByLabelText('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus();
  });

  it('an outside pointerdown closes the menu', () => {
    render(<Harness />);
    act(openMenu);
    act(() => {
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    });
    expect(screen.queryByLabelText('menu')).not.toBeInTheDocument();
  });

  it('a pointerdown inside the menu keeps it open', () => {
    render(<Harness />);
    act(openMenu);
    act(() => {
      fireEvent.pointerDown(screen.getByRole('button', { name: 'First' }));
    });
    expect(screen.getByLabelText('menu')).toBeInTheDocument();
  });

  it('Tab from the last item wraps to the first (focus trapped)', () => {
    render(<Harness />);
    act(openMenu);
    const second = screen.getByRole('button', { name: 'Second' });
    act(() => second.focus());
    fireEvent.keyDown(screen.getByLabelText('menu'), { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('Shift+Tab from the first item wraps to the last', () => {
    render(<Harness />);
    act(openMenu);
    fireEvent.keyDown(screen.getByLabelText('menu'), { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
  });
});
