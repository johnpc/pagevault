import { describe, it, expect } from 'vitest';
import { embedFor } from './embedSource';

describe('embedFor', () => {
  it('classifies direct video files as native video', () => {
    expect(embedFor('https://cdn.x/clip.mp4')).toEqual({
      kind: 'video',
      src: 'https://cdn.x/clip.mp4',
    });
    expect(embedFor('https://cdn.x/v.webm?token=1').kind).toBe('video');
  });

  it('classifies direct audio files as native audio', () => {
    expect(embedFor('https://cdn.x/song.mp3').kind).toBe('audio');
    expect(embedFor('https://cdn.x/a.ogg').kind).toBe('audio');
  });

  it('converts a YouTube watch URL to an embed iframe', () => {
    expect(embedFor('https://www.youtube.com/watch?v=abc123')).toEqual({
      kind: 'iframe',
      src: 'https://www.youtube.com/embed/abc123',
    });
  });

  it('handles youtu.be and shorts links', () => {
    expect(embedFor('https://youtu.be/xyz').src).toBe('https://www.youtube.com/embed/xyz');
    expect(embedFor('https://youtube.com/shorts/s9').src).toBe('https://www.youtube.com/embed/s9');
  });

  it('converts a Vimeo URL to a player iframe', () => {
    expect(embedFor('https://vimeo.com/123456')).toEqual({
      kind: 'iframe',
      src: 'https://player.vimeo.com/video/123456',
    });
  });

  it('prepends https:// for a bare host before classifying', () => {
    expect(embedFor('youtu.be/bare').kind).toBe('iframe');
  });

  it('is none for an unrecognized or empty URL', () => {
    expect(embedFor('')).toEqual({ kind: 'none', src: '' });
    expect(embedFor('https://example.com/article').kind).toBe('none');
  });
});
