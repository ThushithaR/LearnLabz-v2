import React, { useState, useRef } from "react";
import "./CodeWalkthroughAdvanced.css";

/* ---------- Types ---------- */

type Token = {
  type?: string;
  text: string;
  note?: string;
};

type OutputMap = {
  [key: number]: string;
};

type HoverInfo = {
  text: string;
  note: string;
  left: number;
  top: number;
} | null;

interface CodeWalkthroughAdvancedProps {
  lines?: Token[][];
  outputs?: OutputMap;
  onFinish?: () => void;
  technique?: string | null;
}

/* ---------- Component ---------- */

export default function CodeWalkthroughAdvanced({
  lines,
  outputs = {},
  onFinish,
  technique = null
}: CodeWalkthroughAdvancedProps) {

  /* ---------- Default Example ---------- */

  const defaultLines: Token[][] = [
    [
      { type: "keyword", text: "const", note: "Declares a constant variable" },
      { type: "identifier", text: "rawHTML", note: "Input HTML string" },
      { type: "operator", text: "=", note: "Assignment operator" },
      { type: "function", text: "fetch()", note: "Fetches remote resource" },
      { type: "punct", text: ";", note: "End of statement" }
    ],
    [
      { type: "keyword", text: "const", note: "Declares a constant variable" },
      { type: "identifier", text: "cleanedHTML", note: "Sanitized HTML" },
      { type: "operator", text: "=", note: "Assignment" },
      { type: "identifier", text: "rawHTML.replace", note: "Replace dangerous tags" },
      { type: "punct", text: ";", note: "End of statement" }
    ],
    [
      { type: "keyword", text: "const", note: "Declares a constant variable" },
      { type: "identifier", text: "parser", note: "DOM parser instance" },
      { type: "operator", text: "=", note: "Assignment operator" },
      { type: "constructor", text: "new DOMParser()", note: "Creates parser" },
      { type: "punct", text: ";", note: "End of statement" }
    ]
  ];

  const tokenLines: Token[][] = lines && lines.length ? lines : defaultLines;

  /* ---------- State ---------- */

  const [visibleCount, setVisibleCount] = useState<number>(1);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
  const [animating, setAnimating] = useState<boolean>(false);
  const [confettiOn, setConfettiOn] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [userResult, setUserResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showUserInput, setShowUserInput] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const confettiRef = useRef<HTMLCanvasElement | null>(null);

  /* ---------- Endpoint Map ---------- */

  const endpointMap: Record<string, string> = {
    "Sentence Segmentation": "/segment",
    "Word Tokenization": "/tokenize",
    "Stopword Removal": "/stopwords",
    "Stemming": "/stem",
    "Lemmatization": "/lemmatize",
    "Text Normalization": "/normalize"
  };

  /* ---------- Token Hover ---------- */

  function onTokenEnter(
    e: React.MouseEvent<HTMLSpanElement>,
    token: Token,
    lineIndex: number
  ) {
    if (lineIndex !== visibleCount - 1) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setHoverInfo({
      text: token.text,
      note: token.note || "No description",
      left: rect.right + 10,
      top: rect.top
    });
  }

  function onTokenLeave() {
    setHoverInfo(null);
  }

  /* ---------- Navigation ---------- */

  function goNext() {
    if (animating) return;

    if (visibleCount >= tokenLines.length) {
      setShowUserInput(true);
      return;
    }

    setAnimating(true);
    setVisibleCount(c => c + 1);
    setTimeout(() => setAnimating(false), 320);
  }

  function goPrev() {
    if (animating || visibleCount === 1) return;

    setAnimating(true);
    setVisibleCount(c => c - 1);
    setTimeout(() => setAnimating(false), 320);
  }

  /* ---------- Backend Call ---------- */

  async function runUserInput() {
    if (!technique) {
      setUserResult({ out: "Technique not specified." });
      return;
    }

    const endpoint = endpointMap[technique];
    if (!endpoint) {
      setUserResult({ out: "Technique not implemented on backend." });
      return;
    }

    if (!userInput.trim()) {
      setUserResult({ out: "Please enter some text to process." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userInput })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUserResult(data);

    } catch (err: any) {
      console.error(err);
      setUserResult({ out: err.message });
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Confetti ---------- */

  function triggerConfetti() {
    setConfettiOn(true);

    const canvas = confettiRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Capture safe values ONCE
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rot: number;
      rotSpeed: number;
    };

    const particles: Particle[] = [];
    const total = 120;

    function rand(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    for (let i = 0; i < total; i++) {
      particles.push({
        x: rand(0, width),
        y: rand(-height, 0),
        vx: rand(-1.5, 1.5),
        vy: rand(2, 6),
        size: rand(6, 12),
        color: `hsl(${Math.floor(rand(0, 360))}deg 70% 60%)`,
        rot: rand(0, 360),
        rotSpeed: rand(-6, 6)
      });
    }

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }

      frame++;
      if (frame < 300) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
        setConfettiOn(false);
      }
    };

    requestAnimationFrame(draw);
  }


  function handleFinish() {
    triggerConfetti();
    setTimeout(() => onFinish?.(), 2000);
  }

  /* ---------- Output ---------- */

  const currentOutput =
    outputs[visibleCount - 1] ?? `Output for line ${visibleCount}`;

  /* ---------- JSX ---------- */

  return (
    <div className="cwa-root">
      <canvas ref={confettiRef} className={`cwa-confetti ${confettiOn ? "active" : ""}`} />

      {/* JSX BELOW IS IDENTICAL — TYPESCRIPT DOES NOT CHANGE JSX STRUCTURE */}

      {/* ... (your JSX render stays exactly the same) ... */}
    </div>
  );
}
