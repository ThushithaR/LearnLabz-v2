"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { aiml } from "@/lib/courses/aiml";
import { nlp } from "@/lib/courses/nlp";

export default function ModulesPage({ params }: { params: { course: string } }) {
  const { course } = params;
  const courseData = course === "aiml" ? aiml : nlp;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-textPrimary">Units - {courseData.name}</h1>
        <p className="text-textSecondary">
          Structured curriculum designed for depth and mastery.
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid gap-6">
        {courseData.modules.map((unit) => (
          <Card
            key={unit.id}
            className={`overflow-hidden transition-all ${
              unit.isLocked ? "opacity-70 grayscale-[0.5]" : "hover:border-accent/40"
            }`}
          >
            <div className="flex flex-col md:flex-row">
              {/* Visual Side */}
              <div
                className={`w-full md:w-48 h-32 md:h-auto shrink-0 flex items-center justify-center text-4xl font-bold ${
                  unit.isLocked
                    ? "bg-surface"
                    : "bg-gradient-to-br from-accent/20 to-highlight/20 text-accent"
                }`}
              >
                {unit.id}
              </div>

              {/* Content Side */}
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-textSecondary">
                        Unit {unit.id}
                      </span>
                      {(unit as any).active && <Badge variant="accent">Current</Badge>}
                      {unit.isLocked && <Badge variant="outline">Locked</Badge>}
                    </div>
                    <h2 className="text-xl font-bold text-textPrimary">{unit.title}</h2>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-textPrimary">{unit.progress}%</div>
                    <div className="text-xs text-textSecondary">Mastery</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-textSecondary">
                    <span>{unit.lessons.length} Lessons • 3 Quizzes • 1 Project</span>
                  </div>
                  <ProgressBar value={unit.progress} />
                </div>

                <div className="pt-2 flex gap-3">
                  {unit.isLocked ? (
                    <Button disabled variant="secondary" className="w-full sm:w-auto">
                      Locked
                    </Button>
                  ) : (
                    <Link href={`/lib/modules/nlp/DataAcquisition.tsx`}>
                      <Button className="w-full sm:w-auto">
                        {(unit as any).active ? "Continue Learning" : "Review Unit"}
                      </Button>
                    </Link>
                  )}
                  {!unit.isLocked && (
                    <Button variant="outline" className="w-full sm:w-auto">
                      View Syllabus
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
