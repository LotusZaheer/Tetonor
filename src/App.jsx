import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePuzzle, generateMiniPuzzle, checkPairAnswer, checkTask } from './utils/gameEngine';
import GameHeader from './components/GameHeader';
import Board from './components/Board';
import NumberList from './components/NumberList';
import NormalBoard from './components/NormalBoard';
import HelperSidebar from './components/HelperSidebar';
import RulesModal from './components/RulesModal';
import ThemeToggle from './components/ThemeToggle';
import LanguageSelector from './components/LanguageSelector';

function createInitialAnswers(count, isNormal = false) {
  return Array.from({ length: count }, () => ({
    num1: '',
    num2: '',
    op: isNormal ? '' : null,
    status: null,
  }));
}

export default function App() {
  const { t } = useTranslation();
  const [puzzle, setPuzzle] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [mode, setMode] = useState('rapido');
  const [showRules, setShowRules] = useState(false);
  const [guessedValues, setGuessedValues] = useState({}); // { [slotIdx]: number }

  const startNewGame = useCallback(() => {
    const p = (mode === 'very_easy' || mode === 'rapido') ? generateMiniPuzzle() : generatePuzzle();
    setPuzzle(p);
    const count = (mode === 'easy' || mode === 'very_easy') ? p.pairs.length : p.normalTasks.length;
    setAnswers(createInitialAnswers(count, mode === 'normal' || mode === 'rapido'));
    setGuessedValues({});
    setIsSolved(false);
  }, [mode]);

  useEffect(() => {
    startNewGame();
  }, [mode]); // Just mode is enough as dependency if logic is inside

  const handleEasyAnswerChange = (pairIdx, field, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      const updatedAns = { ...next[pairIdx], [field]: value, status: null };

      const resolveValue = (v) => {
        if (/^[a-h]$/.test(v)) {
          const hiddenIndices = puzzle.sortedNumbers
            .map((_, i) => i)
            .filter(i => !puzzle.visibleIndices.has(i));
          const letterIdx = hiddenIndices[v.charCodeAt(0) - 97];
          return guessedValues[letterIdx];
        }
        return parseInt(v, 10);
      };

      const n1 = resolveValue(updatedAns.num1);
      const n2 = resolveValue(updatedAns.num2);

      if (n1 && n2) {
        const correct = checkPairAnswer(puzzle.pairs[pairIdx], n1, n2);
        updatedAns.status = correct ? 'correct' : 'wrong';
      }

      next[pairIdx] = updatedAns;
      if (next.every((a) => a.status === 'correct')) setIsSolved(true);
      return next;
    });
  };

  const handleNormalAnswerChange = (idx, field, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      let val = value;
      if (field === 'op' && (value === 'x' || value === '*')) val = '*';

      const updatedAns = { ...next[idx], [field]: val, status: null };

      const resolveValue = (v) => {
        if (/^[a-h]$/.test(v)) {
          const hiddenIndices = puzzle.sortedNumbers
            .map((_, i) => i)
            .filter(i => !puzzle.visibleIndices.has(i));
          const letterIdx = hiddenIndices[v.charCodeAt(0) - 97];
          return guessedValues[letterIdx];
        }
        return parseInt(v, 10);
      };

      const n1 = resolveValue(updatedAns.num1);
      const n2 = resolveValue(updatedAns.num2);

      if (n1 && n2 && updatedAns.op) {
        const correct = checkTask(puzzle.normalTasks[idx], n1, n2, updatedAns.op);
        updatedAns.status = correct ? 'correct' : 'wrong';
      }

      next[idx] = updatedAns;
      if (next.every((a) => a.status === 'correct')) setIsSolved(true);
      return next;
    });
  };

  const usedNumbers = useMemo(() => {
    const sumUsed = [];
    const prodUsed = [];
    const claimed = [];

    answers.forEach((ans) => {
      if (ans.status === 'correct') {
        const resolveValue = (v) => {
          if (/^[a-h]$/.test(v)) {
            const hiddenIndices = puzzle.sortedNumbers
              .map((_, i) => i)
              .filter(i => !puzzle.visibleIndices.has(i));
            const letterIdx = hiddenIndices[v.charCodeAt(0) - 97];
            return guessedValues[letterIdx];
          }
          return parseInt(v, 10);
        };
        const n1 = resolveValue(ans.num1);
        const n2 = resolveValue(ans.num2);

        if (mode === 'easy' || mode === 'very_easy') {
          if (!isNaN(n1)) { sumUsed.push(n1); prodUsed.push(n1); claimed.push(n1); }
          if (!isNaN(n2)) { sumUsed.push(n2); prodUsed.push(n2); claimed.push(n2); }
        } else {
          const isSum = ans.op === '+';
          if (!isNaN(n1)) {
            if (isSum) sumUsed.push(n1); else prodUsed.push(n1);
            claimed.push(n1);
          }
          if (!isNaN(n2)) {
            if (isSum) sumUsed.push(n2); else prodUsed.push(n2);
            claimed.push(n2);
          }
        }
      }
    });
    return { sumUsed, prodUsed, claimed };
  }, [answers, guessedValues, puzzle, mode]);

  const renderContent = () => {
    if (mode === 'hard') {
      return (
        <div className="placeholder-container">
          <div className="placeholder-card">
            <h2 className="placeholder-title">{t('rules.hard_title')}</h2>
            <p className="placeholder-text">{t('rules.coming_soon')}</p>
            <p className="placeholder-text">{t('rules.coming_soon_desc', 'Estamos diseñando los desafíos de este nivel.')}</p>
            <button className="btn-new-game" onClick={() => setMode('easy')}>{t('rules.back_to_easy', 'Volver al Modo Fácil')}</button>
          </div>
        </div>
      );
    }

    if (!puzzle) return null;

    const requiredAnswers = (mode === 'easy' || mode === 'very_easy') ? puzzle.pairs.length : puzzle.normalTasks.length;
    if (answers.length !== requiredAnswers) {
      return (
        <div className="placeholder-container">
          <p className="placeholder-text">{t('game.loading', 'Cargando modo...')}</p>
        </div>
      );
    }

    const isRapido = mode === 'rapido';
    const limit = isRapido ? 4 : 8;
    const sumCount = answers.filter(a => a.op === '+').length;
    const prodCount = answers.filter(a => (a.op === '*' || a.op === 'x')).length;
    const remainingSums = Math.max(0, limit - sumCount);
    const remainingProds = Math.max(0, limit - prodCount);

    if (mode === 'normal' || mode === 'rapido') {
      return (
        <>
          <NormalBoard
            tasks={puzzle.normalTasks}
            answers={answers}
            onAnswerChange={handleNormalAnswerChange}
            guessedValues={guessedValues}
            puzzle={puzzle}
            sumCount={sumCount}
            prodCount={prodCount}
            sumLimit={limit}
            prodLimit={limit}
          />
          <div className="mobile-only mobile-numbers-wrapper">
            <NumberList
              sortedNumbers={puzzle.sortedNumbers}
              visibleIndices={puzzle.visibleIndices}
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
              sortedNumbers={puzzle.sortedNumbers}
              visibleIndices={puzzle.visibleIndices}
              usedNumbers={usedNumbers}
              guessedValues={guessedValues}
              setGuessedValues={setGuessedValues}
              className={isRapido ? "number-list-compact grid-mini" : ""}
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
            onAnswerChange={handleEasyAnswerChange}
            guessedValues={guessedValues}
            puzzle={puzzle}
          />

          <div className="mobile-only mobile-numbers-wrapper">
            <NumberList
              sortedNumbers={puzzle.sortedNumbers}
              visibleIndices={puzzle.visibleIndices}
              usedNumbers={usedNumbers}
              guessedValues={guessedValues}
              setGuessedValues={setGuessedValues}
              className="mobile-list-compact"
            />
          </div>

          <div className="desktop-only">
            <NumberList
              sortedNumbers={puzzle.sortedNumbers}
              visibleIndices={puzzle.visibleIndices}
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
          onAnswerChange={handleEasyAnswerChange}
          guessedValues={guessedValues}
          puzzle={puzzle}
        />
        <NumberList
          sortedNumbers={puzzle.sortedNumbers}
          visibleIndices={puzzle.visibleIndices}
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
        onSetMode={(m) => setMode(m)}
      />
      <main className="game-main">
        {renderContent()}
      </main>
      <LanguageSelector />
    </div>
  );
}

