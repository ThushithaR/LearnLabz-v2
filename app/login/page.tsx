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
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // handles forgot password
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  // show password
  const [showPassword, setShowPassword] = useState(false);

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
    
    // ✅ Save user_id to localStorage for progress tracking
    localStorage.setItem("user_id", user.user_id.toString());
    
    router.push("/home");
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email first");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      alert("Email sent for resetting password!");
    }
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

            <div className="flex justify-between items-center text-xs font-medium uppercase text-textSecondary">
            <label htmlFor="password">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-accent hover:underline lowercase text-xs"
              disabled={loading}
            >
              Forgot?
            </button>
          </div>

          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />

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
