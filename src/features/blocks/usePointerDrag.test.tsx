import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { usePointerDrag } from './usePointerDrag';

const bag = () => ({
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDrop: vi.fn(),
  onDragEnd: vi.fn(),
});

// A tiny harness: two rows with data-drag-id and a handle wired to the hook.
function Harness({ dnd }: { dnd: ReturnType<typeof bag> }) {
  const pointer = usePointerDrag(dnd);
  return (
    <div>
      <div data-drag-id="a">
        <button data-testid="handle-a" onPointerDown={pointer.onPointerDown('a')}>
          ⋮⋮
        </button>
      </div>
      <div data-drag-id="b" data-testid="row-b" />
    </div>
  );
}

// jsdom has no PointerEvent — dispatch a plain Event with the fields the hook
// reads (clientX/Y). document.elementFromPoint is also unimplemented, so it's
// stubbed to resolve "over row B".
function dispatchDocPointer(type: string, x: number, y: number) {
  const e = new Event(type, { bubbles: true }) as Event & { clientX: number; clientY: number };
  e.clientX = x;
  e.clientY = y;
  act(() => {
    document.dispatchEvent(e);
  });
}

beforeEach(() => {
  const rowB = () => document.querySelector('[data-testid="row-b"]');
  document.elementFromPoint = (() => rowB()) as typeof document.elementFromPoint;
});

describe('usePointerDrag', () => {
  it('a touch pointerdown starts a drag; move+up over another row drops onto it', () => {
    const dnd = bag();
    const { getByTestId } = render(<Harness dnd={dnd} />);
    fireEvent.pointerDown(getByTestId('handle-a'), { pointerType: 'touch', pointerId: 1 });
    expect(dnd.onDragStart).toHaveBeenCalledWith('a');
    dispatchDocPointer('pointermove', 1, 50);
    expect(dnd.onDragOver).toHaveBeenCalledWith('b');
    dispatchDocPointer('pointerup', 1, 50);
    expect(dnd.onDrop).toHaveBeenCalledWith('b');
  });

  it('ignores a mouse pointerdown (native HTML5 drag handles the mouse)', () => {
    const dnd = bag();
    const { getByTestId } = render(<Harness dnd={dnd} />);
    // jsdom's fireEvent drops pointerType, so dispatch a native event with it set.
    const evt = new Event('pointerdown', { bubbles: true }) as Event & { pointerType: string };
    evt.pointerType = 'mouse';
    act(() => {
      getByTestId('handle-a').dispatchEvent(evt);
    });
    expect(dnd.onDragStart).not.toHaveBeenCalled();
  });

  it('pointerup over nothing ends the drag without a drop', () => {
    const dnd = bag();
    const { getByTestId } = render(<Harness dnd={dnd} />);
    fireEvent.pointerDown(getByTestId('handle-a'), { pointerType: 'touch', pointerId: 3 });
    document.elementFromPoint = (() => null) as typeof document.elementFromPoint;
    dispatchDocPointer('pointerup', 0, 0);
    expect(dnd.onDrop).not.toHaveBeenCalled();
    expect(dnd.onDragEnd).toHaveBeenCalled();
  });
});
