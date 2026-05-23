import { useMemo, useRef, useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const nameRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    // Focus first input on first paint (simple UX, no extra features)
    nameRef.current?.focus();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      formData.password.trim().length > 0 &&
      !isSubmitting
    );
  }, [formData, isSubmitting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await registerUser(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        formData.role
      );

      // Keep it simple + predictable
      navigate('/');
    } catch (err) {
      console.error(err);
      setErrorMsg('Registration failed. Please check your details and try again.');

      // A11y: move focus to the error message
      requestAnimationFrame(() => {
        errorRef.current?.focus();
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dark theme input styles (matches the black professional theme)
  const inputClass =
    'block w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white shadow-sm outline-none transition ' +
    'placeholder:text-white/30 focus:border-white/20 focus:ring-4 focus:ring-white/10 disabled:opacity-60';

  const labelClass = 'block text-sm font-medium text-white/80';
  const helperClass = 'mt-2 text-xs text-white/45';

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Dark professional background (same family as Login) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-slate-950" />
        <div className="absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-44 top-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_35%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.92)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Register to access the dashboard.
            </p>
          </div>

          {/* Card */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-neutral-950 p-8 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.9)]">
            {/* Error area (no layout jump) */}
            <div className="min-h-[56px]" aria-live="polite" aria-atomic="true">
              {errorMsg ? (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 outline-none focus:ring-4 focus:ring-rose-500/20"
                >
                  <svg
                    className="mt-0.5 h-5 w-5 text-rose-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
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

            <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isSubmitting}>
              {/* Full name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={isSubmitting}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isSubmitting}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={isSubmitting}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${inputClass} pr-20`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-2 my-2 rounded-lg px-3 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-4 focus:ring-white/10"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    disabled={isSubmitting}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <p className={helperClass}>Use at least 8 characters.</p>
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className={labelClass}>
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={inputClass}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="secretary">Secretary</option>
                </select>
                <p className={helperClass}>Select the role for this account.</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm transition
                           hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/20
                           disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Creating account…' : 'Sign up'}
              </button>

              {/* Footer */}
              <div className="text-center text-sm text-white/60">
                Already have an account?{' '}
                <Link to="/" className="font-semibold text-indigo-300 hover:text-indigo-200">
                  Log in
                </Link>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">
            By signing up, you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;