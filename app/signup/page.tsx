"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: add real signup logic here
    router.push("/home"); // Navigate to home page after signup
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />

      <Card className="z-10 w-full max-w-md border-white/5 bg-surface/50 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="h-10 w-10 mx-auto rounded bg-gradient-to-br from-accent to-highlight" />
          </Link>
          <h2 className="text-2xl font-bold text-textPrimary">Join LearnLabz</h2>
          <p className="mt-2 text-sm text-textSecondary">
            Begin your path to AI enlightenment
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Full Name</label>
            <Input type="text" placeholder="Ada Lovelace" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Email</label>
            <Input type="email" placeholder="scholar@learnlabz.com" required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Password</label>
            <Input type="password" placeholder="Create a strong password" required />
            <div className="h-1 w-full rounded bg-white/10">
              <div className="h-full w-2/3 rounded bg-yellow-500"></div>
            </div>
            <p className="text-[10px] text-yellow-500">Moderate strength</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Confirm Password</label>
            <Input type="password" placeholder="Confirm password" required />
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms" required className="mt-1 rounded border-white/10 bg-black/20 text-accent focus:ring-accent" />
            <label htmlFor="terms" className="text-xs text-textSecondary leading-relaxed">
              I agree to the <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>. I commit to the Honor Code.
            </label>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary">
          Already a scholar?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Log in
          </Link>
        </div>
      </Card>
    </main>
  );
}
