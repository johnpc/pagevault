import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PresenceAvatars } from './PresenceAvatars';
import type { Viewer } from './activeViewers';

const v = (id: string, label: string): Viewer => ({
  id,
  label,
  initial: label[0].toUpperCase(),
});

describe('PresenceAvatars', () => {
  it('renders nothing when no one else is viewing', () => {
    const { container } = render(<PresenceAvatars viewers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows an avatar per viewer with their initial + name in the title', () => {
    render(<PresenceAvatars viewers={[v('u1', 'Ada'), v('u2', 'Bo')]} />);
    expect(screen.getByLabelText('2 people viewing')).toBeInTheDocument();
    expect(screen.getByTitle('Ada is viewing')).toHaveTextContent('A');
    expect(screen.getByTitle('Bo is viewing')).toHaveTextContent('B');
  });

  it('labels a single viewer by name', () => {
    render(<PresenceAvatars viewers={[v('u1', 'Ada')]} />);
    expect(screen.getByLabelText('Ada is viewing')).toBeInTheDocument();
  });

  it('collapses overflow beyond 4 into a +N chip', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f'].map((c) => v(c, c.toUpperCase()));
    render(<PresenceAvatars viewers={many} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});
