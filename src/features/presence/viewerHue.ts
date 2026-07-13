/** A stable, pleasant HSL color derived from a viewer's id, so a person's
 * avatar and their live cursor share the same color. Pure. */
export function viewerHue(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 45%)`;
}
