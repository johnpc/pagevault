import { describe, it, expect } from 'vitest';
import { TOOLBAR_ACTIONS, shouldShowToolbar, toolbarAnchor } from './selectionFormat';

describe('shouldShowToolbar', () => {
  it('shows only for a non-empty selection in a non-code block', () => {
    expect(shouldShowToolbar(false, 2, 6)).toBe(true);
    expect(shouldShowToolbar(false, 4, 4)).toBe(false); // collapsed caret
    expect(shouldShowToolbar(true, 2, 6)).toBe(false); // code block
  });
});

describe('toolbarAnchor', () => {
  it('anchors at the top-center of the textarea rect', () => {
    expect(toolbarAnchor({ top: 100, left: 40, width: 200 })).toEqual({ top: 100, left: 140 });
  });
});

describe('TOOLBAR_ACTIONS', () => {
  it('maps each action to the matching inline-markdown marker', () => {
    const byKey = Object.fromEntries(TOOLBAR_ACTIONS.map((a) => [a.key, a.marker]));
    expect(byKey).toEqual({ bold: '**', italic: '*', underline: '__', strike: '~~', code: '`' });
  });
});
