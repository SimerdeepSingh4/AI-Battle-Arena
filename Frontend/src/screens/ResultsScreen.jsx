import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { countUp } from '../App';
import ModelLogo from '../components/ModelLogo';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/* ─── Helpers ─────────────────────────────────────────── */
const Corners = ({ variant = 'a' }) => (
  <>
    <span className={`corner corner-tl corner-${variant}`} />
    <span className={`corner corner-tr corner-${variant}`} />
    <span className={`corner corner-bl corner-${variant}`} />
    <span className={`corner corner-br corner-${variant}`} />
  </>
);

const METRICS = [
  { key: 'correctness',  label: 'CORRECTNESS'  },
  { key: 'relevance',    label: 'RELEVANCE'     },
  { key: 'completeness', label: 'COMPLETENESS'  },
  { key: 'clarity',      label: 'CLARITY'       },
  { key: 'helpfulness',  label: 'HELPFULNESS'   },
];

/* ─── Animated HP-style score bar ────────────────────── */
const ScoreRow = ({ label, scoreA, scoreB, active, delay }) => {
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setFilled(true);
      countUp(setNumA, scoreA);
      countUp(setNumB, scoreB);
    }, delay);
    return () => clearTimeout(t);
  }, [active]);

  const pctA = (scoreA / 10) * 100;
  const pctB = (scoreB / 10) * 100;
  const aWins = scoreA > scoreB;
  const bWins = scoreB > scoreA;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Row label */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: 'var(--color-dim)',
        letterSpacing: '0.18em',
        textAlign: 'center',
        marginBottom: 6,
      }}>
        {label}
      </div>

      {/* Bar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Score A label */}
        <div style={{
          fontFamily: 'var(--font-game)',
          fontSize: '1rem',
          color: aWins ? 'var(--color-a)' : 'var(--color-dim)',
          width: 28,
          textAlign: 'right',
          flexShrink: 0,
          transition: 'color 0.5s',
          textShadow: aWins && filled ? '0 0 10px var(--color-a)' : 'none',
        }}>
          {numA}
        </div>

        {/* Bar A (fills right-to-left) */}
        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, right: 0,
            height: '100%',
            width: filled ? `${pctA}%` : '0%',
            background: aWins
              ? 'linear-gradient(90deg, var(--color-a-dim), var(--color-a))'
              : 'rgba(0,255,225,0.35)',
            boxShadow: aWins && filled ? '0 0 8px var(--color-a)' : 'none',
            transition: 'width 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
          {/* Segment lines */}
          {[25, 50, 75].map(p => (
            <div key={p} style={{
              position: 'absolute', top: 0,
              right: `${p}%`,
              width: 1, height: '100%',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1,
            }} />
          ))}
        </div>

        {/* Center line */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Bar B (fills left-to-right) */}
        <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: '100%',
            width: filled ? `${pctB}%` : '0%',
            background: bWins
              ? 'linear-gradient(90deg, var(--color-b), var(--color-b-dim))'
              : 'rgba(255,0,119,0.35)',
            boxShadow: bWins && filled ? '0 0 8px var(--color-b)' : 'none',
            transition: 'width 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
          {[25, 50, 75].map(p => (
            <div key={p} style={{
              position: 'absolute', top: 0,
              left: `${p}%`,
              width: 1, height: '100%',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1,
            }} />
          ))}
        </div>

        {/* Score B label */}
        <div style={{
          fontFamily: 'var(--font-game)',
          fontSize: '1rem',
          color: bWins ? 'var(--color-b)' : 'var(--color-dim)',
          width: 28,
          flexShrink: 0,
          transition: 'color 0.5s',
          textShadow: bWins && filled ? '0 0 10px var(--color-b)' : 'none',
        }}>
          {numB}
        </div>
      </div>
    </div>
  );
};

