"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCourse } from "@/lib/context/CourseContext";

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const { selectedCourse } = useCourse();

    const getNavItems = () => {
        const baseItems = [
            {
                label: "Dashboard", href: selectedCourse ? `/dashboard/${selectedCourse}` : "/dashboard", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                )
            },
            {
                label: "Learning Modules", href: selectedCourse ? `/dashboard/${selectedCourse}/modules` : "/dashboard/modules", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                )
            },
            {
                label: "Quizzes", href: selectedCourse ? `/dashboard/${selectedCourse}/quizzes` : "/dashboard/quizzes", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h6" /><path d="M9 19h6" /><path d="M9 11h6" /></svg>
                )
            },
            {
                label: "Numericals", href: selectedCourse ? `/dashboard/${selectedCourse}/numericals` : "/dashboard/numericals", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 7h8" /><path d="M8 11h8" /><path d="M8 15h8" /><path d="M12 7v8" /></svg>
                )
            },
            {
                label: "Study Calendar", href: "/dashboard/calendar", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                )
            },
            {
                label: "Leaderboard", href: selectedCourse ? `/dashboard/${selectedCourse}/leaderboard` : "/dashboard/leaderboard", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                )
            },
            {
                label: "Achievements", href: selectedCourse ? `/dashboard/${selectedCourse}/achievements` : "/dashboard/achievements", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                )
            },
            {
                label: "My Notes", href: selectedCourse ? `/dashboard/${selectedCourse}/notes` : "/dashboard/notes", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                )
            },
            {
                label: "Settings", href: "/dashboard/settings", icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                )
            },
        ];
        return baseItems;
    };

    const navItems = getNavItems();

    return (
        <aside
            className={cn(
                "fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-white/5 bg-background transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group",
                                    isActive
                                        ? "bg-accent/10 text-accent"
                                        : "text-textSecondary hover:bg-white/5 hover:text-textPrimary"
                                )}
                            >
                                <span className={cn(isActive ? "text-accent" : "text-textSecondary")}>
                                    {item.icon}
                                </span>
                                {!collapsed && <span>{item.label}</span>}

                                {collapsed && (
                                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-[#1a1a1a] text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl transition-opacity animate-in fade-in slide-in-from-left-2 shadow-black/50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-white/5 p-3">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex w-full items-center justify-center rounded-lg p-2 text-textSecondary hover:bg-white/5 hover:text-textPrimary"
                >
                    {collapsed ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" /></svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 17 5-5-5-5" /><path d="m6 17 5-5-5-5" /></svg>
                    )}
                </button>
            </div>
        </aside>
    );
}
