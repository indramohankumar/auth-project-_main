import { useMemo, useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    // Nice UX: focus email on first paint
    emailRef.current?.focus();
  }, []);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !submitting;
  }, [email, password, submitting]);

  const setCapsFromEvent = (e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);

      // Optional: tailor message a bit
      const msg =
        err?.message?.toLowerCase?.().includes('network')
          ? 'Network error. Check your connection and try again.'
          : 'Login failed. Please check your email and password and try again.';

      setErrorMsg(msg);

      // A11y: focus error so it's announced / obvious
      // (then focus password so user can retry quickly)
      requestAnimationFrame(() => {
        errorRef.current?.focus();
        passwordRef.current?.focus();
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Let browser validation run; only move focus if email is non-empty
      if (email.trim().length > 0) {
        e.preventDefault();
        passwordRef.current?.focus();
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Dark professional background (no extra UX features) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-slate-950" />

        {/* Very subtle top highlight */}
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />

        {/* Subtle side glows (kept minimal / pro) */}
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-44 top-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />

        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_35%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)] lg:grid-cols-2">
          {/* Left: Brand panel */}
          <div className="hidden lg:block">
            <div className="relative h-full bg-gradient-to-br from-neutral-950 via-slate-950 to-indigo-950 p-10 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a7 7 0 00-7 7v3.1c0 .6-.2 1.1-.6 1.5L3 15v2h18v-2l-1.4-1.4c-.4-.4-.6-.9-.6-1.5V9a7 7 0 00-7-7zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>

                <div>
                  <div className="text-sm font-semibold tracking-wide">Visitor Desk</div>
                  <div className="text-xs text-white/70">Secure check-in management</div>
                </div>
              </div>

              <h2 className="mt-10 text-3xl font-semibold leading-tight">
                Welcome back
                <span className="block text-white/75">Sign in to continue.</span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-white/70">
                Manage passes, scan QR codes, and track check-in/check-out with a clean, fast workflow.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  'Quick sign-in and streamlined dashboard access',
                  'Professional UI designed for front-desk use',
                  'Better clarity: fewer mistakes, faster flow',
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-emerald-300" />
                    <p className="text-sm text-white/80">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <div className="text-xs font-medium uppercase tracking-wide text-white/60">Security tip</div>
                <div className="mt-2 text-sm text-white/80">
                  Use a strong password and avoid sharing accounts for better auditability.
                </div>
              </div>

              <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 sm:p-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
                <p className="mt-1 text-sm text-white/60">Enter your credentials to continue.</p>
              </div>

              <span className="hidden sm:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                Staff access
              </span>
            </div>

            {/* Error area: accessible + no layout jump */}
            <div className="mt-6 min-h-[56px]" aria-live="polite" aria-atomic="true">
              {errorMsg ? (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 outline-none focus:ring-4 focus:ring-rose-500/20"
                >
                  <svg className="mt-0.5 h-5 w-5 text-rose-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="leading-5">{errorMsg}</div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={submitting}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80">
                  Email
                </label>

                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <svg className="h-5 w-5 text-white/30" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2.94 6.34A2 2 0 014.62 5h10.76a2 2 0 011.68 1.34L10 10.59 2.94 6.34z" />
                      <path d="M18 8.12l-7.3 4.56a2 2 0 01-2.12 0L1.28 8.12V14a2 2 0 002 2h13.44a2 2 0 002-2V8.12z" />
                    </svg>
                  </div>

                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={submitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onEmailKeyDown}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white shadow-sm outline-none transition
                               placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/10 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">
                    Password
                  </label>

                </div>

                <div className="mt-2 relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <svg className="h-5 w-5 text-white/30" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M5 8V6a5 5 0 0110 0v2h.5A1.5 1.5 0 0117 9.5v7A1.5 1.5 0 0115.5 18h-11A1.5 1.5 0 013 16.5v-7A1.5 1.5 0 014.5 8H5zm2-2a3 3 0 016 0v2H7V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={submitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={setCapsFromEvent}
                    onKeyUp={setCapsFromEvent}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false);
                      setCapsLockOn(false);
                    }}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 pr-24 text-sm text-white shadow-sm outline-none transition
                               placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/10 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 my-2 rounded-lg px-3 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-4 focus:ring-white/10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {passwordFocused && capsLockOn ? (
                  <p className="mt-2 text-xs text-amber-300/90">Caps Lock is on.</p>
                ) : null}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm transition
                           hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <svg className="h-4 w-4 animate-spin text-black" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
              </button>

              {/* Footer */}
              <div className="pt-2 text-center text-sm text-white/60">
                Don’t have an account?{' '}
                <Link to="/register" className="font-semibold text-indigo-300 hover:text-indigo-200">
                  Create one
                </Link>
              </div>

              <p className="text-center text-xs text-white/40">
                By signing in, you agree to your organization’s access policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;