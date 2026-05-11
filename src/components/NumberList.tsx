import React, { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { GuessedValues, Puzzle, UsedNumbers } from '../types/game';
import { getHiddenIndices } from '../utils/gameLogic';

interface WheelPickerProps {
  options: number[];
  onSelect: (val: number) => void;
  onCancel: () => void;
  currentValue?: number;
  letter?: string;
}

function WheelPicker({ options, onSelect, onCancel, currentValue, letter }: WheelPickerProps) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const defaultVal = currentValue !== undefined ? currentValue : options[0] ?? 1;
  const [localValue, setLocalValue] = useState<number>(defaultVal);
  const [buffer, setBuffer] = useState('');
  const bufferTimeoutRef = useRef<number | null>(null);
  const [dragState, setDragState] = useState<{ isDragging: boolean; startY: number; startScroll: number }>({
    isDragging: false,
    startY: 0,
    startScroll: 0,
  });

  const scrollToValue = (val: number) => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector<HTMLDivElement>(`[data-value="${val}"]`);
    if (item) item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    if (containerRef.current) containerRef.current.focus();
    if (localValue !== undefined) {
      setTimeout(() => scrollToValue(localValue), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = options.indexOf(localValue);
      if (idx < options.length - 1) {
        const nextVal = options[idx + 1]!;
        setLocalValue(nextVal);
        scrollToValue(nextVal);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = options.indexOf(localValue);
      if (idx > 0) {
        const prevVal = options[idx - 1]!;
        setLocalValue(prevVal);
        scrollToValue(prevVal);
      }
    } else if (e.key === 'Enter') {
      onSelect(localValue);
    } else if (e.key === 'Escape') {
      onCancel();
    } else if (/^\d$/.test(e.key)) {
      const newBuffer = buffer + e.key;
      setBuffer(newBuffer);

      if (bufferTimeoutRef.current) window.clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = window.setTimeout(() => setBuffer(''), 1000);

      const targetNum = parseInt(newBuffer, 10);
      let found = options.find((o) => o === targetNum);
      if (found === undefined) found = options.find((o) => o.toString().startsWith(newBuffer));

      if (found !== undefined) {
        setLocalValue(found);
        scrollToValue(found);
      }
    }
  };

  const handleScroll = () => {
    if (!listRef.current) return;
    const container = listRef.current;
    const items = container.querySelectorAll<HTMLDivElement>('.wheel-item');
    const containerCenter = container.getBoundingClientRect().top + container.offsetHeight / 2;

    let closest: number | null = null;
    let minDiff = Infinity;

    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const diff = Math.abs(containerCenter - itemCenter);
      if (diff < minDiff) {
        minDiff = diff;
        const raw = item.getAttribute('data-value');
        if (raw !== null) closest = parseInt(raw, 10);
      }
    });

    if (closest !== null && closest !== localValue) setLocalValue(closest);
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!listRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    setDragState({ isDragging: true, startY: e.clientY, startScroll: listRef.current.scrollTop });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragState.isDragging || !listRef.current) return;
    e.stopPropagation();
    const delta = dragState.startY - e.clientY;
    listRef.current.scrollTop = dragState.startScroll + delta;
  };

  const stopDragging = (e?: MouseEvent<HTMLDivElement>) => {
    if (dragState.isDragging) {
      e?.stopPropagation();
      setDragState((prev) => ({ ...prev, isDragging: false }));
    }
  };

  const dialogLabel = t('sidebar.variable_title', { letter: letter ?? '' });

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
        role="dialog"
        aria-modal="true"
        aria-label={dialogLabel}
      >
        <div className="wheel-header" onMouseDown={(e) => e.stopPropagation()}>
          <span>{dialogLabel}</span>
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
            role="listbox"
            aria-activedescendant={`wheel-option-${localValue}`}
            aria-label={dialogLabel}
          >
            <div className="wheel-spacer" aria-hidden="true"></div>
            {options.map((val) => (
              <div
                key={val}
                id={`wheel-option-${val}`}
                className={`wheel-item ${localValue === val ? 'active' : 'neighbor'}`}
                data-value={val}
                role="option"
                aria-selected={localValue === val}
              >
                {val}
              </div>
            ))}
            <div className="wheel-spacer" aria-hidden="true"></div>
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
}

interface NumberListProps {
  puzzle: Puzzle;
  usedNumbers: UsedNumbers;
  guessedValues: GuessedValues;
  setGuessedValues: React.Dispatch<React.SetStateAction<GuessedValues>>;
  className?: string;
  remainingSums?: number;
  remainingProds?: number;
  sumLimit?: number;
  prodLimit?: number;
}

interface DisplayItem {
  value: number;
  originalType: 'visible' | 'hidden';
  claimed: boolean;
  usedInSum: boolean;
  usedInProduct: boolean;
  key: string;
  guessedValue?: number;
}

