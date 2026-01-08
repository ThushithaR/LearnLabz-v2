export const heuristicsContent = {
  overview:
    "A heuristic function estimates the cost from the current node to the goal and guides informed search algorithms by reducing the search space and improving efficiency.",

  objectives: [
    "Define heuristic functions",
    "Understand admissible heuristics",
    "Understand consistent heuristics",
    "Understand Pure Heuristic Search",
    "Understand A* Search and its evaluation function",
    "Learn properties of heuristic-based search strategies"
  ],

  sections: [
    {
      type: "text" as const,
      title: "Heuristic Function h(n)",
      content:
        "A heuristic function h(n) estimates the minimum cost required to reach the goal from node n. It uses problem-specific knowledge to guide the search towards the goal more efficiently than uninformed search strategies."
    },
    {
      type: "text" as const,
      title: "Characteristics of Heuristic Functions",
      content:
        "Heuristic functions always return non-negative values and estimate how close the current state is to the goal. While they may not always guarantee the optimal solution, they are designed to find good solutions within a reasonable time."
    },
    {
      type: "text" as const,
      title: "Admissible Heuristics",
      content:
        "A heuristic is admissible if it never overestimates the actual cost to reach the goal. This property ensures that search algorithms like A* using admissible heuristics will always find the optimal solution."
    },
    {
      type: "text" as const,
      title: "Consistent (Monotonic) Heuristics",
      content:
        "A heuristic is consistent if for every node n and successor n′, the estimated cost of reaching the goal from n is no greater than the cost from n to n′ plus the heuristic cost of n′. Consistent heuristics ensure non-decreasing f(n) values along a path."
    },
    {
      type: "text" as const,
      title: "Pure Heuristic Search",
      content:
        "Pure heuristic search is the simplest form of informed search. It expands nodes solely based on their heuristic value h(n). The algorithm maintains an OPEN list for unexpanded nodes and a CLOSED list for expanded nodes, always selecting the node with the lowest heuristic value."
    },
    {
      type: "text" as const,
      title: "A* Search Algorithm",
      content:
        "A* search is a widely used best-first search algorithm that combines the actual path cost g(n) and the heuristic estimate h(n). It evaluates nodes using the function f(n) = g(n) + h(n), ensuring efficient and optimal search when admissible heuristics are used."
    },
    {
      type: "text" as const,
      title: "Evaluation Function in A*",
      content:
        "In A* search, g(n) represents the cost to reach node n from the start, while h(n) estimates the remaining cost to the goal. The evaluation function f(n) provides a balanced estimate of the total path cost through node n."
    },
    {
      type: "text" as const,
      title: "Example: 8-Puzzle Problem",
      content:
        "The 8-puzzle problem is a classic example of heuristic search. Common heuristics include the number of misplaced tiles and the Manhattan distance, which calculates the sum of horizontal and vertical distances of tiles from their goal positions."
    }
  ]
};
