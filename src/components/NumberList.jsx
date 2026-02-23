import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * WheelPicker: an iOS-style scrolling wheel for selecting numbers.
 */
const WheelPicker = ({ options, onSelect, onCancel, currentValue, t, letter }) => {
    const listRef = React.useRef(null);
    const containerRef = React.useRef(null);

    // User fix: if no currentValue, don't pre-select the first option which might be the answer.
    // Instead center on a mid-value or stay neutral.
    const defaultVal = currentValue !== undefined ? currentValue : options[Math.floor(options.length / 2)];
    const [localValue, setLocalValue] = React.useState(defaultVal || options[0]);

    // Handle focus on mount
    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    // Scroll to active item when it changes via keyboard
    const scrollToValue = (val) => {
        if (!listRef.current) return;
        const item = listRef.current.querySelector(`[data-value="${val}"]`);
        if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Keyboard support
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const idx = options.indexOf(localValue);
            if (idx < options.length - 1) {
                const nextVal = options[idx + 1];
                setLocalValue(nextVal);
                scrollToValue(nextVal);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const idx = options.indexOf(localValue);
            if (idx > 0) {
                const prevVal = options[idx - 1];
                setLocalValue(prevVal);
                scrollToValue(prevVal);
            }
        } else if (e.key === 'Enter') {
            onSelect(localValue);
        } else if (e.key === 'Escape') {
            onCancel();
        } else if (/^\d$/.test(e.key)) {
            // Typing logic: try to find the number
            const val = parseInt(e.key, 10);
            const found = options.find(o => o === val || (o >= val * 10 && o < (val + 1) * 10));
            if (found !== undefined) {
                setLocalValue(found);
                scrollToValue(found);
            }
        }
    };

    // Handle scroll snapping and center detection
    const handleScroll = () => {
        if (!listRef.current) return;
        const container = listRef.current;
        const items = container.querySelectorAll('.wheel-item');
        const containerCenter = container.getBoundingClientRect().top + container.offsetHeight / 2;

        let closest = null;
        let minDiff = Infinity;

        items.forEach((item) => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const diff = Math.abs(containerCenter - itemCenter);

            if (diff < minDiff) {
                minDiff = diff;
                closest = parseInt(item.getAttribute('data-value'), 10);
            }
        });

        if (closest !== null && closest !== localValue) {
            setLocalValue(closest);
        }
    };

    return (
        <div className="wheel-picker-overlay" onClick={onCancel}>
            <div
                className="wheel-picker-container"
                onClick={(e) => e.stopPropagation()}
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                style={{ outline: 'none' }}
            >
                <div className="wheel-header">
                    <span>{t('sidebar.variable_title', { letter: letter })}</span>
                </div>

                <div className="wheel-viewport">
                    <div className="wheel-highlight-bar"></div>
                    <div
                        className="wheel-scroll-list"
                        ref={listRef}
                        onScroll={handleScroll}
                    >
                        <div className="wheel-spacer"></div>
                        {options.map((val) => (
                            <div
                                key={val}
                                className={`wheel-item ${localValue === val ? 'active' : 'neighbor'}`}
                                data-value={val}
                            >
                                {val}
                            </div>
                        ))}
                        <div className="wheel-spacer"></div>
                    </div>
                </div>

                <div className="wheel-actions">
                    <button className="wheel-btn cancel" onClick={onCancel}>
                        {t('sidebar.clear_guess', 'Clear')}
                    </button>
                    <button className="wheel-btn confirm" onClick={() => onSelect(localValue)}>
                        {t('game.solved', 'Done')}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * NumberList: shows the 16 sorted numbers (8 visible, 8 hidden).
 * Keeps exactly 16 slots. Hidden slots are revealed only when 
 * they match a number used in a correct pair.
 */
export default function NumberList({ sortedNumbers, visibleIndices, usedNumbers, guessedValues, setGuessedValues, className = "" }) {
    const { t } = useTranslation();
    const [openSlotIdx, setOpenSlotIdx] = useState(null);

    const displayItems = useMemo(() => {
        // 1. Initialize slots from sorted numbers
        const items = sortedNumbers.map((num, i) => ({
            value: num,
            originalType: visibleIndices.has(i) ? 'visible' : 'hidden',
            claimed: false,
            key: `slot-${i}`,
        }));

        if (!usedNumbers || usedNumbers.length === 0) return items;

        // 2. Claim slots for used numbers
        // We sort usedNumbers to ensure consistent matching if there are duplicates
        const sortedUsed = [...usedNumbers].sort((a, b) => a - b);

        sortedUsed.forEach((val) => {
            const slot = items.find((item) => item.value === val && !item.claimed);
            if (slot) {
                slot.claimed = true;
            }
        });

        // 3. Mark guessed values
        items.forEach((item, i) => {
            if (guessedValues && guessedValues[i] !== undefined) {
                item.guessedValue = guessedValues[i];
            }
        });

        return items;
    }, [sortedNumbers, visibleIndices, usedNumbers, guessedValues]);

    const getRangeForSlot = (idx) => {
        let min = 1;
        let max = 99;

        // Find nearest "known" value to the left
        for (let j = idx - 1; j >= 0; j--) {
            const item = displayItems[j];
            if (item.originalType === 'visible' || item.claimed || item.guessedValue !== undefined) {
                min = item.guessedValue || item.value;
                break;
            }
        }

        // Find nearest "known" value to the right
        for (let j = idx + 1; j < 16; j++) {
            const item = displayItems[j];
            if (item.originalType === 'visible' || item.claimed || item.guessedValue !== undefined) {
                max = item.guessedValue || item.value;
                break;
            }
        }

        const options = [];
        for (let v = min + 1; v < max; v++) {
            options.push(v);
        }
        return options;
    };

    const handleSlotClick = (idx, isHidden) => {
        if (!isHidden) return;
        if (displayItems[idx].claimed) return; // Already revealed correctly
        setOpenSlotIdx(openSlotIdx === idx ? null : idx);
    };

    const handleGuessSelect = (idx, val) => {
        setGuessedValues(prev => ({ ...prev, [idx]: val }));
        setOpenSlotIdx(null);
    };

    // Map hidden indices to letters a-h
    const hiddenIndices = sortedNumbers
        .map((_, i) => i)
        .filter(i => !visibleIndices.has(i));

    const indexToLetter = {};
    hiddenIndices.forEach((idx, i) => {
        indexToLetter[idx] = String.fromCharCode(97 + i); // 97 is 'a'
    });

    const handleDragStart = (e, val, letter) => {
        // If it's a letter, we send the letter string (e.g., 'a')
        // If it's a number, we send the number string
        const data = letter || val.toString();
        e.dataTransfer.setData('text/plain', data);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <section className="number-list-section">
            <h2 className="section-label">{t('board.numeros_disponibles')}</h2>
            <div className={`number-list ${className}`}>
                {displayItems.map((item, i) => {
                    let slotClass = 'number-slot';
                    let displayValue = '';
                    let isHidden = false;
                    let draggableValue = item.value;
                    let draggableLetter = null;

                    if (item.originalType === 'visible') {
                        slotClass += ' visible';
                        if (item.claimed) slotClass += ' used';
                        displayValue = item.value;
                    } else {
                        isHidden = true;
                        draggableLetter = indexToLetter[i];
                        if (item.claimed) {
                            slotClass += ' revealed-slot';
                            displayValue = item.value;
                            draggableValue = item.value;
                            draggableLetter = null;
                        } else if (item.guessedValue !== undefined) {
                            slotClass += ' guessed-slot';
                            displayValue = item.guessedValue; // User fix: Show number in orange style as requested
                            draggableValue = item.guessedValue;
                        } else {
                            slotClass += ' hidden-slot';
                            displayValue = draggableLetter || '?';
                            draggableValue = null;
                        }
                    }

                    return (
                        <div
                            key={item.key}
                            className={`${slotClass} ${openSlotIdx === i ? 'tooltip-open' : ''}`}
                            onClick={() => handleSlotClick(i, isHidden)}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, draggableValue, draggableLetter)}
                        >
                            {displayValue}

                            {openSlotIdx === i && (
                                <WheelPicker
                                    options={getRangeForSlot(i)}
                                    currentValue={item.guessedValue}
                                    t={t}
                                    letter={draggableLetter}
                                    onSelect={(val) => {
                                        setGuessedValues(prev => ({ ...prev, [i]: val }));
                                        setOpenSlotIdx(null);
                                    }}
                                    onCancel={() => {
                                        setGuessedValues(prev => {
                                            const next = { ...prev };
                                            delete next[i];
                                            return next;
                                        });
                                        setOpenSlotIdx(null);
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
