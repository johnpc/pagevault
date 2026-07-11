import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Highlighted } from './Highlighted';

describe('Highlighted', () => {
  it('wraps matched runs in a <mark> and leaves the rest plain', () => {
    render(<Highlighted text="Roadmap" query="road" />);
    const mark = screen.getByText('Road');
    expect(mark.tagName).toBe('MARK');
    expect(screen.getByText('map').tagName).toBe('SPAN');
  });

  it('renders plain text with no query', () => {
    render(<Highlighted text="plain" query="" />);
    expect(screen.getByText('plain').tagName).toBe('SPAN');
  });
});
