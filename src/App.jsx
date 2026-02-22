import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generatePuzzle, checkPairAnswer, checkTask } from './utils/gameEngine';
import GameHeader from './components/GameHeader';
import Board from './components/Board';
import NumberList from './components/NumberList';
import NormalBoard from './components/NormalBoard';
import HelperSidebar from './components/HelperSidebar';

function createInitialAnswers(count, isNormal = false) {
  return Array.from({ length: count }, () => ({
    num1: '',
    num2: '',
    op: isNormal ? '' : null,
    status: null,
  }));
}

export default function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [mode, setMode] = useState('normal');

  const startNewGame = useCallback(() => {
    const p = generatePuzzle();
    setPuzzle(p);
    const count = mode === 'easy' ? p.pairs.length : p.normalTasks.length;
    setAnswers(createInitialAnswers(count, mode === 'normal'));
    setIsSolved(false);
  }, [mode]);

  useEffect(() => {
    startNewGame();
  }, [mode]); // Just mode is enough as dependency if logic is inside

  const handleEasyAnswerChange = (pairIdx, field, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      const updatedAns = { ...next[pairIdx], [field]: value, status: null };

      if (updatedAns.num1 && updatedAns.num2) {
        const n1 = parseInt(updatedAns.num1, 10);
        const n2 = parseInt(updatedAns.num2, 10);
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
      // Normalize operation: * or x -> *
      let val = value;
      if (field === 'op' && (value === 'x' || value === '*')) val = '*';

      const updatedAns = { ...next[idx], [field]: val, status: null };

      if (updatedAns.num1 && updatedAns.num2 && updatedAns.op) {
        const n1 = parseInt(updatedAns.num1, 10);
        const n2 = parseInt(updatedAns.num2, 10);
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
        const n1 = parseInt(ans.num1, 10);
        const n2 = parseInt(ans.num2, 10);
        if (!isNaN(n1)) nums.push(n1);
        if (!isNaN(n2)) nums.push(n2);
      }
    });
    return nums;
  }, [answers]);

  const renderContent = () => {
    if (mode === 'hard') {
      return (
        <div className="placeholder-container">
          <div className="placeholder-card">
            <h2 className="placeholder-title">Modo Difícil</h2>
            <p className="placeholder-text">Próximamente...</p>
            <p className="placeholder-text">Estamos diseñando los desafíos de este nivel.</p>
            <button className="btn-new-game" onClick={() => setMode('easy')}>Volver al Modo Fácil</button>
          </div>
        </div>
      );
    }

    if (!puzzle) return null;

    // GUARD: Ensure answers array matches the mode's requirement
    // This prevents crashes during the transitional render when mode changes but answers haven't updated yet.
    const requiredAnswers = mode === 'easy' ? puzzle.pairs.length : puzzle.normalTasks.length;
    if (answers.length !== requiredAnswers) {
      return (
        <div className="placeholder-container">
          <p className="placeholder-text">Cargando modo...</p>
        </div>
      );
    }
    if (!puzzle) return null;

    // Move counters logic here or use a component
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
            />
            {/* Mobile Layout: Numbers + Counters on side */}
            <div className="mobile-only mobile-numbers-wrapper">
              <NumberList
                sortedNumbers={puzzle.sortedNumbers}
                visibleIndices={puzzle.visibleIndices}
                usedNumbers={usedNumbers}
                className="mobile-list-compact"
              />
              <div className="mobile-counters-box side-counters">
                <h3 className="section-title small">Operaciones</h3>
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
        />
        <NumberList
          sortedNumbers={puzzle.sortedNumbers}
          visibleIndices={puzzle.visibleIndices}
          usedNumbers={usedNumbers}
        />
      </>
    );
  };

  return (
    <div className={`app-container mode-${mode}`}>
      <GameHeader
        onNewGame={startNewGame}
        isSolved={isSolved}
        currentMode={mode}
        onSetMode={(m) => setMode(m)}
      />
      <main className="game-main">
        {renderContent()}
      </main>
      <footer className="game-footer">
        <p>Tab / Shift+Tab para navegar · Flechas para moverse · Verificación automática</p>
      </footer>
    </div>
  );
}

