import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ dark: false, toggle: () => undefined });

export function ThemeProvider({ initialDark, children }: {initialDark: boolean;children: ReactNode;}) {
  const [dark, setDark] = useState(initialDark);

  useEffect(() => setDark(initialDark), [initialDark]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}