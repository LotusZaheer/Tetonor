import { describe, expect, it } from 'vitest';
import {
  getDisplayValue,
  getHiddenIndices,
  hiddenIndexToLetter,
  isLetterToken,
  isNumericOrLetter,
  letterToHiddenIndex,
  resolveValue,
} from './gameLogic';
import type { Puzzle } from '../types/game';

function buildPuzzle(): Puzzle {
  // sortedNumbers indices: 0..7
  // visible at 0, 2, 4, 6 → hidden letters a..d at 1, 3, 5, 7
  return {
    pairs: [],
    normalTasks: [],
    sortedNumbers: [1, 2, 3, 4, 5, 6, 7, 8],
    visibleIndices: new Set([0, 2, 4, 6]),
    hiddenIndices: new Set([1, 3, 5, 7]),
  };
}

describe('isLetterToken', () => {
  it('accepts a single a-h character', () => {
    expect(isLetterToken('a')).toBe(true);
    expect(isLetterToken('h')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isLetterToken('i')).toBe(false);
    expect(isLetterToken('aa')).toBe(false);
    expect(isLetterToken('1')).toBe(false);
    expect(isLetterToken(5)).toBe(false);
  });
});

describe('getHiddenIndices and letter mapping', () => {
  const puzzle = buildPuzzle();

  it('returns the hidden slot indices in sorted order', () => {
    expect(getHiddenIndices(puzzle)).toEqual([1, 3, 5, 7]);
  });

  it('maps letter a → first hidden index, b → second, etc.', () => {
    expect(letterToHiddenIndex('a', puzzle)).toBe(1);
    expect(letterToHiddenIndex('b', puzzle)).toBe(3);
    expect(letterToHiddenIndex('d', puzzle)).toBe(7);
  });

  it('maps hidden slot indices back to letters', () => {
    expect(hiddenIndexToLetter(1, puzzle)).toBe('a');
    expect(hiddenIndexToLetter(7, puzzle)).toBe('d');
    expect(hiddenIndexToLetter(0, puzzle)).toBeUndefined();
  });
});

describe('resolveValue', () => {
  const puzzle = buildPuzzle();

  it('returns numeric input as-is', () => {
    expect(resolveValue(42, puzzle, {})).toBe(42);
    expect(resolveValue('42', puzzle, {})).toBe(42);
  });

  it('returns NaN for empty / unknown input', () => {
    expect(Number.isNaN(resolveValue('', puzzle, {}))).toBe(true);
    expect(Number.isNaN(resolveValue(null, puzzle, {}))).toBe(true);
    expect(Number.isNaN(resolveValue(undefined, puzzle, {}))).toBe(true);
  });

  it('resolves a letter token to its guessed value when present', () => {
    expect(resolveValue('a', puzzle, { 1: 50 })).toBe(50);
    expect(resolveValue('b', puzzle, { 3: 12 })).toBe(12);
  });

  it('returns NaN for a letter without a guess', () => {
    expect(Number.isNaN(resolveValue('a', puzzle, {}))).toBe(true);
  });
});

describe('getDisplayValue', () => {
  const puzzle = buildPuzzle();

  it('returns empty string for empty values', () => {
    expect(getDisplayValue('', puzzle, {})).toBe('');
    expect(getDisplayValue(null, puzzle, {})).toBe('');
  });

  it('shows the guess when a letter has been picked', () => {
    expect(getDisplayValue('a', puzzle, { 1: 50 })).toBe('50');
  });

  it('keeps the letter itself when no guess exists', () => {
    expect(getDisplayValue('a', puzzle, {})).toBe('a');
  });

  it('returns the raw string for numeric values', () => {
    expect(getDisplayValue('42', puzzle, {})).toBe('42');
    expect(getDisplayValue(42, puzzle, {})).toBe('42');
  });
});

describe('isNumericOrLetter', () => {
  it('accepts empty, digits and a-h letters', () => {
    expect(isNumericOrLetter('')).toBe(true);
    expect(isNumericOrLetter('123')).toBe(true);
    expect(isNumericOrLetter('a')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isNumericOrLetter('12a')).toBe(false);
    expect(isNumericOrLetter('z')).toBe(false);
    expect(isNumericOrLetter(' ')).toBe(false);
  });
});
