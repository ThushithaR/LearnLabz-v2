"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCourse } from "@/lib/context/CourseContext";

export default function LeaderboardRedirectPage() {
  const { selectedCourse } = useCourse();
  const router = useRouter();

  useEffect(() => {
    if (selectedCourse) {
      router.push(`/dashboard/leaderboard/${selectedCourse}`);
    } else {
      router.push("/home");
    }
  }, [selectedCourse, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-textSecondary">Loading the leaderboard...</p>
      </div>
    </div>
  );
}
