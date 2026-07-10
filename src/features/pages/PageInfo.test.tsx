import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageInfo } from './PageInfo';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

const page = (over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id: 'p1',
    title: 'T',
    icon: '',
    archived: false,
    favorite: false,
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: new Date().toISOString(),
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

const blk = (content: string): BlockRecord =>
  ({
    id: content,
    page: 'p1',
    type: 'text',
    content,
    checked: false,
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
  }) as BlockRecord;

describe('PageInfo', () => {
  it('shows pluralized word + block counts and an edited label', () => {
    render(<PageInfo page={page()} blocks={[blk('hello world'), blk('three word block')]} />);
    expect(screen.getByText('5 words')).toBeInTheDocument();
    expect(screen.getByText('2 blocks')).toBeInTheDocument();
    expect(screen.getByText(/Edited/)).toBeInTheDocument();
  });

  it('uses singular for one word and one block', () => {
    render(<PageInfo page={page()} blocks={[blk('solo')]} />);
    expect(screen.getByText('1 word')).toBeInTheDocument();
    expect(screen.getByText('1 block')).toBeInTheDocument();
  });

  it('omits the edited label when the timestamp is invalid', () => {
    render(<PageInfo page={page({ updated: '' })} blocks={[]} />);
    expect(screen.queryByText(/Edited/)).not.toBeInTheDocument();
  });
});
