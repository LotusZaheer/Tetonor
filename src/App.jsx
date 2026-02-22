import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generatePuzzle, checkPairAnswer, checkAllAnswers } from './utils/gameEngine';
import GameHeader from './components/GameHeader';
import Board from './components/Board';
import NumberList from './components/NumberList';

function createInitialAnswers(count) {
  return Array.from({ length: count }, () => ({
    num1: '',
    num2: '',
    status: null,
  }));
}

export default function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [mode, setMode] = useState('easy');

  const startNewGame = useCallback(() => {
    const p = generatePuzzle();
    setPuzzle(p);
    setAnswers(createInitialAnswers(p.pairs.length));
    setIsSolved(false);
  }, []);

  useEffect(() => {
    if (mode === 'easy') {
      startNewGame();
    }
  }, [startNewGame, mode]);

  const handleAnswerChange = useCallback((pairIdx, field, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      const updatedAns = { ...next[pairIdx], [field]: value, status: null };

      // Automatic verification if both numbers are present
      if (updatedAns.num1 !== '' && updatedAns.num1 !== null &&
        updatedAns.num2 !== '' && updatedAns.num2 !== null) {

        const n1 = typeof updatedAns.num1 === 'string' ? parseInt(updatedAns.num1, 10) : updatedAns.num1;
        const n2 = typeof updatedAns.num2 === 'string' ? parseInt(updatedAns.num2, 10) : updatedAns.num2;

        const correct = checkPairAnswer(
          puzzle.pairs[pairIdx],
          n1,
          n2
        );

        updatedAns.status = correct ? 'correct' : 'wrong';
      }

      next[pairIdx] = updatedAns;

      // Check if ALL are now correct
      const allCorrect = next.every((a) => a.status === 'correct');
      if (allCorrect) {
        setIsSolved(true);
      }

      return next;
    });
  }, [puzzle]);

  // Collect all numbers the player has entered so far (only for correct pairs)
  const usedNumbers = useMemo(() => {
    const nums = [];
    answers.forEach((ans) => {
      if (ans.status === 'correct') {
        if (ans.num1 !== '' && ans.num1 !== null) {
          const n = typeof ans.num1 === 'string' ? parseInt(ans.num1, 10) : ans.num1;
          if (!isNaN(n)) nums.push(n);
        }
        if (ans.num2 !== '' && ans.num2 !== null) {
          const n = typeof ans.num2 === 'string' ? parseInt(ans.num2, 10) : ans.num2;
          if (!isNaN(n)) nums.push(n);
        }
      }
    });
    return nums;
  }, [answers]);

  const renderContent = () => {
    if (mode === 'normal' || mode === 'hard') {
      return (
        <div className="placeholder-container">
          <div className="placeholder-card">
            <h2 className="placeholder-title">Modo {mode === 'normal' ? 'Normal' : 'Difícil'}</h2>
            <p className="placeholder-text">Próximamente...</p>
            <p className="placeholder-text">Estamos diseñando los desafíos de este nivel.</p>
            <button className="btn-new-game" onClick={() => setMode('easy')}>Volver al Modo Fácil</button>
          </div>
        </div>
      );
    }

    if (!puzzle) return null;

    return (
      <>
        <Board
          pairs={puzzle.pairs}
          answers={answers}
          onAnswerChange={handleAnswerChange}
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
    <div className="app-container">
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

