import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  dark: { id: 'dark', label: 'Dark', emoji: '🌙' },
  light: { id: 'light', label: 'Light', emoji: '☀️' },
  deuteranopia: { id: 'deuteranopia', label: 'Red-Blind', emoji: '🔴' },
  protanopia: { id: 'protanopia', label: 'Green-Blind', emoji: '💚' },
  tritanopia: { id: 'tritanopia', label: 'Blue-Blind', emoji: '💙' },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('aql-gym-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('aql-gym-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = (themeId) => {
    setTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
