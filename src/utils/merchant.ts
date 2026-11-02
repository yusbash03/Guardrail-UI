/** Deterministic avatar initials + hue from a merchant name (the API has no brand colours). */
export function merchantAvatar(name: string): { initials: string; hue: number } {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  const initials = (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)).toUpperCase();
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return { initials, hue: hash };
}
