import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { WysiwygInput } from './WysiwygInput';

const props = (over = {}) => ({
  value: '',
  placeholder: 'Type…',
  onChange: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  onKeyDown: vi.fn(),
  ...over,
});

const editable = (c: HTMLElement) => c.querySelector('.pv-wysiwyg') as HTMLDivElement;

describe('WysiwygInput', () => {
  it('seeds the editable DOM from content as styled inline HTML', () => {
    const { container } = render(<WysiwygInput {...props({ value: 'a **b**' })} />);
    expect(editable(container).innerHTML).toBe('<span>a </span><strong>b</strong>');
  });

  it('reads the edited DOM back to a content string on input', () => {
    const onChange = vi.fn();
    const { container } = render(<WysiwygInput {...props({ onChange })} />);
    const el = editable(container);
    el.innerHTML = 'hello <em>world</em>';
    fireEvent.input(el);
    expect(onChange).toHaveBeenCalledWith('hello *world*');
  });

  it('does NOT reseed the DOM from a value change while focused (caret safety)', () => {
    const { container, rerender } = render(<WysiwygInput {...props({ value: 'x' })} />);
    const el = editable(container);
    fireEvent.focus(el);
    // Simulate the user having typed something, then an external value arriving.
    el.innerHTML = 'typed by user';
    rerender(<WysiwygInput {...props({ value: 'external update' })} />);
    // Still shows the user's in-progress edit — not clobbered.
    expect(el.innerHTML).toBe('typed by user');
  });

  it('adopts an external value change once unfocused', () => {
    const { container, rerender } = render(<WysiwygInput {...props({ value: 'x' })} />);
    const el = editable(container);
    fireEvent.focus(el);
    fireEvent.blur(el);
    rerender(<WysiwygInput {...props({ value: 'now **bold**' })} />);
    expect(el.innerHTML).toBe('<span>now </span><strong>bold</strong>');
  });

  it('fires onBlur with the read-back content', () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const { container } = render(<WysiwygInput {...props({ onChange, onBlur })} />);
    const el = editable(container);
    el.innerHTML = '<code>x</code>';
    fireEvent.blur(el);
    expect(onChange).toHaveBeenCalledWith('`x`');
    expect(onBlur).toHaveBeenCalled();
  });
});
