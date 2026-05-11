import { useEffect, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface RulesModalProps {
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const TRANS_COMPONENTS = { strong: <strong />, em: <em /> };

export default function RulesModal({ onClose }: RulesModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const closeBtn = modalRef.current?.querySelector<HTMLButtonElement>('.close-btn');
    closeBtn?.focus();

    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusables = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('aria-hidden'));
      if (focusables.length === 0) return;

      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handleMouseDown(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  return (
    <div className="rules-modal-overlay">
      <div
        className="rules-modal-content"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
      >
        <button className="close-btn" onClick={onClose} aria-label={t('rules.close', 'Cerrar')}>
          &times;
        </button>

        <h2 id="rules-modal-title" className="modal-title">
          {t('rules.title')}
        </h2>

        <div className="rules-sections">
          <section className="rules-section">
            <h3 className="rules-header easy">{t('rules.easy_title')}</h3>
            <p>
              <Trans i18nKey="rules.easy_p1" components={TRANS_COMPONENTS} />
            </p>
            <p>
              <Trans i18nKey="rules.easy_p2" components={TRANS_COMPONENTS} />
            </p>
          </section>

          <section className="rules-section">
            <h3 className="rules-header normal">{t('rules.normal_title')}</h3>
            <p>
              <Trans i18nKey="rules.normal_p1" components={TRANS_COMPONENTS} />
            </p>
            <p>
              <Trans i18nKey="rules.normal_p2" components={TRANS_COMPONENTS} />
            </p>
            <p>
              <Trans i18nKey="rules.normal_p3" components={TRANS_COMPONENTS} />
            </p>
          </section>

          <section className="rules-section">
            <h3 className="rules-header difficult">{t('rules.hard_title')}</h3>
            <p className="coming-soon">{t('rules.coming_soon')}</p>
          </section>
        </div>

        <div className="modal-footer">
          <p>
            <Trans i18nKey="rules.footer" components={TRANS_COMPONENTS} />
          </p>
        </div>
      </div>
    </div>
  );
}
