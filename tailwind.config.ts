import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-secondary)",
        highlight: "var(--bg-highlight)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        accent: "var(--accent-primary)",
        accentHover: "var(--accent-hover)",
        scard: "#22333B",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;
