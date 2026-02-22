import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-selector">
            <button
                className={`lang-btn ${i18n.language.startsWith('es') ? 'active' : ''}`}
                onClick={() => changeLanguage('es')}
            >
                ES
            </button>
            <button
                className={`lang-btn ${i18n.language.startsWith('en') ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
            >
                EN
            </button>
        </div>
    );
}
