"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 VERY IMPORTANT
  useEffect(() => {
    const exchangeSession = async () => {
      const code = searchParams.get("code");
      if (!code) return;

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setError(error.message);
      }
    };

    exchangeSession();
  }, [searchParams]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">
          Reset Password
        </h2>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            Update Password
          </Button>
        </form>
      </Card>
    </main>
  );
}
