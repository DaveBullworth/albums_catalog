import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    // При монтировании проверяем localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark-theme');
    }

    // Обработчик изменения ширины
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    document.body.classList.toggle('dark-theme', newTheme === 'dark');
  };

  return (
    <div className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        id="themeSwitch"
        checked={isDark}
        onChange={toggleTheme}
      />
      <label className="form-check-label" htmlFor="themeSwitch">
        {isDark ? '🌙' : '☀️'} {!isMobile && (isDark ? t('theme.dark') : t('theme.light'))}
      </label>
    </div>
  );
};

export default ThemeSwitcher;
