import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeLangMenu } from './CodeLangMenu';

describe('CodeLangMenu', () => {
  it('shows the current language on the button', () => {
    render(<CodeLangMenu current="ts" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Code language')).toHaveTextContent('TypeScript');
  });

  it('shows Plain text when no language is set', () => {
    render(<CodeLangMenu current="" onPick={vi.fn()} />);
    expect(screen.getByLabelText('Code language')).toHaveTextContent('Plain text');
  });

  it('opens the list on click and marks the current language selected', async () => {
    render(<CodeLangMenu current="python" onPick={vi.fn()} />);
    await userEvent.click(screen.getByLabelText('Code language'));
    expect(screen.getByRole('option', { name: 'Python' })).toHaveAttribute('aria-selected', 'true');
  });

  it('picks a language and closes the menu', async () => {
    const onPick = vi.fn();
    render(<CodeLangMenu current="" onPick={onPick} />);
    await userEvent.click(screen.getByLabelText('Code language'));
    await userEvent.click(screen.getByRole('option', { name: 'Go' }));
    expect(onPick).toHaveBeenCalledWith('go');
    expect(screen.queryByRole('listbox', { name: 'Code language' })).not.toBeInTheDocument();
  });
});
