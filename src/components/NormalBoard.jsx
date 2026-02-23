import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Single cell for the Normal board.
 */
function NormalCell({ task, answer, onAnswerChange, cellIdx, onKeyDown, inputRefs, guessedValues, puzzle, sumCount, prodCount, sumLimit, prodLimit }) {
    const { t } = useTranslation();
    const [showOpSelector, setShowOpSelector] = React.useState(false);
    const [dragOverField, setDragOverField] = React.useState(null); // 'num1' or 'num2'

    if (!answer) return <div className="normal-cell">{t('game.loading', 'Cargando...')}</div>;
    const isCorrect = answer.status === 'correct';
    const isWrong = answer.status === 'wrong';

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

    const handleInput = (field, e) => {
        onAnswerChange(field, e.target.value);
    };

    const handleOpKeyDown = (e) => {
        // Allow navigation keys
        if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Backspace', 'Delete'].includes(e.key)) {
            onKeyDown(e, cellIdx, 1);
            return;
        }

        const validOps = ['+', '*', 'x', 'X'];
        if (validOps.includes(e.key)) {
            e.preventDefault();
            const op = (e.key === 'x' || e.key === 'X') ? '*' : e.key;

            // Check limits before allowing change
            const isSum = op === '+';
            const isProd = op === '*';
            const currentIsSum = answer.op === '+';
            const currentIsProd = answer.op === '*' || answer.op === 'x';

            if (isSum && sumCount >= sumLimit && !currentIsSum) return;
            if (isProd && prodCount >= prodLimit && !currentIsProd) return;

            onAnswerChange('op', op);
            return;
        }
    };

    const handleOpSelect = (op) => {
        onAnswerChange('op', op);
        setShowOpSelector(false);
    };

    const handleDrop = (e, field) => {
        e.preventDefault();
        setDragOverField(null);
        const val = e.dataTransfer.getData('text/plain');
        if (val && (/^\d+$/.test(val) || /^[a-h]$/.test(val))) {
            const finalVal = isNaN(val) ? val : parseInt(val, 10);
            onAnswerChange(field, finalVal);
        }
    };

    const handleDragOver = (e, field) => {
        e.preventDefault();
        setDragOverField(field);
    };

    const isGuessed1 = /^[a-h]$/.test(answer.num1) && guessedValues;
    const isGuessed2 = /^[a-h]$/.test(answer.num2) && guessedValues;

    // Determine if operators are disabled
    const plusDisabled = sumCount >= sumLimit && answer.op !== '+';
    const multDisabled = prodCount >= sumLimit && (answer.op !== '*' && answer.op !== 'x');

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
                    className={`num-input small ${dragOverField === 'num1' ? 'drag-over' : ''} ${isGuessed1 ? 'guessed-value' : ''}`}
                    placeholder="?"
                    value={getDisplayValue(answer.num1)}
                    onChange={(e) => handleInput('num1', e)}
                    onKeyDown={(e) => onKeyDown(e, cellIdx, 0)}
                    onDrop={(e) => handleDrop(e, 'num1')}
                    onDragOver={(e) => handleDragOver(e, 'num1')}
                    onDragLeave={() => setDragOverField(null)}
                    disabled={isCorrect}
                />
                <button
                    ref={(el) => (inputRefs.current[cellIdx * 3 + 1] = el)}
                    className={`op-btn ${answer.op === '*' ? 'prod' : answer.op === '+' ? 'sum' : ''}`}
                    onClick={() => !isCorrect && setShowOpSelector(!showOpSelector)}
                    onKeyDown={handleOpKeyDown}
                    disabled={isCorrect}
                >
                    {answer.op === '*' ? '×' : answer.op || '?'}
                    {showOpSelector && (
                        <div className="op-selector">
                            <button
                                className="op-option sum"
                                onClick={(e) => { e.stopPropagation(); handleOpSelect('+'); }}
                                disabled={plusDisabled}
                            >
                                +
                            </button>
                            <button
                                className="op-option prod"
                                onClick={(e) => { e.stopPropagation(); handleOpSelect('*'); }}
                                disabled={multDisabled}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </button>
                <input
                    ref={(el) => (inputRefs.current[cellIdx * 3 + 2] = el)}
                    type="text"
                    className={`num-input small ${dragOverField === 'num2' ? 'drag-over' : ''} ${isGuessed2 ? 'guessed-value' : ''}`}
                    placeholder="?"
                    value={getDisplayValue(answer.num2)}
                    onChange={(e) => handleInput('num2', e)}
                    onKeyDown={(e) => onKeyDown(e, cellIdx, 2)}
                    onDrop={(e) => handleDrop(e, 'num2')}
                    onDragOver={(e) => handleDragOver(e, 'num2')}
                    onDragLeave={() => setDragOverField(null)}
                    disabled={isCorrect}
                />
            </div>
        </div>
    );
}

export default function NormalBoard({ tasks, answers, onAnswerChange, guessedValues, puzzle, sumLimit = 8, prodLimit = 8 }) {
    const { t } = useTranslation();
    const inputRefs = useRef([]);

    const sumCount = answers.filter(a => a.op === '+').length;
    const prodCount = answers.filter(a => (a.op === '*' || a.op === 'x')).length;

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

    const isCompact = tasks.length === 8;
    const gridTitle = isCompact ? " (3-3-2)" : " (4x4)";

    return (
        <div className="normal-board">
            <h2 className="section-label">{t('board.operaciones')}{gridTitle}</h2>
            <div className={`normal-grid ${isCompact ? 'compact' : ''}`}>
                {tasks.map((task, idx) => (
                    <NormalCell
                        key={idx}
                        cellIdx={idx}
                        task={task}
                        answer={answers[idx]}
                        onAnswerChange={(field, val) => onAnswerChange(idx, field, val)}
                        onKeyDown={handleKeyDown}
                        inputRefs={inputRefs}
                        guessedValues={guessedValues}
                        puzzle={puzzle}
                        sumCount={sumCount}
                        prodCount={prodCount}
                        sumLimit={sumLimit}
                        prodLimit={prodLimit}
                    />
                ))}
            </div>
        </div>
    );
}
