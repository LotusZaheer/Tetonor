import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GameHeader({ onNewGame, isSolved, currentMode, onSetMode }) {
    const { t } = useTranslation();
    const modes = [
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
                            className={`btn-mode ${currentMode === m.id ? 'active' : ''}`}
                            onClick={() => onSetMode(m.id)}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>
            <p className="game-subtitle">{t('game.subtitle')}</p>
            <div className="header-actions">
                <button className="btn-new-game" onClick={onNewGame}>
                    {t('game.new_game')}
                </button>
                {isSolved && <span className="solved-badge">{t('game.solved')}</span>}
            </div>
        </header>
    );
}
