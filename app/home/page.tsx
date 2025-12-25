"use client";

import { useRouter } from "next/navigation";
import { useCourse } from "@/lib/context/CourseContext";

export default function HomePage() {
  const router = useRouter();
  const { setSelectedCourse } = useCourse();

  const handleCourseSelect = (course: "aiml" | "nlp") => {
    setSelectedCourse(course);       // save in context
    router.push("/dashboard");       // go to dashboard
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">Choose Your Course</h1>
      <div className="flex gap-6">
        <button
          onClick={() => handleCourseSelect("aiml")}
          className="px-6 py-4 bg-accent text-white rounded-lg hover:bg-accent/80"
        >
          AI/ML
        </button>
        <button
          onClick={() => handleCourseSelect("nlp")}
          className="px-6 py-4 bg-accent text-white rounded-lg hover:bg-accent/80"
        >
          NLP
        </button>
      </div>
    </div>
  );
}
