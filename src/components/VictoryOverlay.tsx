import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameMode } from '../types/game';
import { formatDuration, type ModeStats, successRate } from '../utils/stats';
import { buildShareText, copyToClipboard } from '../utils/share';

interface VictoryOverlayProps {
  mode: GameMode;
  timeMs: number;
  totalCells: number;
  correctCells: number;
  stats: ModeStats;
  dailyKey: string | null;
  onClose: () => void;
  onNewGame: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function VictoryOverlay({
  mode,
  timeMs,
  totalCells,
  correctCells,
  stats,
  dailyKey,
  onClose,
  onNewGame,
}: VictoryOverlayProps) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstBtn = overlayRef.current?.querySelector<HTMLButtonElement>('button');
    firstBtn?.focus();
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !overlayRef.current) return;
      const focusables = Array.from(
        overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleShare = async () => {
    const text = buildShareText({
      mode,
      totalCells,
      correctCells,
      timeMs,
      dailyKey: dailyKey ?? undefined,
    });
    const ok = await copyToClipboard(text);
    setCopyState(ok ? 'copied' : 'failed');
    if (ok) {
      window.setTimeout(() => setCopyState('idle'), 2500);
    }
  };

  const isDaily = mode === 'daily';
  const playAgainLabel = isDaily
    ? t('victory.come_back_tomorrow', 'Vuelve mañana')
    : t('victory.new_game', 'Nueva partida');

  return (
    <div className="victory-overlay" role="dialog" aria-modal="true" aria-labelledby="victory-title">
      <div className="victory-confetti" aria-hidden="true">
        <span>🎉</span>
        <span>✨</span>
        <span>🎊</span>
        <span>⭐</span>
        <span>🎉</span>
        <span>✨</span>
      </div>
      <div className="victory-card" ref={overlayRef}>
        <button
          className="close-btn victory-close"
          onClick={onClose}
          aria-label={t('rules.close', 'Cerrar')}
        >
          &times;
        </button>
        <h2 id="victory-title" className="victory-title">
          {t('victory.title', '¡Resuelto!')}
        </h2>
        <p className="victory-subtitle">
          {isDaily && dailyKey
            ? t('victory.daily_subtitle', { date: dailyKey, defaultValue: 'Reto diario {{date}}' })
            : t('victory.mode_subtitle', { mode: t(`game.${mode}`), defaultValue: 'Modo {{mode}}' })}
        </p>

        <div className="victory-time" aria-live="polite">
          {formatDuration(timeMs)}
        </div>

        <dl className="victory-stats">
          <div>
            <dt>{t('victory.played', 'Jugadas')}</dt>
            <dd>{stats.played}</dd>
          </div>
          <div>
            <dt>{t('victory.success_rate', 'Éxito')}</dt>
            <dd>{successRate(stats)}%</dd>
          </div>
          <div>
            <dt>{t('victory.streak', 'Racha')}</dt>
            <dd>{stats.currentStreak}</dd>
          </div>
          <div>
            <dt>{t('victory.best_time', 'Mejor')}</dt>
            <dd>{stats.bestTimeMs !== null ? formatDuration(stats.bestTimeMs) : '—'}</dd>
          </div>
        </dl>

        <div className="victory-actions">
          <button className="btn-new-game victory-share" onClick={handleShare}>
            {copyState === 'copied'
              ? t('victory.copied', '¡Copiado!')
              : copyState === 'failed'
                ? t('victory.copy_failed', 'No se pudo copiar')
                : t('victory.share', 'Compartir resultado')}
          </button>
          {!isDaily && (
            <button className="btn-secondary" onClick={onNewGame}>
              {playAgainLabel}
            </button>
          )}
          {isDaily && (
            <p className="victory-hint">{t('victory.come_back_tomorrow_hint', 'Mañana hay un nuevo puzzle.')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
