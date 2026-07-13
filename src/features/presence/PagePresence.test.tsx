import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('./usePresence', () => ({
  usePresenceViewers: () => [{ id: 'u1', label: 'Ada', initial: 'A' }],
}));

import { PagePresence } from './PagePresence';

describe('PagePresence', () => {
  it('renders the avatar stack for the page viewers', () => {
    render(<PagePresence pageId="pg" />);
    expect(screen.getByTitle('Ada is viewing')).toBeInTheDocument();
  });
});
