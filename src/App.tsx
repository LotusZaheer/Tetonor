import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GameHeader from './components/GameHeader';
import Board from './components/Board';
import NumberList from './components/NumberList';
import NormalBoard from './components/NormalBoard';
import RulesModal from './components/RulesModal';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import { useGameState } from './hooks/useGameState';
import type { GameMode } from './types/game';

const PAIR_MODES: readonly GameMode[] = ['very_easy', 'easy'];
const TASK_MODES: readonly GameMode[] = ['normal', 'rapido'];

export default function App() {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);

  const {
    mode,
    puzzle,
    answers,
    guessedValues,
    isSolved,
    usedNumbers,
    limit,
    remainingSums,
    remainingProds,
    setMode,
    startNewGame,
    setGuessedValues,
    updateEasyAnswer,
    updateNormalAnswer,
  } = useGameState('rapido');

  const renderContent = () => {
    if (mode === 'hard') {
      return (
        <div className="placeholder-container">
          <div className="placeholder-card">
            <h2 className="placeholder-title">{t('rules.hard_title')}</h2>
            <p className="placeholder-text">{t('rules.coming_soon')}</p>
            <p className="placeholder-text">{t('rules.coming_soon_desc', 'Estamos diseñando los desafíos de este nivel.')}</p>
            <button className="btn-new-game" onClick={() => setMode('easy')}>
              {t('rules.back_to_easy', 'Volver al Modo Fácil')}
            </button>
          </div>
        </div>
      );
    }

    if (!puzzle) return null;

    const requiredAnswers = PAIR_MODES.includes(mode) ? puzzle.pairs.length : puzzle.normalTasks.length;
    if (answers.length !== requiredAnswers) {
      return (
        <div className="placeholder-container">
          <p className="placeholder-text">{t('game.loading', 'Cargando modo...')}</p>
        </div>
      );
    }

    if (TASK_MODES.includes(mode)) {
      const isRapido = mode === 'rapido';
      return (
        <>
          <NormalBoard
            tasks={puzzle.normalTasks}
            answers={answers}
            onAnswerChange={updateNormalAnswer}
            guessedValues={guessedValues}
            puzzle={puzzle}
            sumLimit={limit}
            prodLimit={limit}
          />
          <div className="mobile-only mobile-numbers-wrapper">
            <NumberList
              puzzle={puzzle}
              usedNumbers={usedNumbers}
              guessedValues={guessedValues}
              setGuessedValues={setGuessedValues}
              className="mobile-list-compact"
              remainingSums={remainingSums}
              remainingProds={remainingProds}
              sumLimit={limit}
              prodLimit={limit}
            />
            <div className="mobile-counters-box side-counters">
              <h3 className="section-title small">{t('board.operaciones')}</h3>
              <div className="mobile-counter-text vertical">
                <span>+: <span className={`counter-val ${remainingSums === 0 ? 'text-red' : ''}`}>{remainingSums}/{limit}</span></span>
                <span>x: <span className={`counter-val ${remainingProds === 0 ? 'text-red' : ''}`}>{remainingProds}/{limit}</span></span>
              </div>
            </div>
          </div>

          <div className="desktop-only">
            <NumberList
              puzzle={puzzle}
              usedNumbers={usedNumbers}
              guessedValues={guessedValues}
              setGuessedValues={setGuessedValues}
              className={isRapido ? 'number-list-compact grid-mini' : ''}
              remainingSums={remainingSums}
              remainingProds={remainingProds}
              sumLimit={limit}
              prodLimit={limit}
            />
          </div>
        </>
      );
    }

    if (mode === 'very_easy') {
      return (
        <>
          <Board
            pairs={puzzle.pairs}
            answers={answers}
            onAnswerChange={updateEasyAnswer}
            guessedValues={guessedValues}
            puzzle={puzzle}
          />

          <div className="mobile-only mobile-numbers-wrapper">
            <NumberList
              puzzle={puzzle}
              usedNumbers={usedNumbers}
              guessedValues={guessedValues}
              setGuessedValues={setGuessedValues}
              className="mobile-list-compact"
            />
          </div>

          <div className="desktop-only">
            <NumberList
              puzzle={puzzle}
              usedNumbers={usedNumbers}
              guessedValues={guessedValues}
              setGuessedValues={setGuessedValues}
              className="number-list-compact grid-mini"
            />
          </div>
        </>
      );
    }

    return (
      <>
        <Board
          pairs={puzzle.pairs}
          answers={answers}
          onAnswerChange={updateEasyAnswer}
          guessedValues={guessedValues}
          puzzle={puzzle}
        />
        <NumberList
          puzzle={puzzle}
          usedNumbers={usedNumbers}
          guessedValues={guessedValues}
          setGuessedValues={setGuessedValues}
        />
      </>
    );
  };

  return (
    <div className={`app-container mode-${mode.replace('_', '-')}`}>
      <ThemeToggle />
      <button
        className="help-icon"
        onClick={() => setShowRules(true)}
        title={t('rules.view_rules')}
      >
        ?
      </button>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <GameHeader
        onNewGame={startNewGame}
        isSolved={isSolved}
        currentMode={mode}
        onSetMode={setMode}
      />
      <main className="game-main">{renderContent()}</main>
      <LanguageSelector />
    </div>
  );
}
