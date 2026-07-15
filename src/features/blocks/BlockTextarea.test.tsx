import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { BlockTextarea } from './BlockTextarea';
import type { BlockRecord } from '../../lib/pbClient';

vi.mock('./CodeHighlight', () => ({
  CodeHighlight: () => <pre data-testid="highlight" />,
}));

const mk = (over: Partial<BlockRecord> = {}): BlockRecord =>
  ({ id: 'b1', type: 'text', content: '', lang: '', ...over }) as BlockRecord;

const noop = () => {};
const props = (block: BlockRecord) => ({
  block,
  value: block.content,
  showPlaceholder: true,
  inputRef: createRef<HTMLTextAreaElement>(),
  onFocus: noop,
  onChange: noop,
  onBlur: noop,
  onKeyDown: noop,
  onSelect: noop,
  onPaste: noop,
});

describe('BlockTextarea', () => {
  it('renders a bare textarea for a non-code block (no highlight layer)', () => {
    const { queryByTestId, getByLabelText } = render(<BlockTextarea {...props(mk())} />);
    expect(getByLabelText('Block content')).toBeInTheDocument();
    expect(queryByTestId('highlight')).toBeNull();
  });

  it('renders a bare textarea for a code block with NO language', () => {
    const { queryByTestId } = render(<BlockTextarea {...props(mk({ type: 'code', lang: '' }))} />);
    expect(queryByTestId('highlight')).toBeNull();
  });

  it('renders the highlight layer for a code block WITH a language', () => {
    const { getByTestId, container } = render(
      <BlockTextarea {...props(mk({ type: 'code', lang: 'js', content: 'const x' }))} />,
    );
    expect(getByTestId('highlight')).toBeInTheDocument();
    expect(container.querySelector('.pv-code-wrap')).not.toBeNull();
  });

  it('shows the block-type hint when showPlaceholder is true', () => {
    const { getByLabelText } = render(<BlockTextarea {...props(mk())} showPlaceholder />);
    expect(
      (getByLabelText('Block content') as HTMLTextAreaElement).placeholder.length,
    ).toBeGreaterThan(0);
  });

  it('hides the block-type hint when showPlaceholder is false', () => {
    const { getByLabelText } = render(<BlockTextarea {...props(mk())} showPlaceholder={false} />);
    expect((getByLabelText('Block content') as HTMLTextAreaElement).placeholder).toBe('');
  });
});
