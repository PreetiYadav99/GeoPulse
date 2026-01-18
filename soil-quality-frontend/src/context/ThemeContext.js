import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

const defaultTheme = {
  colors: {
    primary: '#8e44ad',
    secondary: '#3498db',
    background: '#121212',
    text: '#ffffff',
    muted: '#888888',
    accent: '#f39c12',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  // Optional: method to toggle or update theme dynamically
  const updateTheme = newTheme => setTheme(newTheme);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
