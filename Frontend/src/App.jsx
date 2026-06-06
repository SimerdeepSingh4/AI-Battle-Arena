import { useState, useCallback } from 'react';
import ArenaScreen  from './screens/ArenaScreen';
import BattleScreen from './screens/BattleScreen';
import ResultsScreen from './screens/ResultsScreen';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';

const PHASE = { ARENA: 'arena', BATTLE: 'battle', RESULTS: 'results' };

/* Utility: count-up animation */
export function countUp(setter, target, duration = 1100) {
  const start = Date.now();
  const run = () => {
    const p = Math.min((Date.now() - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    setter(Number((ease * target).toFixed(1)));
    if (p < 1) requestAnimationFrame(run);
    else setter(target);
  };
  requestAnimationFrame(run);
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

function MainApp() {
  const { token } = useAuth();
  const [phase,   setPhase]   = useState(PHASE.ARENA);
  const [problem, setProblem] = useState('');
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');
  const [flashing, setFlashing] = useState(false);

  // Custom Matchmaking States
  const [modelA, setModelA] = useState('mistral');
  const [modelB, setModelB] = useState('cohere');
  const [judge, setJudge] = useState('gemini');

  /* White screen flash between phases */
  const flash = (cb) => {
    setFlashing(true);
    setTimeout(() => { setFlashing(false); cb?.(); }, 320);
  };

  const startBattle = useCallback(async (userProblem) => {
    setProblem(userProblem);
    setError('');

    /* Flash → show battle VS screen immediately */
    flash(() => setPhase(PHASE.BATTLE));

    /* Run API + enforced minimum display time in parallel */
    const minDelay = new Promise(r => setTimeout(r, 3200));
    try {
      const [res] = await Promise.all([
        fetch('/battle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({
            problem: userProblem,
            modelA,
            modelB,
            judge
          }),
        }),
        minDelay,
      ]);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      flash(() => setPhase(PHASE.RESULTS));
    } catch (err) {
      setError(err.message || 'Connection failed. Is the backend running?');
      flash(() => setPhase(PHASE.ARENA));
    }
  }, [modelA, modelB, judge, token]);

  const resetBattle = () => {
    flash(() => {
      setPhase(PHASE.ARENA);
      setResult(null);
      setProblem('');
      setError('');
    });
  };

  return (
    <>
      <div className="cyber-bg" aria-hidden="true" />

      {/* Screen-flash overlay */}
      {flashing && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: '#ffffff',
            pointerEvents: 'none',
            animation: 'screen-flash 0.32s ease-out forwards',
          }}
        />
      )}

      {phase === PHASE.ARENA   && (
        <MainAppContent
          onBattle={startBattle}
          error={error}
          modelA={modelA}
          setModelA={setModelA}
          modelB={modelB}
          setModelB={setModelB}
          judge={judge}
          setJudge={setJudge}
        />
      )}
      {phase === PHASE.BATTLE  && (
        <BattleScreen
          problem={problem}
          modelAKey={modelA}
          modelBKey={modelB}
          judgeKey={judge}
        />
      )}
      {phase === PHASE.RESULTS && result && (
        <ResultsScreen result={result} onReset={resetBattle} />
      )}
    </>
  );
}

// Extra wrapper component to capture Auth Context on ArenaScreen layer
function MainAppContent({ onBattle, error, modelA, setModelA, modelB, setModelB, judge, setJudge }) {
  return (
    <ArenaScreen
      onBattle={onBattle}
      error={error}
      modelA={modelA}
      setModelA={setModelA}
      modelB={modelB}
      setModelB={setModelB}
      judge={judge}
      setJudge={setJudge}
    />
  );
}