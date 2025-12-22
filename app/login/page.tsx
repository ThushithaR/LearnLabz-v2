"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface via-background to-background opacity-50" />

            <Card className="z-10 w-full max-w-md border-white/5 bg-surface/50 backdrop-blur-xl">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-block mb-4">
                        <div className="h-10 w-10 mx-auto rounded bg-gradient-to-br from-accent to-highlight" />
                    </Link>
                    <h2 className="text-2xl font-bold text-textPrimary">Welcome Back</h2>
                    <p className="mt-2 text-sm text-textSecondary">
                        Continue your journey to mastery
                    </p>
                </div>

                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = "/dashboard"; }}>
                    <div className="space-y-1">
                        <label className="text-xs font-medium uppercase text-textSecondary">Email</label>
                        <Input type="email" placeholder="scholar@learnlabz.com" required />
                    </div>

                    <div className="space-y-1">
                        <label className="flex items-center justify-between text-xs font-medium uppercase text-textSecondary">
                            <span>Password</span>
                            <Link href="#" className="text-accent hover:underline lowercase bg-transparent">forgot?</Link>
                        </label>
                        <Input type="password" placeholder="••••••••" required />
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="remember" className="rounded border-white/10 bg-black/20 text-accent focus:ring-accent" />
                        <label htmlFor="remember" className="text-sm text-textSecondary">Remember me</label>
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-textSecondary">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-medium text-accent hover:underline">
                        Apply for access
                    </Link>
                </div>
            </Card>
        </main>
    );
}
