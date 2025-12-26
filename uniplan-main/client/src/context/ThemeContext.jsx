import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Default to light mode
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    // Accent Color
    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem('accentColor') || 'blue';
    });

    // Font Size
    const [fontSize, setFontSize] = useState(() => {
        return parseInt(localStorage.getItem('fontSize')) || 16;
    });

    // Apply Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Apply Accent Color
    useEffect(() => {
        const colors = {
            blue: '#3b82f6',
            purple: '#a855f7',
            pink: '#ec4899',
            green: '#10b981',
            orange: '#f59e0b',
            red: '#ef4444'
        };
        const colorHex = colors[accentColor] || colors.blue;
        document.documentElement.style.setProperty('--color-primary', colorHex);
        localStorage.setItem('accentColor', accentColor);
    }, [accentColor]);

    // Apply Font Size
    useEffect(() => {
        // Base font size is 16px (1rem). We scale it.
        // Assuming root font-size change scales rem units.
        const percentage = (fontSize / 16) * 100;
        document.documentElement.style.fontSize = `${percentage}%`;
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme, setTheme,
            accentColor, setAccentColor,
            fontSize, setFontSize
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
