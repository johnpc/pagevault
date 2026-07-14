/** A curated emoji set for the page icon picker, each with search keywords.
 * Not exhaustive (a full Unicode set is huge) — covers the common page-icon
 * intents so search feels useful without shipping thousands of glyphs. */
export interface Emoji {
  char: string;
  keywords: string; // space-separated search terms (lowercase)
}

export const EMOJIS: Emoji[] = [
  { char: '📄', keywords: 'page document file paper note' },
  { char: '📝', keywords: 'memo note write edit pencil' },
  { char: '📌', keywords: 'pin location important' },
  { char: '💡', keywords: 'idea light bulb tip' },
  { char: '✅', keywords: 'check done complete task todo' },
  { char: '📚', keywords: 'books library read learn docs' },
  { char: '🚀', keywords: 'rocket launch ship fast startup' },
  { char: '🗂️', keywords: 'folder files organize index tabs' },
  { char: '⭐', keywords: 'star favorite important' },
  { char: '🔥', keywords: 'fire hot trending urgent' },
  { char: '🎯', keywords: 'target goal aim objective' },
  { char: '📅', keywords: 'calendar date schedule plan' },
  { char: '💰', keywords: 'money finance budget cash' },
  { char: '🏠', keywords: 'home house main dashboard' },
  { char: '⚙️', keywords: 'settings gear config tools' },
  { char: '📊', keywords: 'chart graph stats data report' },
  { char: '🐛', keywords: 'bug issue defect problem' },
  { char: '🎨', keywords: 'art design paint color creative' },
  { char: '🍽️', keywords: 'food meal recipe eat dinner' },
  { char: '✈️', keywords: 'travel trip flight plane vacation' },
  { char: '❤️', keywords: 'heart love like favorite' },
  { char: '🎉', keywords: 'party celebrate launch fun event' },
  { char: '🔒', keywords: 'lock secure private password' },
  { char: '🧠', keywords: 'brain idea think mind smart' },
  { char: '💬', keywords: 'chat message talk comment discuss' },
  { char: '🏆', keywords: 'trophy win award goal achievement' },
  { char: '⚡', keywords: 'lightning fast energy power quick' },
  { char: '🌱', keywords: 'plant grow seedling start new' },
  { char: '🔧', keywords: 'wrench fix tool repair maintenance' },
  { char: '📈', keywords: 'growth up trend increase progress' },
];
