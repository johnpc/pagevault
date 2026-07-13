import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const cursors = vi.fn();
vi.mock('./usePresence', () => ({ useBlockCursors: (id: string) => cursors(id) }));

import { BlockCursors } from './BlockCursors';

describe('BlockCursors', () => {
  it('renders nothing when no collaborator is on the block', () => {
    cursors.mockReturnValue([]);
    const { container } = render(<BlockCursors blockId="b1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a name-tag per collaborator focused on the block', () => {
    cursors.mockReturnValue([
      { id: 'u1', label: 'Ada', initial: 'A', block: 'b1' },
      { id: 'u2', label: 'Bo', initial: 'B', block: 'b1' },
    ]);
    render(<BlockCursors blockId="b1" />);
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Bo')).toBeInTheDocument();
  });
});
