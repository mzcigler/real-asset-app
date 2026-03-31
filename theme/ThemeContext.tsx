import { createContext, ReactNode, useContext, useState } from 'react';
import { darkColors, lightColors, Colors } from './colors';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  mode: ThemeMode;
  colors: Colors;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors: mode === 'light' ? lightColors : darkColors,
        isDark: mode === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/** Access the current theme colors and toggle function from any component */
export function useTheme() {
  return useContext(ThemeContext);
}
