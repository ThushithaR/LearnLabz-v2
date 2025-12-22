"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "warm" | "natural" | "modern" | "neutral";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("warm");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            document.documentElement.setAttribute("data-theme", theme);
        }
    }, [theme, mounted]);

    // Used to prevent hydration mismatch on the theme attribute, 
    // but we must ALWAYS provide the context.
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme, setTheme }}>
                <div style={{ visibility: 'hidden' }}>{children}</div>
            </ThemeContext.Provider>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
