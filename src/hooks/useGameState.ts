import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  checkPairAnswer,
  checkTask,
  generateMiniPuzzle,
  generatePuzzle,
  generatePuzzleFromSeed,
} from '../utils/gameEngine';
import { resolveValue } from '../utils/gameLogic';
import { dailyKey as buildDailyKey, dailySeed } from '../utils/rng';
import type {
  Answer,
  GameMode,
  GuessedValues,
  OperationInput,
  Puzzle,
  UsedNumbers,
} from '../types/game';

const SMALL_MODES: readonly GameMode[] = ['very_easy', 'rapido'];
const PAIR_MODES: readonly GameMode[] = ['very_easy', 'easy'];
const TASK_MODES: readonly GameMode[] = ['normal', 'rapido', 'daily'];
const FAST_LIMIT = 4;
const STANDARD_LIMIT = 8;

function createInitialAnswers(count: number, isNormalLike: boolean): Answer[] {
  return Array.from({ length: count }, () => ({
    num1: '',
    num2: '',
    op: isNormalLike ? '' : null,
    status: null,
  }));
}

function answerCount(mode: GameMode, puzzle: Puzzle): number {
  return PAIR_MODES.includes(mode) ? puzzle.pairs.length : puzzle.normalTasks.length;
}

export interface UseGameState {
  mode: GameMode;
  puzzle: Puzzle | null;
  answers: Answer[];
  guessedValues: GuessedValues;
  isSolved: boolean;
  usedNumbers: UsedNumbers;
  sumCount: number;
  prodCount: number;
  limit: number;
  remainingSums: number;
  remainingProds: number;
  correctCount: number;
  totalCells: number;
  dailyKey: string | null;
  setMode: (mode: GameMode) => void;
  startNewGame: () => void;
  setGuessedValues: React.Dispatch<React.SetStateAction<GuessedValues>>;
  updateEasyAnswer: (pairIdx: number, field: 'num1' | 'num2', value: string) => void;
  updateNormalAnswer: (idx: number, field: 'num1' | 'num2' | 'op', value: string) => void;
}

export function useGameState(initialMode: GameMode = 'rapido'): UseGameState {
  const [mode, setModeState] = useState<GameMode>(initialMode);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [guessedValues, setGuessedValues] = useState<GuessedValues>({});
  const [isSolved, setIsSolved] = useState(false);
  const [dailyKey, setDailyKey] = useState<string | null>(null);

  const startNewGame = useCallback(() => {
    if (mode === 'hard') {
      setPuzzle(null);
      setAnswers([]);
      setGuessedValues({});
      setIsSolved(false);
      setDailyKey(null);
      return;
    }
    let nextPuzzle: Puzzle;
    if (mode === 'daily') {
      nextPuzzle = generatePuzzleFromSeed(dailySeed(), 16);
      setDailyKey(buildDailyKey());
    } else {
      nextPuzzle = SMALL_MODES.includes(mode) ? generateMiniPuzzle() : generatePuzzle();
      setDailyKey(null);
    }
    setPuzzle(nextPuzzle);
    setAnswers(createInitialAnswers(answerCount(mode, nextPuzzle), TASK_MODES.includes(mode)));
    setGuessedValues({});
    setIsSolved(false);
  }, [mode]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const setMode = useCallback((next: GameMode) => {
    setModeState(next);
  }, []);

  const evaluateAnswers = useCallback((nextAnswers: Answer[]) => {
    if (nextAnswers.length > 0 && nextAnswers.every((a) => a.status === 'correct')) {
      setIsSolved(true);
    }
  }, []);

  const updateEasyAnswer = useCallback(
    (pairIdx: number, field: 'num1' | 'num2', value: string) => {
      if (!puzzle) return;
      setAnswers((prev) => {
        const next = [...prev];
        const updated: Answer = { ...next[pairIdx]!, [field]: value, status: null };

        const n1 = resolveValue(updated.num1, puzzle, guessedValues);
        const n2 = resolveValue(updated.num2, puzzle, guessedValues);

        if (!Number.isNaN(n1) && !Number.isNaN(n2)) {
          const pair = puzzle.pairs[pairIdx]!;
          updated.status = checkPairAnswer(pair, n1, n2) ? 'correct' : 'wrong';
        }

        next[pairIdx] = updated;
        evaluateAnswers(next);
        return next;
      });
    },
    [puzzle, guessedValues, evaluateAnswers],
  );

  const updateNormalAnswer = useCallback(
    (idx: number, field: 'num1' | 'num2' | 'op', value: string) => {
      if (!puzzle) return;
      setAnswers((prev) => {
        const next = [...prev];
        const current = next[idx]!;
        const normalizedValue: string = field === 'op' && (value === 'x' || value === 'X') ? '*' : value;
        const updated: Answer = {
          ...current,
          [field]: field === 'op' ? (normalizedValue as OperationInput) : normalizedValue,
          status: null,
        };

        const n1 = resolveValue(updated.num1, puzzle, guessedValues);
        const n2 = resolveValue(updated.num2, puzzle, guessedValues);

        if (!Number.isNaN(n1) && !Number.isNaN(n2) && updated.op) {
          const task = puzzle.normalTasks[idx]!;
          updated.status = checkTask(task, n1, n2, updated.op) ? 'correct' : 'wrong';
        }

        next[idx] = updated;
        evaluateAnswers(next);
        return next;
      });
    },
    [puzzle, guessedValues, evaluateAnswers],
  );

  const usedNumbers: UsedNumbers = useMemo(() => {
    const sumUsed: number[] = [];
    const prodUsed: number[] = [];
    const claimed: number[] = [];
    if (!puzzle) return { sumUsed, prodUsed, claimed };

    for (const ans of answers) {
      if (ans.status !== 'correct') continue;
      const n1 = resolveValue(ans.num1, puzzle, guessedValues);
      const n2 = resolveValue(ans.num2, puzzle, guessedValues);

      if (PAIR_MODES.includes(mode)) {
        if (!Number.isNaN(n1)) {
          sumUsed.push(n1);
          prodUsed.push(n1);
          claimed.push(n1);
        }
        if (!Number.isNaN(n2)) {
          sumUsed.push(n2);
          prodUsed.push(n2);
          claimed.push(n2);
        }
      } else {
        const isSum = ans.op === '+';
        if (!Number.isNaN(n1)) {
          if (isSum) sumUsed.push(n1);
          else prodUsed.push(n1);
          claimed.push(n1);
        }
        if (!Number.isNaN(n2)) {
          if (isSum) sumUsed.push(n2);
          else prodUsed.push(n2);
          claimed.push(n2);
        }
      }
    }
    return { sumUsed, prodUsed, claimed };
  }, [answers, guessedValues, puzzle, mode]);

  const limit = mode === 'rapido' ? FAST_LIMIT : STANDARD_LIMIT;
  const sumCount = answers.filter((a) => a.op === '+').length;
  const prodCount = answers.filter((a) => a.op === '*' || a.op === 'x').length;
  const remainingSums = Math.max(0, limit - sumCount);
  const remainingProds = Math.max(0, limit - prodCount);
  const correctCount = answers.filter((a) => a.status === 'correct').length;
  const totalCells = answers.length;

  return {
    mode,
    puzzle,
    answers,
    guessedValues,
    isSolved,
    usedNumbers,
    sumCount,
    prodCount,
    limit,
    remainingSums,
    remainingProds,
    correctCount,
    totalCells,
    dailyKey,
    setMode,
    startNewGame,
    setGuessedValues,
    updateEasyAnswer,
    updateNormalAnswer,
  };
}
