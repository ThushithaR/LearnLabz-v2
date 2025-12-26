import React from 'react';

export const aimlQuizzes = [
  {
    id: 101,
    title: 'Introduction to AI - Easy',
    unit: 'Unit I',
    difficulty: 'Easy',
    time: '15 min',
    questions: 10,
    xp: 50,
    status: 'Completed',
    score: '85%',
    questionData: [
      {
        id: 1,
        question: 'What does AI stand for?',
        options: ['Artificial Intelligence', 'Automated Integration', 'Advanced Interface', 'Algorithmic Implementation'],
        correct: 0,
        explanation: 'AI stands for Artificial Intelligence, which is the simulation of human intelligence in machines.'
      },
      {
        id: 2,
        question: 'Which of the following is NOT a component of an intelligent agent?',
        options: ['Percepts', 'Actions', 'Environment', 'Database'],
        correct: 3,
        explanation: 'Intelligent agents consist of percepts (inputs), actions (outputs), and environment, but not necessarily a database.'
      },
      // Add more questions...
    ]
  },
  {
    id: 102,
    title: 'Introduction to AI - Medium',
    unit: 'Unit I',
    difficulty: 'Medium',
    time: '25 min',
    questions: 15,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
      // Medium level questions for Unit I
    ]
  },
  {
    id: 103,
    title: 'Introduction to AI - Hard',
    unit: 'Unit I',
    difficulty: 'Hard',
    time: '35 min',
    questions: 20,
    xp: 200,
    status: 'Locked',
    score: '-',
    questionData: [
      // Hard level questions for Unit I
    ]
  },
  {
    id: 201,
    title: 'Search Strategies - Easy',
    unit: 'Unit II',
    difficulty: 'Easy',
    time: '20 min',
    questions: 12,
    xp: 60,
    status: 'Available',
    score: '-',
    questionData: [
      // Easy questions for Unit II
    ]
  },
  // Add more quizzes for other units...
];

export default aimlQuizzes;
