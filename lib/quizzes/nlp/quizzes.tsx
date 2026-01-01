import React from 'react';

export const nlpQuizzes = [
  {
    id: 101,
    title: 'Introduction to NLP - Easy',
    unit: 'Unit I',
    difficulty: 'Easy',
    time: '15 min',
    questions: 10,
    xp: 50,
    status: 'Completed',
    score: '90%',
    questionData: [
      {
        id: 1,
        question: 'What does NLP stand for?',
        options: ['Natural Language Processing', 'Neural Language Programming', 'Network Language Protocol', 'Natural Learning Process'],
        correct: 0,
        explanation: 'NLP stands for Natural Language Processing, which involves the interaction between computers and human language.'
      },
      {
        id: 2,
        question: 'Which of the following is a common NLP task?',
        options: ['Image recognition', 'Speech synthesis', 'Data compression', 'Network routing'],
        correct: 1,
        explanation: 'Speech synthesis is a common NLP task where text is converted to spoken language.'
      },
      // Add more questions...
    ]
  },
  {
    id: 102,
    title: 'Introduction to NLP - Medium',
    unit: 'Unit I',
    difficulty: 'Medium',
    time: '20 min',
    questions: 12,
    xp: 75,
    status: 'New',
    score: '-',
    questionData: [
      // Medium level questions for Unit I
    ]
  },
  {
    id: 103,
    title: 'Introduction to NLP - Hard',
    unit: 'Unit I',
    difficulty: 'Hard',
    time: '25 min',
    questions: 15,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
      // Hard level questions for Unit I
    ]
  },
  {
    id: 201,
    title: 'Text Preprocessing - Easy',
    unit: 'Unit II',
    difficulty: 'Easy',
    time: '18 min',
    questions: 11,
    xp: 55,
    status: 'Available',
    score: '-',
    questionData: [
      // Easy questions for Unit II
    ]
  },
  // Add more quizzes for other units...
];

export default nlpQuizzes;
