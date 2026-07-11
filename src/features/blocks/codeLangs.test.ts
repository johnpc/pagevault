import { describe, it, expect } from 'vitest';
import { CODE_LANGS, codeLangLabel } from './codeLangs';

describe('codeLangs', () => {
  it('offers Plain text as the empty-token default', () => {
    expect(CODE_LANGS[0]).toEqual({ token: '', label: 'Plain text' });
  });

  it('has unique tokens', () => {
    const tokens = CODE_LANGS.map((l) => l.token);
    expect(new Set(tokens).size).toBe(tokens.length);
  });

  it('maps a token to its label', () => {
    expect(codeLangLabel('ts')).toBe('TypeScript');
    expect(codeLangLabel('python')).toBe('Python');
  });

  it('labels the empty token as Plain text', () => {
    expect(codeLangLabel('')).toBe('Plain text');
  });

  it('falls back to the raw token for an unknown language', () => {
    expect(codeLangLabel('brainfuck')).toBe('brainfuck');
  });
});
