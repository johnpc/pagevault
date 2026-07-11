import { describe, it, expect } from 'vitest';
import { render as rtlRender, screen, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { FormattedText } from './FormattedText';

// FormattedText renders mentions as router <Link>s.
const render = (ui: ReactElement): RenderResult => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

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

  it('renders a mention as a link to its page', () => {
    render(<FormattedText text="go to @[Trip](p1)" />);
    const link = screen.getByRole('link', { name: '@Trip' });
    expect(link).toHaveAttribute('href', '/page/p1');
  });
});
