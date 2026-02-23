import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Single cell for the Normal board.
 */
function NormalCell({ task, answer, onAnswerChange, cellIdx, onKeyDown, inputRefs }) {
    const { t } = useTranslation();
    const [showOpSelector, setShowOpSelector] = React.useState(false);

    if (!answer) return <div className="normal-cell">{t('game.loading', 'Cargando...')}</div>;
    const isCorrect = answer.status === 'correct';
    const isWrong = answer.status === 'wrong';

    const handleInput = (field, e) => {
        onAnswerChange(field, e.target.value);
    };

    const handleOpSelect = (op) => {
        onAnswerChange('op', op);
        setShowOpSelector(false);
    };

    return (
        <div
            className={`normal-cell ${isCorrect ? 'pair-correct' : ''} ${isWrong ? 'pair-wrong' : ''}`}
            onMouseLeave={() => setShowOpSelector(false)}
        >
            <div className="task-header">
                <span className="task-value">{task.value}</span>
            </div>

            <div className="normal-inputs">
                <input
                    ref={(el) => (inputRefs.current[cellIdx * 3] = el)}
                    type="text"
                    className="num-input small"
                    placeholder="?"
                    value={answer.num1 || ''}
                    onChange={(e) => handleInput('num1', e)}
                    onKeyDown={(e) => onKeyDown(e, cellIdx, 0)}
                    disabled={isCorrect}
                />

                <div className="op-input-wrapper">
                    <input
                        ref={(el) => (inputRefs.current[cellIdx * 3 + 1] = el)}
                        type="text"
                        className="op-input"
                        placeholder="+/x"
                        value={answer.op === '*' ? 'x' : (answer.op || '')}
                        onChange={(e) => handleInput('op', e)}
                        onKeyDown={(e) => onKeyDown(e, cellIdx, 1)}
                        onFocus={() => !isCorrect && setShowOpSelector(true)}
                        onClick={() => !isCorrect && setShowOpSelector(true)}
                        disabled={isCorrect}
                        maxLength={1}
                        readOnly={false}
                    />

                    {showOpSelector && !isCorrect && (
                        <div className="op-selector-tooltip">
                            <button
                                className={`op-btn ${answer.op === '+' ? 'active' : ''}`}
                                onClick={() => handleOpSelect('+')}
                                type="button"
                            >+</button>
                            <button
                                className={`op-btn ${answer.op === '*' || answer.op === 'x' ? 'active' : ''}`}
                                onClick={() => handleOpSelect('*')}
                                type="button"
                            >x</button>
                        </div>
                    )}
                </div>

                <input
                    ref={(el) => (inputRefs.current[cellIdx * 3 + 2] = el)}
                    type="text"
                    className="num-input small"
                    placeholder="?"
                    value={answer.num2 || ''}
                    onChange={(e) => handleInput('num2', e)}
                    onKeyDown={(e) => onKeyDown(e, cellIdx, 2)}
                    disabled={isCorrect}
                />
            </div>
        </div>
    );
}

export default function NormalBoard({ tasks, answers, onAnswerChange }) {
    const { t } = useTranslation();
    const inputRefs = useRef([]);

    const handleKeyDown = (e, cellIdx, fieldIdx) => {
        const totalInputs = tasks.length * 3;
        const currentIdx = cellIdx * 3 + fieldIdx;

        let nextIdx = -1;

        if (e.key === 'ArrowRight') {
            nextIdx = (currentIdx + 1) % totalInputs;
        } else if (e.key === 'ArrowLeft') {
            nextIdx = (currentIdx - 1 + totalInputs) % totalInputs;
        } else if (e.key === 'ArrowDown') {
            // Move to same field in the cell below (4 cells per row * 3 inputs per cell = 12 inputs)
            nextIdx = (currentIdx + 4 * 3) % totalInputs;
        } else if (e.key === 'ArrowUp') {
            // Move to same field in the cell above
            nextIdx = (currentIdx - 4 * 3 + totalInputs) % totalInputs;
        }

        if (nextIdx !== -1) {
            e.preventDefault();
            inputRefs.current[nextIdx]?.focus();
            inputRefs.current[nextIdx]?.select();
        }
    };

    return (
        <div className="normal-board">
            <h2 className="section-label">{t('board.operaciones')} (4x4)</h2>
            <div className="normal-grid">
                {tasks.map((task, idx) => (
                    <NormalCell
                        key={idx}
                        cellIdx={idx}
                        task={task}
                        answer={answers[idx]}
                        onAnswerChange={(field, val) => onAnswerChange(idx, field, val)}
                        onKeyDown={handleKeyDown}
                        inputRefs={inputRefs}
                    />
                ))}
            </div>
        </div>
    );
}
