import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Settings, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { mockUser } from "@/lib/data";
import { Button } from "@/components/ui/Button";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const pageName = pathname.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Dashboard';

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Mock Notification Count (Logic: 1 item due Today)
    const notificationCount = 1;

    const handleLogout = () => {
        router.push("/login");
    };

    return (
        <header className="h-16 border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-textPrimary capitalize">{pageName}</h2>
            </div>

            <div className="flex items-center gap-4 w-full max-w-md justify-end">
                {/* Search Bar Removed as per request */}

                <div className="flex items-center gap-3">
                    <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors group" title="Notifications">
                        <Bell className="w-5 h-5 text-textSecondary group-hover:text-textPrimary" />
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    <div className="h-8 w-[1px] bg-white/10 mx-2"></div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2 hover:bg-white/5 rounded-lg p-1.5 transition-all text-left"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-textPrimary leading-none">{mockUser.name}</div>
                                <div className="text-xs text-textSecondary mt-1">Level {mockUser.level} Scholar</div>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center text-accent font-bold">
                                {mockUser.name.charAt(0)}
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
