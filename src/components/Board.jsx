import React, { useRef, useCallback } from 'react';

export default function Board({ pairs, answers, onAnswerChange }) {
    const inputRefs = useRef([]);

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
            if (val === '' || /^\d+$/.test(val)) {
                onAnswerChange(pairIdx, field, val === '' ? '' : parseInt(val, 10));
            }
        },
        [onAnswerChange]
    );

    return (
        <section className="board-section">
            <h2 className="section-label">Tablero</h2>
            <div className="board-grid">
                {pairs.map((pair, pairIdx) => {
                    const ans = answers[pairIdx];
                    const statusClass = ans.status === 'correct'
                        ? 'pair-correct'
                        : ans.status === 'wrong'
                            ? 'pair-wrong'
                            : '';

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
                                    pattern="[0-9]*"
                                    className="num-input"
                                    value={ans.num1 === '' || ans.num1 === null ? '' : ans.num1}
                                    onChange={(e) => handleChange(e, pairIdx, 'num1')}
                                    onKeyDown={(e) => handleKeyDown(e, pairIdx, 0)}
                                    placeholder="?"
                                    disabled={ans.status === 'correct'}
                                    aria-label={`Par ${pairIdx + 1}, número 1`}
                                    tabIndex={0}
                                />
                                <input
                                    ref={(el) => setRef(el, pairIdx, 1)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    className="num-input"
                                    value={ans.num2 === '' || ans.num2 === null ? '' : ans.num2}
                                    onChange={(e) => handleChange(e, pairIdx, 'num2')}
                                    onKeyDown={(e) => handleKeyDown(e, pairIdx, 1)}
                                    placeholder="?"
                                    disabled={ans.status === 'correct'}
                                    aria-label={`Par ${pairIdx + 1}, número 2`}
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
