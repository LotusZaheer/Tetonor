import React from 'react';

export default function HelperSidebar({ answers, tasks, isWeb }) {
    // 1. Calculate operation usage
    if (!answers || !tasks || answers.length !== tasks.length) return null;
    const sumCount = answers.filter(a => a.status === 'correct' && a.op === '+').length;
    const prodCount = answers.filter(a => a.status === 'correct' && (a.op === '*' || a.op === 'x')).length;

    // Remaining counts (disminuyendo)
    const remainingSums = Math.max(0, 8 - sumCount);
    const remainingProds = Math.max(0, 8 - prodCount);

    // 2. Logic for pending numbers:
    const usedInSum = new Set();
    const usedInProd = new Set();

    answers.forEach((ans, idx) => {
        if (ans.status === 'correct') {
            const t = tasks[idx];
            const key = JSON.stringify([...t.target].sort((a, b) => a - b));
            if (t.type === '+') usedInSum.add(key);
            else if (t.type === '*') usedInProd.add(key);
        }
    });

    const pendingPairs = [];
    answers.forEach((ans, idx) => {
        if (ans.status === 'correct') {
            const t = tasks[idx];
            const pairKey = JSON.stringify([...t.target].sort((a, b) => a - b));

            if (t.type === '+' && !usedInProd.has(pairKey)) {
                pendingPairs.push({ pair: t.target, missing: 'multiplicación' });
            }
            if (t.type === '*' && !usedInSum.has(pairKey)) {
                pendingPairs.push({ pair: t.target, missing: 'suma' });
            }
        }
    });

    const uniquePending = Array.from(new Set(pendingPairs.map(p => JSON.stringify(p))))
        .map(s => JSON.parse(s));

    return (
        <aside className="helper-sidebar">
            <section className="sidebar-section desktop-only">
                <h3 className="section-title">Operaciones disponibles</h3>
                <div className="counter-item">
                    <span>Sumas disponibles:</span>
                    <span className={`counter-val ${remainingSums === 0 ? 'text-red' : ''}`}>{remainingSums}/8</span>
                </div>
                <div className="counter-item">
                    <span>Multiplicaciones:</span>
                    <span className={`counter-val ${remainingProds === 0 ? 'text-red' : ''}`}>{remainingProds}/8</span>
                </div>
            </section>

            {!isWeb && (
                <section className="sidebar-section">
                    <h3 className="section-title">Ayuda: Números en uso</h3>
                    <p className="sidebar-hint">Te falta usar estos números en su otra operación:</p>
                    <ul className="pending-list">
                        {uniquePending.length === 0 && <li className="empty-hint">Resuelve una casilla para ver pistas aquí...</li>}
                        {uniquePending.map((p, i) => (
                            <li key={i} className="pending-item">
                                <span className="pair-nums">{p.pair[0]} y {p.pair[1]}</span>
                                <span className="missing-hint">→ {p.missing} pendiente</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </aside>
    );
}
