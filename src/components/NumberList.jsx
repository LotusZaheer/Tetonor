import React, { useMemo } from 'react';

/**
 * NumberList: shows the 16 sorted numbers (8 visible, 8 hidden).
 * Keeps exactly 16 slots. Hidden slots are revealed only when 
 * they match a number used in a correct pair.
 */
export default function NumberList({ sortedNumbers, visibleIndices, usedNumbers }) {
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

    return (
        <section className="number-list-section">
            <h2 className="section-label">Números disponibles</h2>
            <div className="number-list">
                {displayItems.map((item) => {
                    let className = 'number-slot';
                    let displayValue = '?';

                    if (item.originalType === 'visible') {
                        className += ' visible';
                        if (item.claimed) className += ' used';
                        displayValue = item.value;
                    } else {
                        // hidden slot
                        if (item.claimed) {
                            className += ' revealed-slot'; // We'll add this class to CSS
                            displayValue = item.value;
                        } else {
                            className += ' hidden-slot';
                            displayValue = '?';
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
