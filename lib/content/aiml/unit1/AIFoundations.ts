import { LessonSection } from "@/lib/types/course";

export const aiFoundationsContent = {
    overview:
        "The foundation of Artificial Intelligence is built upon contributions from multiple disciplines such as philosophy, mathematics, psychology, neuroscience, linguistics, economics, and computer engineering.",

    objectives: [
        "Identify disciplines contributing to AI",
        "Understand philosophical and mathematical foundations",
        "Explain how knowledge leads to intelligent action"
    ],

    sections: [
        {
            type: "text" as const,
            title: "Philosophical Foundations",
            content: `From over 2000 years of philosophy come theories of reasoning and learning, along with the idea that the mind is formed by the operation of a physical system.

Key philosophical questions include:
- Can formal rules be used to draw valid conclusions?
- Where does knowledge come from?
- How does knowledge lead to action?`
        },
        {
            type: "text" as const,
            title: "Mathematics and Logic",
            content: `Mathematics contributes formal theories of logic, probability, decision-making, and computation.

It helps answer:
- What can be computed?
- How do we reason with uncertain information?`
        },
        {
            type: "text" as const,
            title: "Other Contributing Disciplines",
            content: `Psychology provides tools to study the human mind.
Neuroscience explains how the brain processes information.
Linguistics explains how language relates to thought.
Economics focuses on decision-making and maximizing payoff.
Computer engineering provides efficient computing systems.

Together, these fields contribute ideas, viewpoints, and techniques to AI.`
        }
    ]
};

export type AIFoundationsContent = typeof aiFoundationsContent;