export type GameMode = 'very_easy' | 'easy' | 'rapido' | 'normal' | 'hard' | 'daily';

export type Operation = '+' | '*';

export type OperationInput = Operation | 'x' | '';

export type AnswerStatus = 'correct' | 'wrong' | null;

export interface Pair {
  a: number;
  b: number;
  sum: number;
  product: number;
}

export interface NormalTask {
  value: number;
  type: Operation;
  target: [number, number];
}

export interface Puzzle {
  pairs: Pair[];
  normalTasks: NormalTask[];
  sortedNumbers: number[];
  visibleIndices: Set<number>;
  hiddenIndices: Set<number>;
}

export interface Answer {
  num1: string;
  num2: string;
  op: OperationInput | null;
  status: AnswerStatus;
}

export type GuessedValues = Record<number, number>;

export interface UsedNumbers {
  sumUsed: number[];
  prodUsed: number[];
  claimed: number[];
}
