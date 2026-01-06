"use client";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/app/providers";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/supabase/avatar";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<number | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  

  // 🔹 Load current user
    useEffect(() => {
        const loadUser = async () => {
        const user = await getCurrentUserProfile();
        if (!user) return;

        setUserId(user.user_id);
        setDisplayName(user.user_name ?? "");
        setEmail(user.user_email ?? "");

        // optional avatar from DB later
        setAvatar(user.avatar_url ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex");
    };

    loadUser();
    }, []);

  // 🔹 Avatar change (local preview only for now)
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
        alert("Max file size is 5MB");
        return;
    }

    try {
        const url = await uploadAvatar( file);
        setAvatar(url); // instantly update UI
    } catch (err) {
        console.error(err);
        alert("Upload failed");
    }
    };
    
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-textPrimary">Settings</h1>

            <section>
                <h2 className="text-xl font-bold text-textPrimary mb-4">Appearance</h2>
                <Card className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onClick={() => setTheme('warm')} className={`relative rounded-xl overflow-hidden border-2 transition-all ${theme === 'warm' ? 'border-accent ring-2 ring-accent/50' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                            <div className="aspect-video bg-[#0A0908] p-3 flex flex-col gap-2">
                                <div className="h-2 w-full bg-[#22333B] rounded"></div>
                                <div className="h-2 w-2/3 bg-[#5E503F] rounded"></div>
                                <div className="mt-auto h-4 w-4 rounded-full bg-[#C6AC8F]"></div>
                            </div>
                            <div className="p-2 text-sm font-medium text-center bg-surface text-textPrimary">Warm Scholarly</div>
                        </button>

                        <button onClick={() => setTheme('natural')} className={`relative rounded-xl overflow-hidden border-2 transition-all ${theme === 'natural' ? 'border-accent ring-2 ring-accent/50' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                            <div className="aspect-video bg-[#F0EAD6] p-3 flex flex-col gap-2">
                                <div className="h-2 w-full bg-[#E6DCC5] rounded"></div>
                                <div className="h-2 w-2/3 bg-[#D4C5A9] rounded"></div>
                                <div className="mt-auto h-4 w-4 rounded-full bg-[#A44A3F]"></div>
                            </div>
                            <div className="p-2 text-sm font-medium text-center bg-surface text-textPrimary">Vintage Parchment</div>
                        </button>

                        <button onClick={() => setTheme('modern')} className={`relative rounded-xl overflow-hidden border-2 transition-all ${theme === 'modern' ? 'border-accent ring-2 ring-accent/50' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                            <div className="aspect-video bg-[#0f172a] p-3 flex flex-col gap-2">
                                <div className="h-2 w-full bg-[#1e293b] rounded"></div>
                                <div className="h-2 w-2/3 bg-[#334155] rounded"></div>
                                <div className="mt-auto h-4 w-4 rounded-full bg-[#8b5cf6]"></div>
                            </div>
                            <div className="p-2 text-sm font-medium text-center bg-surface text-textPrimary">Midnight Modern</div>
                        </button>

                        <button onClick={() => setTheme('neutral')} className={`relative rounded-xl overflow-hidden border-2 transition-all ${theme === 'neutral' ? 'border-accent ring-2 ring-accent/50' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                            <div className="aspect-video bg-[#f9fafb] p-3 flex flex-col gap-2">
                                <div className="h-2 w-full bg-[#ffffff] rounded border border-gray-100"></div>
                                <div className="h-2 w-2/3 bg-[#f3f4f6] rounded"></div>
                                <div className="mt-auto h-4 w-4 rounded-full bg-[#4b5563]"></div>
                            </div>
                            <div className="p-2 text-sm font-medium text-center bg-surface text-textPrimary">Minimalist Slate</div>
                        </button>
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="text-xl font-bold text-textPrimary mb-4">Account</h2>
                <Card className="p-6 space-y-4">
                <div className="flex items-center gap-6 mb-6">
                    <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    >
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent">
                        <img src={avatar ||  "/avatar-placeholder.png"} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    </div>

                    <div>
                    <h3 className="font-bold text-lg">Profile Picture</h3>
                    <p className="text-sm text-textSecondary">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                    <label className="text-xs font-medium uppercase text-textSecondary">
                        Display Name
                    </label>
                    <Input value={displayName} disabled/>
                    </div>

                    <div className="space-y-1">
                    <label className="text-xs font-medium uppercase text-textSecondary">
                        Email
                    </label>
                    <Input value={email} disabled/>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                    variant="secondary"
                    onClick={() =>
                        supabase.auth.resetPasswordForEmail(email)
                    }
                    >
                    Change Password
                    </Button>
                </div>
            </Card>
        </section>
    </div>
    );
}
