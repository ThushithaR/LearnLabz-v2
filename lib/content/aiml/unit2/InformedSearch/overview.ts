export const overviewContent = {
  overview:
    "Informed search strategies use problem-specific heuristic knowledge to guide the search process and reach the goal node more efficiently than uninformed search methods.",

  objectives: [
    "Differentiate informed and uninformed search",
    "Understand the role of heuristics",
    "Recognize real-world applications of informed search"
  ],

  sections: [
    {
      type: "text" as const,
      title: "Informed vs Uninformed Search",
      content:
        "Uninformed search uses only the problem definition and explores the search space without any knowledge of the goal.\n\n" +
        "Informed search uses additional problem-specific knowledge to guide the search toward the goal.\n\n" +
        "Key differences:\n" +
        "- Uninformed search expands nodes blindly\n" +
        "- Informed search prioritizes promising nodes\n" +
        "- Informed search explores fewer nodes and is more efficient"
    },
    {
      type: "text" as const,
      title: "Role of Heuristics in Informed Search",
      content:
        "Heuristics provide an estimate of how close a current node is to the goal state.\n\n" +
        "Important points:\n" +
        "- Represented using a heuristic function h(n)\n" +
        "- Always returns a non-negative value\n" +
        "- Guides the selection of the next node to expand\n" +
        "- Reduces unnecessary exploration of the search space"
    },
    {
      type: "text" as const,
      title: "Applications of Informed Search",
      content:
        "Informed search strategies are applied in many practical problems:\n\n" +
        "- Path finding and navigation systems\n" +
        "- Route planning and map-based applications\n" +
        "- Puzzle solving such as the 8-puzzle problem\n" +
        "- Game playing algorithms\n" +
        "- Optimization problems where efficient solutions are required"
    }
  ]
};