/* ─── Solution tab panel ──────────────────────────────── */
const SolutionPanel = ({ title, model, content, variant, animCls }) => {
  const color  = variant === 'a' ? 'var(--color-a)' : 'var(--color-b)';
  const border = variant === 'a' ? 'rgba(0,255,225,0.45)' : 'rgba(255,0,119,0.45)';
  const clipCls = variant === 'a' ? 'clip-tr' : 'clip-tl';
  const breathe = variant === 'a' ? 'anim-breathe-a' : 'anim-breathe-b';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${animCls} ${breathe} ${clipCls} hud-panel`} style={{
      background: 'rgba(255,255,255,0.018)',
      border: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <Corners variant={variant} />

      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: `1px solid ${border}`,
        background: variant === 'a'
          ? 'rgba(0,255,225,0.04)'
          : 'rgba(255,0,119,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            fontWeight: 'bold',
            color: '#ffffff',
            background: color,
            padding: '1px 5px',
            borderRadius: 1,
            lineHeight: 1.1,
          }}>
            {variant === 'a' ? 'A' : 'B'}
          </span>
          <span style={{
            fontFamily: 'var(--font-game)',
            fontSize: '0.75rem',
            color,
            letterSpacing: '0.12em',
          }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.58rem',
            color,
            border: `1px solid ${border}`,
            background: variant === 'a' ? 'rgba(0,255,225,0.06)' : 'rgba(255,0,119,0.06)',
            padding: '2px 8px',
            letterSpacing: '0.1em',
          }}>
            {model}
          </span>
          <button
            onClick={handleCopy}
            className="clip-btn-sm"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              color: copied ? '#030308' : color,
              border: `1px solid ${border}`,
              background: copied ? 'var(--color-neon-green)' : 'transparent',
              padding: '2px 10px',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓ COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '14px 18px',
        overflowY: 'auto',
        maxHeight: 380,
        flex: 1,
      }}>
        <div className="md-render">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;
                return !isInline ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      background: 'transparent',
                      margin: 0,
                      padding: '8px 0',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

/* Compact Strengths/Weaknesses card */
const SwCard = ({ score, variant }) => {
  const color  = variant === 'a' ? 'var(--color-a)' : 'var(--color-b)';
  const border = variant === 'a' ? 'rgba(0,255,225,0.38)' : 'rgba(255,0,119,0.38)';
  const clipCls = variant === 'a' ? 'clip-tr' : 'clip-tl';

  return (
    <div className={clipCls} style={{
      border: `1px solid ${border}`,
      background: 'rgba(255,255,255,0.015)',
      padding: 'clamp(12px, 2vh, 18px)',
    }}>
      <div style={{
        fontFamily: 'var(--font-ui)', fontWeight: 700,
        fontSize: '0.75rem', color, letterSpacing: '0.12em',
        marginBottom: 10,
      }}>
        {variant === 'a' ? 'SOLUTION A' : 'SOLUTION B'}
      </div>

      {score?.strengths?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-neon-green)', letterSpacing: '0.15em', marginBottom: 5 }}>
            ✦ STRENGTHS
          </div>
          {score.strengths.slice(0, 2).map((s, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              color: 'rgba(180,210,180,0.85)', lineHeight: 1.5,
              paddingLeft: 8, borderLeft: '2px solid rgba(0,255,136,0.35)',
              marginBottom: 4,
            }}>
              {s}
            </div>
          ))}
        </div>
      )}

      {score?.weaknesses?.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-neon-red)', letterSpacing: '0.15em', marginBottom: 5 }}>
            ◆ WEAKNESSES
          </div>
          {score.weaknesses.slice(0, 2).map((w, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-body)', fontSize: '0.75rem',
              color: 'rgba(210,170,170,0.85)', lineHeight: 1.5,
              paddingLeft: 8, borderLeft: '2px solid rgba(255,34,68,0.35)',
              marginBottom: 4,
            }}>
              {w}
            </div>
          ))}
        </div>
      )}

      {score?.justification && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          color: 'var(--color-dim)', lineHeight: 1.6,
          marginTop: 10, fontStyle: 'italic',
        }}>
          "{score.justification}"
        </p>
      )}
    </div>
  );
};

const MODEL_LABELS = {
  mistral: 'MISTRAL AI',
  cohere: 'COHERE AI',
  gemini: 'GEMINI AI',
  cerebras: 'CEREBRAS AI',
  groq: 'GROQ AI'
};

export default function ResultsScreen({ result, onReset }) {
  const { problem, solution_1, solution_2, judge, modelA = 'mistral', modelB = 'cohere', judgeModel = 'gemini' } = result;
  
  const modelALabel = MODEL_LABELS[modelA] || 'MISTRAL AI';
  const modelBLabel = MODEL_LABELS[modelB] || 'COHERE AI';
  const judgeLabel  = MODEL_LABELS[judgeModel] || 'GEMINI AI';
  
  const [scoresActive, setScoresActive] = useState(false);
  const [finalScoreA, setFinalScoreA]   = useState(0);
  const [finalScoreB, setFinalScoreB]   = useState(0);

  useEffect(() => {
    /* Activate score animation after brief delay */
    const t = setTimeout(() => {
      setScoresActive(true);
      countUp(setFinalScoreA, judge?.solution_1_score?.final_score ?? 0, 1400);
      countUp(setFinalScoreB, judge?.solution_2_score?.final_score ?? 0, 1400);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const s1 = judge?.solution_1_score;
  const s2 = judge?.solution_2_score;

  const winner = judge?.winner || 'Tie';
  const isA = winner === 'A';
  const isB = winner === 'B';
  const isTie = winner === 'Tie';
  const winnerColor = isTie ? 'var(--color-judge)' : isA ? 'var(--color-a)' : 'var(--color-b)';
  const winnerName = isTie ? 'DRAW' : isA ? `SOLUTION A — ${modelALabel}` : `SOLUTION B — ${modelBLabel}`;

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 40px', backgroundColor: '#05050a', position: 'relative' }}>
      
      {/* ── TOP NAVBAR ──────────────────────────────── */}
      <header className="navbar" style={{ position: 'relative', marginBottom: 20 }}>
        <a href="/" className="navbar-logo" onClick={(e) => { e.preventDefault(); onReset(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="navbar-logo-icon">
            <path d="M4 20V8l8 6 8-6v12" />
          </svg>
          <span className="navbar-logo-text">AI BATTLE ARENA</span>
        </a>
        <nav className="navbar-menu">
          <span className="navbar-link" style={{ color: 'var(--color-judge)', textShadow: '0 0 8px var(--color-judge-glow)' }}>
            <span className="back-btn-text-full">◈ RESULTS DASHBOARD ◈</span>
            <span className="back-btn-text-mobile">◈ RESULTS ◈</span>
          </span>
        </nav>
        <div style={{ gridColumn: 3, justifySelf: 'end' }}>
          <button
            onClick={onReset}
            className="clip-btn-sm"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#030308',
              background: 'linear-gradient(90deg, var(--color-judge), var(--color-judge-dim))',
              border: 'none',
              padding: '6px 16px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            <span className="back-btn-text-full">↺ NEW BATTLE</span>
            <span className="back-btn-text-mobile">↺ RESET</span>
          </button>
        </div>
      </header>

      {/* ── 1. HERO VERDICT AREA (TOP) ──────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '20px 24px 36px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* KO Title */}
        <div
          className="anim-ko"
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            color: '#ffffff',
            letterSpacing: '0.08em',
            lineHeight: 1,
            marginBottom: 12,
            textShadow: `0 0 25px ${winnerColor}, 0 0 60px ${winnerColor}55`,
          }}
        >
          {isTie ? 'DRAW!' : 'K.O.'}
        </div>

        {/* Winner Banner */}
        <div
          className="anim-winner clip-btn"
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: 'clamp(0.85rem, 2vw, 1.15rem)',
            letterSpacing: '0.1em',
            padding: '12px 36px',
            color: '#030308',
            background: isTie
              ? 'linear-gradient(90deg, var(--color-judge), var(--color-judge-dim))'
              : isA
              ? 'linear-gradient(90deg, var(--color-a), var(--color-a-dim))'
              : 'linear-gradient(90deg, var(--color-b), var(--color-b-dim))',
            boxShadow: `0 0 35px ${winnerColor}44`,
            marginBottom: 20,
          }}
        >
          {isTie ? '⚖ IT\'S A DRAW' : `👑 WINNER: ${winnerName}`}
        </div>

        {/* Judge name */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          color: 'var(--color-judge)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <ModelLogo modelKey={judgeModel} size="14px" />
          <span>EVALUATED BY {judgeLabel}</span>
        </div>

        {/* Challenge Statement */}
        <div style={{
          background: 'rgba(255,255,255,0.01)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 8,
          padding: '16px 24px',
          maxWidth: 760,
          width: '100%',
          marginBottom: 28,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            color: 'var(--color-dim)',
            letterSpacing: '0.15em',
            display: 'block',
            marginBottom: 6,
          }}>
            CHALLENGE
          </span>
          <h2 style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 'clamp(0.95rem, 2.5vw, 1.25rem)',
            color: '#ddeeff',
            lineHeight: 1.4,
          }}>
            "{problem}"
          </h2>
        </div>

        {/* Score comparison boxes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(8px, 3vw, 20px)',
            marginBottom: 28,
          }}
        >
          {/* Solution A Score Box */}
          <div
            className="clip-tr"
            style={{
              border: `1px solid ${isA ? 'var(--color-a)' : 'rgba(0,255,225,0.2)'}`,
              background: isA ? 'rgba(0,255,225,0.05)' : 'rgba(255,255,255,0.01)',
              padding: '12px clamp(12px, 4vw, 28px)',
              textAlign: 'center',
              minWidth: 'clamp(95px, 28vw, 130px)',
              boxShadow: isA ? '0 0 20px rgba(0,255,225,0.15)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--color-dim)', letterSpacing: '0.12em', marginBottom: 4 }}>SOLUTION A</div>
            <div style={{
              fontFamily: 'var(--font-game)',
              fontSize: '1.8rem',
              color: isA ? 'var(--color-a)' : 'var(--color-dim)',
              textShadow: isA ? '0 0 15px var(--color-a)' : 'none',
              lineHeight: 1,
            }}>
              {finalScoreA}
            </div>
            {isA && <div style={{ marginTop: 2, fontSize: '1rem' }}>🏆</div>}
          </div>

          <div style={{
            fontFamily: 'var(--font-game)',
            fontSize: '0.9rem',
            color: 'var(--color-muted)',
            letterSpacing: '0.1em',
          }}>
            VS
          </div>

          {/* Solution B Score Box */}
          <div
            className="clip-tl"
            style={{
              border: `1px solid ${isB ? 'var(--color-b)' : 'rgba(255,0,119,0.2)'}`,
              background: isB ? 'rgba(255,0,119,0.05)' : 'rgba(255,255,255,0.01)',
              padding: '12px clamp(12px, 4vw, 28px)',
              textAlign: 'center',
              minWidth: 'clamp(95px, 28vw, 130px)',
              boxShadow: isB ? '0 0 20px rgba(255,0,119,0.15)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--color-dim)', letterSpacing: '0.12em', marginBottom: 4 }}>SOLUTION B</div>
            <div style={{
              fontFamily: 'var(--font-game)',
              fontSize: '1.8rem',
              color: isB ? 'var(--color-b)' : 'var(--color-dim)',
              textShadow: isB ? '0 0 15px var(--color-b)' : 'none',
              lineHeight: 1,
            }}>
              {finalScoreB}
            </div>
            {isB && <div style={{ marginTop: 2, fontSize: '1rem' }}>🏆</div>}
          </div>
        </div>

        {/* Judge Reason */}
        {judge?.winner_reason && (
          <div
            style={{
              maxWidth: 760,
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'var(--color-text)',
              padding: '16px 20px',
              background: 'rgba(255,230,0,0.02)',
              borderLeft: '3px solid var(--color-judge)',
              textAlign: 'left',
              borderRadius: '0 8px 8px 0',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              color: 'var(--color-judge)',
              letterSpacing: '0.12em',
              display: 'block',
              marginBottom: 4,
              textTransform: 'uppercase',
            }}>
              Verdict Justification
            </span>
            "{judge.winner_reason}"
          </div>
        )}
      </div>

      {/* ── 2. SCOREBOARD & METRICS AREA (MIDDLE) ────── */}
      <div style={{
        padding: '36px 24px',
        maxWidth: 1200,
        margin: '0 auto',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Header line */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16,
          marginBottom: 28,
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06))' }} />
          <span style={{
            fontFamily: 'var(--font-game)',
            fontSize: '1.05rem',
            color: 'var(--color-judge)',
            letterSpacing: '0.15em',
            textShadow: '0 0 10px var(--color-judge)',
          }}>
            JUDGE SCOREBOARD
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
        </div>

        {/* Fighter Labels */}
        <div style={{ display: 'flex', marginBottom: 20, alignItems: 'center' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, paddingRight: 'clamp(8px, 6vw, 40px)' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-a)', letterSpacing: '0.1em' }}>
              {modelALabel}
            </span>
            <ModelLogo modelKey={modelA} size="18px" />
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, paddingLeft: 'clamp(8px, 6vw, 40px)' }}>
            <ModelLogo modelKey={modelB} size="18px" />
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-b)', letterSpacing: '0.1em' }}>
              {modelBLabel}
            </span>
          </div>
        </div>

        {/* Graph metric rows */}
        {s1 && s2 && METRICS.map(({ key, label }, i) => (
          <ScoreRow
            key={key}
            label={label}
            scoreA={s1[key] ?? 0}
            scoreB={s2[key] ?? 0}
            active={scoresActive}
            delay={i * 150}
          />
        ))}

        {/* Strengths & Weaknesses Cards */}
        {s1 && s2 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
            gap: 20,
            marginTop: 32,
          }}>
            <SwCard score={s1} variant="a" />
            <SwCard score={s2} variant="b" />
          </div>
        )}
      </div>

      {/* ── 3. SOLUTIONS DISPLAY AREA (BOTTOM) ──────── */}
      <div style={{
        padding: '36px 24px',
        maxWidth: 1600,
        margin: '0 auto',
      }}>
        {/* Section title */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16,
          marginBottom: 28,
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06))' }} />
          <span style={{
            fontFamily: 'var(--font-game)',
            fontSize: '0.9rem',
            color: 'var(--color-dim)',
            letterSpacing: '0.15em',
          }}>
            DETAILED CODE SOLUTIONS
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
        </div>

        {/* Solutions Side by Side Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
          gap: 24,
          alignItems: 'start',
        }}>
          <SolutionPanel
            title="SOLUTION A"
            model={modelALabel}
            content={solution_1}
            variant="a"
            animCls="anim-from-left"
          />
          <SolutionPanel
            title="SOLUTION B"
            model={modelBLabel}
            content={solution_2}
            variant="b"
            animCls="anim-from-right"
          />
        </div>
      </div>

      {/* ── 4. NEW BATTLE CTA BUTTON ────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '32px 24px 60px',
      }}>
        <button
          id="new-battle-btn"
          onClick={onReset}
          className="clip-btn"
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: '1rem',
            letterSpacing: '0.12em',
            padding: '16px 48px',
            color: '#030308',
            background: 'linear-gradient(90deg, var(--color-judge), var(--color-judge-dim))',
            border: 'none',
            boxShadow: '0 0 25px var(--color-judge-glow)',
            cursor: 'pointer',
            transition: 'box-shadow 0.3s, transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 45px rgba(255,230,0,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 25px var(--color-judge-glow)'}
        >
          ↺ START NEW BATTLE
        </button>
      </div>

    </div>
  );
}
