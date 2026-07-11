import { useState } from 'react';

/** A copy-to-clipboard button that briefly shows "Copied!" — used on code
 * blocks. Guards against an unavailable clipboard (older browsers / no https). */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard unavailable — leave the label unchanged rather than throw.
    }
  };

  return (
    <button type="button" className="pv-code-copy" aria-label="Copy code" onClick={copy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
