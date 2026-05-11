import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GameHeader from './components/GameHeader';
import Board from './components/Board';
import NumberList from './components/NumberList';
import NormalBoard from './components/NormalBoard';
import RulesModal from './components/RulesModal';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';
import VictoryOverlay from './components/VictoryOverlay';
import { useGameState } from './hooks/useGameState';
import { useGameTimer } from './hooks/useGameTimer';
import { getModeStats, loadStats, recordWin, saveStats, type StatsByMode } from './utils/stats';
import type { GameMode } from './types/game';

const PAIR_MODES: readonly GameMode[] = ['very_easy', 'easy'];
const TASK_MODES: readonly GameMode[] = ['normal', 'rapido', 'daily'];

export default function App() {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [stats, setStats] = useState<StatsByMode>(() => loadStats());
  const [statusMessage, setStatusMessage] = useState('');
  const [finalTimeMs, setFinalTimeMs] = useState<number | null>(null);
  const previousPuzzleRef = useRef<unknown>(null);
  const recordedSolveRef = useRef<unknown>(null);

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
    correctCount,
    totalCells,
    dailyKey,
    setMode,
    startNewGame,
    setGuessedValues,
    updateEasyAnswer,
    updateNormalAnswer,
  } = useGameState('rapido');

  const timer = useGameTimer(puzzle, !!puzzle && !isSolved);

  useEffect(() => {
    if (puzzle && puzzle !== previousPuzzleRef.current) {
      previousPuzzleRef.current = puzzle;
      setStatusMessage(t('a11y.new_game_announcement', 'Nuevo juego cargado'));
      setShowVictory(false);
      setFinalTimeMs(null);
      recordedSolveRef.current = null;
    }
  }, [puzzle, t]);

  useEffect(() => {
    if (!isSolved || !puzzle || recordedSolveRef.current === puzzle) return;
    recordedSolveRef.current = puzzle;
    const elapsed = timer.elapsedMs;
    setFinalTimeMs(elapsed);
    setStats((prev) => {
      const next = recordWin(prev, {
        mode,
        timeMs: elapsed,
        dailyKey: dailyKey ?? undefined,
      });
      saveStats(next);
      return next;
    });
    setStatusMessage(t('a11y.solved_announcement', '¡Puzzle resuelto!'));
    setShowVictory(true);
  }, [isSolved, puzzle, mode, dailyKey, timer.elapsedMs, t]);

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

  const overlayTime = finalTimeMs ?? timer.elapsedMs;

  return (
    <div className={`app-container mode-${mode.replace('_', '-')}`}>
      <ThemeToggle />
      <button
        className="help-icon"
        onClick={() => setShowRules(true)}
        title={t('rules.view_rules')}
        aria-label={t('rules.view_rules')}
      >
        ?
      </button>

      <div role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <GameHeader
        onNewGame={startNewGame}
        isSolved={isSolved}
        currentMode={mode}
        onSetMode={setMode}
        elapsedMs={timer.elapsedMs}
        showTimer={!!puzzle && mode !== 'hard'}
      />
      <main className="game-main">{renderContent()}</main>
      <LanguageSelector />

      {showVictory && (
        <VictoryOverlay
          mode={mode}
          timeMs={overlayTime}
          totalCells={totalCells}
          correctCells={correctCount}
          stats={getModeStats(stats, mode)}
          dailyKey={dailyKey}
          onClose={() => setShowVictory(false)}
          onNewGame={() => {
            setShowVictory(false);
            startNewGame();
          }}
        />
      )}
    </div>
  );
}
