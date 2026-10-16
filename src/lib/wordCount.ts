export const MIN_WORDS = 20;

/** Counts whitespace-separated words, ignoring empty strings. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
