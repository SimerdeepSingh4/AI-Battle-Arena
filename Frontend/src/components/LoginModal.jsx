import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithGitHub, isMockAuth } = useAuth();
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (loginFn) => {
    setError('');
    setLoggingIn(true);
    try {
      await loginFn();
      onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(3, 3, 10, 0.82)',
      backdropFilter: 'blur(10px)',
      padding: 16,
      animation: 'fade-in 0.25s ease-out forwards',
    }}>
      {/* HUD Panel Modal */}
      <div className="clip-tr hud-panel" style={{
        background: 'rgba(13, 13, 28, 0.95)',
        border: '1px solid rgba(255, 230, 0, 0.4)',
        boxShadow: '0 0 35px rgba(255, 230, 0, 0.12), 0 0 1px rgba(255, 230, 0, 0.3) inset',
        width: '100%',
        maxWidth: '460px',
        padding: '36px 28px',
        position: 'relative',
        textAlign: 'center',
      }}>
        {/* HUD Corner Brackets */}
        <span className="corner corner-tl corner-judge" />
        <span className="corner corner-tr corner-judge" />
        <span className="corner corner-bl corner-judge" />
        <span className="corner corner-br corner-judge" />

        {/* Access Warning Header */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.68rem',
          color: 'var(--color-neon-red)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: 10,
          fontWeight: 700,
        }}>
          ⚠️ SECURE AUTHENTICATION NODE
        </div>

        <h2 style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '0.04em',
          lineHeight: 1.2,
          marginBottom: 16,
          textTransform: 'uppercase',
        }}>
          Access Restricted
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
          color: 'var(--color-dim)',
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          To protect the Battle Arena API keys from exhaustion, please authenticate to run your duels. 
          Each user is allocated a quota of <strong>5 battles daily</strong>.
        </p>

        {/* Mock Mode Alert Banner */}
        {isMockAuth && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'var(--color-neon-green)',
            border: '1px solid rgba(0, 255, 136, 0.28)',
            background: 'rgba(0, 255, 136, 0.03)',
            padding: '8px 12px',
            borderRadius: 4,
            marginBottom: 24,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            ◈ LOCAL SANDBOX MOCK MODE ACTIVE ◈
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: '#ff2244',
            border: '1px solid rgba(255, 34, 68, 0.28)',
            background: 'rgba(255, 34, 68, 0.05)',
            padding: '10px 14px',
            borderRadius: 4,
            marginBottom: 20,
            textAlign: 'left',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Sign In Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {/* Google Button */}
          <button
            onClick={() => handleLogin(signInWithGoogle)}
            disabled={loggingIn}
            className="clip-btn-sm"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.08em',
              color: '#030308',
              background: '#ffffff',
              border: 'none',
              padding: '14px 20px',
              cursor: loggingIn ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
          >
            {/* Simple Google SVG Icon */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{loggingIn ? 'INITIALIZING...' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

          {/* GitHub Button */}
          <button
            onClick={() => handleLogin(signInWithGitHub)}
            disabled={loggingIn}
            className="clip-btn-sm"
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '0.88rem',
              letterSpacing: '0.08em',
              color: '#ffffff',
              background: '#24292e',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '14px 20px',
              cursor: loggingIn ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
          >
            {/* GitHub SVG Icon */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span>{loggingIn ? 'CONNECTING...' : 'SIGN IN WITH GITHUB'}</span>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          disabled={loggingIn}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'var(--color-dim)',
            letterSpacing: '0.1em',
            cursor: loggingIn ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            transition: 'color 0.2s',
          }}
        >
          CANCEL ACCESS
        </button>
      </div>
    </div>
  );
}
