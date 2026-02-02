import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from './ui/Icon';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-outline hover:text-primary hover:bg-surface-variant transition-all"
      aria-label="Switch language"
    >
      <Icon name="language" size={18} />
      <span>{i18n.language.startsWith('en') ? 'ES' : 'EN'}</span>
    </button>
  );
};
