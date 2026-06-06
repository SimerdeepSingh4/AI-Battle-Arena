import { useState, useRef, useEffect } from 'react';
import ModelLogo from '../components/ModelLogo';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

const placeholders = {
  text: "e.g. Ask any question, describe a problem, or write a prompt...",
  code: "e.g. Write a function in Python, debug JavaScript, or optimize SQL...",
  creative: "e.g. Write a story about a spaceship, draft a formal email, or write a poem..."
};

const MODEL_DETAILS = {
  mistral: {
    name: "MISTRAL AI",
    desc: "Fast • Efficient • Great for Code",
    letter: "M"
  },
  cohere: {
    name: "COHERE AI",
    desc: "Strong Reasoning • Detailed • Reliable",
    letter: "C"
  },
  gemini: {
    name: "GEMINI AI",
    desc: "Fast Multimodal • Advanced Reasoning • Balanced",
    letter: "G"
  },
  cerebras: {
    name: "CEREBRAS AI",
    desc: "Incredibly Fast • High Throughput • Llama-based",
    letter: "X"
  },
  groq: {
    name: "GROQ AI",
    desc: "Ultra-Low Latency • LPU Powered • Real-time",
    letter: "Q"
  }
};

export default function ArenaScreen({
  onBattle,
  error,
  modelA,
  setModelA,
  modelB,
  setModelB,
  judge,
  setJudge
}) {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [showModelsSetup, setShowModelsSetup] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Temporary selection states for the setup screen before hitting "Save"
  const [tempA, setTempA] = useState(modelA);
  const [tempB, setTempB] = useState(modelB);
  const [tempJudge, setTempJudge] = useState(judge);

  const textRef = useRef(null);

  // Sync temp states when the setup view opens
  useEffect(() => {
    if (showModelsSetup) {
      setTempA(modelA);
      setTempB(modelB);
      setTempJudge(judge);
    }
  }, [showModelsSetup, modelA, modelB, judge]);

  const autoResize = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (!input.trim()) return;
    if (!user) {
      setShowLoginModal(true);
    } else {
      onBattle(input.trim());
    }
  };

  const saveSettings = () => {
    setModelA(tempA);
    setModelB(tempB);
    setJudge(tempJudge);
    setShowModelsSetup(false);
  };

  const resetToDefaults = () => {
    setTempA('mistral');
    setTempB('cohere');
    setTempJudge('gemini');
  };

  const closeAllOverlays = () => {
    setShowModelsSetup(false);
    setShowHowItWorks(false);
    setShowAbout(false);
  };

  const ready = !!input.trim();

  const activeDetailsA = MODEL_DETAILS[modelA] || MODEL_DETAILS.mistral;
  const activeDetailsB = MODEL_DETAILS[modelB] || MODEL_DETAILS.cohere;
  const activeDetailsJudge = MODEL_DETAILS[judge] || MODEL_DETAILS.gemini;

  // Unified Navbar Helper
  const renderNavbar = (activeTab) => {
    const isOverlayOpen = showModelsSetup || showHowItWorks || showAbout;
    return (
      <header className={`navbar ${isOverlayOpen ? 'overlay-open' : ''}`}>
        <a href="/" className="navbar-logo" onClick={(e) => { e.preventDefault(); closeAllOverlays(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="navbar-logo-icon">
            <path d="M4 20V8l8 6 8-6v12" />
          </svg>
          <span className="navbar-logo-text">AI BATTLE ARENA</span>
        </a>
        <nav className="navbar-menu">
          <a
            href="#how-it-works"
            className={`navbar-link ${activeTab === 'how-it-works' ? 'active' : ''}`}
            style={activeTab === 'how-it-works' ? { color: '#ffffff', textShadow: '0 0 8px var(--color-a)' } : {}}
            onClick={(e) => { e.preventDefault(); setShowHowItWorks(true); setShowAbout(false); setShowModelsSetup(false); }}
          >
            How It Works
          </a>
          <a
            href="#models"
            className={`navbar-link ${activeTab === 'models' ? 'active' : ''}`}
            style={activeTab === 'models' ? { color: '#ffffff', textShadow: '0 0 8px var(--color-judge)' } : {}}
            onClick={(e) => { e.preventDefault(); setShowModelsSetup(true); setShowHowItWorks(false); setShowAbout(false); }}
          >
            Models
          </a>
          <a
            href="#about"
            className={`navbar-link ${activeTab === 'about' ? 'active' : ''}`}
            style={activeTab === 'about' ? { color: '#ffffff', textShadow: '0 0 8px var(--color-b)' } : {}}
            onClick={(e) => { e.preventDefault(); setShowAbout(true); setShowHowItWorks(false); setShowModelsSetup(false); }}
          >
            About
          </a>
        </nav>
        <div style={{ gridColumn: 3, justifySelf: 'end' }}>
          {isOverlayOpen ? (
            <button
              onClick={closeAllOverlays}
              className="clip-btn-sm"
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: '#030308',
                background: 'linear-gradient(90deg, var(--color-judge), var(--color-judge-dim))',
                border: 'none',
                padding: '6px 16px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'box-shadow 0.2s',
              }}
            >
              <span className="back-btn-text-full">← BACK TO ARENA</span>
              <span className="back-btn-text-mobile">← BACK</span>
            </button>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="navbar-user-info" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.7rem', color: '#ffffff', lineHeight: 1.1 }}>
                  {user.displayName ? user.displayName.split(' ')[0].toUpperCase() : 'USER'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1 }}>
                  {user.email ?? ''}
                </span>
              </div>
              <button
                onClick={logout}
                className="clip-btn-sm"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  color: '#ffffff',
                  background: 'rgba(255, 34, 68, 0.12)',
                  border: '1px solid rgba(255, 34, 68, 0.35)',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="clip-btn-sm"
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: '0.72rem',
                color: '#030308',
                background: 'linear-gradient(90deg, var(--color-a), var(--color-a-dim))',
                border: 'none',
                padding: '6px 14px',
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              SIGN IN
            </button>
          )}
        </div>
      </header>
    );
  };

  // 1. HOW IT WORKS OVERLAY PAGE
  if (showHowItWorks) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        backgroundColor: '#05050a',
        paddingBottom: 60,
      }}>
        {renderNavbar('how-it-works')}

        <main className="setup-container" style={{ maxWidth: 1000 }}>
          <h1 className="setup-title">HOW IT WORKS</h1>
          <p className="setup-desc">The underlying mechanics, pipelines, and evaluation metrics that power the arena duels.</p>

          {/* Pipeline Steps Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 20,
            width: '100%',
            marginBottom: 40,
          }}>
            {/* Step 1 */}
            <div className="setup-column cyan" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-a)', marginBottom: 8 }}>PHASE 01</div>
              <div className="setup-column-title cyan" style={{ fontSize: '0.95rem' }}>Submit Challenge</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                Enter your coding task, algorithm challenge, or debugging prompt. Choose your contestants and click start.
              </p>
            </div>

            {/* Step 2 */}
            <div className="setup-column magenta" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-b)', marginBottom: 8 }}>PHASE 02</div>
              <div className="setup-column-title magenta" style={{ fontSize: '0.95rem' }}>Contestants Duel</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                Contestants Fighter A and Fighter B receive the problem in parallel, processing outputs instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="setup-column judge" style={{ padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-judge)', marginBottom: 8 }}>PHASE 03</div>
              <div className="setup-column-title judge" style={{ fontSize: '0.95rem' }}>Impartial Judgment</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                A third, independent evaluator model scores both candidate solutions across five core criteria.
              </p>
            </div>

            {/* Step 4 */}
            <div className="setup-column" style={{ padding: 20, borderTop: '3px solid #ffffff' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#ffffff', marginBottom: 8 }}>PHASE 04</div>
              <div className="setup-column-title" style={{ fontSize: '0.95rem', color: '#ffffff' }}>The Verdict</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                A weighted K.O. or Draw is rendered. Details, metrics, and justifications are shown instantly on your scoreboard.
              </p>
            </div>
          </div>

          {/* Formulas and Rules Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: 24,
            width: '100%',
          }}>
            {/* Scoring Weights */}
            <div className="mockup-card" style={{ padding: 24, textAlign: 'left' }}>
              <span className="card-label" style={{ color: 'var(--color-judge)' }}>◈ EVALUATION WEIGHTS ◈</span>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: '#ffffff',
                background: 'rgba(255,230,0,0.03)',
                border: '1px solid rgba(255,230,0,0.1)',
                padding: '12px 16px',
                borderRadius: 6,
                marginBottom: 16,
                lineHeight: 1.5,
              }}>
                Final Score = (Correctness × 0.35)
                <br />+ (Relevance × 0.20)
                <br />+ (Completeness × 0.20)
                <br />+ (Clarity × 0.10)
                <br />+ (Helpfulness × 0.15)
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-dim)', lineHeight: 1.6 }}>
                Weights favor correctness first, followed by relevance and completeness, ensuring responses are correct, direct, and full.
              </p>
            </div>

            {/* Penalties & Strict Rules */}
            <div className="mockup-card" style={{ padding: 24, textAlign: 'left' }}>
              <span className="card-label" style={{ color: 'var(--color-neon-red)' }}>◈ PENALTIES & EXTRA RULES ◈</span>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  ⚡ Anti-Verbosity Rule
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                  Contestants are not rewarded for length. Concise, direct code solutions that solve the task receive full points.
                </p>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  ⚠️ Hallucination & Error Penalty
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                  If a candidate solution contains syntax errors, broken code, or incorrect facts, the judge deducts **2 to 5 points** from the final score.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. ABOUT OVERLAY PAGE
  if (showAbout) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        backgroundColor: '#05050a',
        paddingBottom: 60,
      }}>
        {renderNavbar('about')}

        <main className="setup-container" style={{ maxWidth: 1000 }}>
          <h1 className="setup-title">ABOUT THE ARENA</h1>
          <p className="setup-desc">An objective, automated testing and benchmarking sandbox for Large Language Models.</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: 24,
            width: '100%',
            textAlign: 'left',
          }}>
            {/* The Vision */}
            <div className="mockup-card" style={{ padding: 24 }}>
              <span className="card-label">THE VISION</span>
              <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '1.25rem', color: '#ffffff', marginBottom: 12 }}>
                Objective, Real-Time LLM Comparison
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-dim)', lineHeight: 1.6, marginBottom: 16 }}>
                Standard leaderboards are static and prone to benchmark contamination. The AI Battle Arena lets you run real-time duels on your specific problem statement.
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-dim)', lineHeight: 1.6 }}>
                By using an automated judge setup orchestrated by LangGraph, we can evaluate answers reliably, objectively, and in parallel.
              </p>
            </div>

            {/* Contestant Models */}
            <div className="mockup-card" style={{ padding: 24 }}>
              <span className="card-label" style={{ color: 'var(--color-b)' }}>CONTESTANT MODELS</span>
              <h2 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '1.25rem', color: '#ffffff', marginBottom: 12 }}>
                Supported Duelists
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--color-dim)', lineHeight: 1.6, marginBottom: 16 }}>
                The arena supports a diverse range of models, from high-speed inference engines like Groq and Cerebras to deep reasoning powerhouses.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {['Gemini 2.5', 'Mistral Large', 'Cohere Command R', 'Cerebras Llama', 'Groq Llama 3'].map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-b)', border: '1px solid var(--color-b-border)', background: 'rgba(255,0,119,0.04)', padding: '2px 8px', borderRadius: 4 }}>
                    {t}
                  </span>
                ))}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-dim)', border: '1px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: 4, fontStyle: 'italic' }}>
                  + More coming soon...
                </span>
              </div>
            </div>

            {/* FAQ Card */}
            <div className="mockup-card" style={{ padding: 24 }}>
              <span className="card-label" style={{ color: 'var(--color-judge)' }}>FREQUENTLY ASKED QUESTIONS</span>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  Q: How does the judge remain unbiased?
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                  A: Solutions are evaluated anonymously as "Solution A" and "Solution B". Names are masked so the judge cannot favor specific models.
                </p>
              </div>

              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', marginBottom: 4 }}>
                  Q: What are the scoring rules?
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-dim)', lineHeight: 1.5 }}>
                  A: Scoring uses a weighted formula of correctness (35%), relevance (20%), completeness (20%), clarity (10%), and helpfulness (15%). Concise code is favored.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. MODELS CONFIGURATION OVERLAY PAGE
  if (showModelsSetup) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        backgroundColor: '#05050a',
        paddingBottom: 60,
      }}>
        {renderNavbar('models')}

        {/* Content Container */}
        <main className="setup-container">
          <h1 className="setup-title">BATTLE CONFIGURATION</h1>
          <p className="setup-desc">Customize which AI models go head-to-head in the arena and choose the independent evaluator.</p>

          <div className="setup-grid">
            {/* Fighter A Setup */}
            <div className="setup-column cyan">
              <div className="setup-column-title cyan">Fighter A</div>
              <div className="setup-column-desc">Cyan Side competitor</div>
              
              {Object.entries(MODEL_DETAILS).map(([key, details]) => (
                <div
                  key={key}
                  className={`setup-option-card cyan ${tempA === key ? 'active' : ''}`}
                  onClick={() => setTempA(key)}
                >
                  <div className="setup-option-name">{details.name}</div>
                  <div className="setup-option-details">{details.desc}</div>
                </div>
              ))}
            </div>

            {/* Fighter B Setup */}
            <div className="setup-column magenta">
              <div className="setup-column-title magenta">Fighter B</div>
              <div className="setup-column-desc">Magenta Side competitor</div>
              
              {Object.entries(MODEL_DETAILS).map(([key, details]) => (
                <div
                  key={key}
                  className={`setup-option-card magenta ${tempB === key ? 'active' : ''}`}
                  onClick={() => setTempB(key)}
                >
                  <div className="setup-option-name">{details.name}</div>
                  <div className="setup-option-details">{details.desc}</div>
                </div>
              ))}
            </div>

            {/* Judge Setup */}
            <div className="setup-column judge">
              <div className="setup-column-title judge">Judge Model</div>
              <div className="setup-column-desc">Impartial Evaluation Node</div>
              
              {Object.entries(MODEL_DETAILS).map(([key, details]) => (
                <div
                  key={key}
                  className={`setup-option-card judge ${tempJudge === key ? 'active' : ''}`}
                  onClick={() => setTempJudge(key)}
                >
                  <div className="setup-option-name">{details.name}</div>
                  <div className="setup-option-details">{details.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="setup-actions">
            <button className="btn-setup-apply" onClick={saveSettings}>
              Save & Apply Configuration
            </button>
            <button className="btn-setup-cancel" onClick={resetToDefaults}>
              Reset to Defaults
            </button>
            <button className="btn-setup-cancel" onClick={closeAllOverlays}>
              Cancel
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 4. NORMAL ARENA HOMEPAGE VIEW
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      backgroundColor: '#05050a',
    }}>
      {/* Top Navbar */}
      {renderNavbar('home')}

      {/* Main Container */}
      <main className="arena-main">
        {/* Tagline Subtitle */}
        <div className="tagline-container">
          <span className="tagline-bar cyan" />
          <span className="tagline-text">TWO AI MODELS. ONE CHALLENGE. OBJECTIVE JUDGEMENT.</span>
          <span className="tagline-bar magenta" />
        </div>

        {/* Title */}
        <h1 className="mockup-title">AI BATTLE ARENA</h1>

        {/* Sub-description */}
        <p className="mockup-description">
          Submit a challenge. Two leading AI models go head-to-head.<br />
          An independent judge evaluates. You get the verdict.
        </p>

        {/* Enter Challenge Card */}
        <div className="mockup-card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="card-label">ENTER YOUR CHALLENGE</span>
          </div>
          <textarea
            ref={textRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Ask any question, write a coding challenge, or describe a problem..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.92rem',
              color: '#ffffff',
              resize: 'none',
              lineHeight: 1.6,
              minHeight: '80px',
            }}
            id="battle-input"
            aria-label="Battle challenge input"
          />

          <div className="input-accessory-bar">
            {/* Left side empty spacer */}
            <div />
            <div className="char-counter">
              {input.length} / 4000
            </div>
          </div>
        </div>

        {/* Model Selection Container */}
        <div className="models-container">
          <span className="card-label">SELECT AI MODELS</span>
          <div className="models-grid">
            {/* Model A Card */}
            <div className="model-card cyan">
              <span className="model-badge cyan">Model A</span>
              <div className="model-logo-container cyan" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ModelLogo modelKey={modelA} size="22px" />
              </div>
              <div className="model-info">
                <div className="model-name">{activeDetailsA.name}</div>
                <div className="model-desc">{activeDetailsA.desc}</div>
                <div className="model-ver">{activeDetailsA.ver}</div>
              </div>
            </div>

            {/* VS Circle */}
            <div className="vs-circle">VS</div>

            {/* Model B Card */}
            <div className="model-card magenta">
              <span className="model-badge magenta">Model B</span>
              <div className="model-logo-container magenta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ModelLogo modelKey={modelB} size="22px" />
              </div>
              <div className="model-info">
                <div className="model-name">{activeDetailsB.name}</div>
                <div className="model-desc">{activeDetailsB.desc}</div>
                <div className="model-ver">{activeDetailsB.ver}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluated By Gemini Banner */}
        <div className="gemini-banner">
          <div className="gemini-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ModelLogo modelKey={judge} size="24px" />
          </div>
          <div className="gemini-banner-content">
            <div className="gemini-banner-title">EVALUATED BY {activeDetailsJudge.name}</div>
            <div className="gemini-banner-desc">Independent evaluation across correctness, relevance, completeness, clarity, and helpfulness.</div>
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          id="start-battle-btn"
          onClick={submit}
          disabled={!ready}
          className="btn-gold"
        >
          START BATTLE <span style={{ marginLeft: '4px' }}>→</span>
        </button>

        {/* Error Message Display */}
        {error && (
          <div style={{
            marginTop: 20,
            background: 'rgba(255,34,68,0.07)',
            border: '1px solid rgba(255,34,68,0.35)',
            padding: '12px 18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#ff4466',
            letterSpacing: '0.05em',
            textAlign: 'left',
            width: '100%',
            borderRadius: '6px',
          }}>
            ⚠ {error}
          </div>
        )}
      </main>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
