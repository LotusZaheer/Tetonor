import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export default function RulesModal({ onClose }) {
    const { t } = useTranslation();
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="rules-modal-overlay">
            <div className="rules-modal-content" ref={modalRef}>
                <button className="close-btn" onClick={onClose} aria-label={t('rules.close', 'Cerrar')}>
                    &times;
                </button>

                <h2 className="modal-title">{t('rules.title')}</h2>

                <div className="rules-sections">
                    <section className="rules-section">
                        <h3 className="rules-header easy">{t('rules.easy_title')}</h3>
                        <p dangerouslySetInnerHTML={{ __html: t('rules.easy_p1') }} />
                        <p dangerouslySetInnerHTML={{ __html: t('rules.easy_p2') }} />
                    </section>

                    <section className="rules-section">
                        <h3 className="rules-header normal">{t('rules.normal_title')}</h3>
                        <p dangerouslySetInnerHTML={{ __html: t('rules.normal_p1') }} />
                        <p dangerouslySetInnerHTML={{ __html: t('rules.normal_p2') }} />
                        <p dangerouslySetInnerHTML={{ __html: t('rules.normal_p3') }} />
                    </section>

                    <section className="rules-section">
                        <h3 className="rules-header difficult">{t('rules.hard_title')}</h3>
                        <p className="coming-soon">{t('rules.coming_soon')}</p>
                    </section>
                </div>

                <div className="modal-footer">
                    <p dangerouslySetInnerHTML={{ __html: t('rules.footer') }} />
                </div>
            </div>
        </div>
    );
}
