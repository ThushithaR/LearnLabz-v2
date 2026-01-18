import { LessonSection } from "@/lib/types/course";

export const searchAlgosContent = {
    overview:
        "Search algorithms are universal problem-solving techniques used by AI agents. They help agents explore state spaces to reach goal states efficiently.",

    objectives: [
        "Understand problem-solving agents",
        "Differentiate uninformed and informed search",
        "Explain major search algorithms"
    ],

    sections: [
        {
            type: "text" as const,
            title: "Problem-Solving Agents",
            content: `Problem-solving agents use search strategies to find solutions.

Key terms include:
- Search Tree
- Path Cost
- Solution
- Optimal Solution`
        },
        {
            type: "text" as const,
            title: "Uninformed Search Strategies",
            content: `Uninformed (Blind) search does not use domain knowledge.

Examples:
- Breadth First Search (BFS)
- Depth First Search (DFS)
- Depth Limited Search
- Iterative Deepening DFS

BFS is complete and optimal but memory-intensive.
DFS is memory efficient but may not find a solution.`
        },
        {
            type: "text" as const,
            title: "Informed Search Strategies",
            content: `Informed search uses heuristic information.

Examples include:
- A* Search

Informed search is more efficient than uninformed search.`
        }
    ]
};

export type SearchAlgosContent = typeof searchAlgosContent;