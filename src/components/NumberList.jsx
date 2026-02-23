import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * NumberList: shows the 16 sorted numbers (8 visible, 8 hidden).
 * Keeps exactly 16 slots. Hidden slots are revealed only when 
 * they match a number used in a correct pair.
 */
export default function NumberList({ sortedNumbers, visibleIndices, usedNumbers, className = "" }) {
    const { t } = useTranslation();
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
            // Find the first unclaimed slot with this value.
            // Since sortedNumbers and sortedUsed are both sorted, 
            // simple linear search or find works well.
            const slot = items.find((item) => item.value === val && !item.claimed);
            if (slot) {
                slot.claimed = true;
            }
        });

        return items;
    }, [sortedNumbers, visibleIndices, usedNumbers]);

    // 1.5. Map hidden indices to letters a-h
    const hiddenIndices = sortedNumbers
        .map((_, i) => i)
        .filter(i => !visibleIndices.has(i));

    const indexToLetter = {};
    hiddenIndices.forEach((idx, i) => {
        indexToLetter[idx] = String.fromCharCode(97 + i); // 97 is 'a'
    });

    return (
        <section className="number-list-section">
            <h2 className="section-label">{t('board.numeros_disponibles')}</h2>
            <div className={`number-list ${className}`}>
                {displayItems.map((item, i) => {
                    let className = 'number-slot';
                    let displayValue = '';

                    if (item.originalType === 'visible') {
                        className += ' visible';
                        if (item.claimed) className += ' used';
                        displayValue = item.value;
                    } else {
                        // hidden slot
                        if (item.claimed) {
                            className += ' revealed-slot';
                            displayValue = item.value;
                        } else {
                            className += ' hidden-slot';
                            displayValue = indexToLetter[i] || '?';
                        }
                    }

                    return (
                        <div key={item.key} className={className}>
                            {displayValue}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
