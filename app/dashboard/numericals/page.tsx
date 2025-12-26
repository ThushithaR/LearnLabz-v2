"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { courses, CourseId } from "@/lib/courses";

export default function NumericalsPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the user's enrolled course with numericals
    // Since the user chose AIML during signup, redirect to AIML numericals
    const course = courses.aiml;
    if (course && course.features.numericals && course.numericals && course.numericals.length > 0) {
      router.replace(`/dashboard/numericals/aiml`);
    } else {
      // Fallback to 404 if no course with numericals is available
      router.replace("/404");
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-textSecondary">Loading numericals...</p>
      </div>
    </div>
  );
}
