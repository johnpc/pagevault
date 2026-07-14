import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Stub the heavy Sidebar (data + router) to a marker so we test the shell frame.
vi.mock('../pages/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar" />,
}));

// Control the viewport branch.
const isMobile = { value: false };
vi.mock('./useIsMobile', () => ({ useIsMobile: () => isMobile.value }));

import { WorkspaceShell } from './WorkspaceShell';

const renderShell = () =>
  render(
    <MemoryRouter>
      <WorkspaceShell onSearch={() => {}} onHelp={() => {}}>
        <div>content</div>
      </WorkspaceShell>
    </MemoryRouter>,
  );

describe('WorkspaceShell', () => {
  beforeEach(() => {
    isMobile.value = false;
  });

  it('desktop: persistent sidebar, no hamburger', () => {
    renderShell();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open sidebar' })).toBeNull();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('mobile: shows the hamburger; opening reveals the backdrop', () => {
    isMobile.value = true;
    const { container } = renderShell();
    const menu = screen.getByRole('button', { name: 'Open sidebar' });
    expect(container.querySelector('.pv-drawer-backdrop')).toBeNull();
    fireEvent.click(menu);
    expect(container.querySelector('.pv-drawer-backdrop')).not.toBeNull();
    expect(container.querySelector('.pv-drawer-open')).not.toBeNull();
  });

  it('mobile: tapping the backdrop closes the drawer', () => {
    isMobile.value = true;
    const { container } = renderShell();
    fireEvent.click(screen.getByRole('button', { name: 'Open sidebar' }));
    fireEvent.click(container.querySelector('.pv-drawer-backdrop')!);
    expect(container.querySelector('.pv-drawer-backdrop')).toBeNull();
  });
});
