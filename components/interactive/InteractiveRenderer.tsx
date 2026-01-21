"use client";

import InteractiveCodeWalkthrough from "./InteractiveCodeWalkthrough";
import InteractiveConceptDiagram from "./InteractiveConceptDiagram";
import InteractiveMLSimulation from "./InteractiveMLSimulation";
import InteractiveDLSimulation from "./InteractiveDLSimulation";
import InteractiveDataset from "./InteractiveDataset";
import InteractiveModelExplanation from "./InteractiveModelExplanation"; 
import InteractiveTestItYourself from "./InteractiveTestItYOurself";



export default function InteractiveRenderer({
  title,
  content,
}: {
  title?: string;
  content: any;
}) {
  // 🔹 Case 1: Code walkthrough (your existing logic)
  if (content?.lines && Array.isArray(content.lines)) {
    return (
      <InteractiveCodeWalkthrough
        lines={content.lines}
        outputs={content.outputs}
        summary={content.summary}
      />
    );
  }

  // 🔹 Case 2: Concept relationships (circles, diagrams, etc.)
  if (content?.concepts && content?.relations) {
    return <InteractiveConceptDiagram data={content} />;
  }

  // 🔹 Case 3: ML Simulation
  if (content?.scenarioId) {
  return <InteractiveMLSimulation scenarioId={content.scenarioId} />;
  }

  // 🔹 Case 4: Deep Learning Simulation
  if (content?.scenarioIdDl) {
    return <InteractiveDLSimulation scenarioId={content.scenarioIdDl} />;
  }

  // 🔹 Case 5: Dataset Simulation
  if (content.kind === "dataset") {
  return <InteractiveDataset />;
  }
  // 🔹 Case 6: Model Explanation
  if (content?.modelFlow) {
  return <InteractiveModelExplanation />;
  }

  // 🔹 Case 7: Test it yourself
  if (content?.questions) {
  return (
    <div className="space-y-10">
      {content.questions.map((q: any, idx: number) => (
        <InteractiveTestItYourself
          key={idx}
          question={q.question}
          options={q.options}
          correctAnswer={q.correctAnswer}
        />
        ))}
      </div>
    );
  } 


  // 🔹 Fallback
  return (
    <div className="text-white/60 italic">
      Unsupported interactive content
    </div>
  );
}
