import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectionToolbar } from './SelectionToolbar';

describe('SelectionToolbar', () => {
  it('renders nothing when there is no anchor (no selection)', () => {
    const { container } = render(
      <SelectionToolbar anchor={null} apply={vi.fn()} applyLink={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the format buttons at the anchor and applies a marker on mousedown', () => {
    const onApply = vi.fn();
    render(
      <SelectionToolbar anchor={{ top: 50, left: 120 }} apply={onApply} applyLink={vi.fn()} />,
    );
    expect(screen.getByRole('toolbar', { name: 'Format selection' })).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Bold' }));
    expect(onApply).toHaveBeenCalledWith('**');
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Code' }));
    expect(onApply).toHaveBeenCalledWith('`');
  });

  it('prevents default on mousedown so the textarea keeps its selection', () => {
    render(<SelectionToolbar anchor={{ top: 0, left: 0 }} apply={vi.fn()} applyLink={vi.fn()} />);
    const evt = fireEvent.mouseDown(screen.getByRole('button', { name: 'Italic' }));
    // fireEvent returns false when a handler called preventDefault.
    expect(evt).toBe(false);
  });

  it('reveals a URL prompt on the link button and applies the entered link', async () => {
    const onLink = vi.fn();
    render(<SelectionToolbar anchor={{ top: 0, left: 0 }} apply={vi.fn()} applyLink={onLink} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Link' }));
    const input = screen.getByLabelText('Link URL');
    await userEvent.type(input, 'example.com{Enter}');
    expect(onLink).toHaveBeenCalledWith('example.com');
  });
});
