import { describe, expect, it } from 'vitest';
import { dailyKey, dailySeed, mulberry32, randomIntFrom, shuffleWith } from './rng';

describe('mulberry32', () => {
  it('produces the same stream for the same seed', () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces a different stream for a different seed', () => {
    const a = Array.from({ length: 5 }, mulberry32(1));
    const b = Array.from({ length: 5 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });

  it('returns values within [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('randomIntFrom and shuffleWith', () => {
  it('randomIntFrom stays inside the requested inclusive range', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 200; i++) {
      const v = randomIntFrom(rng, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('shuffleWith preserves all elements and is deterministic per seed', () => {
    const input = [1, 2, 3, 4, 5, 6];
    const a = shuffleWith(mulberry32(99), input);
    const b = shuffleWith(mulberry32(99), input);
    expect(a).toEqual(b);
    expect([...a].sort((x, y) => x - y)).toEqual(input);
  });
});

describe('daily helpers', () => {
  it('dailySeed packs YYYYMMDD', () => {
    expect(dailySeed(new Date(2026, 4, 11))).toBe(20260511);
  });

  it('dailyKey returns ISO-like YYYY-MM-DD', () => {
    expect(dailyKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
