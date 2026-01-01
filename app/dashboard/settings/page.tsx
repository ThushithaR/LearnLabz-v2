"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/app/providers";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [avatar, setAvatar] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=Alex");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
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
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent">
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
                            <label className="text-xs font-medium uppercase text-textSecondary">Display Name</label>
                            <Input defaultValue="Alex Chen" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase text-textSecondary">Email</label>
                            <Input defaultValue="alex@learnlabz.com" disabled />
                        </div>
                    </div>
                    <div className="pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => alert("Password reset link sent to your email.")}
                        >
                            Change Password
                        </Button>
                    </div>
                </Card>
            </section>
        </div>
    );
}
