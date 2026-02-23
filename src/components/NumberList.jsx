import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * WheelPicker: an iOS-style scrolling wheel for selecting numbers.
 */
const WheelPicker = ({ options, onSelect, onCancel, currentValue, t, letter }) => {
    const listRef = React.useRef(null);
    const containerRef = React.useRef(null);

    // User fix: if no currentValue, start with the lowest possible number (the first option)
    const defaultVal = currentValue !== undefined ? currentValue : options[0];
    const [localValue, setLocalValue] = React.useState(defaultVal || (options.length > 0 ? options[0] : 1));

    // Handle focus and initial scroll on mount
    React.useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
        // Ensure the initial value is centered
        if (localValue !== undefined) {
            // Small delay to allow layout to settle
            setTimeout(() => scrollToValue(localValue), 50);
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

    // Numeric Input Buffering
    const [buffer, setBuffer] = React.useState('');
    const bufferTimeoutRef = React.useRef(null);

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
            // Typing logic: buffer digits to find specific numbers (e.g. 6 + 7 = 67)
            const newBuffer = buffer + e.key;
            setBuffer(newBuffer);

            // Clear buffer after 1 second of inactivity
            if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
            bufferTimeoutRef.current = setTimeout(() => setBuffer(''), 1000);

            const targetNum = parseInt(newBuffer, 10);

            // Priority 1: Exact match in options
            let found = options.find(o => o === targetNum);

            // Priority 2: If no exact match (yet), try to find first number starting with those digits
            if (found === undefined) {
                found = options.find(o => o.toString().startsWith(newBuffer));
            }

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

    // Mouse Drag-to-Scroll support
    const [dragState, setDragState] = React.useState({ isDragging: false, startY: 0, startScroll: 0 });

    const handleMouseDown = (e) => {
        if (!listRef.current) return;
        e.stopPropagation(); // Prevent parent slot from starting DnD
        e.preventDefault();  // Prevent text selection/native ghost
        setDragState({
            isDragging: true,
            startY: e.clientY,
            startScroll: listRef.current.scrollTop
        });
    };

    const handleMouseMove = (e) => {
        if (!dragState.isDragging || !listRef.current) return;
        e.stopPropagation();
        const delta = dragState.startY - e.clientY;
        listRef.current.scrollTop = dragState.startScroll + delta;
    };

    const stopDragging = (e) => {
        if (dragState.isDragging) {
            e?.stopPropagation();
            setDragState(prev => ({ ...prev, isDragging: false }));
        }
    };

    return (
        <div className="wheel-picker-overlay" onClick={onCancel} onMouseDown={(e) => e.stopPropagation()}>
            <div
                className="wheel-picker-container"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                style={{ outline: 'none' }}
                draggable={false}
            >
                <div className="wheel-header" onMouseDown={(e) => e.stopPropagation()}>
                    <span>{t('sidebar.variable_title', { letter: letter })}</span>
                </div>

                <div className="wheel-viewport" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="wheel-highlight-bar" onMouseDown={(e) => e.stopPropagation()}></div>
                    <div
                        className="wheel-scroll-list"
                        ref={listRef}
                        onScroll={handleScroll}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={stopDragging}
                        onMouseLeave={stopDragging}
                        style={{ cursor: dragState.isDragging ? 'grabbing' : 'grab' }}
                        draggable={false}
                    >
                        <div className="wheel-spacer" draggable={false}></div>
                        {options.map((val) => (
                            <div
                                key={val}
                                className={`wheel-item ${localValue === val ? 'active' : 'neighbor'}`}
                                data-value={val}
                                draggable={false}
                            >
                                {val}
                            </div>
                        ))}
                        <div className="wheel-spacer" draggable={false}></div>
                    </div>
                </div>

                <div className="wheel-actions" onMouseDown={(e) => e.stopPropagation()}>
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

        // 2. Mark guessed values from user state
        items.forEach((item, i) => {
            if (guessedValues && guessedValues[i] !== undefined) {
                item.guessedValue = guessedValues[i];
            }
        });

        if (!usedNumbers || usedNumbers.length === 0) return items;

        // 3. Claim slots for used numbers (correctly solved)
        const sortedUsed = [...usedNumbers].sort((a, b) => a - b);
        sortedUsed.forEach((val) => {
            const slot = items.find((item) => item.value === val && !item.claimed);
            if (slot) {
                slot.claimed = true;
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
        for (let v = min; v <= max; v++) { // Inclusive range as numbers can be repeated
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
                            // CRITICAL: Always show the guessed number in the sidebar list
                            displayValue = item.guessedValue;
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
