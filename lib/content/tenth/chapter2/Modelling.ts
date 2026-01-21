import { LessonSection } from "@/lib/types/course";

export const modelling = {
  quoteOfTheDay: "Artificial Intelligence is not a substitue for human intelligence; it is a tool to amplify human creativity and ingenuity. ",
  quoteAttribution: "Fei-Fei Li",

 objectives: [
    "Understand the different types of AI models, including rule-based and learning-based models",
    "Identify and explain supervised learning models such as classification and regression",
    "Understand unsupervised learning models including clustering and association",
    "Differentiate between rule-based systems, supervised learning, and unsupervised learning models with examples"
    ],

  sections: [

    {
    type: "interactive",
    title: "Types of AI Models",
    content: {
        modelFlow: true
    }
    },   
    
    {
    type: "interactive",
    content: {
        questions: [
            {
            question: "Social media platforms identify your friend in a picture. Identify the model:",
            options: ["Supervised Learning", "Unsupervised Learning"],
            correctAnswer: "Supervised Learning"
            },
            {
            question: "OTT platforms make recommendations based on the user's watch history. Identify the model:",
            options: ["Supervised Learning", "Unsupervised Learning"],
            correctAnswer: "Unsupervised Learning"
            },
            {
            question: "Banks analyze data for suspicious-looking transactions and flag fraudulent transactions. Suspicious transactions are not defined clearly. Identify the model:",
            options: ["Supervised Learning", "Unsupervised Learning"],
            correctAnswer: "Unsupervised Learning"
            },
            {
            question: "Predicting whether a customer is eligible for a bank loan or not?",
            options: ["Classification", "Regression"],
            correctAnswer: "Classification"
            },
            {
            question: "Predicting weather for the next 24 hours:",
            options: ["Classification", "Regression"],
            correctAnswer: "Regression"
            }
        ]
    }
    }

  ]
};

export type modelling = typeof modelling;
