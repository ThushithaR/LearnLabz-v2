"use client";
import AIChallenges from "@/components/daily-challenges/AIChallenges";

export default function DailyChallengePage({ params }: { params: { course: string } }) {
  return <AIChallenges />;
}