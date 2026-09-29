const WORDS_PER_MINUTE = 200;

/** Minutes to read `text`, rounded up, never less than 1. */
export function readingTime(text: string | undefined): number {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
