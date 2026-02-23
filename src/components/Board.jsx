import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function Board({ pairs, answers, onAnswerChange, guessedValues, puzzle }) {
    const { t } = useTranslation();
    const inputRefs = useRef([]);
    const [dragOverIdx, setDragOverIdx] = React.useState(null);

    const setRef = useCallback((el, pairIdx, inputIdx) => {
        const flatIdx = pairIdx * 2 + inputIdx;
        inputRefs.current[flatIdx] = el;
    }, []);

    const focusInput = useCallback((flatIdx) => {
        const el = inputRefs.current[flatIdx];
        if (el) {
            el.focus();
            el.select();
        }
    }, []);

    const getDisplayValue = (v) => {
        if (!v) return '';
        if (/^[a-h]$/.test(v)) {
            const hiddenIndices = puzzle.sortedNumbers
                .map((_, i) => i)
                .filter(i => !puzzle.visibleIndices.has(i));
            const letterIdx = hiddenIndices[v.charCodeAt(0) - 97];
            return guessedValues[letterIdx] || v;
        }
        return v;
    };

    const handleKeyDown = useCallback(
        (e, pairIdx, inputIdx) => {
            const flatIdx = pairIdx * 2 + inputIdx;
            const totalInputs = pairs.length * 2;

            switch (e.key) {
                case 'ArrowRight': {
                    e.preventDefault();
                    const next = (flatIdx + 1) % totalInputs;
                    focusInput(next);
                    break;
                }
                case 'ArrowLeft': {
                    e.preventDefault();
                    const prev = (flatIdx - 1 + totalInputs) % totalInputs;
                    focusInput(prev);
                    break;
                }
                case 'ArrowDown': {
                    e.preventDefault();
                    if (inputIdx === 0) {
                        focusInput(pairIdx * 2 + 1);
                    }
                    break;
                }
                case 'ArrowUp': {
                    e.preventDefault();
                    if (inputIdx === 1) {
                        focusInput(pairIdx * 2);
                    }
                    break;
                }
                default:
                    break;
            }
        },
        [pairs.length, focusInput]
    );

    const handleChange = useCallback(
        (e, pairIdx, field) => {
            const val = e.target.value;
            if (val === '' || /^\d+$/.test(val) || /^[a-h]$/.test(val)) {
                onAnswerChange(pairIdx, field, val === '' ? '' : (isNaN(val) ? val : parseInt(val, 10)));
            }
        },
        [onAnswerChange]
    );

    const handleDrop = (e, pairIdx, field) => {
        e.preventDefault();
        setDragOverIdx(null);
        const val = e.dataTransfer.getData('text/plain');
        if (val && (/^\d+$/.test(val) || /^[a-h]$/.test(val))) {
            const finalVal = isNaN(val) ? val : parseInt(val, 10);
            onAnswerChange(pairIdx, field, finalVal);
        }
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        setDragOverIdx(idx);
    };

    return (
        <section className="board-section">
            <h2 className="section-label">{t('board.tablero')}</h2>
            <div className="board-grid">
                {pairs.map((pair, pairIdx) => {
                    const ans = answers[pairIdx];
                    if (!ans) return null; // Defensive guard
                    const statusClass = ans.status === 'correct'
                        ? 'pair-correct'
                        : ans.status === 'wrong'
                            ? 'pair-wrong'
                            : '';

                    const isGuessed1 = /^[a-h]$/.test(ans.num1) && guessedValues;
                    const isGuessed2 = /^[a-h]$/.test(ans.num2) && guessedValues;

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
                                    value={getDisplayValue(ans.num1)}
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
                                    value={getDisplayValue(ans.num2)}
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
