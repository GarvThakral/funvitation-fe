import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface AuthPanelProps {
  onSuccess?: () => void;
}

const getAuthErrorMessage = (error: unknown, mode: 'signin' | 'signup') => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a bit and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return mode === 'signup'
        ? 'Could not create your account right now.'
        : 'Could not sign you in right now.';
  }
};

export default function AuthPanel({ onSuccess }: AuthPanelProps) {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuthMode = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(normalizedEmail, password);
      } else {
        await signUp(normalizedEmail, password);
      }
      onSuccess?.();
    } catch (submitError) {
      console.error('Auth failed:', submitError);
      setError(getAuthErrorMessage(submitError, mode));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (googleError) {
      console.error('Google auth failed:', googleError);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth" className="rounded-3xl border border-[#f3c583]/60 bg-white p-6 shadow-xl shadow-[#f3c583]/25">
      <h2 className="text-xl font-semibold text-[var(--play-ink)]">Start Creating</h2>
      <p className="mt-1 text-sm text-[#6a645a]">Sign in to unlock your private canvas workspace.</p>

      <div className="mt-5 flex rounded-xl bg-[#fff4dd] p-1 text-sm">
        <button
          type="button"
          onClick={() => setAuthMode('signin')}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === 'signin' ? 'bg-white text-[var(--play-ink)] shadow-sm' : 'text-[#7b756b]'}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === 'signup' ? 'bg-white text-[var(--play-ink)] shadow-sm' : 'text-[#7b756b]'}`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <input
          type="email"
          required
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-[#f3c583]/50 px-3 py-2.5 text-sm outline-none focus:border-[#e99497]"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-[#f3c583]/50 px-3 py-2.5 text-sm outline-none focus:border-[#e99497]"
        />
        {mode === 'signup' && (
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-xl border border-[#f3c583]/50 px-3 py-2.5 text-sm outline-none focus:border-[#e99497]"
          />
        )}

        {error && <p className="text-xs text-[#c2484f]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-[#e99497] via-[#f3c583] to-[#e8e46e] px-4 py-2.5 text-sm font-semibold text-[#2f2c28] disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Please wait...
            </span>
          ) : mode === 'signin' ? (
            'Enter Canvas'
          ) : (
            'Create Account'
          )}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-xl border border-[#b3e283] bg-[#f7ffe9] px-4 py-2.5 text-sm font-semibold text-[#3f6630] hover:bg-[#edffd2] disabled:opacity-60"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
