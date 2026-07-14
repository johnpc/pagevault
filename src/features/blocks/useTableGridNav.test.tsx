import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useTableGridNav } from './useTableGridNav';

// A minimal 2×2 grid of text inputs wired to the hook, matching the real
// data-cell layout so the DOM navigation can be exercised end to end.
function Grid() {
  const onKeyDown = useTableGridNav({ rows: 2, cols: 2 });
  return (
    <table>
      <tbody onKeyDown={onKeyDown}>
        {[0, 1].map((r) => (
          <tr key={r}>
            {[0, 1].map((c) => (
              <td key={c} data-cell={`${r}-${c}`}>
                <input type="text" aria-label={`Cell ${r + 1},${c + 1}`} defaultValue="ab" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const cellOf = (container: HTMLElement, r: number, c: number) =>
  container.querySelector(`td[data-cell="${r}-${c}"] input`) as HTMLInputElement;

describe('useTableGridNav', () => {
  it('Enter moves focus down a row (same column)', () => {
    const { container } = render(<Grid />);
    const from = cellOf(container, 0, 1);
    from.focus();
    fireEvent.keyDown(from, { key: 'Enter' });
    expect(document.activeElement).toBe(cellOf(container, 1, 1));
  });

  it('does not move past the last row', () => {
    const { container } = render(<Grid />);
    const from = cellOf(container, 1, 0);
    from.focus();
    fireEvent.keyDown(from, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(from);
  });

  it('ArrowRight at the text end moves to the next column', () => {
    const { container } = render(<Grid />);
    const from = cellOf(container, 0, 0);
    from.focus();
    from.setSelectionRange(from.value.length, from.value.length);
    fireEvent.keyDown(from, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cellOf(container, 0, 1));
  });

  it('ArrowRight mid-text stays in the cell (lets the caret move)', () => {
    const { container } = render(<Grid />);
    const from = cellOf(container, 0, 0);
    from.focus();
    from.setSelectionRange(1, 1);
    fireEvent.keyDown(from, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(from);
  });
});
