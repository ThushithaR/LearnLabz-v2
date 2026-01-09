"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { CourseProvider } from "@/lib/context/CourseContext"; // import your new context

// ---------------- Theme Context (existing) ----------------
type Theme = "warm" | "natural" | "modern" | "neutral";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("warm");

    // Apply theme changes
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
}

// ---------------- Course Context Wrapper ----------------
// Wrap both providers together
export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <CourseProvider>{children}</CourseProvider>
        </ThemeProvider>
    );
}
