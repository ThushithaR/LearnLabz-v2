import { useState } from "react";

type NodeKey =
  | "ai"
  | "learning"
  | "rule"
  | "ml"
  | "dl"
  | "supervised"
  | "unsupervised"
  | "reinforcement"
  | "ann"
  | "cnn";

const explanations: Record<NodeKey, string[]> = {
  ai: ["When building AI models, researchers usually follow one of two main approaches:", "1. Rule-Based Approach", "2. Learning-Based Approach","Think of these approaches as two different ways of teaching a machine how to work. One way is by giving it fixed instructions, and the other way is by letting it learn from experience.","Does the machine follow fixed rules, or does it learn and improve over time?"],
  learning: [
  "In a learning-based approach, the machine learns from data instead of fixed rules. Here:",
  "• The machine is given examples",
  "• It finds patterns on its own",
  "• It improves as it sees more data",
  "This is similar to how humans learn: We learn from experience, mistakes, and feedback.",
  "Ask yourself: How is this different from following strict instructions?",
  "---------------------------------------",
  "Learning-Based Example: Dog Images",
  "→ Imagine you give a machine 1000 images of stray dogs. You do not tell the machine:",
  "• The breed",
  "• The color",
  "• The size",
  "→ The machine studies the images and discovers patterns on its own. It may group dogs based on:",
  "• Color",
  "• Size",
  "• Fur type",
  "→ It might even find patterns humans didn’t notice! This ability to discover patterns makes learning-based models powerful.",
  "Think: What kind of patterns do you think a machine could discover?",
  "---------------------------------------",
  "Learning-Based Example: Spam Email Filter",
  "→ A spam email filter is a common learning-based AI model. How it works:",
  "• The model is trained on emails labeled as 'spam' or 'not spam'",
  "• It learns patterns like certain words, links, or sender details",
  "• Over time, it becomes better at identifying spam",
  "→ Unlike rule-based systems:",
  "• It adapts to new spam techniques",
  " • It improves as it sees more emails",
  "Think: Why would spam filters fail if they were rule-based only?"
],

  rule: ["In a rule-based approach, the machine works exactly the way the developer tells it to.","The developer defines:","• The data","• The rules","• The actions the machine should take","You can think of a rule-based system like a calculator: If you press the same buttons, you will always get the same result.","Ask yourself: What happens if a new situation appears that was not part of the rules?","---------------------------------------","Rule-Based Example: Website Chatbot", "→ Example: A clothing website has a chatbot to help users track their orders.", "→ How it works:","• The chatbot has a fixed set of questions and answers", "• It looks for specific keywords in the user’s message", "→ Sample Rules:","• If the message contains words like track order or delivery, show tracking options","• If the user enters a valid order number, show tracking details", "• If the order number is invalid, show an error message","• If no rule matches, reply: Sorry, I can’t help with that", "Think: Can this chatbot answer questions outside what it was programmed for?"],
  ml: [
  "Machine Learning (ML) is a type of learning-based approach. Instead of being explicitly programmed, the machine learns from examples. It identifies patterns and creates models to make decisions or predictions.",
  "There are three main types of Machine Learning:",
  "1. Supervised Learning",
  "2. Unsupervised Learning",
  "3.Reinforcement Learning",
  "→ Supervised Learning:",
  "• In supervised learning, the machine is given labeled data.",
  "• It learns to map inputs to correct outputs based on this labeled data.",
  "• For example, predicting the price of a house based on features like size and location.",
  "→ Unsupervised Learning:",
  "• In unsupervised learning, the machine is given unlabeled data.",
  "• It tries to find hidden patterns or groupings in the data without pre-defined labels.",
  "• For example, grouping customers based on their purchasing behavior.",
  "→ Reinforcement Learning:",
  "• In reinforcement learning, the machine learns through trial and error.",
  "• It takes actions, receives feedback (rewards or penalties), and adjusts accordingly.",
  "• For example, a self-driving car learning how to navigate by receiving feedback from its environment.",
  "Machine Learning is powerful because it can learn from experience and adapt over time. Unlike rule-based systems, which follow fixed instructions, ML systems improve as they are exposed to more data.",
  "Think: How would an ML model improve over time? How does this differ from following strict rules?"
],


  dl: ["Deep Learning is a subset of Machine Learning using multi-layered neural networks."],
  supervised: [
  "In supervised learning, the data is labeled. This means:",
  "• The machine knows the correct answers during training",
  "• A human acts like a teacher",
  "Example: A teacher solves math problems in class (training), then gives homework to test students (testing). Similarly, the machine learns from labeled examples and then predicts new results.",
  "Think: What happens if labels are wrong or missing?",
  "---------------------------------------",
  "Supervised Learning Example: Coin Identification",
  "→ Problem: Identify a coin based on its weight.",
  "→ Data:",
  "• 1 Dollar = 3 grams",
  "• 1 Rupee = 4 grams",
  "• 1 Euro = 5 grams",
  "→ Feature: Weight",
  "→ Label: Currency type",
  "→ The model learns the relationship between weight and currency. Later, it can identify new coins just by checking weight.",
  "Think: Is this predicting a category or a number?"
],
  unsupervised: [
    "Unsupervised Learning finds hidden patterns in data without labels. The machine: ",
    "• Has no guidance",
    "• Finds patterns by itself",
    "• Groups similar data together",
    "Example: A child learning to seim alone - no teacher, just exploration.",
    "Think: Why is this useful when we don't know much about the data?",
    "---------------------------------------",
    "Unsupervised Learning Example: Supermarket Customers",
    "→ Problem: A supermarket has customer purchase data. But no customer is labeled as",
    "• Grocery buyer",
    "• Non-grocery buyer",
    "→ The model studies purchase patterns and automatically creates groups. This helps businesses:",
    "• Target customers better",
    "• Design personalized offers",
    "Think: How does Netflix or SPotify use similar ideas?"
  ],
  reinforcement: [
    "Reinforcement Learning learns by interacting with an environment using rewards and penalties. The agent learns optimal behavior through trial and error. The machine:",
    "• Takes an action",
    "• Receives feedback (reward or punishment)",
    "• Learns to immprove future actions",
    "No labels are given. Only feedback matters.",
    "Think: How do video games help players learn this way?",
    "----------------------------------------",
    "Reinforcement Learning Example: Identifying an apple",
    "• Machine guesses 'cherry' → negative feedback",
    "• Machine guesses again → learns from mistake",
    "• Machine guesses 'apple' → positive feedback",
    "→ Over time, the macjine improves its decisions. Used in self-driving cars, game-playing AI and robotics",
    "Think: Why is reinforcement learning good for unknown environments?"
  ],
  ann: [
    "Artificial Neural Networks are inspired by the human brain and form the basis of deep learning.",
    "They consist of interconnected nodes that process and transmit information."
  ],
  cnn: [
    "Convolutional Neural Networks specialize in image and visual data processing.",
    "They use convolutional layers to automatically learn spatial features from images."
  ],
};

