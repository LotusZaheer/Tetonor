import { describe, expect, it } from 'vitest';
import {
  checkPairAnswer,
  checkTask,
  generateMiniPuzzle,
  generatePuzzle,
  normalizeOperation,
} from './gameEngine';
import type { NormalTask, Pair } from '../types/game';

describe('generatePuzzle', () => {
  it('produces 16 numbers, 8 pairs and 16 normal tasks', () => {
    const puzzle = generatePuzzle();
    expect(puzzle.sortedNumbers).toHaveLength(16);
    expect(puzzle.pairs).toHaveLength(8);
    expect(puzzle.normalTasks).toHaveLength(16);
  });

  it('splits indices into 8 visible / 8 hidden, no overlap', () => {
    const puzzle = generatePuzzle();
    expect(puzzle.visibleIndices.size).toBe(8);
    expect(puzzle.hiddenIndices.size).toBe(8);
    for (const idx of puzzle.visibleIndices) {
      expect(puzzle.hiddenIndices.has(idx)).toBe(false);
    }
  });

  it('keeps each pair sum and product consistent with a*b', () => {
    const puzzle = generatePuzzle();
    for (const pair of puzzle.pairs) {
      expect(pair.sum).toBe(pair.a + pair.b);
      expect(pair.product).toBe(pair.a * pair.b);
    }
  });

  it('guarantees unique (sum, product) per pair so the puzzle has one solution per column', () => {
    for (let i = 0; i < 25; i++) {
      const puzzle = generatePuzzle();
      const keys = new Set(puzzle.pairs.map((p) => `${p.sum}|${p.product}`));
      expect(keys.size).toBe(puzzle.pairs.length);
    }
  });

  it('emits both sum and product normal tasks per pair with matching target', () => {
    const puzzle = generatePuzzle();
    for (const pair of puzzle.pairs) {
      const matching = puzzle.normalTasks.filter(
        (task) =>
          task.target[0] === pair.a &&
          task.target[1] === pair.b,
      );
      expect(matching.some((t) => t.type === '+' && t.value === pair.sum)).toBe(true);
      expect(matching.some((t) => t.type === '*' && t.value === pair.product)).toBe(true);
    }
  });
});

describe('generateMiniPuzzle', () => {
  it('produces 8 numbers, 4 pairs and 8 normal tasks in the same shape as the full puzzle', () => {
    const puzzle = generateMiniPuzzle();
    expect(puzzle.sortedNumbers).toHaveLength(8);
    expect(puzzle.pairs).toHaveLength(4);
    expect(puzzle.normalTasks).toHaveLength(8);
    for (const task of puzzle.normalTasks) {
      expect(task.type === '+' || task.type === '*').toBe(true);
      expect(task.target).toHaveLength(2);
    }
  });
});

describe('checkPairAnswer', () => {
  const pair: Pair = { a: 3, b: 7, sum: 10, product: 21 };

  it('accepts the correct pair in either order', () => {
    expect(checkPairAnswer(pair, 3, 7)).toBe(true);
    expect(checkPairAnswer(pair, 7, 3)).toBe(true);
  });

  it('rejects values that miss either operation', () => {
    expect(checkPairAnswer(pair, 1, 9)).toBe(false); // sums to 10 but product wrong
    expect(checkPairAnswer(pair, 21, 1)).toBe(false); // product matches but sum wrong
  });
});

describe('checkTask', () => {
  const sumTask: NormalTask = { value: 10, type: '+', target: [3, 7] };
  const productTask: NormalTask = { value: 21, type: '*', target: [3, 7] };

  it('matches the target regardless of operand order', () => {
    expect(checkTask(sumTask, 3, 7, '+')).toBe(true);
    expect(checkTask(sumTask, 7, 3, '+')).toBe(true);
  });

  it('rejects the wrong operator even if the math would otherwise work', () => {
    expect(checkTask(sumTask, 2, 5, '*')).toBe(false);
  });

  it('translates "x" to multiplication', () => {
    expect(checkTask(productTask, 3, 7, 'x')).toBe(true);
  });

  it('rejects numbers that arithmetically match but are not the target pair', () => {
    const ambiguous: NormalTask = { value: 12, type: '+', target: [5, 7] };
    expect(checkTask(ambiguous, 4, 8, '+')).toBe(false);
  });
});

describe('normalizeOperation', () => {
  it('maps inputs to the canonical Operation symbols', () => {
    expect(normalizeOperation('+')).toBe('+');
    expect(normalizeOperation('*')).toBe('*');
    expect(normalizeOperation('x')).toBe('*');
    expect(normalizeOperation('X')).toBe('*');
    expect(normalizeOperation('')).toBeNull();
    expect(normalizeOperation('-')).toBeNull();
  });
});
