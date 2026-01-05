import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/code-walkthrough.css";

/*
  Usage:
    <CodeWalkthroughAdvanced
        lines={yourLinesArray}
        outputs={yourOutputsMap}
        onFinish={callbackFunction}
    />
  lines: [
    // Each line is an array of token objects
    [ {type: "keyword", text: "const", note: "declares constant"}, {type: "identifier", text:"cleanedHTML", note:"result var"}, ... ],
    ...
  ]
  outputs: {
    0: "Initial cleaned string",
    1: "<Document ...>",
    ...
  }
*/
export default function CodeWalkthroughAdvanced({
  lines,
  outputs = {},
  onFinish,
  technique = null
}) {
  // If the user didn't pass lines, we'll use a small built-in example.
  const defaultLines = [
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

  const tokenLines = lines && lines.length ? lines : defaultLines;

  // state
  const [visibleCount, setVisibleCount] = useState(1); // how many lines are visible
  const [hoverInfo, setHoverInfo] = useState(null); // {text,note, x,y}
  const [animating, setAnimating] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [userResult, setUserResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUserInput, setShowUserInput] = useState(false);
  const containerRef = useRef(null);
  const confettiRef = useRef(null);

  // Map UI technique → backend endpoint
  const endpointMap = {
    "Sentence Segmentation": "/segment",
    "Word Tokenization": "/tokenize",
    "Stopword Removal": "/stopwords",
    "Stemming": "/stem",
    "Lemmatization": "/lemmatize",
    "Text Normalization": "/normalize"
  };

  // show tooltip positioned near the token
  function onTokenEnter(e, token, lineIndex, tokenIndex) {
    // only allow hover for the last line visible
    if (lineIndex !== visibleCount - 1) return;
    const rect = e.target.getBoundingClientRect();
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

  function goNext() {
    if (animating) return;
    if (visibleCount >= tokenLines.length) {
      // Show user input section when walkthrough completes
      setShowUserInput(true);
      return;
    }
    setAnimating(true);
    // append next line after small delay to allow CSS animation
    setVisibleCount((c) => c + 1);
    setTimeout(() => setAnimating(false), 320);
  }

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
        body: JSON.stringify({ text: userInput }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setUserResult(data);
    } catch (err) {
      console.error("Backend error:", err);
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setUserResult({ out: "Error: Cannot connect to backend server. Please make sure the backend is running on http://localhost:8000" });
      } else {
        setUserResult({ out: `Error: ${err.message}` });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    // final state -> confetti
    triggerConfetti();
    // Wait for confetti animation, then call onFinish
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 2000);
  }

  function goPrev() {
    if (animating) return;
    if (visibleCount === 1) return;
    setAnimating(true);
    setVisibleCount((c) => c - 1);
    setTimeout(() => setAnimating(false), 320);
  }

  // confetti — simple canvas particle system
  function triggerConfetti() {
    setConfettiOn(true);
    const canvas = confettiRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const particles = [];
    const total = 120;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    function rand(min, max) { return Math.random() * (max - min) + min; }

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

    let t0 = performance.now();
    let frame = 0;

    function draw(now) {
      const dt = now - t0;
      t0 = now;
      ctx.clearRect(0, 0, width, height);
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 1.002;
        p.rot += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        ctx.restore();
      }
      frame++;
      if (frame < 300) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0,0,width,height);
        setConfettiOn(false);
      }
    }
    requestAnimationFrame(draw);
  }

  // ensure canvas covers viewport when confetti active
  useEffect(() => {
    const canvas = confettiRef.current;
    if (!canvas) return;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // output for visible last line
  const currentOutput = outputs && outputs[visibleCount - 1] ? outputs[visibleCount - 1] : `Output for line ${visibleCount}`;

  return (
    <div className="cwa-root">
      <canvas ref={confettiRef} className={`cwa-confetti ${confettiOn ? "active" : ""}`} />
      <div className="cwa-row">
        {/* left: code container */}
        <div className="cwa-code-col">
          <div className="cwa-header">
            <h3>Interactive Code Walkthrough</h3>
          </div>
          <div ref={containerRef} className={`cwa-code-box ${animating ? "animating" : ""}`}>
            {/* render visible lines */}
            {tokenLines.slice(0, visibleCount).map((line, li) => {
              const isCurrent = li === visibleCount - 1;
              return (
                <pre key={li} className={`cwa-line ${isCurrent ? "current" : "past"}`} aria-current={isCurrent}>
                  <code>
                    {line.map((token, ti) => {
                      const cls = `tok tok-${token.type || "plain"}`;
                      return (
                        <span
                          key={ti}
                          className={cls}
                          onMouseEnter={(e) => onTokenEnter(e, token, li, ti)}
                          onMouseLeave={onTokenLeave}
                          style={{ pointerEvents: isCurrent ? "auto" : "none" }} // disable hover on past lines
                        >
                          {token.text}
                        </span>
                      );
                    })}
                  </code>
                </pre>
              );
            })}
          </div>
          <div className="cwa-controls">
            <button className="btn small" onClick={goPrev} disabled={visibleCount <= 1 || showUserInput}>← Previous</button>
            {!showUserInput ? (
              <button className="btn small" onClick={goNext} style={{ marginLeft: 12 }}>
                {visibleCount >= tokenLines.length ? "Try Your Input →" : "Next →"}
              </button>
            ) : null}
          </div>
        </div>
        {/* right: output window */}
        <div className="cwa-output-col">
          <div className="cwa-output-box">
            <h4>Sample Output</h4>
            <div className="cwa-output-content">
              <pre>{currentOutput}</pre>
            </div>
          </div>

          {/* User Input/Output Section - Show after walkthrough completes */}
          {showUserInput && (
            <div className="cwa-output-box" style={{ marginTop: '20px' }}>
              <h4>Try it Yourself</h4>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#bfeaf3' }}>
                  Enter your text:
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#0a1a23',
                    color: '#e4f7fb',
                    border: '1px solid #07575b',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                  placeholder="Type or paste text here..."
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={runUserInput}
                  disabled={loading || !userInput.trim()}
                  className="btn small"
                >
                  {loading ? "Processing..." : "Run"}
                </button>
                <button
                  onClick={() => {
                    setUserInput("");
                    setUserResult(null);
                  }}
                  className="btn small"
                  style={{ background: '#2d5a59' }}
                >
                  Clear
                </button>
              </div>
              {userResult && (
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bfeaf3' }}>
                    Result:
                  </label>
                  <div style={{
                    background: '#0a1a23',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #07575b',
                    color: '#e4f7fb',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {typeof userResult.out === 'object' 
                      ? JSON.stringify(userResult.out, null, 2)
                      : userResult.out}
                  </div>
                </div>
              )}
              <button
                onClick={handleFinish}
                className="btn small"
                style={{ marginTop: '16px', width: '100%', background: '#4CAF50' }}
              >
                Finish & Return
              </button>
            </div>
          )}
        </div>
      </div>
      {/* hover tooltip */}
      {hoverInfo && (
        <div className="cwa-tooltip" style={{ left: hoverInfo.left, top: hoverInfo.top }}>
          <strong>{hoverInfo.text}</strong>
          <div className="note">{hoverInfo.note}</div>
        </div>
      )}
    </div>
  );
}

