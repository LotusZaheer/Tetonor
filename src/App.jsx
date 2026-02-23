import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePuzzle, checkPairAnswer, checkTask } from './utils/gameEngine';
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
  const [mode, setMode] = useState('normal');
  const [showRules, setShowRules] = useState(false);
  const [guessedValues, setGuessedValues] = useState({}); // { [slotIdx]: number }

  const startNewGame = useCallback(() => {
    const p = generatePuzzle();
    setPuzzle(p);
    const count = mode === 'easy' ? p.pairs.length : p.normalTasks.length;
    setAnswers(createInitialAnswers(count, mode === 'normal'));
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
          // Find index of letter
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
    const nums = [];
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
        if (!isNaN(n1)) nums.push(n1);
        if (!isNaN(n2)) nums.push(n2);
      }
    });
    return nums;
  }, [answers, guessedValues, puzzle]);

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

    const requiredAnswers = mode === 'easy' ? puzzle.pairs.length : puzzle.normalTasks.length;
    if (answers.length !== requiredAnswers) {
      return (
        <div className="placeholder-container">
          <p className="placeholder-text">{t('game.loading', 'Cargando modo...')}</p>
        </div>
      );
    }

    const sumCount = answers.filter(a => a.status === 'correct' && a.op === '+').length;
    const prodCount = answers.filter(a => a.status === 'correct' && (a.op === '*' || a.op === 'x')).length;
    const remainingSums = Math.max(0, 8 - sumCount);
    const remainingProds = Math.max(0, 8 - prodCount);

    if (mode === 'normal') {
      return (
        <div className="normal-layout">
          <div className="layout-left">
            <NormalBoard
              tasks={puzzle.normalTasks}
              answers={answers}
              onAnswerChange={handleNormalAnswerChange}
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
              <div className="mobile-counters-box side-counters">
                <h3 className="section-title small">{t('board.operaciones')}</h3>
                <div className="mobile-counter-text vertical">
                  <span>+: {remainingSums}/8</span>
                  <span>x: {remainingProds}/8</span>
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
              />
            </div>
          </div>
          <HelperSidebar
            answers={answers}
            tasks={puzzle.normalTasks}
            isWeb={true}
          />
        </div>
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
    <div className={`app-container mode-${mode}`}>
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

