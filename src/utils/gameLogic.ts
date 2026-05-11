import type { GuessedValues, Puzzle } from '../types/game';

const LETTER_REGEX = /^[a-h]$/;

export function isLetterToken(value: unknown): value is string {
  return typeof value === 'string' && LETTER_REGEX.test(value);
}

export function getHiddenIndices(puzzle: Puzzle): number[] {
  return puzzle.sortedNumbers
    .map((_, i) => i)
    .filter((i) => !puzzle.visibleIndices.has(i));
}

export function letterToHiddenIndex(letter: string, puzzle: Puzzle): number | undefined {
  return getHiddenIndices(puzzle)[letter.charCodeAt(0) - 97];
}

export function hiddenIndexToLetter(slotIndex: number, puzzle: Puzzle): string | undefined {
  const idx = getHiddenIndices(puzzle).indexOf(slotIndex);
  return idx === -1 ? undefined : String.fromCharCode(97 + idx);
}

/**
 * Resolves a raw input token (digits or hidden-slot letter a-h) to a number.
 * Returns NaN when the value is still unknown so callers can branch on
 * `Number.isNaN`.
 */
export function resolveValue(value: unknown, puzzle: Puzzle, guessed: GuessedValues): number {
  if (typeof value === 'number') return value;
  if (value === '' || value === null || value === undefined) return NaN;
  const stringValue = String(value);
  if (isLetterToken(stringValue)) {
    const slotIdx = letterToHiddenIndex(stringValue, puzzle);
    return slotIdx === undefined ? NaN : guessed[slotIdx] ?? NaN;
  }
  const parsed = parseInt(stringValue, 10);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function getDisplayValue(value: unknown, puzzle: Puzzle, guessed: GuessedValues): string {
  if (value === '' || value === null || value === undefined) return '';
  const stringValue = String(value);
  if (isLetterToken(stringValue)) {
    const slotIdx = letterToHiddenIndex(stringValue, puzzle);
    if (slotIdx === undefined) return stringValue;
    const guess = guessed[slotIdx];
    return guess === undefined ? stringValue : String(guess);
  }
  return stringValue;
}

export function isNumericOrLetter(token: string): boolean {
  return token === '' || /^\d+$/.test(token) || LETTER_REGEX.test(token);
}
