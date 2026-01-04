"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useCourse } from "@/lib/context/CourseContext";
import { supabase } from "@/lib/supabase/client";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { isFullscreen } = useCourse();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            }
        };
        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen bg-background">
            {!isFullscreen && <Header />}
            {!isFullscreen && <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />}
            <main
                className={cn(
                    "transition-all duration-300",
                    !isFullscreen && "pt-16",
                    !isFullscreen && (isSidebarCollapsed ? "pl-16" : "pl-64")
                )}
            >
                <div className={cn("px-6 pb-6 pt-2", isFullscreen && "p-0")}>
                    {children}
                </div>
            </main>
        </div>
    );
}
