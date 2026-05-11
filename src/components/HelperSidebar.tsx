import { useTranslation } from 'react-i18next';
import type { Answer, NormalTask } from '../types/game';

interface HelperSidebarProps {
  answers: Answer[];
  tasks: NormalTask[];
  isWeb?: boolean;
}

interface PendingPair {
  pair: [number, number];
  missing: string;
}

export default function HelperSidebar({ answers, tasks, isWeb }: HelperSidebarProps) {
  const { t } = useTranslation();
  if (!answers || !tasks || answers.length !== tasks.length) return null;

  const usedInSum = new Set<string>();
  const usedInProd = new Set<string>();

  answers.forEach((ans, idx) => {
    if (ans.status === 'correct') {
      const task = tasks[idx]!;
      const key = JSON.stringify([...task.target].sort((a, b) => a - b));
      if (task.type === '+') usedInSum.add(key);
      else if (task.type === '*') usedInProd.add(key);
    }
  });

  const pendingPairs: PendingPair[] = [];
  answers.forEach((ans, idx) => {
    if (ans.status === 'correct') {
      const currentTask = tasks[idx]!;
      const pairKey = JSON.stringify([...currentTask.target].sort((a, b) => a - b));

      if (currentTask.type === '+' && !usedInProd.has(pairKey)) {
        pendingPairs.push({ pair: currentTask.target, missing: t('sidebar.missing_prod') });
      }
      if (currentTask.type === '*' && !usedInSum.has(pairKey)) {
        pendingPairs.push({ pair: currentTask.target, missing: t('sidebar.missing_sum') });
      }
    }
  });

  const uniquePending = Array.from(new Set(pendingPairs.map((p) => JSON.stringify(p))))
    .map((s) => JSON.parse(s) as PendingPair);

  return (
    <aside className="helper-sidebar">
      {!isWeb && (
        <section className="sidebar-section">
          <h3 className="section-title">{t('sidebar.pending_desc')}</h3>
          <p className="sidebar-hint">{t('sidebar.pending_hint')}</p>
          <ul className="pending-list">
            {uniquePending.length === 0 && <li className="empty-hint">{t('sidebar.empty_hint')}</li>}
            {uniquePending.map((p, i) => (
              <li key={i} className="pending-item">
                <span className="pair-nums">
                  {p.pair[0]} {t('sidebar.and')} {p.pair[1]}
                </span>
                <span className="missing-hint">→ {p.missing}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
