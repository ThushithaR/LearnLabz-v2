"use client";

import { useRouter } from "next/navigation";
import { useCourse } from "@/lib/context/CourseContext";
import { ArrowRight, BrainCircuit, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const router = useRouter();
  const { setSelectedCourse } = useCourse();

  const handleCourseSelect = (course: "aiml" | "nlp") => {
    setSelectedCourse(course);
    router.push(`/dashboard/${course}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-textPrimary">Choose Your Course</h1>
          <p className="text-textSecondary">Select a track to begin your learning journey</p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* AI/ML Card */}
          <Card 
            className="p-6 border border-white/10 bg-surface/50 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group"
            onClick={() => handleCourseSelect("aiml")}
          >
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
            className="p-6 border border-white/10 bg-surface/50 hover:border-highlight/40 hover:bg-highlight/5 transition-all cursor-pointer group"
            onClick={() => handleCourseSelect("nlp")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-highlight/20 flex items-center justify-center group-hover:bg-highlight/30 transition-colors">
                <MessageSquareText className="w-6 h-6 text-highlight" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-textPrimary group-hover:text-highlight transition-colors">
                  Natural Language Processing
                </h3>
                <p className="text-sm text-textSecondary mt-1">
                  LLMs & Transformers
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-textSecondary group-hover:text-highlight group-hover:translate-x-1 transition-all" />
            </div>
          </Card>
        </div>

        {/* Bottom note */}
        <div className="text-center">
          <p className="text-sm text-textSecondary">
            Not sure? <span className="text-accent">Start with AI & ML</span> for a comprehensive foundation.
          </p>
        </div>
      </div>
    </main>
  );
}
