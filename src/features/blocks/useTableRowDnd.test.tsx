import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useTableRowDnd } from './useTableRowDnd';

// Harness: two rows with data-drag-id + a handle wired to the hook's pointer path.
function Harness({ moveTo }: { moveTo: (from: number, to: number) => void }) {
  const dnd = useTableRowDnd(moveTo);
  return (
    <table>
      <tbody>
        <tr data-drag-id="0" className={dnd.dragRow === 0 ? 'dragging' : ''}>
          <td>
            <button
              data-testid="handle-0"
              draggable
              onDragStart={() => dnd.onDragStart(0)}
              onPointerDown={dnd.onPointerDown('0')}
            >
              ⋮⋮
            </button>
          </td>
        </tr>
        <tr data-drag-id="1" data-testid="row-1">
          <td
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              dnd.onDrop(1);
            }}
          />
        </tr>
      </tbody>
    </table>
  );
}

function docPointer(type: string, x: number, y: number) {
  const e = new Event(type, { bubbles: true }) as Event & { clientX: number; clientY: number };
  e.clientX = x;
  e.clientY = y;
  act(() => {
    document.dispatchEvent(e);
  });
}

describe('useTableRowDnd', () => {
  beforeEach(() => {
    document.elementFromPoint = (() =>
      document.querySelector('[data-testid="row-1"]')) as typeof document.elementFromPoint;
  });

  it('touch-dragging row 0 onto row 1 calls moveTo(0, 1)', () => {
    const moveTo = vi.fn();
    const { getByTestId } = render(<Harness moveTo={moveTo} />);
    fireEvent.pointerDown(getByTestId('handle-0'), { pointerType: 'touch', pointerId: 1 });
    docPointer('pointermove', 1, 40);
    docPointer('pointerup', 1, 40);
    expect(moveTo).toHaveBeenCalledWith(0, 1);
  });

  it('native (mouse) drag path still calls moveTo via onDragStart + onDrop', () => {
    const moveTo = vi.fn();
    const { getByTestId } = render(<Harness moveTo={moveTo} />);
    fireEvent.dragStart(getByTestId('handle-0'));
    fireEvent.drop(getByTestId('row-1').querySelector('td')!);
    expect(moveTo).toHaveBeenCalledWith(0, 1);
  });
});
