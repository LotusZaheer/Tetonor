import type { GameMode } from '../types/game';
import { formatDuration } from './stats';

const MODE_LABEL: Record<GameMode, string> = {
  very_easy: 'Mini',
  easy: 'Fácil',
  rapido: 'Rápido',
  normal: 'Normal',
  hard: 'Difícil',
  daily: 'Diario',
};

const APP_URL = 'https://lotuszaheer.github.io/Tetonor/';

export interface ShareInput {
  mode: GameMode;
  totalCells: number;
  correctCells: number;
  timeMs: number;
  dailyKey?: string;
}

/**
 * Builds the Wordle-style result block. Solved cells render as 🟩, anything
 * left blank as ⬜ — we don't yet track per-cell mistakes, so this is a
 * faithful summary of completeness rather than accuracy.
 */
export function buildShareText({ mode, totalCells, correctCells, timeMs, dailyKey }: ShareInput): string {
  const label = MODE_LABEL[mode] ?? mode;
  const cellsPerRow = mode === 'rapido' || mode === 'very_easy' ? 4 : 4;
  const cells = Array.from({ length: totalCells }, (_, i) => (i < correctCells ? '🟩' : '⬜'));
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += cellsPerRow) {
    rows.push(cells.slice(i, i + cellsPerRow).join(''));
  }
  const header =
    mode === 'daily' && dailyKey
      ? `Tetonor Diario ${dailyKey}`
      : `Tetonor · ${label}`;
  return `${header}\n${correctCells}/${totalCells} · ${formatDuration(timeMs)}\n${rows.join('\n')}\n${APP_URL}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy path.
  }

  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    return ok;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
