import { useState, useEffect } from 'react';
import ModelLogo from '../components/ModelLogo';

const MODEL_DETAILS = {
  mistral: {
    name: "MISTRAL AI",
    model: "mistral-medium-latest",
    letter: "M",
    stats: [
      ['SPEED',    92],
      ['LOGIC',    86],
      ['DEPTH',    89],
    ]
  },
  cohere: {
    name: "COHERE AI",
    model: "command-a-03-2025",
    letter: "C",
    stats: [
      ['SPEED',    84],
      ['LOGIC',    95],
      ['DEPTH',    91],
    ]
  },
  gemini: {
    name: "GEMINI AI",
    model: "gemini-flash-latest",
    letter: "G",
    stats: [
      ['SPEED',    96],
      ['LOGIC',    94],
      ['DEPTH',    93],
    ]
  },
  cerebras: {
    name: "CEREBRAS AI",
    model: "gpt-oss-20b",
    letter: "X",
    stats: [
      ['SPEED',    99],
      ['LOGIC',    82],
      ['DEPTH',    80],
    ]
  },
  groq: {
    name: "GROQ AI",
    model: "llama-4-scout",
    letter: "Q",
    stats: [
      ['SPEED',    98],
      ['LOGIC',    92],
      ['DEPTH',    89],
    ]
  }
};

export default function BattleScreen({ problem, modelAKey = 'mistral', modelBKey = 'cohere', judgeKey = 'gemini' }) {
  const [msgIdx,   setMsgIdx]   = useState(0);
  const [progress, setProgress] = useState(0);
  const [ready,    setReady]    = useState(false);

  const detailsA = MODEL_DETAILS[modelAKey] || MODEL_DETAILS.mistral;
  const detailsB = MODEL_DETAILS[modelBKey] || MODEL_DETAILS.cohere;
  const judgeName = MODEL_DETAILS[judgeKey]?.name || 'GEMINI AI';

  const messages = [
    'SUMMONING FIGHTERS TO THE ARENA...',
    `${detailsA.name} LOCKED IN — CYAN FIGHTER READY`,
    `${detailsB.name} LOCKED IN — MAGENTA FIGHTER READY`,
    'GENERATING SOLUTIONS IN PARALLEL...',
    'PROCESSING CHALLENGE...',
    'SOLUTIONS COMPUTED — CALLING JUDGE...',
    `${judgeName} ANALYZING RESPONSES...`,
    'SCORING CORRECTNESS & RELEVANCE...',
    'EVALUATING COMPLETENESS & CLARITY...',
    'FINAL VERDICT INCOMING...',
  ];

  useEffect(() => {
    /* Slight delay for slide-in drama */
    const t = setTimeout(() => setReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const prog = setInterval(() => {
      setProgress(p => (p >= 96 ? 96 : p + 0.8));
    }, 60);
    const msg = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length);
    }, 1500);
    return () => { clearInterval(prog); clearInterval(msg); };
  }, [messages.length]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(40px, 8vh, 80px) 20px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#05050a',
    }}>
      {/* HUD crosshair / target line background */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.18,
      }}>
        {/* Horizontal center grid line */}
        <div style={{
          position: 'absolute', top: '50%', left: '5%', right: '5%',
          height: 1, background: 'linear-gradient(90deg, transparent, var(--color-a), var(--color-b), transparent)',
        }} />
        {/* Vertical center tick lines */}
        <div style={{
          position: 'absolute', left: '50%', top: '15%', bottom: '15%',
          width: 1, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.4), transparent)',
        }} />

        {/* Corner tech ticks */}
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '8%', width: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Round banner */}
      <div style={{
        fontFamily: 'var(--font-game)',
        fontSize: 'clamp(0.7rem, 2vw, 0.95rem)',
        color: 'var(--color-judge)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        marginBottom: 'clamp(24px, 5vh, 48px)',
        textShadow: '0 0 12px var(--color-judge)',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.4s 0.1s',
      }}>
        ◈ ROUND 1 — BATTLE INITIATED ◈
      </div>

      {/* ── FIGHTER CARDS + VS ──────────────────────── */}
      <div className="battle-duel-container">
        {/* Fighter A */}
        <FighterCard
          label="FIGHTER A"
          name={detailsA.name}
          model={detailsA.model}
          modelKey={modelAKey}
          variant="a"
          slideFrom="left"
          visible={ready}
          stats={detailsA.stats}
        />

        {/* VS */}
        <div className="battle-vs-container">
          <div
            className="anim-vs"
            style={{
              fontFamily: 'var(--font-game)',
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              color: '#ffffff',
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            VS
          </div>
          {/* Energy beam */}
          <div className="battle-beam-container" style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="anim-beam"
                style={{
                  width: 3,
                  height: 24 + (i % 3) * 8,
                  background: i % 2 === 0 ? 'var(--color-a)' : 'var(--color-b)',
                  animationDelay: `${i * 0.12}s`,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Fighter B */}
        <FighterCard
          label="FIGHTER B"
          name={detailsB.name}
          model={detailsB.model}
          modelKey={modelBKey}
          variant="b"
          slideFrom="right"
          visible={ready}
          stats={detailsB.stats}
        />
      </div>

      {/* ── PROBLEM DISPLAY ────────────────────────── */}
      <div style={{
        maxWidth: 640,
        width: '100%',
        textAlign: 'center',
        marginBottom: 'clamp(24px, 4vh, 40px)',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.5s 0.3s',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          color: 'var(--color-dim)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          ACTIVE CHALLENGE:
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.18)',
          padding: '12px 20px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
          color: '#e0eeff',
          letterSpacing: '0.03em',
          lineHeight: 1.5,
        }}>
          "{problem}"
        </div>
      </div>

      {/* ── STATUS + PROGRESS ──────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 780,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.5s 0.5s',
      }}>
        {/* Status line */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          color: 'var(--color-a)',
          letterSpacing: '0.12em',
          minHeight: 20,
        }}>
          <span>{messages[msgIdx]}</span>
          <span className="anim-cursor">_</span>
        </div>

        {/* Progress track */}
        <div style={{
          position: 'relative',
          height: 6,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--color-a), var(--color-b))',
            boxShadow: '0 0 12px rgba(0,255,225,0.5)',
            transition: 'width 0.08s linear',
          }} />
          {/* Segment marks */}
          {[25, 50, 75].map(pct => (
            <div key={pct} style={{
              position: 'absolute', top: 0, left: `${pct}%`,
              width: 1, height: '100%',
              background: 'rgba(0,0,0,0.5)',
            }} />
          ))}
        </div>

        {/* Percentage */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', marginTop: 5,
          fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
          color: 'var(--color-dim)', letterSpacing: '0.1em',
        }}>
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}

