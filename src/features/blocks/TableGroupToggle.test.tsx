import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableGroupToggle } from './TableGroupToggle';
import type { TableData } from '../../lib/pbTypes';

const withSelect = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo'] },
  ],
  rows: [],
  ...over,
});

describe('TableGroupToggle', () => {
  it('renders nothing without a select column', () => {
    const { container } = render(
      <TableGroupToggle
        data={{ columns: [{ name: 'T', type: 'text' }], rows: [] }}
        save={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('turns grouping on, naming the group column', async () => {
    const save = vi.fn();
    render(<TableGroupToggle data={withSelect()} save={save} />);
    const btn = screen.getByRole('button', { name: /Group/ });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(btn);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ grouped: true }));
  });

  it('turns grouping off and clears collapsed sections', async () => {
    const save = vi.fn();
    render(
      <TableGroupToggle
        data={withSelect({ grouped: true, collapsedGroups: ['Todo'] })}
        save={save}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Group/ }));
    const saved = save.mock.calls.at(-1)![0] as TableData;
    expect(saved.grouped).toBeUndefined();
    expect(saved.collapsedGroups).toBeUndefined();
  });
});