function Box({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 rounded-xl font-semibold text-sm
        transition-all duration-300
        ${color}
        ${active ? "ring-4 ring-white scale-105" : "hover:scale-105"}
      `}
    >
      {label}
    </button>
  );
}

export default function InteractiveModelSimulation() {
  const [active, setActive] = useState<NodeKey>("ai");
  const [path, setPath] = useState<{ level1?: NodeKey; level2?: NodeKey; level3?: NodeKey }>({});

  const handleClick = (key: NodeKey) => {
    setActive(key);
    if (key === "ai") {
      setPath({});
    } else if (key === "learning" || key === "rule") {
      setPath({ level1: "ai", level2: key });
    } else if (key === "ml" || key === "dl") {
      setPath({ ...path, level3: key });
    } else {
      // level 4, keep path as is
    }
  };

  const handlePrevious = () => {
    if (["supervised", "unsupervised", "reinforcement", "ann", "cnn"].includes(active)) {
      setActive(path.level3!);
    } else if (active === "ml" || active === "dl") {
      setActive(path.level2!);
    } else if (active === "learning" || active === "rule") {
      setActive("ai");
    }
  };

  const showRow2 = active === "ai" || !!path.level2;
  const showRow3 = active === "learning" || active === "rule" || !!path.level3;
  const showRow4 = active === "ml" || ["supervised", "unsupervised", "reinforcement"].includes(active);
  const showRow5 = active === "dl" || ["ann", "cnn"].includes(active);
  const showPrevious = active !== "ai";

  return (
    <div className="w-full flex flex-col items-center gap-12">

      {/* Previous Button */}
      {showPrevious && (
        <button
          onClick={handlePrevious}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous
        </button>
      )}

      {/* ===== GRID DIAGRAM ===== */}
      <div className="grid grid-rows-[auto_auto_auto_auto_auto] gap-16 w-full max-w-6xl">

        {/* ROW 1 */}
        <div className="flex justify-center">
          <Box
            label="AI Models"
            color="bg-yellow-400 text-black"
            active={active === "ai"}
            onClick={() => handleClick("ai")}
          />
        </div>

        {/* ROW 2 */}
        {showRow2 && (
          <div className="relative flex justify-center gap-24">
            <Box
              label="Learning Based"
              color="bg-green-500 text-white"
              active={active === "learning"}
              onClick={() => handleClick("learning")}
            />
            <Box
              label="Rule Based"
              color="bg-green-600 text-white"
              active={active === "rule"}
              onClick={() => handleClick("rule")}
            />
          </div>
        )}

        {/* ROW 3 */}
        {showRow3 && (
          <div className="relative flex justify-center gap-24">
            <Box
              label="Machine Learning"
              color="bg-blue-500 text-white"
              active={active === "ml"}
              onClick={() => handleClick("ml")}
            />
            <Box
              label="Deep Learning"
              color="bg-blue-600 text-white"
              active={active === "dl"}
              onClick={() => handleClick("dl")}
            />
          </div>
        )}

        {/* ROW 4 */}
        {showRow4 && (
          <div className="relative flex justify-center gap-12 flex-wrap">
            <Box
              label="Supervised Learning"
              color="bg-orange-500 text-white"
              active={active === "supervised"}
              onClick={() => handleClick("supervised")}
            />
            <Box
              label="Unsupervised Learning"
              color="bg-orange-500 text-white"
              active={active === "unsupervised"}
              onClick={() => handleClick("unsupervised")}
            />
            <Box
              label="Reinforcement Learning"
              color="bg-orange-500 text-white"
              active={active === "reinforcement"}
              onClick={() => handleClick("reinforcement")}
            />
          </div>
        )}

        {/* ROW 5 */}
        {showRow5 && (
          <div className="relative flex justify-center gap-12 flex-wrap">
            <Box
              label="Artificial Neural Networks"
              color="bg-orange-600 text-white"
              active={active === "ann"}
              onClick={() => handleClick("ann")}
            />
            <Box
              label="Convolutional Neural Networks"
              color="bg-orange-600 text-white"
              active={active === "cnn"}
              onClick={() => handleClick("cnn")}
            />
          </div>
        )}
      </div>

      {/* ===== EXPLANATION PANEL ===== */}
      <div className="max-w-3xl w-full bg-surface/70 border border-white/10 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold mb-2 text-accent">
          Explanation
        </h3>
        {explanations[active].map((para, index) => (
          <p key={index} className="text-sm leading-relaxed mb-2 text-justify">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

