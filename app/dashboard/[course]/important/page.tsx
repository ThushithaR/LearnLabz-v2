"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Star, Clock, BookOpen, ArrowRight, Calculator } from "lucide-react";
import { useCourse } from "@/lib/context/CourseContext";
import { courses, CourseId } from "@/lib/courses";
import { StarredQuestion } from "@/lib/types/course";

const createStarredQuestion = (question: any, quiz: any, course: string, index: number): StarredQuestion => ({
  id: `${course}-${quiz.id}-${index}`,
  question: question.question,
  answer: question.options?.[question.correct],
  options: question.options,
  correct: question.correct,
  quizTitle: quiz.title,
  unit: quiz.unit,
  difficulty: quiz.difficulty,
  time: quiz.time,
  course: course,
  moduleId: quiz.id.toString(),
  questionIndex: index
});

export default function ImportantPage({ params }: { params: { course?: string } }) {
  const { selectedCourse } = useCourse();
  const course = params.course || selectedCourse;
  const [starredQuestions, setStarredQuestions] = useState<StarredQuestion[]>([]);
  const [starredNumericals, setStarredNumericals] = useState<StarredQuestion[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'quizzes' | 'numericals'>('all');

  useEffect(() => {
    if (!course) return;

    const courseData = courses[course as CourseId];
    if (!courseData) return;

    const allStarred: StarredQuestion[] = [];
    const allNumericals: StarredQuestion[] = [];



    // Load starred questions from all quizzes in this course
    if (courseData.actualquizzes) {
      courseData.actualquizzes.forEach((quiz: any) => {
        const storageKey = `starred_questions_${course}_${quiz.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const starredIndices = JSON.parse(saved) as number[];
          starredIndices.forEach((index) => {
            const question = quiz.questionData?.[index];
            if (question) {
              allStarred.push(createStarredQuestion(question, quiz, course, index));
            }
          });
        }
      });
    }

    // Load starred questions from modules
    if (courseData.modules) {
      courseData.modules.forEach((module: any) => {
        const storageKey = `starred_questions_${course}_${module.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const starredIds = JSON.parse(saved) as string[];
          starredIds.forEach((questionId) => {
            // Ensure questionId is a string before splitting
            const idStr = typeof questionId === 'string' ? questionId : String(questionId);
            const parts = idStr.split('-q');
            if (parts.length === 2) {
              const [lessonId, qNum] = parts;
              const lesson = module.lessons.find((l: any) => l.id === lessonId);
              if (lesson) {
                allStarred.push({
                  id: `${course}-${module.id}-${idStr}`,
                  question: `Quiz question from ${lesson.title}`,
                  quizTitle: lesson.title,
                  unit: `Unit ${module.id}`,
                  difficulty: "Medium",
                  time: lesson.duration || "10 min",
                  course: course,
                  moduleId: module.id.toString(),
                  questionIndex: parseInt(qNum) - 1
                });
              }
            }
          });
        }
      });
    }

    // Load starred numericals
    if (courseData.numericals && Array.isArray(courseData.numericals)) {
      const storageKey = `starred_numericals_${course}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const starredIds = JSON.parse(saved) as string[];
        starredIds.forEach((numericalId) => {
          const numerical = courseData.numericals?.find((n: any) => n.id.toString() === numericalId);
          if (numerical) {
            allNumericals.push({
              id: `${course}-numerical-${numericalId}`,
              question: numerical.topic,
              answer: `Numerical Problem: ${numerical.title}`,
              quizTitle: numerical.topic,
              unit: "Numericals",
              difficulty: numerical.difficulty,
              time: (numerical as any).time || "N/A",
              course: course,
              moduleId: "numericals",
              questionIndex: parseInt(numericalId)
            });
          }
        });
      }
    }

    setStarredQuestions(allStarred);
    setStarredNumericals(allNumericals);
  }, [course]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-white/10 text-textSecondary border-white/20";
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-textSecondary">Please select a course to view important questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-textPrimary flex items-center gap-3">
          <Star className="w-8 h-8 text-accent" />
          Important Questions
        </h1>
        <p className="text-textSecondary">
          Pre-defined important questions and those you've marked for review.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-accent/10 to-transparent border-accent/20">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <div>
              <div className="text-lg font-bold text-textPrimary">{starredQuestions.length}</div>
              <div className="text-[10px] text-textSecondary uppercase tracking-wider">Total Starred</div>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-lg font-bold text-textPrimary">
                {starredQuestions.filter(q => q.difficulty === "Easy").length}
              </div>
              <div className="text-[10px] text-textSecondary uppercase tracking-wider">Easy</div>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-lg font-bold text-textPrimary">
                {starredQuestions.filter(q => q.difficulty === "Medium").length}
              </div>
              <div className="text-[10px] text-textSecondary uppercase tracking-wider">Medium</div>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 font-bold text-xs">!</span>
            </div>
            <div>
              <div className="text-lg font-bold text-textPrimary">
                {starredQuestions.filter(q => q.difficulty === "Hard").length}
              </div>
              <div className="text-[10px] text-textSecondary uppercase tracking-wider">Hard</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant={activeFilter === 'all' ? 'primary' : 'outline'}
          onClick={() => setActiveFilter('all')}
          className="px-4"
        >
          All ({starredQuestions.length + starredNumericals.length})
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'quizzes' ? 'primary' : 'outline'}
          onClick={() => setActiveFilter('quizzes')}
          className="px-4"
        >
          Quizzes ({starredQuestions.length})
        </Button>
        <Button
          size="sm"
          variant={activeFilter === 'numericals' ? 'primary' : 'outline'}
          onClick={() => setActiveFilter('numericals')}
          className="px-4"
        >
          Numericals ({starredNumericals.length})
        </Button>
      </div>

      {/* Quiz Questions Section */}
      {(activeFilter === 'all' || activeFilter === 'quizzes') && starredQuestions.length > 0 && (
        <div className="bg-surface/20 rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Quiz Questions
              <Badge variant="outline" className="ml-2 bg-accent/10 text-accent border-accent/20">
                {starredQuestions.length}
              </Badge>
            </h2>
            <div className="text-sm text-textSecondary">
              Questions and answers from starred quizzes
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {starredQuestions.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-accent/40 transition-all group"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                        <span className="text-xs text-textSecondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.time}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-textPrimary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {item.question}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 fill-accent text-accent shrink-0" />
                    </div>
                  </div>

                  {/* Answer Section */}
                  {item.answer && (
                    <div className="mb-3 p-2 rounded bg-accent/10 border border-accent/20">
                      <p className="text-xs text-accent font-medium mb-1">✓ Correct Answer:</p>
                      <p className="text-xs text-textSecondary">{item.answer}</p>
                    </div>
                  )}

                  {/* Review Button */}
                  <div className="flex gap-2">
                    <Link href={`/dashboard/${course}/quizzes/${item.moduleId}`}>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        Review Question
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-textSecondary truncate">
                      {item.quizTitle}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 hover:border-accent/40 group-hover:bg-accent/5 px-2 py-1 text-xs"
                      onClick={() => {
                        const storageKey = `starred_questions_${course}_${item.moduleId}`;
                        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
                        const newStarred = saved.filter((index: number) => index !== item.questionIndex);
                        localStorage.setItem(storageKey, JSON.stringify(newStarred));
                        window.location.reload();
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Numericals Section */}
      {(activeFilter === 'all' || activeFilter === 'numericals') && starredNumericals.length > 0 && (
        <div className={activeFilter === 'all' && starredQuestions.length > 0 ? "mt-6" : ""}>
          <div className="bg-surface/20 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
                <Calculator className="w-5 h-5 text-accent" />
                Numericals
                <Badge variant="outline" className="ml-2 bg-accent/10 text-accent border-accent/20">
                  {starredNumericals.length}
                </Badge>
              </h2>
              <div className="text-sm text-textSecondary">
                Starred numerical topics for quick reference
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {starredNumericals.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent hover:border-accent/40 transition-all group"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                            {item.difficulty}
                          </Badge>
                          <span className="text-xs text-textSecondary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-textPrimary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                          {item.question}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="w-4 h-4 fill-accent text-accent shrink-0" />
                      </div>
                    </div>

                    {/* Answer Section */}
                    {item.answer && (
                      <div className="mb-3 p-2 rounded bg-accent/10 border border-accent/20">
                        <p className="text-xs text-accent font-medium mb-1">Topic:</p>
                        <p className="text-xs text-textSecondary">{item.answer}</p>
                      </div>
                    )}

                    {/* Review Button */}
                    <div className="flex gap-2">
                      <Link href={`/dashboard/${course}/numericals/${item.questionIndex}`}>
                        <Button size="sm" variant="outline" className="flex-1 text-xs">
                          Solve Numerical
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs text-textSecondary truncate">
                        {item.quizTitle}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/10 hover:border-accent/40 group-hover:bg-accent/5 px-2 py-1 text-xs"
                        onClick={() => {
                          const storageKey = `starred_numericals_${course}`;
                          const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
                          const newStarred = saved.filter((id: string) => id !== item.questionIndex.toString());
                          localStorage.setItem(storageKey, JSON.stringify(newStarred));
                          window.location.reload();
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {((activeFilter === 'all' && starredQuestions.length === 0 && starredNumericals.length === 0) ||
        (activeFilter === 'quizzes' && starredQuestions.length === 0) ||
        (activeFilter === 'numericals' && starredNumericals.length === 0)) && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-textPrimary mb-2">
            {activeFilter === 'quizzes' ? 'No starred quiz questions yet' : 
             activeFilter === 'numericals' ? 'No starred numericals yet' : 
             'No important items yet'}
          </h3>
          <p className="text-textSecondary">
            {activeFilter === 'quizzes' ? 'Star quiz questions to see them here for quick review.' :
             activeFilter === 'numericals' ? 'Star numericals to see them here for quick reference.' :
             'Star quiz questions and numericals to see them here for quick review.'}
          </p>
        </div>
      )}
    </div>
  );
}
