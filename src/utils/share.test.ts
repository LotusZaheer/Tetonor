import { describe, expect, it } from 'vitest';
import { buildShareText } from './share';

describe('buildShareText', () => {
  it('includes the daily date header when in daily mode', () => {
    const text = buildShareText({
      mode: 'daily',
      totalCells: 16,
      correctCells: 16,
      timeMs: 132_000,
      dailyKey: '2026-05-11',
    });
    expect(text).toContain('Tetonor Diario 2026-05-11');
    expect(text).toContain('16/16');
    expect(text).toContain('02:12');
    expect(text.split('\n').filter((l) => l.includes('🟩')).length).toBe(4);
  });

  it('falls back to mode label when not daily', () => {
    const text = buildShareText({
      mode: 'normal',
      totalCells: 16,
      correctCells: 8,
      timeMs: 60_000,
    });
    expect(text.startsWith('Tetonor · Normal')).toBe(true);
    expect(text).toContain('🟩');
    expect(text).toContain('⬜');
  });
});
