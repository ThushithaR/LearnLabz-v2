import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers";
import { CourseProvider } from "@/lib/context/CourseContext"; // <- added

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "LearnLabz | Master AI",
    description: "Premium gamified learning platform for AI mastery.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${outfit.variable} font-sans bg-background text-textPrimary antialiased min-h-screen selection:bg-accent selection:text-background`}
            >
                <ThemeProvider>
                    <CourseProvider>
                        {children}
                    </CourseProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
