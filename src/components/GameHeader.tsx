import { useTranslation } from 'react-i18next';
import type { GameMode } from '../types/game';
import { formatDuration } from '../utils/stats';

interface GameHeaderProps {
  onNewGame: () => void;
  isSolved: boolean;
  currentMode: GameMode;
  onSetMode: (mode: GameMode) => void;
  elapsedMs: number;
  showTimer: boolean;
}

export default function GameHeader({
  onNewGame,
  isSolved,
  currentMode,
  onSetMode,
  elapsedMs,
  showTimer,
}: GameHeaderProps) {
  const { t } = useTranslation();
  const modes: { id: GameMode; label: string }[] = [
    { id: 'daily', label: t('game.daily', 'Diario') },
    { id: 'very_easy', label: t('game.very_easy') },
    { id: 'easy', label: t('game.easy') },
    { id: 'rapido', label: t('game.rapido') },
    { id: 'normal', label: t('game.normal') },
    { id: 'hard', label: t('game.hard') },
  ];

  return (
    <header className="game-header">
      <h1 className="game-title">{t('game.title')}</h1>

      <div className="difficulty-container">
        <span className="mode-label">{t('game.mode')}</span>
        <div className="difficulty-selector">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`btn-mode ${m.id === 'daily' ? 'btn-mode--daily' : ''} ${currentMode === m.id ? 'active' : ''}`}
              onClick={() => onSetMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <p className="game-subtitle">{t('game.subtitle')}</p>
      <div className="header-actions">
        {currentMode !== 'daily' && (
          <button className="btn-new-game" onClick={onNewGame}>
            {t('game.new_game')}
          </button>
        )}
        {showTimer && (
          <span className="game-timer" aria-label={t('game.timer_label', 'Tiempo transcurrido')}>
            ⏱ {formatDuration(elapsedMs)}
          </span>
        )}
        {isSolved && <span className="solved-badge">{t('game.solved')}</span>}
      </div>
    </header>
  );
}
