import { beforeEach, describe, expect, it } from 'vitest';
import {
  formatDuration,
  getModeStats,
  loadStats,
  recordWin,
  saveStats,
  successRate,
  type StatsByMode,
} from './stats';

describe('formatDuration', () => {
  it('formats milliseconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(45_000)).toBe('00:45');
    expect(formatDuration(125_000)).toBe('02:05');
    expect(formatDuration(3_600_000)).toBe('60:00');
  });
});

describe('successRate', () => {
  it('returns 0 when nothing has been played', () => {
    const stats = getModeStats({}, 'normal');
    expect(successRate(stats)).toBe(0);
  });

  it('computes the win percentage', () => {
    const stats = { ...getModeStats({}, 'normal'), played: 4, won: 3 };
    expect(successRate(stats)).toBe(75);
  });
});

describe('recordWin', () => {
  it('updates played/won/bestTime/streak for a non-daily mode', () => {
    const after = recordWin({}, { mode: 'normal', timeMs: 60_000 });
    const stats = getModeStats(after, 'normal');
    expect(stats.played).toBe(1);
    expect(stats.won).toBe(1);
    expect(stats.bestTimeMs).toBe(60_000);
    expect(stats.currentStreak).toBe(1);
    expect(stats.bestStreak).toBe(1);
  });

  it('keeps the best (shortest) time across repeated wins', () => {
    let s: StatsByMode = recordWin({}, { mode: 'normal', timeMs: 90_000 });
    s = recordWin(s, { mode: 'normal', timeMs: 50_000 });
    s = recordWin(s, { mode: 'normal', timeMs: 70_000 });
    const stats = getModeStats(s, 'normal');
    expect(stats.bestTimeMs).toBe(50_000);
    expect(stats.played).toBe(3);
  });

  it('extends a daily streak only when the next day key follows the previous one', () => {
    let s: StatsByMode = recordWin({}, { mode: 'daily', timeMs: 1000, dailyKey: '2026-05-10' });
    s = recordWin(s, { mode: 'daily', timeMs: 1000, dailyKey: '2026-05-11' });
    expect(getModeStats(s, 'daily').currentStreak).toBe(2);
    s = recordWin(s, { mode: 'daily', timeMs: 1000, dailyKey: '2026-05-13' });
    expect(getModeStats(s, 'daily').currentStreak).toBe(1);
    expect(getModeStats(s, 'daily').bestStreak).toBe(2);
  });
});

describe('load / save', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips through localStorage', () => {
    const initial = recordWin({}, { mode: 'rapido', timeMs: 30_000 });
    saveStats(initial);
    expect(loadStats()).toEqual(initial);
  });

  it('returns {} when storage is empty or malformed', () => {
    expect(loadStats()).toEqual({});
    localStorage.setItem('tetonor.stats.v1', 'not-json');
    expect(loadStats()).toEqual({});
  });
});
