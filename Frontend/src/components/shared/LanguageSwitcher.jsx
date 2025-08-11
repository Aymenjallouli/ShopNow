import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language || 'fr';
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          getCurrentLanguage() === 'fr'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          getCurrentLanguage() === 'ar'
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSwitcher;
