import type { NormalTask, Operation, Pair, Puzzle } from '../types/game';
import { mulberry32, randomIntFrom, shuffleWith } from './rng';

const MAX_GENERATION_ATTEMPTS = 100;

type RNG = () => number;

const defaultRng: RNG = Math.random;

function buildPairs(rng: RNG, numbers: readonly number[]): Pair[] {
  const shuffled = shuffleWith(rng, numbers);
  const pairs: Pair[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    const a = shuffled[i]!;
    const b = shuffled[i + 1]!;
    pairs.push({ a, b, sum: a + b, product: a * b });
  }
  return pairs;
}

function buildNormalTasks(rng: RNG, pairs: readonly Pair[]): NormalTask[] {
  const tasks: NormalTask[] = [];
  for (const p of pairs) {
    tasks.push({ value: p.sum, type: '+', target: [p.a, p.b] });
    tasks.push({ value: p.product, type: '*', target: [p.a, p.b] });
  }
  return shuffleWith(rng, tasks);
}

/**
 * Two pairs collide if they share both (sum, product). Mathematically that
 * forces {a,b} = {c,d}, so the player would face a duplicated column with no
 * distinguishable answer. We regenerate when this happens.
 */
function pairsHaveUniqueSolutions(pairs: readonly Pair[]): boolean {
  const seen = new Set<string>();
  for (const p of pairs) {
    const key = `${p.sum}|${p.product}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

function pickVisibleIndices(
  rng: RNG,
  total: number,
  visibleCount: number,
): { visible: Set<number>; hidden: Set<number> } {
  const indices = Array.from({ length: total }, (_, i) => i);
  const shuffled = shuffleWith(rng, indices);
  return {
    visible: new Set(shuffled.slice(0, visibleCount)),
    hidden: new Set(shuffled.slice(visibleCount)),
  };
}

function generateSizedPuzzle(numberCount: number, rng: RNG): Puzzle {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const numbers = Array.from({ length: numberCount }, () => randomIntFrom(rng, 1, 99));
    const pairs = buildPairs(rng, numbers);
    if (!pairsHaveUniqueSolutions(pairs)) continue;

    const sortedNumbers = [...numbers].sort((x, y) => x - y);
    const { visible, hidden } = pickVisibleIndices(rng, numberCount, numberCount / 2);

    return {
      pairs,
      normalTasks: buildNormalTasks(rng, pairs),
      sortedNumbers,
      visibleIndices: visible,
      hiddenIndices: hidden,
    };
  }

  const numbers = Array.from({ length: numberCount }, () => randomIntFrom(rng, 1, 99));
  const pairs = buildPairs(rng, numbers);
  const sortedNumbers = [...numbers].sort((x, y) => x - y);
  const { visible, hidden } = pickVisibleIndices(rng, numberCount, numberCount / 2);
  return {
    pairs,
    normalTasks: buildNormalTasks(rng, pairs),
    sortedNumbers,
    visibleIndices: visible,
    hiddenIndices: hidden,
  };
}

export function generatePuzzle(): Puzzle {
  return generateSizedPuzzle(16, defaultRng);
}

export function generateMiniPuzzle(): Puzzle {
  return generateSizedPuzzle(8, defaultRng);
}

export function generatePuzzleFromSeed(seed: number, size: 8 | 16 = 16): Puzzle {
  return generateSizedPuzzle(size, mulberry32(seed));
}

export function normalizeOperation(op: string): Operation | null {
  if (op === '+') return '+';
  if (op === '*' || op === 'x' || op === 'X') return '*';
  return null;
}

export function checkPairAnswer(pair: Pair, num1: number, num2: number): boolean {
  return num1 + num2 === pair.sum && num1 * num2 === pair.product;
}

export function checkTask(task: NormalTask, num1: number, num2: number, op: string): boolean {
  const operation = normalizeOperation(op);
  if (operation === null || operation !== task.type) return false;

  const [t1, t2] = task.target;
  const targetMatches = (num1 === t1 && num2 === t2) || (num1 === t2 && num2 === t1);
  if (!targetMatches) return false;

  return operation === '+' ? num1 + num2 === task.value : num1 * num2 === task.value;
}
