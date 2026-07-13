import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarShowButton } from './SidebarShowButton';

describe('SidebarShowButton', () => {
  it('renders nothing when the sidebar is shown', () => {
    const { container } = render(<SidebarShowButton hidden={false} onShow={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a restore button when hidden and calls onShow', async () => {
    const onShow = vi.fn();
    render(<SidebarShowButton hidden onShow={onShow} />);
    await userEvent.click(screen.getByLabelText('Show sidebar'));
    expect(onShow).toHaveBeenCalled();
  });
});
