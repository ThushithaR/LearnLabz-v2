"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    school: "",
    section: "",
    password: "",
    confirmPassword: "",
    terms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length > 6) score++;
    if (password.length > 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const strength = calculateStrength(formData.password);

  const getStrengthColor = (s: number) => {
    if (s <= 1) return "bg-red-500";
    if (s <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (s: number) => {
    if (formData.password.length === 0) return "";
    if (s <= 1) return "Weak";
    if (s <= 3) return "Moderate";
    return "Strong";
  };

  const getStrengthTextColor = (s: number) => {
    if (s <= 1) return "text-red-500";
    if (s <= 3) return "text-yellow-500";
    return "text-green-500";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
    if (error) setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.school || !formData.section || !formData.password || !formData.confirmPassword) {
      setError("All fields must be filled.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.terms) {
      setError("You must agree to the terms.");
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError || !data.user) {
      console.error("Auth signup error:", authError);
      setError(authError?.message || "Signup failed");
      return;
    }

    console.log("Auth user created:", data.user.id);

    // Insert user profile into database
    const { data: insertData, error: dbError } = await supabase.from("users").insert({
      auth_user_id: data.user.id,
      user_name: formData.name,
      user_email: formData.email,
      school_name: formData.school,
      class_name: formData.section,
    }).select();

    if (dbError) {
      console.error("Database insert error:", dbError);
      setError(`Profile creation failed: ${dbError.message}. Please contact support.`);
      return;
    }

    console.log("User profile created:", insertData);
    router.push("/home");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />

      <Card className="z-10 w-full max-w-md border-white/5 bg-surface/50 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-textPrimary">Join LearnLabz</h2>
          <p className="mt-2 text-sm text-textSecondary">
            Begin your path to AI enlightenment
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Full Name</label>
            <Input
              id="name"
              type="text"
              placeholder="Ada Lovelace"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="scholar@learnlabz.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">School/College Name</label>
            <Input
              id="school"
              type="text"
              placeholder="Enter your school or college name"
              value={formData.school}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Section</label>
            <Input
              id="section"
              type="text"
              placeholder="Enter your section"
              value={formData.section}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Password</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {formData.password && (
              <>
                <div className="h-1 w-full rounded bg-white/10 mt-2">
                  <div
                    className={`h-full rounded transition-all duration-300 ${getStrengthColor(strength)}`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-[10px] mt-1 ${getStrengthTextColor(strength)}`}>
                  {getStrengthText(strength)}
                </p>
              </>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase text-textSecondary">Confirm Password</label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
              className="mt-1 rounded border-white/10 bg-black/20 text-accent focus:ring-accent"
            />
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
