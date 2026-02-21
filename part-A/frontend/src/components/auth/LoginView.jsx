import { useState } from 'react';

function LoginView({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister && onRegister) {
        await onRegister({ name, email, password, role });
      } else {
        await onLogin({ email, password });
      }
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 px-8 py-10 shadow-xl shadow-slate-900/60">
        <h1 className="text-2xl font-semibold text-slate-50 tracking-tight">
          Company Equipment Tracker
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {isRegister
            ? 'Create an account to manage or request office equipment.'
            : 'Sign in with your work account to manage office equipment.'}
        </p>
        {error && (
          <p className="mt-4 text-sm text-rose-400 bg-rose-950/60 border border-rose-800 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                placeholder="John Admin"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              placeholder="Enter your password"
              required
            />
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-200">
                Role
              </label>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="user">User (request equipment)</option>
                <option value="admin">Admin (manage equipment)</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? isRegister
                ? 'Creating account...'
                : 'Signing in...'
              : isRegister
              ? 'Create account'
              : 'Sign in'}
          </button>
        </form>
        <button
          type="button"
          onClick={() =>
            setMode(isRegister ? 'login' : 'register')
          }
          className="mt-4 w-full text-center text-xs font-medium text-slate-400 hover:text-slate-200"
        >
          {isRegister
            ? 'Already have an account? Sign in'
            : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}

export default LoginView;