export default function NumberList({
  puzzle,
  usedNumbers,
  guessedValues,
  setGuessedValues,
  className = '',
  remainingSums,
  remainingProds,
  sumLimit,
  prodLimit,
}: NumberListProps) {
  const { t } = useTranslation();
  const [openSlotIdx, setOpenSlotIdx] = useState<number | null>(null);
  const { sortedNumbers, visibleIndices } = puzzle;

  const displayItems = useMemo<DisplayItem[]>(() => {
    const { sumUsed = [], prodUsed = [], claimed = [] } = usedNumbers || {};

    const items: DisplayItem[] = sortedNumbers.map((num, i) => ({
      value: num,
      originalType: visibleIndices.has(i) ? 'visible' : 'hidden',
      claimed: false,
      usedInSum: false,
      usedInProduct: false,
      key: `slot-${i}`,
    }));

    items.forEach((item, i) => {
      if (guessedValues && guessedValues[i] !== undefined) {
        item.guessedValue = guessedValues[i];
      }
    });

    const sortedClaimed = [...claimed].sort((a, b) => a - b);
    sortedClaimed.forEach((val) => {
      const slot = items.find((item) => item.value === val && !item.claimed);
      if (slot) slot.claimed = true;
    });

    [...sumUsed].sort((a, b) => a - b).forEach((val) => {
      const slot = items.find((item) => item.value === val && !item.usedInSum);
      if (slot) slot.usedInSum = true;
    });

    [...prodUsed].sort((a, b) => a - b).forEach((val) => {
      const slot = items.find((item) => item.value === val && !item.usedInProduct);
      if (slot) slot.usedInProduct = true;
    });

    return items;
  }, [sortedNumbers, visibleIndices, usedNumbers, guessedValues]);

  const getRangeForSlot = (idx: number): number[] => {
    let min = 1;
    let max = 99;

    for (let j = idx - 1; j >= 0; j--) {
      const item = displayItems[j]!;
      if (item.originalType === 'visible' || item.claimed || item.guessedValue !== undefined) {
        min = item.guessedValue ?? item.value;
        break;
      }
    }

    for (let j = idx + 1; j < displayItems.length; j++) {
      const item = displayItems[j]!;
      if (item.originalType === 'visible' || item.claimed || item.guessedValue !== undefined) {
        max = item.guessedValue ?? item.value;
        break;
      }
    }

    const options: number[] = [];
    for (let v = min; v <= max; v++) options.push(v);
    return options;
  };

  const handleSlotClick = (idx: number, isHidden: boolean) => {
    if (!isHidden) return;
    if (displayItems[idx]!.claimed) return;
    setOpenSlotIdx(openSlotIdx === idx ? null : idx);
  };

  const hiddenIndices = getHiddenIndices(puzzle);
  const indexToLetter: Record<number, string> = {};
  hiddenIndices.forEach((idx, i) => {
    indexToLetter[idx] = String.fromCharCode(97 + i);
  });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, val: number | null, letter: string | null) => {
    const data = letter ?? (val !== null ? val.toString() : '');
    e.dataTransfer.setData('text/plain', data);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <section className="number-list-section">
      <div className={`section-header-row ${remainingSums !== undefined ? 'with-counters' : ''}`}>
        <h2 className="section-label no-margin">{t('board.numeros_disponibles')}</h2>
        {remainingSums !== undefined && remainingProds !== undefined && (
          <div className="header-counters desktop-only">
            <span>
              +:{' '}
              <span className={`counter-val ${remainingSums === 0 ? 'text-red' : ''}`}>
                {remainingSums}/{sumLimit ?? 8}
              </span>
            </span>
            <span>
              x:{' '}
              <span className={`counter-val ${remainingProds === 0 ? 'text-red' : ''}`}>
                {remainingProds}/{prodLimit ?? 8}
              </span>
            </span>
          </div>
        )}
      </div>
      <div className={`number-list ${className}`}>
        {displayItems.map((item, i) => {
          let slotClass = 'number-slot';
          let displayValue: string | number = '';
          let isHidden = false;
          let draggableValue: number | null = item.value;
          let draggableLetter: string | null = null;

          if (item.originalType === 'visible') {
            slotClass += ' visible';
            if (item.claimed) slotClass += ' used';
            displayValue = item.value;
          } else {
            isHidden = true;
            draggableLetter = indexToLetter[i] ?? null;
            if (item.claimed) {
              slotClass += ' revealed-slot';
              displayValue = item.value;
              draggableValue = item.value;
              draggableLetter = null;
            } else if (item.guessedValue !== undefined) {
              slotClass += ' guessed-slot';
              displayValue = item.guessedValue;
              draggableValue = item.guessedValue;
            } else {
              slotClass += ' hidden-slot';
              displayValue = draggableLetter ?? '?';
              draggableValue = null;
            }
          }

          return (
            <div
              key={item.key}
              className={`${slotClass} ${openSlotIdx === i ? 'tooltip-open' : ''}`}
              onClick={() => handleSlotClick(i, isHidden)}
              draggable
              onDragStart={(e) => handleDragStart(e, draggableValue, draggableLetter)}
            >
              {displayValue}

              <div className="usage-indicators">
                {item.usedInProduct && <span className="usage-indicator prod">×</span>}
                {item.usedInSum && <span className="usage-indicator sum">+</span>}
              </div>

              {openSlotIdx === i && (
                <WheelPicker
                  options={getRangeForSlot(i)}
                  currentValue={item.guessedValue}
                  letter={draggableLetter ?? undefined}
                  onSelect={(val) => {
                    setGuessedValues((prev) => ({ ...prev, [i]: val }));
                    setOpenSlotIdx(null);
                  }}
                  onCancel={() => {
                    setGuessedValues((prev) => {
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
