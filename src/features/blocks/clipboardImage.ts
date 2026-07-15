/** The first image file on a clipboard payload (a screenshot or copied image),
 * or null when there's no image (or no `items`, as in jsdom). Pure. */
export function clipboardImage(data: Pick<DataTransfer, 'items'>): File | null {
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind === 'file' && item.type.startsWith('image/')) return item.getAsFile();
  }
  return null;
}