const FighterCard = ({ label, name, model, modelKey, variant, slideFrom, visible, stats }) => {
  const color    = variant === 'a' ? 'var(--color-a)' : 'var(--color-b)';
  const border   = variant === 'a' ? 'rgba(0,255,225,0.48)' : 'rgba(255,0,119,0.48)';
  const animCls  = variant === 'a' ? 'anim-breathe-a' : 'anim-breathe-b';
  const slideCls = slideFrom === 'left' ? 'anim-from-left' : 'anim-from-right';
  const clipCls  = variant === 'a' ? 'clip-tr' : 'clip-tl';
  const cardCls  = variant === 'a' ? 'fighter-card-a' : 'fighter-card-b';

  return (
    <div
      className={`${animCls} ${visible ? slideCls : ''} ${clipCls} ${cardCls}`}
      style={{
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.58rem',
        color: 'var(--color-dim)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        {label}
      </div>

      {/* Big logo */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color,
        height: 'clamp(2.5rem, 6vw, 4.5rem)',
        filter: `drop-shadow(0 0 12px ${color})`,
        marginBottom: 14,
      }}>
        <ModelLogo modelKey={modelKey} size="clamp(2.5rem, 6vw, 4.5rem)" />
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          color,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--color-dim)',
          marginTop: 4,
          letterSpacing: '0.08em',
        }}>
          {model}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {stats.map(([lbl, val]) => (
          <div key={lbl}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              color: 'var(--color-dim)',
              marginBottom: 3,
              letterSpacing: '0.08em',
            }}>
              <span>{lbl}</span>
              <span style={{ color }}>{val}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
              <div style={{
                height: '100%',
                width: `${val}%`,
                background: color,
                boxShadow: `0 0 6px ${color}`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
