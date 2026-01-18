"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useCourse } from "@/lib/context/CourseContext";
import { ArrowRight, BrainCircuit, MessageSquareText, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { COURSE_ID_MAP } from "@/lib/courses";
import { updateUserStreakOnLogin } from "@/lib/supabase/streak";
import { enrollUserInCourse } from "@/lib/supabase/user-courses";

export default function HomePage() {
  const router = useRouter();
  const { setSelectedCourse } = useCourse();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  
  // Strak logic
  useEffect(() => {
  const init = async () => {
    const userIdStr = localStorage.getItem("user_id");
    if (!userIdStr) return;

    const userId = parseInt(userIdStr);
    await updateUserStreakOnLogin(userId);
  };

  init();
  }, []);

  // 🔐 Protect Home Page
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login"); // block access
        return;
      }

      // Get the user's actual ID from the profile
      const userIdStr = localStorage.getItem("user_id");
      if (userIdStr) {
        setUserId(parseInt(userIdStr));
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleCourseSelect = async (course: "aiml" | "nlp" | "foundation") => {
    setSelectedCourse(course);
    
    // Save course enrollment to database
    if (userId) {
      try {
        const courseId = COURSE_ID_MAP[course];
        await enrollUserInCourse(userId, courseId);
      } catch (error) {
        console.error("Failed to enroll user in course:", error);
      }
    }
    
    router.push(`/dashboard/${course}`);
  };

  // ⏳ Prevent UI flash
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-accent/10 blur-xl absolute inset-0" />
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
            <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          </div>
        </div>

        <p className="text-sm text-textSecondary tracking-wide animate-pulse">
          Securing your workspace…
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-textPrimary">
            Choose Your Course
          </h1>
          <p className="text-textSecondary">
            Select a track to begin your learning journey
          </p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI/ML Card */}
          <Card
              className="relative p-6 rounded-2xl bg-[var(--bg-secondary)] border border-white/10 shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:border-[var(--accent-primary)] cursor-pointer overflow-hidden group"
              onClick={() => handleCourseSelect("aiml")}
            >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40" />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <BrainCircuit className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-textPrimary group-hover:text-accent transition-colors">
                  AI & Machine Learning
                </h3>
                <p className="text-sm text-textSecondary mt-1">
                  Neural Networks & Deep Learning
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-textSecondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          </Card>

          {/* NLP Card */}
          <Card
              className="relative p-6 rounded-2xl bg-[var(--bg-secondary)] border border-white/10 shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:border-[var(--accent-primary)] cursor-pointer overflow-hidden group"
              onClick={() => handleCourseSelect("nlp")}
            >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40" />
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-highlight/20 flex items-center justify-center group-hover:bg-highlight/30 transition-colors">
                <MessageSquareText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-textPrimary group-hover:text-accent transition-colors">
                  Natural Language Processing
                </h3>
                <p className="text-sm text-textSecondary mt-1">
                  LLMs & Transformers
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-textSecondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </div>
          </Card>

        {/* Foundation Card */}
        <Card
              className="relative p-6 rounded-2xl bg-[var(--bg-secondary)] border border-white/10 shadow-md transition-all duration-300 ease-out hover:shadow-xl hover:border-[var(--accent-primary)] cursor-pointer overflow-hidden group"
              onClick={() => handleCourseSelect("foundation")}
            >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-40" />
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-lg bg-highlight/20 flex items-center justify-center group-hover:bg-highlight/30 transition-colors">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-textPrimary group-hover:text-accent transition-colors">
                Foundation (Class 10)
              </h3>
              <p className="text-sm text-textSecondary mt-1">
                Foundation of AIML and NLP
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-textSecondary group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </div>
        </Card>
        </div>
        {/* Bottom note */}
        <div className="text-center">
          <p className="text-sm text-textSecondary">
            Not sure?{" "}
            <span className="text-accent">Start with Foundation</span>{" "}
            for a comprehensive understanding.
          </p>
        </div>
      </div>
    </main>
  );
}
