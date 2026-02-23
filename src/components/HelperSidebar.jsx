import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HelperSidebar({ answers, tasks, isWeb }) {
    const { t } = useTranslation();
    // 1. Calculate operation usage (tracking board choices, not just correct ones)
    if (!answers || !tasks || answers.length !== tasks.length) return null;
    const sumCount = answers.filter(a => a.op === '+').length;
    const prodCount = answers.filter(a => (a.op === '*' || a.op === 'x')).length;

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
            const currentTask = tasks[idx];
            const pairKey = JSON.stringify([...currentTask.target].sort((a, b) => a - b));

            if (currentTask.type === '+' && !usedInProd.has(pairKey)) {
                pendingPairs.push({ pair: currentTask.target, missing: t('sidebar.missing_prod') });
            }
            if (currentTask.type === '*' && !usedInSum.has(pairKey)) {
                pendingPairs.push({ pair: currentTask.target, missing: t('sidebar.missing_sum') });
            }
        }
    });

    const uniquePending = Array.from(new Set(pendingPairs.map(p => JSON.stringify(p))))
        .map(s => JSON.parse(s));

    return (
        <aside className="helper-sidebar">
            <section className="sidebar-section desktop-only">
                <h3 className="section-title">{t('sidebar.available_ops')}</h3>
                <div className="counter-item">
                    <span>{t('sidebar.sums_available')}</span>
                    <span className={`counter-val ${remainingSums === 0 ? 'text-red' : ''}`}>{remainingSums}/8</span>
                </div>
                <div className="counter-item">
                    <span>{t('sidebar.prods_available')}</span>
                    <span className={`counter-val ${remainingProds === 0 ? 'text-red' : ''}`}>{remainingProds}/8</span>
                </div>
            </section>

            {!isWeb && (
                <section className="sidebar-section">
                    <h3 className="section-title">{t('sidebar.pending_desc')}</h3>
                    <p className="sidebar-hint">{t('sidebar.pending_hint')}</p>
                    <ul className="pending-list">
                        {uniquePending.length === 0 && <li className="empty-hint">{t('sidebar.empty_hint')}</li>}
                        {uniquePending.map((p, i) => (
                            <li key={i} className="pending-item">
                                <span className="pair-nums">{p.pair[0]} {t('sidebar.and')} {p.pair[1]}</span>
                                <span className="missing-hint">→ {p.missing}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </aside>
    );
}
