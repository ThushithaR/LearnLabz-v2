import { LessonSection } from "@/lib/types/course";



export const revisitingAIMLDL = {
  quoteOfTheDay: "Predicting the future isn't magic; it's Artificial Intelligence",
  quoteAttribution: "Dave Waters",

  objectives: [
    "Understand what Artificial Intelligence (AI) is and how it is used in real life",
    "Differentiate between Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning (DL)",
    "Learn basic data-related terms such as data, features, and labels",
    "Understand the difference between training data and testing data"
  ],

  sections: [
        {
      type: 'text' as const,
      title: 'Introduction to AI-Based Projects',
      content: `To build an AI-based project, we work with intelligent models or algorithms. These models help computers make decisions, recognize patterns, and solve problems.

We can either design our own models or use ready-made AI models that already exist. Before we start building or using any model, it is important to clearly understand what Artificial Intelligence (AI), Machine Learning (ML), and Deep Learning (DL) actually mean.`
    },
      {
        type: "interactive",
        title: "AI, ML, and DL Relationship",
        content: {
          concepts: [
            { id: "ai", label: "Artificial Intelligence", note: "Artificial Intelligence, or AI, refers to techniques that allow computers to imitate human intelligence. An AI system works by following algorithms (step-by-step rules) and using data to produce useful outputs. Examples of AI around us include voice assistants, recommendation systems on shopping apps, and navigation apps that suggest the fastest route." },
            { id: "ml", label: "Machine Learning", note: "Machine Learning, or ML, is a part of AI that allows machines to learn from experience. Instead of being programmed for every situation, a machine learning system improves by analyzing new data. If it makes mistakes, it learns from them and performs better next time. For example, an email spam filter improves over time by learning which emails are spam and which are not." },
            { id: "dl", label: "Deep Learning", note: "Deep Learning, or DL, is a more advanced form of machine learning. It uses very large amounts of data and complex structures called Artificial Neural Networks (ANNs), which are inspired by the human brain. Deep learning systems can learn patterns on their own without much human guidance. Examples include face recognition on phones and apps that can recognize objects in photos." }
          ],
          relations: [
            { from: "ai", to: "ml" },
            { from: "ml", to: "dl" }
          ]
        }
      },
      
    {
      type: 'text' as const,
      title: 'Examples of Machine Learning',
      content: `Object Classification is a machine learning task where the system identifies what category an object belongs to, such as classifying images as apples or strawberries.

Anomaly Detection is another ML application. It helps find unusual patterns in data, such as detecting an unexpected spike in heart rate using a fitness tracker.`
    },
    {
    type: "interactive",
    title: "How a Machine Learning Model Learns",
    content: {
      scenarioId: "fruits" // "clothes" | "heartrate"
    }
    },
    {
        type: "interactive",
        title: "Object Classification Example",
        content: {
          scenarioId: "clothes" // "fruits" | "heartrate"
        }
    },
    {
        type: "interactive",
        title: "Anomaly Detection Example",
        content: {
          scenarioId: "heartrate" // "fruits" | "clothes"
        }
    },

    {
      type: 'text' as const,
      title: 'Examples of Deep Learning',
      content: `Object Identification in deep learning involves detecting and labeling objects in images using advanced algorithms.

Digit Recognition is another example, where systems learn to recognize handwritten numbers, such as reading digits written on a touchscreen or scanned forms.`
    },

    {
      type: "interactive",
      title: "How Deep Learning Makes Predictions",
      content: {
        scenarioIdDl: "catdog" // or "digits"
      }
    },

    
    {
      type: "interactive",
      title: "How Deep Learning Makes Predictions",
      content: {
        scenarioIdDl: "digits" // or "catdog"
      }
    },
    {
      type: "interactive",
      title: "Understanding Data, Features, and Labels",
      content: {
        kind: "dataset"
      }
    },
    
  ]
};

export type revisitingAIMLDL = typeof revisitingAIMLDL;
