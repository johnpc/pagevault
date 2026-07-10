import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoverPicker } from './CoverPicker';

describe('CoverPicker', () => {
  it('renders no strip when no cover is set', () => {
    render(<CoverPicker cover="" onCover={vi.fn()} />);
    expect(screen.queryByTestId('cover-strip')).not.toBeInTheDocument();
  });

  it('renders the gradient strip when a cover is set', () => {
    render(<CoverPicker cover="ocean" onCover={vi.fn()} />);
    expect(screen.getByTestId('cover-strip')).toBeInTheDocument();
  });

  it('picks a cover on swatch click', async () => {
    const onCover = vi.fn();
    render(<CoverPicker cover="" onCover={onCover} />);
    await userEvent.click(screen.getByLabelText('Cover Ocean'));
    expect(onCover).toHaveBeenCalledWith('ocean');
  });

  it('clears the cover when the active swatch is clicked again', async () => {
    const onCover = vi.fn();
    render(<CoverPicker cover="ocean" onCover={onCover} />);
    await userEvent.click(screen.getByLabelText('Cover Ocean'));
    expect(onCover).toHaveBeenCalledWith('');
  });
});
