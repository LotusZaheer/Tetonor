import type { NormalTask, Operation, Pair, Puzzle } from '../types/game';

const MAX_GENERATION_ATTEMPTS = 100;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function buildPairs(numbers: readonly number[]): Pair[] {
  const shuffled = shuffle(numbers);
  const pairs: Pair[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    const a = shuffled[i]!;
    const b = shuffled[i + 1]!;
    pairs.push({ a, b, sum: a + b, product: a * b });
  }
  return pairs;
}

function buildNormalTasks(pairs: readonly Pair[]): NormalTask[] {
  const tasks: NormalTask[] = [];
  for (const p of pairs) {
    tasks.push({ value: p.sum, type: '+', target: [p.a, p.b] });
    tasks.push({ value: p.product, type: '*', target: [p.a, p.b] });
  }
  return shuffle(tasks);
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

function pickVisibleIndices(total: number, visibleCount: number): { visible: Set<number>; hidden: Set<number> } {
  const indices = Array.from({ length: total }, (_, i) => i);
  const shuffled = shuffle(indices);
  return {
    visible: new Set(shuffled.slice(0, visibleCount)),
    hidden: new Set(shuffled.slice(visibleCount)),
  };
}

function generateSizedPuzzle(numberCount: number): Puzzle {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const numbers = Array.from({ length: numberCount }, () => randomInt(1, 99));
    const pairs = buildPairs(numbers);
    if (!pairsHaveUniqueSolutions(pairs)) continue;

    const sortedNumbers = [...numbers].sort((x, y) => x - y);
    const { visible, hidden } = pickVisibleIndices(numberCount, numberCount / 2);

    return {
      pairs,
      normalTasks: buildNormalTasks(pairs),
      sortedNumbers,
      visibleIndices: visible,
      hiddenIndices: hidden,
    };
  }

  // Fallback: extremely unlikely, but never block the UI.
  const numbers = Array.from({ length: numberCount }, () => randomInt(1, 99));
  const pairs = buildPairs(numbers);
  const sortedNumbers = [...numbers].sort((x, y) => x - y);
  const { visible, hidden } = pickVisibleIndices(numberCount, numberCount / 2);
  return {
    pairs,
    normalTasks: buildNormalTasks(pairs),
    sortedNumbers,
    visibleIndices: visible,
    hiddenIndices: hidden,
  };
}

export function generatePuzzle(): Puzzle {
  return generateSizedPuzzle(16);
}

export function generateMiniPuzzle(): Puzzle {
  return generateSizedPuzzle(8);
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
