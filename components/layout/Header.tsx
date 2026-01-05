"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { useCourse } from "@/lib/context/CourseContext";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { selectedCourse } = useCourse();
    const pathParts = pathname.split('/').filter(Boolean); // e.g. ['dashboard', 'aiml', 'modules']
    const courseId = pathParts[1];
    const component = pathParts[2];
    const [user, setUser] = useState<{
        name: string;
    } | null>(null);

    let pageTitle = "Dashboard";
    let titleColor = "text-textPrimary";

    const getCourseTitle = (id: string) => {
        if (id === 'aiml') return "AI/ML";
        if (id === 'nlp') return "NLP";
        return id.charAt(0).toUpperCase() + id.slice(1);
    };

    const getCourseColor = (id: string) => {
        if (id === 'aiml') return "text-accent";
        if (id === 'nlp') return "text-accent";
        return "text-textPrimary";
    };
  useEffect(() => {
    const loadUser = async () => {
      const profile = await getCurrentUserProfile();
      if (!profile) return;
      setUser({
        name: profile.user_name,
      });
    };
    loadUser();
}, []);

    // If we are in a course-specific route or have a selected global course
    const activeCourseId = courseId && (courseId === 'aiml' || courseId === 'nlp') ? courseId : selectedCourse;

    if (activeCourseId) {
        pageTitle = getCourseTitle(activeCourseId);
        titleColor = getCourseColor(activeCourseId);

        if (component) {
            pageTitle += ` | ${component.toUpperCase()}`;
        } else if (pathname.includes('/settings')) {
            pageTitle += ` | SETTINGS`;
        } else if (pathname.includes('/calendar')) {
            pageTitle += ` | CALENDAR`;
        }
    } else {
        // Fallback for no selected course (e.g. fresh global dashboard)
        if (pathname.includes('/settings')) pageTitle = "SETTINGS";
        if (pathname.includes('/calendar')) pageTitle = "CALENDAR";
    }

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Mock Notification Count (Logic: 1 item due Today)
    const notificationCount = 1;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        };


    return (
        <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h2 className={`text-xl font-bold capitalize ${titleColor}`}>{pageTitle}</h2>
            </div>

            <div className="flex items-center gap-4 w-full max-w-md justify-end">
                {/* Search Bar Removed as per request */}

                <div className="flex items-center gap-3">
                    {/* Bell Notification Removed */}

                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2 hover:bg-white/5 rounded-lg p-1.5 transition-all text-left"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-textPrimary leading-none">
                                    {user?.name ?? "Loading..."}
                                </div>
                                </div>

                                <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent font-bold">
                                {user?.name?.charAt(0) ?? "U"}
                                </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <Link
                                    href="/dashboard/settings"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
