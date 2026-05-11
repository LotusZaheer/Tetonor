import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Answer, GuessedValues, Pair, Puzzle } from '../types/game';
import { getDisplayValue, isNumericOrLetter } from '../utils/gameLogic';

interface BoardProps {
  pairs: Pair[];
  answers: Answer[];
  onAnswerChange: (pairIdx: number, field: 'num1' | 'num2', value: string) => void;
  guessedValues: GuessedValues;
  puzzle: Puzzle;
}

export default function Board({ pairs, answers, onAnswerChange, guessedValues, puzzle }: BoardProps) {
  const { t } = useTranslation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const setRef = useCallback((el: HTMLInputElement | null, pairIdx: number, inputIdx: number) => {
    const flatIdx = pairIdx * 2 + inputIdx;
    inputRefs.current[flatIdx] = el;
  }, []);

  const focusInput = useCallback((flatIdx: number) => {
    const el = inputRefs.current[flatIdx];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, pairIdx: number, inputIdx: number) => {
      const flatIdx = pairIdx * 2 + inputIdx;
      const totalInputs = pairs.length * 2;

      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          focusInput((flatIdx + 1) % totalInputs);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          focusInput((flatIdx - 1 + totalInputs) % totalInputs);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          if (inputIdx === 0) focusInput(pairIdx * 2 + 1);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (inputIdx === 1) focusInput(pairIdx * 2);
          break;
        }
        default:
          break;
      }
    },
    [pairs.length, focusInput],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, pairIdx: number, field: 'num1' | 'num2') => {
      const val = e.target.value;
      if (isNumericOrLetter(val)) {
        onAnswerChange(pairIdx, field, val);
      }
    },
    [onAnswerChange],
  );

  const handleDrop = (e: React.DragEvent<HTMLInputElement>, pairIdx: number, field: 'num1' | 'num2') => {
    e.preventDefault();
    setDragOverIdx(null);
    const val = e.dataTransfer.getData('text/plain');
    if (val && isNumericOrLetter(val)) {
      onAnswerChange(pairIdx, field, val);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLInputElement>, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  return (
    <section className="board-section">
      <h2 className="section-label">{t('board.tablero')}</h2>
      <div className="board-grid">
        {pairs.map((pair, pairIdx) => {
          const ans = answers[pairIdx];
          if (!ans) return null;
          const statusClass =
            ans.status === 'correct' ? 'pair-correct' : ans.status === 'wrong' ? 'pair-wrong' : '';

          const isGuessed1 = /^[a-h]$/.test(ans.num1);
          const isGuessed2 = /^[a-h]$/.test(ans.num2);

          return (
            <div key={pairIdx} className={`pair-column ${statusClass}`}>
              <div className="pair-results">
                <div className="result-cell sum-cell">
                  <span className="op-label">+</span>
                  <span className="result-value">{pair.sum}</span>
                </div>
                <div className="result-cell product-cell">
                  <span className="op-label">×</span>
                  <span className="result-value">{pair.product}</span>
                </div>
              </div>
              <div className="pair-inputs">
                <input
                  ref={(el) => setRef(el, pairIdx, 0)}
                  type="text"
                  inputMode="numeric"
                  className={`num-input ${dragOverIdx === pairIdx * 2 ? 'drag-over' : ''} ${isGuessed1 ? 'guessed-value' : ''}`}
                  value={getDisplayValue(ans.num1, puzzle, guessedValues)}
                  onChange={(e) => handleChange(e, pairIdx, 'num1')}
                  onKeyDown={(e) => handleKeyDown(e, pairIdx, 0)}
                  onDrop={(e) => handleDrop(e, pairIdx, 'num1')}
                  onDragOver={(e) => handleDragOver(e, pairIdx * 2)}
                  onDragLeave={() => setDragOverIdx(null)}
                  placeholder="?"
                  disabled={ans.status === 'correct'}
                  aria-label={t('board.pair_num_1', { num: pairIdx + 1, defaultValue: `Par ${pairIdx + 1}, número 1` })}
                  tabIndex={0}
                />
                <input
                  ref={(el) => setRef(el, pairIdx, 1)}
                  type="text"
                  inputMode="numeric"
                  className={`num-input ${dragOverIdx === pairIdx * 2 + 1 ? 'drag-over' : ''} ${isGuessed2 ? 'guessed-value' : ''}`}
                  value={getDisplayValue(ans.num2, puzzle, guessedValues)}
                  onChange={(e) => handleChange(e, pairIdx, 'num2')}
                  onKeyDown={(e) => handleKeyDown(e, pairIdx, 1)}
                  onDrop={(e) => handleDrop(e, pairIdx, 'num2')}
                  onDragOver={(e) => handleDragOver(e, pairIdx * 2 + 1)}
                  onDragLeave={() => setDragOverIdx(null)}
                  placeholder="?"
                  disabled={ans.status === 'correct'}
                  aria-label={t('board.pair_num_2', { num: pairIdx + 1, defaultValue: `Par ${pairIdx + 1}, número 2` })}
                  tabIndex={0}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
