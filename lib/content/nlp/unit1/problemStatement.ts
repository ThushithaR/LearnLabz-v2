export const problemStatementContent = {
  problem: "You've been hired by a rising e-commerce startup. You must build a system to route customer chat messages to either Commercial Inquiry or Technical Support.",

  twist: "The product is brand new. There are no historical logs, no labeled examples, and you have a two-week deadline to deploy a working version.",

  hints: [
    'If you have zero examples to train a model, can you use basic logic rules to start?',
    'If you find a similar dataset online, will it work for your specific product names?',
    'If you manually label only ten messages, can you use technology to turn those into a thousand?'
  ],

  solution: "Use a phased approach: Phase 1 - Heuristics with keywords, Phase 2 - Back Translation and Snorkel for silver data, Phase 3 - Train model on silver data, Phase 4 - Product intervention for gold data collection."
};

export type ProblemStatementContent = typeof problemStatementContent;
