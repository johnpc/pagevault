import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableBody } from './TableBody';
import type { TableData, TableColumn } from '../../lib/pbTypes';

const cols = (...names: string[]): TableColumn[] => names.map((name) => ({ name, type: 'text' }));

const renderBody = (data: TableData, save = vi.fn()) =>
  render(
    <table>
      <TableBody data={data} save={save} />
    </table>,
  );

describe('TableBody', () => {
  it('renders a cell per column and edits bubble up', async () => {
    const save = vi.fn();
    renderBody({ columns: cols('A', 'B'), rows: [['1', '2']] }, save);
    await userEvent.type(screen.getByLabelText('Cell 1,1'), 'X');
    expect(save).toHaveBeenLastCalledWith({ columns: cols('A', 'B'), rows: [['1X', '2']] });
  });

  it('reorders rows by dragging one onto another', () => {
    const save = vi.fn();
    renderBody({ columns: cols('A'), rows: [['first'], ['second'], ['third']] }, save);
    // Drag row 3's handle and drop it onto row 1.
    fireEvent.dragStart(screen.getByLabelText('Drag row 3'));
    const firstRow = screen.getByLabelText('Cell 1,1').closest('tr')!;
    fireEvent.drop(firstRow);
    expect(save).toHaveBeenCalledWith({
      columns: cols('A'),
      rows: [['third'], ['first'], ['second']],
    });
  });

  it('does not reorder when a row is dropped onto itself', () => {
    const save = vi.fn();
    renderBody({ columns: cols('A'), rows: [['a'], ['b']] }, save);
    fireEvent.dragStart(screen.getByLabelText('Drag row 1'));
    fireEvent.drop(screen.getByLabelText('Cell 1,1').closest('tr')!);
    expect(save).not.toHaveBeenCalled();
  });

  it('deletes a row via its delete control', async () => {
    const save = vi.fn();
    renderBody({ columns: cols('A'), rows: [['a'], ['b']] }, save);
    await userEvent.click(screen.getByLabelText('Delete row 2'));
    expect(save).toHaveBeenCalledWith({ columns: cols('A'), rows: [['a']] });
  });

  it('shows no delete control when there is only one row', () => {
    renderBody({ columns: cols('A'), rows: [['only']] });
    expect(screen.queryByLabelText('Delete row 1')).not.toBeInTheDocument();
  });
});
