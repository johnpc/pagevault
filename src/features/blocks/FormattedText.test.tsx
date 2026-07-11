import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormattedText } from './FormattedText';

describe('FormattedText', () => {
  it('renders bold, italic, and code as the right elements', () => {
    render(<FormattedText text="a **b** *i* `c`" />);
    expect(screen.getByText('b').tagName).toBe('STRONG');
    expect(screen.getByText('i').tagName).toBe('EM');
    expect(screen.getByText('c').tagName).toBe('CODE');
  });

  it('renders plain text in a span', () => {
    render(<FormattedText text="plain" />);
    expect(screen.getByText('plain').tagName).toBe('SPAN');
  });
});
