import type { GameMode } from '../types/game';

const STORAGE_KEY = 'tetonor.stats.v1';

export interface ModeStats {
  played: number;
  won: number;
  bestTimeMs: number | null;
  totalTimeMs: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDay: string | null;
  lastDailyKey: string | null;
}

export type StatsByMode = Partial<Record<GameMode, ModeStats>>;

function emptyModeStats(): ModeStats {
  return {
    played: 0,
    won: 0,
    bestTimeMs: null,
    totalTimeMs: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastPlayedDay: null,
    lastDailyKey: null,
  };
}

function safeParse(raw: string | null): StatsByMode {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as StatsByMode;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function loadStats(): StatsByMode {
  if (typeof localStorage === 'undefined') return {};
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveStats(stats: StatsByMode): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage may be unavailable (private mode quota, etc.) — fail silently.
  }
}

export function getModeStats(stats: StatsByMode, mode: GameMode): ModeStats {
  return stats[mode] ?? emptyModeStats();
}

function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(`${a}T00:00:00`);
  const dateB = new Date(`${b}T00:00:00`);
  return Math.round((dateB.getTime() - dateA.getTime()) / (24 * 60 * 60 * 1000));
}

export interface RecordWinInput {
  mode: GameMode;
  timeMs: number;
  dailyKey?: string;
}

/**
 * Returns updated stats with the win recorded. The caller is responsible for
 * persisting the result. Daily mode tracks streaks against consecutive days;
 * other modes update streaks against consecutive sessions.
 */
export function recordWin(stats: StatsByMode, input: RecordWinInput): StatsByMode {
  const current = getModeStats(stats, input.mode);
  const next: ModeStats = { ...current };
  const day = todayKey();

  next.played = current.played + 1;
  next.won = current.won + 1;
  next.totalTimeMs = current.totalTimeMs + input.timeMs;
  next.bestTimeMs = current.bestTimeMs === null ? input.timeMs : Math.min(current.bestTimeMs, input.timeMs);

  if (input.mode === 'daily') {
    if (current.lastDailyKey && input.dailyKey) {
      const gap = daysBetween(current.lastDailyKey, input.dailyKey);
      next.currentStreak = gap === 1 ? current.currentStreak + 1 : 1;
    } else {
      next.currentStreak = 1;
    }
    next.lastDailyKey = input.dailyKey ?? current.lastDailyKey;
  } else {
    next.currentStreak = current.currentStreak + 1;
  }

  next.bestStreak = Math.max(current.bestStreak, next.currentStreak);
  next.lastPlayedDay = day;

  return { ...stats, [input.mode]: next };
}

export function recordAttempt(stats: StatsByMode, mode: GameMode): StatsByMode {
  const current = getModeStats(stats, mode);
  const next: ModeStats = { ...current, played: current.played + 1, lastPlayedDay: todayKey() };
  return { ...stats, [mode]: next };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function successRate(stats: ModeStats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.won / stats.played) * 100);
}
