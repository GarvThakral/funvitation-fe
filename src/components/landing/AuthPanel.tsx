import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface AuthPanelProps {
  onSuccess?: () => void;
}

export default function AuthPanel({ onSuccess }: AuthPanelProps) {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onSuccess?.();
    } catch (submitError) {
      console.error('Auth failed:', submitError);
      setError('Authentication failed. Check credentials and try again.');
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
          onClick={() => setMode('signin')}
          className={`flex-1 rounded-lg px-3 py-2 ${mode === 'signin' ? 'bg-white text-[var(--play-ink)] shadow-sm' : 'text-[#7b756b]'}`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode('signup')}
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
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-[#f3c583]/50 px-3 py-2.5 text-sm outline-none focus:border-[#e99497]"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-[#f3c583]/50 px-3 py-2.5 text-sm outline-none focus:border-[#e99497]"
        />

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
