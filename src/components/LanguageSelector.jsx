import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const nextLng = i18n.language.startsWith('es') ? 'en' : 'es';
        i18n.changeLanguage(nextLng);
    };

    return (
        <div className="language-selector" onClick={toggleLanguage} style={{ cursor: 'pointer' }}>
            <button
                className={`lang-btn ${i18n.language.startsWith('es') ? 'active' : ''}`}
                type="button"
            >
                ES
            </button>
            <button
                className={`lang-btn ${i18n.language.startsWith('en') ? 'active' : ''}`}
                type="button"
            >
                EN
            </button>
        </div>
    );
}
