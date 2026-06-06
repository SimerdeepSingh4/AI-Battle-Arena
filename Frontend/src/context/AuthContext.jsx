import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, githubProvider, isMockAuth } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync token periodically or when user changes
  useEffect(() => {
    if (isMockAuth) {
      // Load mock user from localStorage if it exists
      const savedMockUser = localStorage.getItem('mock_auth_user');
      if (savedMockUser) {
        try {
          const parsed = JSON.parse(savedMockUser);
          setUser(parsed);
          setToken(`mock-token:${parsed.uid}:${parsed.email}`);
        } catch (e) {
          localStorage.removeItem('mock_auth_user');
        }
      }
      setLoading(false);
    } else {
      if (!auth) return;
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setLoading(true);
        if (currentUser) {
          try {
            const idToken = await currentUser.getIdToken();
            setUser(currentUser);
            setToken(idToken);
          } catch (err) {
            console.error('Error getting user ID token:', err);
            setUser(null);
            setToken(null);
          }
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  // Mock signing handler helper
  const handleMockSignIn = async (provider) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Dramatic grid loading effect

    const randomId = Math.random().toString(36).substring(2, 7);
    const mockUser = {
      uid: `mock-uid-${randomId}`,
      email: `${provider}-user-${randomId}@example.com`,
      displayName: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Tester`,
      photoURL: ''
    };

    localStorage.setItem('mock_auth_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setToken(`mock-token:${mockUser.uid}:${mockUser.email}`);
    setLoading(false);
    return mockUser;
  };

  const signInWithGoogle = async () => {
    if (isMockAuth) {
      return handleMockSignIn('google');
    }
    if (!auth || !googleProvider) throw new Error('Firebase Auth is not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    setToken(idToken);
    return result.user;
  };

  const signInWithGitHub = async () => {
    if (isMockAuth) {
      return handleMockSignIn('github');
    }
    if (!auth || !githubProvider) throw new Error('Firebase Auth is not initialized');
    const result = await signInWithPopup(auth, githubProvider);
    const idToken = await result.user.getIdToken();
    setToken(idToken);
    return result.user;
  };

  const logout = async () => {
    setLoading(true);
    if (isMockAuth) {
      localStorage.removeItem('mock_auth_user');
      setUser(null);
      setToken(null);
      setLoading(false);
    } else {
      if (!auth) return;
      await signOut(auth);
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    isMockAuth,
    signInWithGoogle,
    signInWithGitHub,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
