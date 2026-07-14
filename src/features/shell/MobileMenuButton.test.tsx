import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileMenuButton } from './MobileMenuButton';

describe('MobileMenuButton', () => {
  it('calls onOpen when tapped', () => {
    const onOpen = vi.fn();
    render(<MobileMenuButton onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open sidebar' }));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
