import React from 'react';

export const ProblemSolution: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Phase 1 (Immediate):</strong>
        <p>Use Heuristics. Create a list of 50 keywords for each category. This provides an instant, though imperfect, solution.</p>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Phase 2 (The "Silver" Dataset):</strong>
        <p>Use Back Translation to expand your small list of keywords into full sentences. Use Snorkel to label 5,000 unlabeled logs based on your Phase 1 rules.</p>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Phase 3 (The Model):</strong>
        <p>Train your NLP model on this "Silver" data.</p>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Phase 4 (Long-Term):</strong>
        <p>Set up Product Intervention to start collecting "Gold" data from real users for future updates.</p>
      </div>
    </div>
  );
};
