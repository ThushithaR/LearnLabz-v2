"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";
import {updateUserStreak} from "@/lib/supabase/progress";
import { getCurrentUserProfile } from "@/lib/supabase/profile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }
     // ✅ fetch logged-in user profile
  const user = await getCurrentUserProfile();
    if (!user) {
      setError("Unable to load user profile");
      return;
    }

    // ✅ decide active course
    // (temporary: first enrolled course)
    const { data: userCourses } = await supabase
      .from("user_courses")
      .select("course_id")
      .eq("user_id", user.user_id)
      .order("last_active", { ascending: false })
      .limit(1);

    if (userCourses && userCourses.length > 0) {
      await updateUserStreak(user.user_id, userCourses[0].course_id);
    }
    router.push("/home");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface via-background to-background opacity-50" />

      <Card className="z-10 w-full max-w-md border-white/5 bg-surface/50 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-textPrimary">Welcome Back</h2>
          <p className="mt-2 text-sm text-textSecondary">
            Continue your journey to mastery
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Email</label>
            <Input
              type="email"
              placeholder="scholar@learnlabz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-medium uppercase text-textSecondary">
              <span>Password</span>
              <Link href="#" className="text-accent hover:underline lowercase bg-transparent">forgot?</Link>
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="remember" className="rounded border-white/10 bg-black/20 text-accent focus:ring-accent" />
            <label htmlFor="remember" className="text-sm text-textSecondary">Remember me</label>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Log In
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
