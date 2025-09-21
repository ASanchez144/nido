// src/components/LanguageSelector.js
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ className = "" }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`language-selector ${className}`}>
      <button 
        onClick={() => changeLanguage('en')}
        className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
      >
        🇺🇸 EN
      </button>
      <button 
        onClick={() => changeLanguage('es')}
        className={`lang-btn ${i18n.language === 'es' ? 'active' : ''}`}
      >
        🇪🇸 ES
      </button>
    </div>
  );
};

export default LanguageSelector;