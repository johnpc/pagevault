import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';
import { showToast } from './toastBus';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows nothing until a message arrives', () => {
    render(<Toast />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a pushed message, then auto-dismisses after 4s', () => {
    render(<Toast />);
    act(() => showToast('Couldn’t save'));
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t save');
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('can be dismissed early with the close button', () => {
    render(<Toast />);
    act(() => showToast('boom'));
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
