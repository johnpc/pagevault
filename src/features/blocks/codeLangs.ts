/** A selectable language for a code block: the stored token + its display
 * label. The token is emitted into the ```lang fence on Markdown export. */
export interface CodeLang {
  token: string;
  label: string;
}

/** The languages a code block can be tagged with. '' is "Plain text" (no fence
 * language). Kept short + common — enough to label a snippet, not exhaustive. */
export const CODE_LANGS: CodeLang[] = [
  { token: '', label: 'Plain text' },
  { token: 'js', label: 'JavaScript' },
  { token: 'ts', label: 'TypeScript' },
  { token: 'jsx', label: 'JSX' },
  { token: 'tsx', label: 'TSX' },
  { token: 'python', label: 'Python' },
  { token: 'go', label: 'Go' },
  { token: 'rust', label: 'Rust' },
  { token: 'java', label: 'Java' },
  { token: 'c', label: 'C' },
  { token: 'cpp', label: 'C++' },
  { token: 'csharp', label: 'C#' },
  { token: 'ruby', label: 'Ruby' },
  { token: 'php', label: 'PHP' },
  { token: 'swift', label: 'Swift' },
  { token: 'kotlin', label: 'Kotlin' },
  { token: 'sql', label: 'SQL' },
  { token: 'bash', label: 'Shell' },
  { token: 'json', label: 'JSON' },
  { token: 'yaml', label: 'YAML' },
  { token: 'html', label: 'HTML' },
  { token: 'css', label: 'CSS' },
  { token: 'markdown', label: 'Markdown' },
];

/** The display label for a stored language token ('' → 'Plain text'). */
export const codeLangLabel = (token: string): string =>
  CODE_LANGS.find((l) => l.token === token)?.label ?? token;
