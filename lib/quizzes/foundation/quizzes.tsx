import React from 'react';

export const foundationQuizzes = [
  {
    id: 1001,
    title: 'Distunguish between AI, ML and DL ',
    unit: 'Unit I',
    difficulty: 'Easy',
    time: '10 min',
    questions: 8,
    xp: 50,
    status: 'Completed',
    score: '90%',
    questionData: [
    {
        id: 1,
        question: 'What does AI stand for?',
        options: ['Automated Information', 'Artificial Intelligence', 'Advanced Internet', 'Automatic Input'],
        correct: 1,
        explanation: 'AI stands for Artificial Intelligence, which mimics human intelligence.',
        topics: ['what is ai ml dl']
    },
    {
        id: 2,
        question: 'Which learning approach allows machines to improve using experience?',
        options: ['Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Data Mining'],
        correct: 2,
        explanation: 'Machine Learning enables systems to learn from past data and mistakes.',
        topics: ['what is ai ml dl']
    },
    {
        id: 3,
        question: 'Deep Learning is a subset of which concept?',
        options: ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Robotics'],
        correct: 1,
        explanation: 'Deep Learning comes under Machine Learning.',
        topics: ['what is ai ml dl']
    },
    {
        id: 4,
        question: 'What are rows in a dataset usually representing?',
        options: ['Features', 'Labels', 'Different data items', 'Algorithms'],
        correct: 2,
        explanation: 'Each row represents one data item or example.',
        topics: ['what is ai ml dl']
    },
    {
        id: 5,
        question: 'What do we call columns in a dataset?',
        options: ['Records', 'Features', 'Labels', 'Outputs'],
        correct: 1,
        explanation: 'Columns describe properties of data and are called features.',
        topics: ['what is ai ml dl']
    },
    {
        id: 6,
        question: 'Which type of data has tags attached to it?',
        options: ['Raw data', 'Unlabeled data', 'Testing data', 'Labeled data'],
        correct: 3,
        explanation: 'Labeled data contains predefined tags or outputs.',
        topics: ['what is ai ml dl']
    },
    {
        id: 7,
        question: 'What is the main purpose of a training dataset?',
        options: ['To test accuracy', 'To store results', 'To teach the model', 'To remove errors'],
        correct: 2,
        explanation: 'Training data is used to help the model learn patterns.',
        topics: ['what is ai ml dl']
    },
    {
        id: 8,
        question: 'Which model uses Artificial Neural Networks (ANN)?',
        options: ['Rule-based AI', 'Machine Learning', 'Deep Learning', 'Data Collection'],
        correct: 2,
        explanation: 'Deep Learning models use ANN to process large data.',
        topics: ['what is ai ml dl']
    }
    ]

  },
  {
    id: 1002,
    title: 'Distinguish between AI, ML and DL',
    unit: 'Unit I',
    difficulty: 'Medium',
    time: '15 min',
    questions: 7,
    xp: 100,
    status: 'New',
    score: '-',
    questionData: [
    {
        id: 1,
        question: 'Assertion (A): Deep Learning is considered the most advanced form of Artificial Intelligence.\nReason (R): Deep Learning uses larger datasets compared to Machine Learning.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 1,
        explanation: 'DL is advanced due to neural architectures, not just data size. Large datasets alone do not define advancement.',
        topics: ['what is ai ml dl']
    },
    {
        id: 2,
        question: 'Assertion (A): Machine Learning models always require labeled data for training.\nReason (R): Unlabeled data cannot be used to improve model performance.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 3,
        explanation: 'ML can work with unlabeled data in unsupervised learning. Unlabeled data is still useful for learning patterns.',
        topics: ['what is ai ml dl']
    },
    {
        id: 3,
        question: 'Assertion (A): In a fruit dataset, color can never be a label.\nReason (R): Labels depend on the prediction goal of the problem.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 3,
        explanation: 'Color can be a label in certain prediction tasks. What is a label depends entirely on the problem context.',
        topics: ['what is ai ml dl']
    },
    {
        id: 4,
        question: 'Assertion (A): Testing data improves the learning ability of a Machine Learning model.\nReason (R): Testing data is used only to measure how well the model performs on unseen data.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 3,
        explanation: 'Learning happens during training, not testing. Testing is purely for evaluation.',
        topics: ['what is ai ml dl']
    },
    {
        id: 5,
        question: 'Assertion (A): Artificial Intelligence can exist without Machine Learning.\nReason (R): Rule-based expert systems are a form of Artificial Intelligence.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 0,
        explanation: 'Rule-based systems perform intelligent tasks without learning. This directly proves AI can exist without ML.',
        topics: ['what is ai ml dl']
    },
    {
        id: 6,
        question: 'Assertion (A): Anomaly detection models usually learn what normal data looks like.\nReason (R): Anomalies are patterns that do not match normal behavior.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 0,
        explanation: 'Models learn normal patterns first. Deviations from this are flagged as anomalies.',
        topics: ['what is ai ml dl']
    },
    {
        id: 7,
        question: 'Assertion (A): Deep Learning always performs better than Machine Learning.\nReason (R): Deep Learning requires more computational power and data.',
        options: [
        'Both A and R are true, and R is the correct explanation of A',
        'Both A and R are true, but R is not the correct explanation of A',
        'A is true, R is false',
        'A is false, R is true'
        ],
        correct: 3,
        explanation: 'DL does not always outperform ML. Higher resource needs do not guarantee better results.',
        topics: ['what is ai ml dl']
    }
    ]

  },
  {
    id: 1003,
    title: 'Distinguish between AI, ML and DL',
    unit: 'Unit I',
    difficulty: 'Hard',
    time: '20 min',
    questions: 12,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Case Study 1: Smart Health Monitoring System\n\nA hospital has implemented a smart wearable device that continuously monitors patients’ heart rate, sleep patterns, and physical activity. The system uses Machine Learning models to detect irregular heartbeats and predict potential health risks. The hospital also wants the system to recognize patterns automatically in new types of health data, such as stress levels inferred from skin sensors.Answer the next few questions based on the given case study.\nWhich AI technique is primarily used when the system improves predictions based on historical patient data?',
    options: [
      'Artificial Intelligence',
      'Machine Learning',
      'Deep Learning',
      'Data Mining'
    ],
    correct: 1,
    explanation: 'ML improves performance from historical data without manual rule coding.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 2,
    question: 'If the system starts identifying new patterns in stress-related data without human guidance, which method is being applied?',
    options: [
      'Machine Learning',
      'Deep Learning',
      'Rule-based AI',
      'Statistical analysis'
    ],
    correct: 1,
    explanation: 'Deep Learning can learn new patterns from large, complex datasets automatically.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 3,
    question: 'What kind of dataset would be required to train the heartbeat anomaly detection model?',
    options: [
      'Unlabeled real-time data only',
      'Labeled historical heartbeat data',
      'Random patient records',
      'Featureless raw data'
    ],
    correct: 1,
    explanation: 'Supervised ML requires labeled examples of normal and abnormal heartbeats.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 4,
    question: 'Why should testing data be separate from training data in this system?',
    options: [
      'To increase training speed',
      'To prevent the model from memorizing patterns',
      'To reduce dataset size',
      'To automatically label new data'
    ],
    correct: 1,
    explanation: 'Separate testing ensures evaluation reflects unseen, real-world data accuracy.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 5,
    question: 'Case Study 2: E-Commerce Product Recommendation System\n\nAn online shopping platform uses an AI-based recommendation system to suggest products. The system tracks users’ browsing history, purchase patterns, and product ratings. The platform wants to automatically update recommendations as user preferences change over time and predict products a user might buy next week. Answer the next few questions based on the given case-study.\nWhich type of AI task is predicting the next product a user might buy?',
    options: [
      'Regression',
      'Classification',
      'Recommendation (Predictive Modeling)',
      'Clustering'
    ],
    correct: 2,
    explanation: 'Predicting the next likely purchase involves analyzing past data to suggest items.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 6,
    question: 'If the system continuously updates its recommendation model as users interact, which approach is being used?',
    options: [
      'Offline ML',
      'Online ML',
      'Rule-based AI',
      'Unsupervised learning'
    ],
    correct: 1,
    explanation: 'Online ML updates the model dynamically with new data from interactions.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 7,
    question: 'If the system clusters similar users to suggest products, which AI technique is applied?',
    options: [
      'Supervised Learning',
      'Unsupervised Learning',
      'Deep Learning',
      'Reinforcement Learning'
    ],
    correct: 1,
    explanation: 'Clustering is unsupervised and groups users without labeled outputs.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 8,
    question: 'What kind of data features are used in product recommendation?',
    options: [
      'User demographics, browsing history, purchase history',
      'Only product prices',
      'Random text data',
      'Featureless images'
    ],
    correct: 0,
    explanation: 'Recommendation models rely on user behavior and demographics for personalization.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 9,
    question: 'Case Study 3: Autonomous Vehicle Navigation\n\nA self-driving car uses sensors, cameras, and GPS to navigate city streets. It must identify pedestrians, vehicles, and traffic signs, predict movements of nearby vehicles, and decide safe actions in real-time. The car uses a combination of Deep Learning for image recognition and Machine Learning for trajectory prediction.Answer the next few questions based on the given case-study.\nWhich AI method allows the car to identify pedestrians in camera images?',
    options: [
      'Machine Learning',
      'Deep Learning',
      'Rule-based AI',
      'Anomaly Detection'
    ],
    correct: 1,
    explanation: 'CNN-based Deep Learning models are used for object detection in images.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 10,
    question: 'Predicting the future movement of nearby vehicles is an example of which ML task?',
    options: [
      'Classification',
      'Regression / Predictive Modeling',
      'Clustering',
      'Dimensionality Reduction'
    ],
    correct: 1,
    explanation: 'Regression predicts continuous future positions based on historical trajectories.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 11,
    question: 'Why is it important to feed the system diverse driving scenarios during training?',
    options: [
      'To reduce data storage',
      'To improve model generalization in real-world situations',
      'To make testing easier',
      'To reduce the number of sensors required'
    ],
    correct: 1,
    explanation: 'Diverse scenarios prevent overfitting and ensure safety in unseen conditions.',
    topics: ['What is AI, ML, DL']
  },
  {
    id: 12,
    question: 'If the car incorrectly classifies a traffic sign, which part of the AI pipeline failed?',
    options: [
      'Data collection',
      'Training / Model accuracy',
      'Testing data selection',
      'Rule implementation'
    ],
    correct: 1,
    explanation: 'Misclassification indicates the model did not learn the feature patterns accurately.',
    topics: ['What is AI, ML, DL']
  },
  
]
  },
  {
    id: 2001,
    title: 'Different Modelling Techniques',
    unit: 'Unit II',
    difficulty: 'Easy',
    time: '10 min',
    questions: 8,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
    {
        id: 1,
        question: 'Which learning approach uses rewards and penalties to improve performance?',
        options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Classification'],
        correct: 2,
        explanation: 'Reinforcement Learning learns through reward-based feedback.',
        topics: ['Modelling']
    },
    {
        id: 2,
        question: 'Which type of learning works with labeled data?',
        options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'Clustering'],
        correct: 2,
        explanation: 'Supervised learning requires labeled input-output data.',
        topics: ['Modelling']
    },
    {
        id: 3,
        question: 'Predicting house prices is an example of which model?',
        options: ['Classification', 'Regression', 'Clustering', 'Association'],
        correct: 1,
        explanation: 'Regression predicts continuous values like price.',
        topics: ['Modelling']
    },
    {
        id: 4,
        question: 'Identifying emails as spam or not spam is an example of:',
        options: ['Regression', 'Clustering', 'Classification', 'Reinforcement Learning'],
        correct: 2,
        explanation: 'Classification assigns data to predefined categories.',
        topics: ['Modelling']
    },
    {
        id: 5,
        question: 'Which learning model discovers patterns without labels?',
        options: ['Supervised Learning', 'Reinforcement Learning', 'Unsupervised Learning', 'Regression'],
        correct: 2,
        explanation: 'Unsupervised learning finds patterns in unlabeled data.',
        topics: ['Modelling']
    },
    {
        id: 6,
        question: 'Predicting temperature for tomorrow uses which type of data?',
        options: ['Discrete', 'Categorical', 'Continuous', 'Binary'],
        correct: 2,
        explanation: 'Temperature is a continuous value.',
        topics: ['Modelling']
    },
    {
        id:7,
        question: 'Which Deep Learning model is inspired by the human brain?',
        options: ['CNN', 'ANN', 'Regression', 'Clustering'],
        correct: 1,
        explanation: 'ANN is modeled after the human brain and nervous system.',
        topics: ['Modelling']
    },
    {
        id: 8,
        question: 'Which Deep Learning model is mainly used for image-related tasks?',
        options: ['ANN', 'Regression', 'CNN', 'Association'],
        correct: 2,
        explanation: 'CNNs are designed to process and analyze images.',
        topics: ['Modelling']
    }
    ]
  },
  {
    id: 2002,
    title: 'Different Modelling Techniques',
    unit: 'Unit II',
    difficulty: 'Medium',
    time: '15 min',
    questions: 7,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Assertion (A): A model that predicts tomorrow’s temperature is an example of supervised learning.\nReason (R): Supervised learning always involves predicting future values.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'Supervised learning uses labeled data, not necessarily future prediction.',
    topics: ['Modelling']
  },
  {
    id: 2,
    question: 'Assertion (A): Clustering algorithms can be applied to labeled datasets.\nReason (R): Clustering does not use labels while forming groups.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 1,
    explanation: 'Labels may exist but are ignored during clustering.',
    topics: ['Modelling']
  },
  {
    id: 3,
    question: 'Assertion (A): A regression model can be used to solve a classification problem.\nReason (R): Regression outputs can be converted into classes using thresholds.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Thresholding continuous outputs enables class prediction.',
    topics: ['Modelling']
  },
  {
    id: 4,
    question: 'Assertion (A): CNNs perform better than traditional ANNs for image tasks.\nReason (R): CNNs reduce the number of parameters using weight sharing.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Weight sharing helps capture spatial patterns efficiently.',
    topics: ['Modelling']
  },
  {
    id: 5,
    question: 'Assertion (A): Anomaly detection is a type of classification problem.\nReason (R): Anomaly detection separates normal data from unusual data.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 1,
    explanation: 'Separation exists, but labels are often absent.',
    topics: ['Modelling']
  },
  {
    id: 6,
    question: 'Assertion (A): Unsupervised learning models cannot be evaluated for accuracy.\nReason (R): There are no true labels to compare predictions against.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 3,
    explanation: 'Evaluation exists using metrics like silhouette score.',
    topics: ['Modelling']
  },
  {
    id: 7,
    question: 'Assertion (A): Deep learning models always perform better when more data is added.\nReason (R): More data can reduce overfitting and improve generalization.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 3,
    explanation: 'Poor-quality or irrelevant data can hurt performance.',
    topics: ['Modelling']
  }
]
  },
  {
    id: 2003,
    title: 'Different Modelling Techniques',
    unit: 'Unit II',
    difficulty: 'Hard',
    time: '20 min',
    questions: 12,
    xp: 159,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Case Study 1: Smart School Performance System\n\nA school uses an AI system to analyze student data such as attendance, assignment scores, test marks, and time spent on online learning platforms.\nThe goal is to predict final exam performance and also identify students who behave very differently from the majority.Answer the next few questions based on the given case-study.\nWhich learning approach is most suitable for predicting final exam scores?',
    options: [
      'Clustering',
      'Regression',
      'Reinforcement Learning',
      'Anomaly Detection'
    ],
    correct: 1,
    explanation: 'Exam scores are continuous numerical values.',
    topics: ['Modelling']
  },
  {
    id: 2,
    question: 'Which technique is best suited to identify students with unusual behavior patterns?',
    options: [
      'Classification',
      'Regression',
      'Anomaly Detection',
      'Supervised Learning'
    ],
    correct: 2,
    explanation: 'Unusual patterns indicate anomalies.',
    topics: ['Modelling']
  },
  {
    id: 3,
    question: 'If the school groups students based on learning behavior without using grades, this is an example of:',
    options: [
      'Classification',
      'Clustering',
      'Regression',
      'Reinforcement Learning'
    ],
    correct: 1,
    explanation: 'Groups are formed without labels.',
    topics: ['Modelling']
  },
  {
    id: 4,
    question: 'If past student records with known outcomes are used, the system mainly relies on:',
    options: [
      'Unsupervised learning',
      'Reinforcement learning',
      'Supervised learning',
      'Online learning'
    ],
    correct: 2,
    explanation: 'Known outcomes imply labeled data.',
    topics: ['Modelling']
  },
  {
    id: 5,
    question: 'Case Study 2: Online Shopping Recommendation System\n\nAn e-commerce platform tracks user clicks, search history, purchases, and time spent on products.\nIt wants to **recommend products, group similar customers, and detect fraudulent purchase behavior.Answer the next few questions based on the given case-study.\nProduct recommendation based on past purchases mainly uses:',
    options: [
      'Clustering',
      'Association Rule Learning',
      'Regression',
      'Image Classification'
    ],
    correct: 1,
    explanation: 'It finds item relationships.',
    topics: ['Modelling']
  },
  {
    id: 6,
    question: 'Grouping customers based on browsing behavior without predefined categories uses:',
    options: [
      'Supervised learning',
      'Regression',
      'Clustering',
      'Reinforcement learning'
    ],
    correct: 2,
    explanation: 'No labels are involved.',
    topics: ['Modelling']
  },
  {
    id: 7,
    question: 'Identifying abnormal purchasing patterns is best handled by:',
    options: [
      'Classification',
      'Anomaly Detection',
      'Regression',
      'Clustering'
    ],
    correct: 1,
    explanation: 'Fraud deviates from normal behavior.',
    topics: ['Modelling']
  },
  {
    id: 8,
    question: 'If the system improves recommendations using user feedback (likes/dislikes), it resembles:',
    options: [
      'Supervised learning',
      'Unsupervised learning',
      'Reinforcement learning',
      'Association learning'
    ],
    correct: 2,
    explanation: 'Feedback acts as reward or penalty.',
    topics: ['Modelling']
  },
  {
    id: 9,
    question: 'Case Study 3: Smart Traffic Management System\nA city deploys cameras and sensors to monitor traffic flow.\nThe system must classify vehicles, predict congestion levels, and optimize signal timing automatically.Identifying whether a vehicle is a car, bike, or bus is a:',
    options: [
      'Regression task',
      'Clustering task',
      'Classification task',
      'Anomaly detection task'
    ],
    correct: 2,
    explanation: 'Output belongs to predefined classes.',
    topics: ['Modelling']
  },
  {
    id: 10,
    question: 'Predicting traffic density for the next hour is best modeled using:',
    options: [
      'Classification',
      'Regression',
      'Clustering',
      'Reinforcement learning'
    ],
    correct: 1,
    explanation: 'Traffic density is numerical.',
    topics: ['Modelling']
  },
  {
    id: 11,
    question: 'Automatically adjusting traffic signals based on traffic conditions uses:',
    options: [
      'Supervised learning',
      'Unsupervised learning',
      'Reinforcement learning',
      'Association learning'
    ],
    correct: 2,
    explanation: 'The system learns from rewards like reduced congestion.',
    topics: ['Modelling']
  },
  {
    id: 12,
    question: 'Grouping roads with similar traffic patterns without labels is:',
    options: [
      'Regression',
      'Classification',
      'Clustering',
      'Anomaly detection'
    ],
    correct: 2,
    explanation: 'Similar patterns are grouped without labels.',
    topics: ['Modelling']
  }
]

  },
  {
    id: 3001,
    title: 'Undertanding Neural Networks',
    unit: 'Unit III',
    difficulty: 'Easy',
    time: '10 min',
    questions: 10,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Neural networks are loosely modeled after which system?',
    options: ['Computer memory', 'Human brain', 'Internet network', 'Electrical circuits'],
    correct: 1,
    explanation: 'Neural networks are inspired by the working of neurons in the human brain.',
    topics: ['Neural Networks']
  },
  {
    id: 2,
    question: 'What is the key advantage of neural networks?',
    options: ['They require very little data', 'They automatically extract features', 'They do not need algorithms', 'They work only for numbers'],
    correct: 1,
    explanation: 'Neural networks can extract features automatically without programmer input.',
    topics: ['Neural Networks']
  },
  {
    id: 3,
    question: 'Which layer of a neural network receives the input data?',
    options: ['Hidden layer', 'Output layer', 'Input layer', 'Bias layer'],
    correct: 2,
    explanation: 'The input layer only receives data and passes it forward.',
    topics: ['Neural Networks']
  },
  {
    id: 4,
    question: 'In which layer does most of the computation occur?',
    options: ['Input layer', 'Hidden layer', 'Output layer', 'Data layer'],
    correct: 1,
    explanation: 'Hidden layers perform computations using weights and biases.',
    topics: ['Neural Networks']
  },
  {
    id: 5,
    question: 'What do weights represent in a neural network?',
    options: ['Fixed values', 'Importance of inputs', 'Output values', 'Number of layers'],
    correct: 1,
    explanation: 'Weights indicate how important each input is to the decision.',
    topics: ['Neural Networks']
  },
  {
    id: 6,
    question: 'What is the role of bias in a neural network?',
    options: ['To increase input size', 'To adjust the decision threshold', 'To remove noise', 'To normalize data'],
    correct: 1,
    explanation: 'Bias helps shift the output and control the decision boundary.',
    topics: ['Neural Networks']
  },
  {
    id: 7,
    question: 'Which layer gives the final result to the user?',
    options: ['Input layer', 'Hidden layer', 'Output layer', 'Bias layer'],
    correct: 2,
    explanation: 'The output layer presents the final prediction to the user.',
    topics: ['Neural Networks']
  },
  {
    id: 8,
    question: 'Neural networks are especially useful when the dataset is',
    options: ['Very small', 'Text-based only', 'Very large', 'Manually labeled'],
    correct: 2,
    explanation: 'Neural networks perform well on large and complex datasets.',
    topics: ['Neural Networks']
  },
  {
    id: 9,
    question: 'Neural networks learn mainly through',
    options: ['Guessing', 'Trial and error', 'Copying data', 'Fixed rules'],
    correct: 1,
    explanation: 'Learning happens by adjusting weights based on errors.',
    topics: ['Neural Networks']
  },
  {
    id: 10,
    question: 'Which of the following is a real-world application of neural networks?',
    options: ['Calculator operations', 'Facial recognition', 'File compression', 'Sorting numbers'],
    correct: 1,
    explanation: 'Neural networks are widely used in facial recognition systems.',
    topics: ['Neural Networks']
  }
]
  },
  {
    id: 3002,
    title: 'Undertanding Neural Networks',
    unit: 'Unit III',
    difficulty: 'Medium',
    time: '15 min',
    questions: 10,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Assertion (A): In a neural network, the hidden layers are termed “hidden” because their internal computations involving weights, biases, and activation functions are not directly visible to the user, even though they play a central role in determining the final output.\nReason (R): Hidden layers are called hidden because they do not contribute to the final output and mainly serve as data storage units.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'Hidden layers perform essential computations and directly influence output, but they are not storage units.',
    topics: ['Neural Networks']
  },
  {
    id: 2,
    question: 'Assertion (A): A neural network designed to solve a highly complex problem, such as image recognition, often requires multiple hidden layers and a large number of nodes to successfully learn intricate patterns present in the data.\nReason (R): Increasing the number of hidden layers allows the network to represent complex, non-linear relationships within the dataset.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 1,
    explanation: 'Deeper networks can capture complex patterns, which explains why multiple hidden layers are used.',
    topics: ['Neural Networks']
  },
  {
    id: 3,
    question: 'Assertion (A): The input layer of a neural network plays a critical role in the decision-making process by applying weights and biases to the incoming data before passing it to the hidden layers.\nReason (R): The main responsibility of the input layer is to receive raw data and forward it without performing any computation.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 4,
    explanation: 'The input layer does not perform computations, but the assertion incorrectly claims that it does.',
    topics: ['Neural Networks']
  },
  {
    id: 4,
    question: 'Assertion (A): During the learning process of a neural network, the weights associated with each node are continuously adjusted to minimize the difference between the predicted output and the desired output.\nReason (R): Weights in a neural network are fixed values that are decided randomly at the beginning and remain unchanged during training.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 3,
    explanation: 'Weights are adjusted during training, but the reason falsely claims they remain fixed.',
    topics: ['Neural Networks']
  },
  {
    id: 5,
    question: 'Assertion (A): Bias in a neural network allows the model to produce meaningful outputs even when all input values are zero, making the decision boundary more flexible.\nReason (R): Bias functions in a neural network similarly to personal caution in human decision-making, influencing whether the model leans toward or away from a decision.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'Both statements are true, but the reason is an analogy, not a technical explanation.',
    topics: ['Neural Networks']
  },
  {
    id: 6,
    question: 'Assertion (A): Two individuals facing the same real-world situation may make different decisions because the values they assign to the importance of each factor vary.\nReason (R): In neural networks, weights and bias values can differ even when the input data remains the same, leading to different outputs.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'Both are true, but the reason draws a parallel rather than explaining the assertion.',
    topics: ['Neural Networks']
  },
  {
    id: 7,
    question: 'Assertion (A): There is no universally correct set of weights for a neural network, even if multiple networks achieve the same level of accuracy on a given task.\nReason (R): Different combinations of weights and biases can produce similar outputs while satisfying the learning objective.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 1,
    explanation: 'Multiple solutions can exist, which directly explains why no single correct weight set exists.',
    topics: ['Neural Networks']
  },
  {
    id: 8,
    question: 'Assertion (A): The output layer of a neural network primarily acts as an interface between the model and the user by presenting the final prediction.\nReason (R): The output layer performs complex feature extraction similar to hidden layers before generating results.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 3,
    explanation: 'Output layers present results but do not perform deep feature extraction.',
    topics: ['Neural Networks']
  },
  {
    id: 9,
    question: 'Assertion (A): Neural networks rely on trial-and-error learning, gradually improving performance as errors from previous predictions are used to adjust internal parameters.\nReason (R): Neural networks compare predicted outputs with desired outputs and update weights to reduce future errors.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 1,
    explanation: 'Error-based weight updates are the core mechanism behind trial-and-error learning.',
    topics: ['Neural Networks']
  },
  {
    id: 10,
    question: 'Assertion (A): Even when two neural networks are trained on the same dataset, their final outputs may differ if their initial weights or bias values are different.\nReason (R): Initial parameter values influence the learning path taken during training.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 1,
    explanation: 'Different starting points can lead networks to different solutions.',
    topics: ['Neural Networks']
  }
]
  },
  {
    id: 3003,
    title: 'Undertanding Neural Networks',
    unit: 'Unit III',
    difficulty: 'Hard',
    time: '20 min',
    questions: 8,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'CASE STUDY 1: Smart City Traffic Decision System\nA smart city uses a neural-network-based decision system to decide whether traffic lights should extend green time at an intersection.The system considers these inputs:\nX1: Current traffic density (high/low)\nX2: Time of day (peak/non-peak)\nX3: Emergency vehicle detected (yes/no)\nX4: Weather condition (clear/rainy)\nEach input is assigned a weight based on importance, and a bias is added to control sensitivity.\nThe final output decides whether to extend green light (1) or not (0).Answer the next few questions based on the given case-study.\nWhich component of the neural network determines how strongly traffic density affects the final decision?',
    options: [
      'Input layer',
      'Weight assigned to traffic density',
      'Bias term',
      'Activation function'
    ],
    correct: 1,
    explanation: 'Weights represent the importance of each input. Higher weight means traffic density influences the decision more. Bias affects overall sensitivity, not individual input importance.',
    topics: ['Neural Networks']
  },
  {
    id: 2,
    question: 'If emergency vehicle detection suddenly becomes the most critical factor, what change is MOST appropriate?',
    options: [
      'Increase bias value',
      'Increase weight of emergency vehicle input',
      'Add more hidden layers',
      'Remove activation function'
    ],
    correct: 1,
    explanation: 'Increasing the weight boosts the influence of that input. Bias shifts the decision threshold but does not prioritize inputs. Hidden layers affect complexity, not immediate importance.',
    topics: ['Neural Networks']
  },
  {
    id: 3,
    question: 'The system starts extending green light too often, even when traffic is low. What adjustment best fixes this?',
    options: [
      'Decrease traffic density weight',
      'Increase bias value',
      'Remove weather input',
      'Reduce number of input nodes'
    ],
    correct: 1,
    explanation: 'Increasing bias makes the system more conservative. It raises the threshold required for output to become 1. This reduces unnecessary green-light extensions.',
    topics: ['Neural Networks']
  },
  {
    id: 4,
    question: 'Why can two intersections using the same inputs still behave differently?',
    options: [
      'Inputs are processed randomly',
      'Neural networks do not use weights',
      'Different weight and bias values were learned',
      'Output layer performs extra computation'
    ],
    correct: 2,
    explanation: 'Different training experiences lead to different weights. Bias values may also vary based on desired sensitivity. Hence, decisions differ despite identical inputs.',
    topics: ['Neural Networks']
  },
  {
    id: 5,
    question: 'CASE STUDY 2: Facial Recognition Access System\nA facial recognition system uses a deep neural network to grant access to a secure building.\nThe model processes:Pixel intensity values from imagesMultiple hidden layers extract facial featuresOutput layer predicts Authorized (1) or Unauthorized (0)Over time, the system improves accuracy by adjusting internal parameters.Answer the next few questions based on the given case-study.\nWhy are hidden layers essential in this facial recognition system?',
    options: [
      'They store images permanently',
      'They manually select facial features',
      'They automatically extract complex patterns',
      'They reduce image size'
    ],
    correct: 2,
    explanation: 'Hidden layers learn features like edges and shapes. This happens automatically without manual programming. Such abstraction is crucial for image-based tasks.',
    topics: ['Neural Networks']
  },
  {
    id: 6,
    question: 'If lighting conditions change frequently, which ANN property helps the system adapt?',
    options: [
      'Fixed weights',
      'Bias and weight adjustment through training',
      'Input layer normalization',
      'Output layer threshold'
    ],
    correct: 1,
    explanation: 'Training updates weights and biases using error feedback. This allows adaptation to new conditions like lighting. Fixed weights would prevent learning.',
    topics: ['Neural Networks']
  },
  {
    id: 7,
    question: 'Two models trained on the same face dataset show different predictions. What is the MOST likely reason?',
    options: [
      'Input layer structure changed',
      'Output layer removed',
      'Different initial weights led to different learning paths',
      'Images were manually altered'
    ],
    correct: 2,
    explanation: 'Initial weights affect the optimization path. Different paths can lead to different solutions. Multiple correct models can exist.',
    topics: ['Neural Networks']
  },
  {
    id: 8,
    question: 'Why is there no single “correct” set of weights for facial recognition?',
    options: [
      'Neural networks are random systems',
      'Training data is always incorrect',
      'Multiple weight combinations can achieve similar accuracy',
      'Bias values are ignored'
    ],
    correct: 2,
    explanation: 'Different parameter combinations can minimize error. All may perform equally well on unseen data. Hence, no unique correct solution exists.',
    topics: ['Neural Networks']
  }
]

  },
  {
    id: 4001,
    title: 'Undertand the Process of Model Evaluation',
    unit: 'Unit IV',
    difficulty: 'Easy',
    time: '10 min',
    questions: 10,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'What is model evaluation in machine learning?',
    options: [
      'Collecting new data',
      'Measuring model performance using metrics',
      'Writing algorithms',
      'Deploying the model'
    ],
    correct: 1,
    explanation: 'Model evaluation checks how well a model performs using evaluation metrics.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 2,
    question: 'Why is model evaluation important in an AI project?',
    options: [
      'To increase dataset size',
      'To find model strengths and weaknesses',
      'To remove features',
      'To label data'
    ],
    correct: 1,
    explanation: 'Evaluation helps identify how good or bad a model is.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 3,
    question: 'Model evaluation is similar to which real-life example?',
    options: [
      'Attendance sheet',
      'Report card',
      'Library record',
      'Bus pass'
    ],
    correct: 1,
    explanation: 'It shows performance just like a report card shows academic results.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 4,
    question: 'What happens after evaluating a model?',
    options: [
      'The model is deleted',
      'Feedback is ignored',
      'Improvements are made based on feedback',
      'Data is recollected'
    ],
    correct: 2,
    explanation: 'Evaluation feedback helps improve the model.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 5,
    question: 'What is train-test split mainly used for?',
    options: [
      'Storing data',
      'Evaluating model performance',
      'Cleaning data',
      'Visualizing data'
    ],
    correct: 1,
    explanation: 'Train-test split helps evaluate how the model performs on unseen data.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 6,
    question: 'Which dataset is used to make the model learn?',
    options: [
      'Test dataset',
      'Validation dataset',
      'Training dataset',
      'Prediction dataset'
    ],
    correct: 2,
    explanation: 'The training dataset is used to teach the model.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 7,
    question: 'Why should we not evaluate a model using training data?',
    options: [
      'It reduces accuracy',
      'It causes underfitting',
      'It leads to overfitting',
      'It increases dataset size'
    ],
    correct: 2,
    explanation: 'The model may memorize training data, causing overfitting.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 8,
    question: 'What is the purpose of the testing dataset?',
    options: [
      'To train the model',
      'To collect data',
      'To test predictions on unseen data',
      'To clean data'
    ],
    correct: 2,
    explanation: 'Testing data checks model performance on new, unseen inputs.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 9,
    question: 'What does accuracy measure in a model?',
    options: [
      'Total data size',
      'Number of features',
      'Correct predictions made by the model',
      'Training time'
    ],
    correct: 2,
    explanation: 'Accuracy shows how many predictions are correct.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 10,
    question: 'In the concert example, who estimated the entry fee more accurately?',
    options: [
      'Bob',
      'Billy',
      'Both equally',
      'Cannot be determined'
    ],
    correct: 1,
    explanation: 'Billy’s estimate is closer to the actual entry fee of Rs 500.',
    topics: ['What and How to do Model Evaluation']
  }
]

  },
  {
    id: 4002,
    title: 'Undertand the Process of Model Evaluation',
    unit: 'Unit IV',
    difficulty: 'Medium',
    time: '15 min',
    questions: 10,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Assertion: Model evaluation plays a critical role in the AI project cycle because it helps determine whether a trained model will perform reliably when exposed to new, unseen data in real-world scenarios.\nReason: Model evaluation guarantees that the model will always make correct predictions on future data.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'Evaluation estimates future performance but cannot guarantee perfect predictions.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 2,
    question: 'Assertion: In machine learning, evaluation metrics act as constructive feedback that guide improvements to a model over multiple iterations.\nReason: Evaluation metrics directly change the model’s weights and parameters without human intervention.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'Metrics provide feedback, but parameter updates are done through training algorithms.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 3,
    question: 'Assertion: The train-test split technique is commonly used to evaluate supervised learning models by separating data used for learning from data used for performance assessment.\nReason: Using the same data for both training and testing can cause the model to simply memorize the data rather than truly learn from it.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 0,
    explanation: 'Memorization leads to overfitting, which train-test split helps avoid.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 4,
    question: 'Assertion: The primary objective of testing a machine learning model is to measure how accurately it predicts outputs for data that was not part of the training process.\nReason: The testing dataset always contains labeled data that the model has already seen during training.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'Testing data is unseen during training, though labels exist for evaluation.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 5,
    question: 'Assertion: Train-test split is considered appropriate only when a sufficiently large dataset is available for model development.\nReason: Splitting a very small dataset may result in unreliable evaluation of model performance.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 0,
    explanation: 'Small datasets make performance estimates unstable after splitting.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 6,
    question: 'Assertion: Evaluating a model using the same data that was used to train it can produce misleadingly high accuracy values.\nReason: The model may overfit by memorizing training examples instead of learning general patterns.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 0,
    explanation: 'Overfitting inflates training accuracy but harms generalization.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 7,
    question: 'Assertion: Accuracy alone is always sufficient to judge the quality of a machine learning model.\nReason: Accuracy only measures the proportion of correct predictions made by the model.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 3,
    explanation: 'Accuracy alone may be insufficient, even though its definition is correct.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 8,
    question: 'Assertion: Model evaluation is an iterative process where feedback from evaluation metrics is used to refine and improve the model.\nReason: Once a model achieves high accuracy on the training data, further evaluation is unnecessary.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 2,
    explanation: 'High training accuracy does not eliminate the need for proper evaluation.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 9,
    question: 'Assertion: In real-world deployment, machine learning models are typically used to make predictions on data for which the true output is unknown at the time of prediction.\nReason: This is why model evaluation aims to simulate real-world usage by testing on unseen data.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 0,
    explanation: 'Evaluation mirrors real-world prediction conditions.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 10,
    question: 'Assertion: In the concert ticket example, Billy’s estimate is considered more accurate than Bob’s estimate.\nReason: Accuracy depends on how close the predicted value is to the actual value.',
    options: [
      'Both Assertion and Reason are true, and Reason is the correct explanation',
      'Both Assertion and Reason are true, but Reason is NOT the correct explanation',
      'Assertion is true, but Reason is false',
      'Assertion is false, but Reason is true'
    ],
    correct: 0,
    explanation: 'Smaller error means higher accuracy in estimation.',
    topics: ['What and How to do Model Evaluation']
  }
]

  },
  {
    id: 4003,
    title: 'Undertand the Process of Model Evaluation',
    unit: 'Unit IV',
    difficulty: 'Hard',
    time: '20 min',
    questions: 8,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'CASE STUDY 1: Online Exam Cheating Detection System\n\nA university develops an AI model to detect cheating in online exams.\nThe model is trained using past exam data where cheating behavior is already known.\nAfter training, the developers test the model on a new batch of student data to check whether it can correctly identify cheating cases it has never seen before.\n\nAnswer the following based on the given case-study.\nWhy is it important to test the cheating detection model on new student data instead of the same data used for training?',
    options: [
      'To reduce training time',
      'To avoid overfitting and estimate real-world performance',
      'To increase dataset size',
      'To remove noisy data'
    ],
    correct: 1,
    explanation: 'Testing on unseen data checks whether the model has truly learned patterns. Using training data would inflate accuracy due to memorization. This mirrors real-world deployment conditions.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 2,
    question: 'The model shows 98% accuracy on training data but only 72% on testing data. What does this indicate?',
    options: [
      'The model is underfitting',
      'The dataset is incorrect',
      'The model is overfitting',
      'The evaluation metrics are wrong'
    ],
    correct: 2,
    explanation: 'High training accuracy with low test accuracy signals memorization. The model fails to generalize to unseen data. This is a classic overfitting scenario.',
    topics: ['What and How to do Model Evaluation']
  },
  {
    id: 3,
    question: 'If the university had only a very small dataset, which evaluation decision would be MOST reasonable?',
    options: [
      'Avoid splitting data and test on training data',
      'Use train-test split carefully or collect more data',
      'Ignore evaluation',
      'Use accuracy only'
    ],
    correct: 1,
    explanation: 'Small datasets make evaluation unstable. Careful splitting or more data is needed. Testing on training data gives misleading results.',
topics: ['What and How to do Model Evaluation']  },
  {
    id: 4,
    question: 'Why does model evaluation act like a “feedback loop” in this system?',
    options: [
      'It removes training data',
      'It decides cheating rules directly',
      'It helps improve the model after checking weaknesses',
      'It increases model complexity automatically'
    ],
    correct: 2,
    explanation: 'Evaluation highlights errors and weaknesses. This feedback guides improvements in the next iteration. The process continues until desired performance is achieved.',
topics: ['What and How to do Model Evaluation']  },
  {
    id: 5,
    question: 'CASE STUDY 2: Movie Ticket Price Prediction App\n\nA movie ticket booking app builds a regression model to predict ticket prices based on\nday, time, seat type, and demand.\nThe developers split historical data into training and testing datasets before evaluation.\nAnswer the following based on the given case-study.\nWhy is train-test split especially important for this pricing model?',
    options: [
      'Ticket prices never change',
      'The model must predict future prices accurately',
      'Regression models do not need evaluation',
      'Labels are unavailable'
    ],
    correct: 1,
    explanation: 'The model will be used on future, unseen price scenarios. Testing simulates real usage conditions. This ensures reliability after deployment.',
topics: ['What and How to do Model Evaluation']  },
  {
    id: 6,
    question: 'Suppose the developers evaluated the model using only training data and got very low error. What is the main risk?',
    options: [
      'Underfitting',
      'Data leakage',
      'Overfitting and false confidence',
      'Reduced dataset size'
    ],
    correct: 2,
    explanation: 'Low training error may hide poor real-world performance. The model may have memorized the data. This leads to false confidence.',
topics: ['What and How to do Model Evaluation']  },
  {
    id: 7,
    question: 'Two pricing models are trained on the same data. Model A has lower training error, but Model B performs better on test data. Which model should be preferred?',
    options: [
      'Model A, because training error is lower',
      'Model B, because it generalizes better',
      'Both are equal',
      'Neither is usable'
    ],
    correct: 1,
    explanation: 'Generalization is more important than training accuracy. Test performance reflects real-world behavior. Model B is more reliable.',
topics: ['What and How to do Model Evaluation']  },
  {
    id: 8,
    question: 'How does the concept of accuracy vs error apply to this pricing model?',
    options: [
      'Accuracy measures training time',
      'Error measures how far predictions are from actual prices',
      'Error is irrelevant for regression',
      'Accuracy and error mean the same thing'
    ],
    correct: 1,
    explanation: 'Regression focuses on minimizing prediction error. Smaller error means predictions are closer to true values. This determines model quality.',
topics: ['What and How to do Model Evaluation']  }
]


  },
  {
    id: 5001,
    title: 'Undertand Different Evaluation Metrics',
    unit: 'Unit V',
    difficulty: 'Easy',
    time: '10 min',
    questions: 10,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'In the concert example, who is more accurate in estimating the entry fee of Rs 500?',
    options: [
      'Bob',
      'Billy',
      'Both are equally accurate',
      'Accuracy cannot be determined'
    ],
    correct: 1,
    explanation: 'Billy’s estimate (Rs 550) is closer to Rs 500 than Bob’s Rs 300.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 2,
    question: 'What does “error” represent in machine learning?',
    options: [
      'Total predictions made',
      'Difference between prediction and actual value',
      'Number of correct predictions',
      'Size of the dataset'
    ],
    correct: 1,
    explanation: 'Error measures how far the model’s prediction is from the actual outcome.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 3,
    question: 'Which of the following best defines accuracy?',
    options: [
      'Total number of wrong predictions',
      'Ratio of incorrect predictions',
      'Total number of correct predictions',
      'Difference between predicted and actual values'
    ],
    correct: 2,
    explanation: 'Accuracy measures how many predictions the model gets right.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 4,
    question: 'In classification, what is the output produced by the model?',
    options: [
      'Continuous values',
      'Random numbers',
      'Class labels',
      'Images'
    ],
    correct: 2,
    explanation: 'Classification predicts discrete class labels like Yes/No or 0/1.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 5,
    question: 'Which tool shows predicted values versus actual values in a table format?',
    options: [
      'Histogram',
      'Confusion matrix',
      'Scatter plot',
      'Line graph'
    ],
    correct: 1,
    explanation: 'A confusion matrix compares actual outcomes with predicted outcomes.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 6,
    question: 'What does a True Positive (TP) indicate?',
    options: [
      'Model predicts negative and is wrong',
      'Model predicts positive and is correct',
      'Model predicts negative and is correct',
      'Model predicts positive and is wrong'
    ],
    correct: 1,
    explanation: 'True Positive means correctly predicting the positive class.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 7,
    question: 'Which metric focuses on reducing False Positives?',
    options: [
      'Accuracy',
      'Recall',
      'Precision',
      'Error rate'
    ],
    correct: 2,
    explanation: 'Precision measures how many predicted positives are actually correct.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 8,
    question: 'Recall is most important when which type of error must be minimized?',
    options: [
      'True Positives',
      'False Positives',
      'True Negatives',
      'False Negatives'
    ],
    correct: 3,
    explanation: 'Recall focuses on reducing False Negatives.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 9,
    question: 'Which metric combines both precision and recall into a single value?',
    options: [
      'Accuracy',
      'Error',
      'F1 Score',
      'Confusion matrix'
    ],
    correct: 2,
    explanation: 'F1 Score balances precision and recall.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 10,
    question: 'Accuracy alone may be misleading when the dataset is:',
    options: [
      'Small',
      'Clean',
      'Balanced',
      'Unbalanced'
    ],
    correct: 3,
    explanation: 'Accuracy can give false confidence in unbalanced datasets.',
    topics: ['Evaluation Metrics']
  }
    ]
  },
  {
    id: 5002,
    title: 'Undertand Different Evaluation Metrics',
    unit: 'Unit V',
    difficulty: 'Medium',
    time: '15 min',
    questions: 10,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Bob estimates the concert ticket price as Rs 300 and Billy estimates it as Rs 550, while the actual price is Rs 500. Which statement best explains why Billy is considered more accurate?',
    options: [
      'Billy’s estimate is higher than the actual value',
      'Billy’s absolute error is smaller than Bob’s',
      'Accuracy depends only on overestimation',
      'Bob’s prediction is invalid'
    ],
    correct: 1,
    explanation: 'Accuracy improves when the prediction error (difference from actual value) is smaller.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 2,
    question: 'Assertion (A): Accuracy and model performance are directly proportional. Reason (R): A model with higher accuracy always makes fewer critical mistakes in real-world applications.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'High accuracy does not always mean fewer critical mistakes, especially in sensitive domains.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 3,
    question: 'A disease prediction model correctly identifies 90 healthy patients and 5 infected patients, but misses 15 infected patients. Which metric would best reveal this weakness?',
    options: [
      'Accuracy',
      'Precision',
      'Recall',
      'F1 Score'
    ],
    correct: 2,
    explanation: 'Recall highlights how many actual positive cases are missed (False Negatives).',
    topics: ['Evaluation Metrics']
  },
  {
    id: 4,
    question: 'Assertion (A): Precision is preferred when False Positives must be minimized. Reason (R): Precision measures how many predicted positives are actually positive.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Precision directly penalizes False Positives.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 5,
    question: 'In a satellite launch prediction system, wrongly predicting bad weather as good weather can cause massive loss. Which metric should be prioritized?',
    options: [
      'Recall',
      'Precision',
      'Accuracy',
      'Error rate'
    ],
    correct: 1,
    explanation: 'Precision reduces False Positives, which are dangerous in this scenario.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 6,
    question: 'A confusion matrix shows a high number of True Negatives and very few True Positives. However, accuracy is still very high. What is the most likely issue?',
    options: [
      'The model is overfitting',
      'The dataset is balanced',
      'The dataset is unbalanced',
      'The model has zero error'
    ],
    correct: 2,
    explanation: 'In unbalanced datasets, accuracy can appear high even when positives are poorly detected.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 7,
    question: 'Assertion (A): Accuracy is sufficient as an evaluation metric for all classification problems. Reason (R): Accuracy treats all types of prediction errors as equally important.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 3,
    explanation: 'Treating all errors equally is exactly why accuracy is often insufficient.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 8,
    question: 'Which pair of confusion matrix terms represents completely correct predictions?',
    options: [
      'True Positive and False Negative',
      'False Positive and False Negative',
      'True Positive and True Negative',
      'True Negative and False Positive'
    ],
    correct: 2,
    explanation: 'Both TP and TN are correct predictions.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 9,
    question: 'A COVID-19 classifier wrongly predicts infected patients as non-infected. This error belongs to which category?',
    options: [
      'False Positive',
      'True Negative',
      'False Negative',
      'True Positive'
    ],
    correct: 2,
    explanation: 'Infected predicted as non-infected is a False Negative.',
    topics: ['Evaluation Metrics']
  },
  {
    id: 10,
    question: 'Assertion (A): F1 Score is useful when dealing with unbalanced datasets. Reason (R): F1 Score considers both Precision and Recall simultaneously.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'F1 balances FP and FN, making it ideal for unbalanced data.',
    topics: ['Evaluation Metrics']
  }
]
  },
  {
    id: 5003,
    title: 'Undertand Different Evaluation Metrics',
    unit: 'Unit V',
    difficulty: 'Hard',
    time: '20 min',
    questions: 10,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'CASE STUDY 1: Hospital Screening System\n\nA hospital deploys an AI model to screen patients for a contagious disease.\nOut of 10,000 patients, only 200 actually have the disease.\nThe model results are:\n\n Correctly identifies 180 infected patients\n Misses 20 infected patients\n Incorrectly labels 800 healthy patients as infected\n\nDespite a large number of wrong predictions, the model still shows very high accuracy.Answer the following based on the given case-study.\n What is the primary reason for this misleading result?',
    options: [
      'The model is underfitting',
      'The dataset is highly unbalanced',
      'The confusion matrix is incorrect',
      'Accuracy ignores True Negatives'
    ],
    correct: 1,
    explanation: 'When negatives dominate the dataset, accuracy can remain high despite serious errors.',
    topics: ['Evaluation metrics']
  },
  {
    id: 2,
    question: 'Which type of error in this scenario is most dangerous from a public health perspective?',
    options: [
      'False Positives',
      'True Negatives',
      'False Negatives',
      'True Positives'
    ],
    correct: 2,
    explanation: 'Missing infected patients (FN) risks further disease spread.',
    topics: ['Evaluation metrics']
  },
  {
    id: 3,
    question: 'To improve patient safety, which evaluation metric should the hospital prioritize while retraining the model?',
    options: [
      'Accuracy',
      'Precision',
      'Recall',
      'F1 Score'
    ],
    correct: 2,
    explanation: 'Recall reduces False Negatives, which are critical in medical diagnosis.',
    topics: ['Evaluation metrics']
  },
  {
    id: 4,
    question: 'Assertion (A): Increasing recall may reduce precision in this model.\nReason (R): Identifying more positive cases often increases False Positives.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Capturing more positives often increases FP, lowering precision.',
    topics: ['Evaluation metrics']
  },
  {
    id: 5,
    question: 'CASE STUDY 2: Airport Security System\n\nAn AI model classifies passengers as “Threat” or “Safe”.\n\nSecurity officials say:\n\nStopping a safe passenger is inconvenient but acceptable\nLetting a real threat pass is unacceptable\n\nAnswer the following based on the given case-study.\nWhich confusion matrix outcome must be minimized at all costs in airport security?',
    options: [
      'False Positive',
      'False Negative',
      'True Positive',
      'True Negative'
    ],
    correct: 1,
    explanation: 'A threat labeled as safe is a False Negative.',
    topics: ['Evaluation metrics']
  },
  {
    id: 6,
    question: 'Which metric best aligns with the airport’s priority of catching all threats?',
    options: [
      'Precision',
      'Recall',
      'Accuracy',
      'Error rate'
    ],
    correct: 1,
    explanation: 'Recall focuses on catching all actual threats.',
    topics: ['Evaluation metrics']
  },
  {
    id: 7,
    question: 'Assertion (A): A model with lower accuracy can be safer than a model with higher accuracy in this scenario.\nReason (R): Accuracy does not differentiate between types of errors.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Some errors are more dangerous than others, which accuracy ignores.',
    topics: ['Evaluation metrics']
  },
  {
    id: 8,
    question: 'CASE STUDY 3: Online Shopping Fraud Detection\nA fraud detection system flags transactions as Fraud or Genuine.\n\nBusiness feedback:\n\n Blocking genuine customers leads to complaints\n Missing a fraud causes financial loss\n\nAnswer the following based on the given case-study.\nIf the system wrongly flags genuine transactions as fraud, which error is this?',
    options: [
      'False Negative',
      'True Positive',
      'False Positive',
      'True Negative'
    ],
    correct: 2,
    explanation: 'Genuine predicted as fraud is a False Positive.',
    topics: ['Evaluation metrics']
  },
  {
    id: 9,
    question: 'Which metric should the company focus on to reduce customer complaints?',
    options: [
      'Recall',
      'Precision',
      'Accuracy',
      'F1 Score'
    ],
    correct: 1,
    explanation: 'Precision reduces False Positives.',
    topics: ['Evaluation metrics']
  },
  {
    id: 10,
    question: 'Assertion (A): F1 Score is useful when both customer trust and fraud detection are equally important.\nReason (R): F1 Score balances precision and recall into a single metric.',
    options: [
      'Both A and R are true, and R explains A',
      'Both A and R are true, but R does not explain A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'F1 helps when both FP and FN matter.',
    topics: ['Evaluation metrics']
  }
]
  },
  {
    id: 6001,
    title: 'Introduction to NLP',
    unit: 'Unit VI',
    difficulty: 'Easy',
    time: '5 min',
    questions: 8,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Which of the following best defines a natural language?',
    options: [
      'A language used only by computers',
      'A language made of binary signals',
      'A human language like English or Spanish',
      'A programming language'
    ],
    correct: 2,
    explanation: 'Natural languages are human languages used for everyday communication.',
    topics: ['NLP']
  },
  {
    id: 2,
    question: 'Which feature is common to all natural languages?',
    options: [
      'They never change over time',
      'They are governed by syntax and semantics',
      'They have only one meaning per word',
      'They are written only, not spoken'
    ],
    correct: 1,
    explanation: 'Natural languages follow rules such as syntax, lexicon, and semantics.',
    topics: ['NLP']
  },
  {
    id: 3,
    question: 'Why is context important in understanding natural language?',
    options: [
      'Words are always spelled differently',
      'Computers cannot read sentences',
      'Words can have multiple meanings',
      'Grammar rules do not apply'
    ],
    correct: 2,
    explanation: 'The meaning of a word depends on how it is used in a sentence.',
    topics: ['NLP']
  },
  {
    id: 4,
    question: 'What type of language does a computer directly understand?',
    options: [
      'Natural language',
      'Spoken language',
      'Binary language',
      'Regional language'
    ],
    correct: 2,
    explanation: 'Computers process information in the form of binary signals.',
    topics: ['NLP']
  },
  {
    id: 5,
    question: 'What is the main goal of Natural Language Processing (NLP)?',
    options: [
      'To replace programming languages',
      'To make computers think like humans',
      'To enable communication between humans and computers',
      'To eliminate human languages'
    ],
    correct: 2,
    explanation: 'NLP helps computers understand and process human language.',
    topics: ['NLP']
  },
  {
    id: 6,
    question: 'Which of the following is an example of an NLP application?',
    options: [
      'Image compression',
      'Auto-generated captions',
      'Computer hardware design',
      'Database indexing'
    ],
    correct: 1,
    explanation: 'Auto-generated captions convert speech into text using NLP.',
    topics: ['NLP']
  },
  {
    id: 7,
    question: 'What does sentiment analysis primarily identify?',
    options: [
      'Grammar mistakes',
      'Language translation',
      'Emotions in text',
      'Programming errors'
    ],
    correct: 2,
    explanation: 'Sentiment analysis detects whether text expresses positive, negative, or neutral emotion.',
    topics: ['NLP']
  },
  {
    id: 8,
    question: 'Keyword extraction is mainly used to:',
    options: [
      'Translate languages',
      'Generate speech',
      'Identify important words in text',
      'Remove duplicate sentences'
    ],
    correct: 2,
    explanation: 'Keyword extraction finds the most important words or phrases in a text.',
    topics: ['NLP']
  }
]
  },
  {
    id: 6002,
    title: 'Introduction to NLP',
    unit: 'Unit VI',
    difficulty: 'Medium',
    time: '10 min',
    questions: 6,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Assertion (A): Natural languages are considered complex for computers to process because the same word can represent different meanings in different situations. Reason (R): In natural languages, words derive their meaning strictly from predefined dictionaries without considering context.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'Natural languages are complex because meaning depends heavily on context. Dictionaries alone cannot determine meaning without contextual understanding.',
    topics: ['NLP']
  },
  {
    id: 2,
    question: 'Assertion (A): Natural Language Processing is required because computers cannot directly interpret human languages like English or Spanish. Reason (R): Computers are capable of understanding natural languages naturally, but NLP is used mainly to speed up communication.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'Computers do not naturally understand human languages. NLP exists to enable understanding, not just to improve speed.',
    topics: ['NLP']
  },
  {
    id: 3,
    question: 'Assertion (A): The word “red” can indicate emotion, physical condition, or colour depending on how it is used in a sentence. Reason (R): Natural languages are redundant and allow information to be expressed in multiple forms.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 1,
    explanation: 'Both statements are true, but redundancy does not explain multiple meanings. Context, not redundancy, determines meaning.',
    topics: ['NLP']
  },
  {
    id: 4,
    question: 'Assertion (A): Voice assistants like Alexa and Siri rely heavily on NLP to understand and respond to user commands. Reason (R): NLP enables computers to process binary language into natural language.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 1,
    explanation: 'NLP helps computers convert natural language into machine-understandable form, not the other way around.',
    topics: ['NLP']
  },
  {
    id: 5,
    question: 'Assertion (A): Language translation systems are considered NLP applications because they interpret intent and meaning across languages. Reason (R): Translation systems work by replacing each word with its exact equivalent from another language.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'Translation involves understanding context and meaning, not simple word-to-word replacement.',
    topics: ['NLP']
  },
  {
    id: 6,
    question: 'Assertion (A): Keyword extraction can help businesses understand customer opinions expressed on social media. Reason (R): Keyword extraction identifies the most frequently occurring and meaningful terms in a text.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Extracting important keywords highlights common themes and concerns in customer feedback.',
    topics: ['NLP']
  }
]
  },
  {
    id: 6003,
    title: 'Introduction to NLP',
    unit: 'Unit VI',
    difficulty: 'Hard',
    time: '20 min',
    questions: 4,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: "Case Study 1: Contextual Ambiguity in Language\n\nA school is developing an AI system that flags emotionally sensitive student messages. During testing, the system incorrectly flags the sentence:\n\n> “His face turned red after taking the medicine.”\n\nIn some cases, the system assumes emotional embarrassment, while in others it detects a medical emergency.Answer the following based on the given case-study.\nAssertion (A): The system’s incorrect behavior occurs because natural language allows the same word to convey multiple meanings depending on context.\nReason (R): NLP systems rely entirely on fixed grammar rules and therefore cannot adapt to contextual variation.",
    options: [
      "Both A and R are true, and R is the correct explanation of A",
      "Both A and R are true, but R is NOT the correct explanation of A",
      "A is true, but R is false",
      "A is false, but R is true"
    ],
    correct: 2,
    explanation: "Contextual ambiguity causes the issue, not rigid grammar rules alone.",
    topics: ["NLP"]
  },
  {
    id: 2,
    question: "Assertion (A): Providing historical data allows NLP systems to better infer context based on learned patterns.\nReason (R): NLP systems memorize exact sentences from training data and reuse them during prediction.",
    options: [
      "Both A and R are true, and R is the correct explanation of A",
      "Both A and R are true, but R is NOT the correct explanation of A",
      "A is true, but R is false",
      "A is false, but R is true"
    ],
    correct: 2,
    explanation: "NLP learns patterns and associations, not exact sentence recall.",
    topics: ["NLP"]
  },
  {
    id: 3,
    question: "Case Study 2: Voice Assistant Failure\n\nA voice assistant responds incorrectly to the command:\n\n> “Set an alarm for half past three.”\n\nThe system sets the alarm for 3:00 AM instead of 3:30 PM, leading to user dissatisfaction.\n\nAnswer the following based on the given case-study.\nAssertion (A): The failure highlights the challenge NLP systems face in understanding implicit human expressions.\nReason (R): Natural languages are redundant and allow the same idea to be expressed in multiple ways.",
    options: [
      "Both A and R are true, and R is the correct explanation of A",
      "Both A and R are true, but R is NOT the correct explanation of A",
      "A is true, but R is false",
      "A is false, but R is true"
    ],
    correct: 0,
    explanation: "Redundancy leads to multiple expressions, increasing ambiguity.",
    topics: ["NLP"]
  },
  {
    id: 4,
    question: "Assertion (A): Computers cannot directly understand natural language and require NLP techniques to interpret user intent.\nReason (R): Computers process information only in binary form, making human language incomprehensible without conversion.",
    options: [
      "Both A and R are true, and R is the correct explanation of A",
      "Both A and R are true, but R is NOT the correct explanation of A",
      "A is true, but R is false",
      "A is false, but R is true"
    ],
    correct: 0,
    explanation: "Binary processing necessitates NLP-based conversion and interpretation.",
    topics: ["NLP"]
  },
  
]

  },
  {
    id: 7001,
    title: 'Different stages of NLP',
    unit: 'Unit VII',
    difficulty: 'Easy',
    time: '10 min',
    questions: 8,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Which of the following best defines a natural language?',
    options: [
      'A language used only by computers',
      'A language made of binary signals',
      'A human language like English or Spanish',
      'A programming language'
    ],
    correct: 2,
    explanation: 'Natural languages are human languages used for everyday communication.',
    topics: ['NLP']
  },
  {
    id: 2,
    question: 'Which feature is common to all natural languages?',
    options: [
      'They never change over time',
      'They are governed by syntax and semantics',
      'They have only one meaning per word',
      'They are written only, not spoken'
    ],
    correct: 1,
    explanation: 'Natural languages follow rules such as syntax, lexicon, and semantics.',
    topics: ['NLP']
  },
  {
    id: 3,
    question: 'Why is context important in understanding natural language?',
    options: [
      'Words are always spelled differently',
      'Computers cannot read sentences',
      'Words can have multiple meanings',
      'Grammar rules do not apply'
    ],
    correct: 2,
    explanation: 'The meaning of a word depends on how it is used in a sentence.',
    topics: ['NLP']
  },
  {
    id: 4,
    question: 'What type of language does a computer directly understand?',
    options: [
      'Natural language',
      'Spoken language',
      'Binary language',
      'Regional language'
    ],
    correct: 2,
    explanation: 'Computers process information in the form of binary signals.',
    topics: ['NLP']
  },
  {
    id: 5,
    question: 'What is the main goal of Natural Language Processing (NLP)?',
    options: [
      'To replace programming languages',
      'To make computers think like humans',
      'To enable communication between humans and computers',
      'To eliminate human languages'
    ],
    correct: 2,
    explanation: 'NLP helps computers understand and process human language.',
    topics: ['NLP']
  },
  {
    id: 6,
    question: 'Which of the following is an example of an NLP application?',
    options: [
      'Image compression',
      'Auto-generated captions',
      'Computer hardware design',
      'Database indexing'
    ],
    correct: 1,
    explanation: 'Auto-generated captions convert speech into text using NLP.',
    topics: ['NLP']
  },
  {
    id: 7,
    question: 'What does sentiment analysis primarily identify?',
    options: [
      'Grammar mistakes',
      'Language translation',
      'Emotions in text',
      'Programming errors'
    ],
    correct: 2,
    explanation: 'Sentiment analysis detects whether text expresses positive, negative, or neutral emotion.',
    topics: ['NLP']
  },
  {
    id: 8,
    question: 'Keyword extraction is mainly used to:',
    options: [
      'Translate languages',
      'Generate speech',
      'Identify important words in text',
      'Remove duplicate sentences'
    ],
    correct: 2,
    explanation: 'Keyword extraction finds the most important words or phrases in a text.',
    topics: ['NLP']
  }
]
  },
  {
    id: 7002,
    title: 'Different stages of NLP',
    unit: 'Unit VII',
    difficulty: 'Medium',
    time: '15 min',
    questions: 7,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Assertion (A): Lexical analysis is the first stage of NLP because it prepares raw text for further language processing. Reason (R): Lexical analysis determines whether a sentence is meaningful and logical in the real world.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'Lexical analysis prepares text by breaking it into tokens. Meaningfulness and real-world logic are handled in later stages.',
    topics: ['Stages of NLP']
  },
  {
    id: 2,
    question: 'Assertion (A): A grammatically correct sentence may still be rejected during NLP processing. Reason (R): Semantic analysis verifies whether a sentence makes logical sense in terms of meaning.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'A sentence can follow grammar rules yet be meaningless. Semantic analysis checks logical sense beyond grammar.',
    topics: ['Stages of NLP']
  },
  {
    id: 3,
    question: 'Assertion (A): Discourse integration focuses on evaluating each sentence independently. Reason (R): Discourse integration ensures that sentences maintain continuity and logical flow within a larger context.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 3,
    explanation: 'Discourse integration does not treat sentences independently. It connects sentences across context.',
    topics: ['Stages of NLP']
  },
  {
    id: 4,
    question: 'Assertion (A): Pragmatic analysis may override the literal meaning identified during semantic analysis. Reason (R): Pragmatic analysis focuses on understanding the speaker’s intent and real-world relevance.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Pragmatic analysis prioritizes intent over literal meaning. This allows NLP systems to infer real-world implications.',
    topics: ['Stages of NLP']
  },
  {
    id: 5,
    question: 'Assertion (A): Chatbots are designed to make interactions feel natural and human-like. Reason (R): All chatbots learn automatically from every interaction without predefined rules.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 2,
    explanation: 'While chatbots aim for human-like interaction, many are rule-based and do not learn automatically.',
    topics: ['Stages of NLP']
  },
  {
    id: 6,
    question: 'Assertion (A): Smart-bots generally provide more flexible and contextual responses compared to script-bots. Reason (R): Smart-bots use AI techniques to analyze language patterns rather than fixed scripts.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Smart-bots rely on NLP and learning methods. This allows them to respond beyond predefined rules.',
    topics: ['Stages of NLP']
  },
  {
    id: 7,
    question: 'Assertion (A): A chatbot that responds correctly to individual questions may still fail in long conversations. Reason (R): Discourse integration is required to maintain consistency across multiple turns of conversation.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is NOT the correct explanation of A',
      'A is true, but R is false',
      'A is false, but R is true'
    ],
    correct: 0,
    explanation: 'Maintaining context across turns is essential. Discourse integration enables coherent multi-turn conversations.',
    topics: ['Stages of NLP']
  }
]

  },
  {
    id: 7003,
    title: 'Different stages of NLP',
    unit: 'Unit VII',
    difficulty: 'Hard',
    time: '20 min',
    questions: 8,
    xp: 150,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: "A chatbot receives the sentence: “I saw her duck near the river bank.” The system correctly identifies all words and grammatical structure, but still produces multiple interpretations. Which NLP stage is primarily responsible for resolving this ambiguity?",
    options: [
      "Lexical Analysis, because it tokenizes the words correctly",
      "Syntactic Analysis, because it builds the sentence structure",
      "Semantic Analysis, because it determines meaning of words and relationships",
      "Pragmatic Analysis, because it considers user intent and real-world context"
    ],
    correct: 2,
    explanation: "Semantic analysis handles word sense ambiguity like 'duck' (verb vs noun) and meaning relationships.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 2,
    question: "Consider the chatbot response failure: User: “Can you book a flight for tomorrow?” Bot: “Yes, tomorrow is a day after today.” The chatbot understood the sentence grammatically and semantically, but failed to act appropriately. Which NLP stage is most likely missing or weak in this system?",
    options: [
      "Syntactic analysis, since sentence structure was incorrect",
      "Semantic analysis, since meaning was unclear",
      "Pragmatic analysis, since intent was not interpreted",
      "Lexical analysis, since tokenization failed"
    ],
    correct: 2,
    explanation: "The chatbot failed to infer intent (booking a flight), which is handled by pragmatic analysis.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 3,
    question: "A chatbot answers factual questions correctly but gives inconsistent responses in long conversations, forgetting earlier references like 'that product' or 'the previous issue'. This failure is best explained by poor implementation of:",
    options: [
      "Semantic analysis",
      "Discourse integration",
      "Pragmatic analysis",
      "Lexical processing"
    ],
    correct: 1,
    explanation: "Discourse integration maintains context and reference across multiple sentences.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 4,
    question: "A sentence passes syntactic analysis but is rejected during semantic analysis: “The laptop drank water and fell asleep.” Why does this rejection occur?",
    options: [
      "The sentence violates grammatical rules",
      "The sentence lacks proper tokenization",
      "The sentence violates real-world meaning constraints",
      "The sentence lacks conversational context"
    ],
    correct: 2,
    explanation: "Semantic analysis checks logical meaning and real-world feasibility.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 5,
    question: "A smart-bot adapts its responses based on user behavior, while a script-bot fails in unexpected situations. Which combination of properties best explains this difference?",
    options: [
      "Smart-bots use lexical rules; script-bots use grammar rules",
      "Smart-bots rely on AI and learning; script-bots rely on fixed flows",
      "Script-bots use discourse integration; smart-bots do not",
      "Script-bots use pragmatic analysis more effectively"
    ],
    correct: 1,
    explanation: "Smart-bots use AI/NLP models that generalize, unlike fixed scripts.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 6,
    question: "A chatbot correctly answers isolated questions but fails when the user says: “Earlier you said it was unavailable. Why?” Which NLP challenge is MOST relevant here?",
    options: [
      "Token ambiguity",
      "Sentence parsing",
      "Context retention and reference resolution",
      "Word segmentation"
    ],
    correct: 2,
    explanation: "The bot must link 'it' to earlier dialogue using discourse integration.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 7,
    question: "A chatbot interprets the sentence: “Can you open the window?” as a question about ability rather than a polite request. Which NLP stage would prevent this misunderstanding?",
    options: [
      "Semantic analysis",
      "Syntactic analysis",
      "Pragmatic analysis",
      "Lexical analysis"
    ],
    correct: 2,
    explanation: "Pragmatics interprets indirect requests and speaker intent.",
    topics: ["Stages of NLP", "Chatbots"]
  },
  {
    id: 8,
    question: "A chatbot fails only when sarcasm is used, despite correct grammar, vocabulary, and sentence meaning. Which stages are insufficient, and why?",
    options: [
      "Semantic only, because sarcasm changes word meaning",
      "Pragmatic only, because sarcasm depends on intent",
      "Discourse and semantic, because sarcasm spans sentences",
      "Semantic and pragmatic, because literal meaning conflicts with intent"
    ],
    correct: 3,
    explanation: "Sarcasm often has correct literal meaning but opposite intent.",
    topics: ["Stages of NLP", "Chatbots"]
  }
]
  },
  {
    id: 8001,
    title: 'Text Preprocessing Techniques',
    unit: 'Unit VIII',
    difficulty: 'Easy',
    time: '10 min',
    questions: 5,
    xp: 50,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'What is the first step in converting human language into a form understandable by computers?',
    options: [
      'Tokenization',
      'Text Normalization',
      'Stemming',
      'Bag of Words'
    ],
    correct: 1,
    explanation: 'Text normalization simplifies complex human language so computers can process it.',
    topics: ['Text Preprocessing']
  },
  {
    id: 2,
    question: 'What does tokenization do in text processing?',
    options: [
      'Converts text to numbers',
      'Divides text into words, numbers, or special characters',
      'Removes stop words',
      'Calculates TFIDF'
    ],
    correct: 1,
    explanation: 'Tokenization splits sentences into smaller units called tokens.',
    topics: ['Text Preprocessing']
  },
  {
    id: 3,
    question: 'Why are stop words removed from a corpus?',
    options: [
      'They occur rarely',
      'They are important for meaning',
      'They do not add value to the main content',
      'They help in TFIDF calculation'
    ],
    correct: 2,
    explanation: 'Stop words like “is,” “the,” “and” occur frequently but carry little meaning.',
    topics: ['Text Preprocessing']
  },
  {
    id: 4,
    question: 'Which of the following is a difference between stemming and lemmatization?',
    options: [
      'Stemming results in meaningful words, lemmatization does not',
      'Lemmatization results in meaningful words, stemming may not',
      'Both always produce the same results',
      'Neither removes affixes'
    ],
    correct: 1,
    explanation: 'Lemmatization ensures the root word has meaning, unlike stemming.',
    topics: ['Text Preprocessing']
  },
  {
    id: 5,
    question: 'What are the two outputs of the Bag of Words model?',
    options: [
      'Vocabulary of words and their frequency',
      'Tokenized sentences and stop words',
      'TFIDF values and lemmatized words',
      'Document vectors and IDF values'
    ],
    correct: 0,
    explanation: 'Bag of Words counts occurrences of each word in the corpus.',
    topics: ['Text Preprocessing']
  }
]
  },
  {
    id: 8002,
    title: 'Text Preprocessing Techniques',
    unit: 'Unit VIII',
    difficulty: 'Medium',
    time: '15 min',
    questions: 5,
    xp: 100,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'Assertion (A): Tokenization is a necessary step before removing stop words. Reason (R): Stop words can only be identified when each word is treated as a separate token.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, R is false',
      'A is false, R is true'
    ],
    correct: 0,
    explanation: 'Stop words are removed after tokenization because individual words need to be recognized first.',
    topics: ['Text Preprocessing']
  },
  {
    id: 2,
    question: 'Assertion (A): Lemmatization takes more time than stemming. Reason (R): Lemmatization ensures that the root word is meaningful, while stemming may produce non-meaningful words.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, R is false',
      'A is false, R is true'
    ],
    correct: 0,
    explanation: 'Lemmatization is slower because it checks that the root word has meaning, unlike stemming.',
    topics: ['Text Preprocessing']
  },
  {
    id: 3,
    question: 'Assertion (A): Words that occur frequently across all documents in a corpus usually have low TFIDF values. Reason (R): Frequent words across documents are likely to be stop words and carry less information about individual documents.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, R is false',
      'A is false, R is true'
    ],
    correct: 0,
    explanation: 'Common words have low TFIDF because they don’t add unique value to a document.',
    topics: ['Text Preprocessing']
  },
  {
    id: 4,
    question: 'Assertion (A): Bag of Words does not consider the order of words in a document. Reason (R): The model only counts the occurrences of words, ignoring their sequence.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, R is false',
      'A is false, R is true'
    ],
    correct: 0,
    explanation: 'Bag of Words focuses on word frequency, so word order is irrelevant.',
    topics: ['Text Preprocessing']
  },
  {
    id: 5,
    question: 'Assertion (A): Text normalization is essential for machine learning applications in NLP. Reason (R): Normalization reduces text complexity and ensures consistent representation of words across the corpus.',
    options: [
      'Both A and R are true, and R is the correct explanation of A',
      'Both A and R are true, but R is not the correct explanation of A',
      'A is true, R is false',
      'A is false, R is true'
    ],
    correct: 0,
    explanation: 'Normalized text ensures uniformity and simplifies processing for algorithms like Bag of Words and TFIDF.',
    topics: ['Text Preprocessing']
  }
]
  },
  {
    id: 8003,
    title: 'Text Preprocessing Techniques',
    unit: 'Unit VIII',
    difficulty: 'Hard',
    time: '18 min',
    questions: 5,
    xp: 55,
    status: 'Available',
    score: '-',
    questionData: [
  {
    id: 1,
    question: 'You have three documents: D1: "The cat sat on the mat.", D2: "The dog sat on the rug.", D3: "Cats and dogs are pets." After removing stop words, lowercase conversion, and stemming, which word is likely to have the highest TFIDF value?',
    options: [
      'cat',
      'sat',
      'the',
      'and'
    ],
    correct: 0,
    explanation: 'Words appearing in fewer documents but occurring frequently within a document get higher TFIDF. “Cat” occurs in D1 (and stemmed as “cat”) but not in all documents, so its value is higher than common or stop words.',
    topics: ['Text Preprocessing']
  },
  {
    id: 2,
    question: 'Suppose a corpus has 100 documents, and the word “AI” occurs in 90 documents with high frequency. Another word “Quantum” occurs only in 3 documents but also with high frequency in those documents. Which word will have a higher TFIDF score, and why?',
    options: [
      'AI, because it occurs more frequently',
      'Quantum, because it is rare across documents but frequent in some',
      'AI, because TF dominates IDF',
      'Quantum, because TFIDF ignores frequency'
    ],
    correct: 1,
    explanation: 'TFIDF favors words that are important to specific documents. “Quantum” is rare across the corpus but frequent in a few documents, giving it a higher TFIDF than “AI”.',
    topics: ['Text Preprocessing']
  },
  {
    id: 3,
    question: 'You are building a health chatbot, and your corpus contains medical FAQs. Words like “doctor” and “medicine” appear in almost all documents. How should TFIDF help the chatbot understand important keywords for responses?',
    options: [
      'Assign high scores to “doctor” and “medicine” for all responses',
      'Ignore these words because their IDF is low',
      'Treat all words equally regardless of frequency',
      'Use only Bag of Words without TFIDF'
    ],
    correct: 1,
    explanation: 'Words common to many documents have low IDF and are less informative. TFIDF helps focus on unique keywords relevant to a specific query.',
    topics: ['Text Preprocessing']
  },
  {
    id: 4,
    question: 'Consider a document vector created using Bag of Words for sentiment analysis. The word “happy” appears 5 times in D1 and 2 times in D2, while “good” appears 3 times in D1 and 3 times in D2. Which word is likely more significant for D1 after TFIDF computation?',
    options: [
      'happy',
      'good',
      'Both equally',
      'Cannot determine'
    ],
    correct: 0,
    explanation: '“Happy” has higher term frequency in D1 and is assumed to be less common across documents, giving it a higher TFIDF and more significance for D1.',
    topics: ['Text Preprocessing']
  },
  {
    id: 5,
    question: 'You are preprocessing a large corpus for topic modeling. If you incorrectly retain stop words during TFIDF calculation, what will happen?',
    options: [
      'Frequent stop words will dominate, reducing model accuracy',
      'Rare words will be ignored',
      'TFIDF values will increase for important words',
      'No effect on model'
    ],
    correct: 0,
    explanation: 'Stop words occur frequently across documents but carry little meaning. Keeping them can skew TFIDF and reduce the effectiveness of the model.',
    topics: ['Text Preprocessing']
  }
]
  },
  // Add more quizzes for other units...
];

export default foundationQuizzes;
