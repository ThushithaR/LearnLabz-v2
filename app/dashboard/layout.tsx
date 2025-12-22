"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
            <main
                className={cn(
                    "pt-16 transition-all duration-300",
                    isSidebarCollapsed ? "pl-16" : "pl-64"
                )}
            >
                <div className="px-6 pb-6 pt-2">
                    {children}
                </div>
            </main>
        </div>
    );
}
