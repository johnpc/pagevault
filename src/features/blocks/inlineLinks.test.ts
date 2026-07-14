import { describe, it, expect } from 'vitest';
import { trimAutolink, LINK_SPECIALS } from './inlineLinks';

describe('trimAutolink', () => {
  it('leaves a clean URL untouched', () => {
    expect(trimAutolink('https://ex.com/a?b=1&c=2')).toBe('https://ex.com/a?b=1&c=2');
  });

  it('strips trailing sentence punctuation', () => {
    expect(trimAutolink('https://ex.com/page.')).toBe('https://ex.com/page');
    expect(trimAutolink('https://ex.com!?')).toBe('https://ex.com');
    expect(trimAutolink('https://ex.com/a,')).toBe('https://ex.com/a');
  });

  it('keeps a balanced trailing ) but drops an unbalanced one', () => {
    expect(trimAutolink('https://en.wikipedia.org/wiki/Foo_(bar)')).toBe(
      'https://en.wikipedia.org/wiki/Foo_(bar)',
    );
    expect(trimAutolink('https://ex.com/x)')).toBe('https://ex.com/x');
  });

  it('strips a mix of trailing punctuation and an unbalanced )', () => {
    expect(trimAutolink('https://ex.com/x).')).toBe('https://ex.com/x');
  });
});

describe('LINK_SPECIALS', () => {
  const find = (re: RegExp, s: string) => re.exec(s);

  it('the autolink token reports the TRIMMED length so trailing chars stay plain', () => {
    const autolink = LINK_SPECIALS[2];
    const m = find(autolink.re, 'https://ex.com/page.')!;
    const { length, segment } = autolink.match(m);
    expect(segment.href).toBe('https://ex.com/page');
    expect(length).toBe('https://ex.com/page'.length); // NOT including the '.'
  });

  it('the link token captures text and a paren-containing url', () => {
    const link = LINK_SPECIALS[1];
    const m = find(link.re, '[x](https://ex.com/a_(1))')!;
    const { segment } = link.match(m);
    expect(segment).toEqual({ text: 'x', href: 'https://ex.com/a_(1)' });
  });
});
