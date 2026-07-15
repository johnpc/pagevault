import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tag } from './Tag';
import { tagColor } from './tagColor';

describe('Tag', () => {
  it('renders the label and a hue class derived from it', () => {
    render(<Tag label="Urgent" />);
    const pill = screen.getByText('Urgent');
    expect(pill).toHaveClass('pv-tag');
    expect(pill).toHaveClass(`pv-tag--${tagColor('Urgent')}`);
  });
});
