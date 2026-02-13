'use client';

import { useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        const stored = localStorage.getItem('cv-creator-theme') as Theme | null;
        if (stored) {
            setTheme(stored);
            document.documentElement.setAttribute('data-theme', stored);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = prefersDark ? 'dark' : 'light';
            setTheme(initial);
            document.documentElement.setAttribute('data-theme', initial);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('cv-creator-theme', next);
            document.documentElement.setAttribute('data-theme', next);
            return next;
        });
    }, []);

    return { theme, toggleTheme };
}
