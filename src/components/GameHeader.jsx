import React from 'react';

export default function GameHeader({ onNewGame, isSolved, currentMode, onSetMode }) {
    const modes = [
        { id: 'easy', label: 'fácil' },
        { id: 'normal', label: 'normal' },
        { id: 'hard', label: 'difícil' },
    ];

    return (
        <header className="game-header">
            <h1 className="game-title">Tetonor</h1>

            <div className="difficulty-container">
                <span className="mode-label">Modo:</span>
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
            <p className="game-subtitle">Encuentra los pares que suman y multiplican</p>
            <div className="header-actions">
                <button className="btn-new-game" onClick={onNewGame}>
                    Nuevo Juego
                </button>
                {isSolved && <span className="solved-badge">🎉 ¡Completado!</span>}
            </div>
        </header>
    );
}
