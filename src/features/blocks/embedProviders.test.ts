import { describe, it, expect } from 'vitest';
import { iframeSrc } from './embedProviders';

const src = (u: string) => iframeSrc(new URL(u));

describe('iframeSrc', () => {
  it('embeds YouTube watch, youtu.be and shorts', () => {
    expect(src('https://www.youtube.com/watch?v=abc')).toBe('https://www.youtube.com/embed/abc');
    expect(src('https://youtu.be/xyz')).toBe('https://www.youtube.com/embed/xyz');
    expect(src('https://youtube.com/shorts/s9')).toBe('https://www.youtube.com/embed/s9');
  });

  it('embeds Vimeo', () => {
    expect(src('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');
  });

  it('embeds Spotify tracks and playlists', () => {
    expect(src('https://open.spotify.com/track/abc123')).toBe(
      'https://open.spotify.com/embed/track/abc123',
    );
    expect(src('https://open.spotify.com/playlist/xyz')).toBe(
      'https://open.spotify.com/embed/playlist/xyz',
    );
  });

  it('embeds a Loom share link', () => {
    expect(src('https://www.loom.com/share/deadbeef99')).toBe(
      'https://www.loom.com/embed/deadbeef99',
    );
  });

  it('embeds a CodePen pen at its result tab', () => {
    expect(src('https://codepen.io/team/pen/aBcDeF')).toBe(
      'https://codepen.io/team/embed/aBcDeF?default-tab=result',
    );
  });

  it('embeds a Figma file via the embed host', () => {
    const out = src('https://www.figma.com/design/AbC/My-Design');
    expect(out).toContain('https://www.figma.com/embed?embed_host=pagevault&url=');
    expect(out).toContain(encodeURIComponent('https://www.figma.com/design/AbC/My-Design'));
  });

  it('embeds a SoundCloud track via the visual player', () => {
    const out = src('https://soundcloud.com/artist/some-track');
    expect(out).toContain('https://w.soundcloud.com/player/?url=');
    expect(out).toContain(encodeURIComponent('https://soundcloud.com/artist/some-track'));
  });

  it('returns empty for an unknown provider or non-embeddable path', () => {
    expect(src('https://example.com/article')).toBe('');
    expect(src('https://open.spotify.com/about')).toBe('');
    expect(src('https://vimeo.com/channels/staffpicks')).toBe('');
  });
});
