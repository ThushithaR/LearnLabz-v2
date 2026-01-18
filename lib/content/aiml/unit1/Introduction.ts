import { LessonSection } from "@/lib/types/course";

export const introductionContent = {
    overview:
        "Artificial Intelligence (AI) focuses on building systems that can mimic human problem-solving and decision-making abilities. This section introduces AI, explains what intelligence means in machines, and outlines the four major definitions of AI based on human vs rational behavior.",

    objectives: [
        "Define Artificial Intelligence",
        "Understand human-centered and rationalist approaches",
        "Explain the concept of rationality in AI systems"
    ],

    sections: [
        {
            type: "text" as const,
            title: "What is Artificial Intelligence?",
            content: `Artificial Intelligence (AI) takes the advantages of computers and machines to mimic the problem-solving and decision-making capabilities of human beings.

A computer has intelligence enough to process and analyze data, whereas a machine by itself contains no intelligence and waits for instructions from a computer or user.

Definitions of AI vary along two dimensions:
1. Thought processes and reasoning
2. Behavior

An AI system is said to be rational if it does the right thing.`
        },
        {
            type: "text" as const,
            title: "Four Categories of AI Definitions",
            content: `AI definitions are classified into four categories:

1. Systems that think like humans
2. Systems that think rationally
3. Systems that act like humans
4. Systems that act rationally

Human-centered approaches are empirical sciences involving hypothesis and experimentation.
Rationalist approaches combine mathematics and engineering.`
        },
        {
            type: "text" as const,
            title: "State of the Art in AI",
            content: `All four approaches have been followed during the development of AI systems. Modern AI applications often integrate multiple approaches rather than relying on a single definition of intelligence.`
        }
    ]
};

export type IntroductionContent = typeof introductionContent;