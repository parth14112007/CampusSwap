import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success message passed from signup
  const signupSuccessMessage = location.state?.message;

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'College email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email format';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/explore';
      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setAuthError('');
    try {
      await loginWithGoogle();
      const destination = location.state?.from?.pathname || '/explore';
      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(err.message || 'Google SSO sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('arjun.sharma@mit.edu');
    setPassword('password123');
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      {/* Background ambient decorative blurs */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container Card (24px radius + Glassmorphic border) */}
      <div className="w-full max-w-md bg-surface-container-lowest/95 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 border border-outline-variant/30 shadow-xl flex flex-col gap-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <h1 className="font-display-lg-mobile text-[26px] font-extrabold text-secondary tracking-tight">
              CampusSwap
            </h1>
          </Link>

          <div className="mt-1">
            <h2 className="font-heading-xl text-[24px] font-extrabold text-on-surface">
              Welcome back
            </h2>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">
              The engineering-campus marketplace to buy, rent, & borrow lab gear.
            </p>
          </div>
        </div>

        {/* Signup Success Banner */}
        {signupSuccessMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-[13px] font-semibold">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{signupSuccessMessage}</span>
          </div>
        )}

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-2xl flex items-center gap-2.5 text-[13px] font-semibold">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Quick Demo Login Preset Banner */}
        <div className="bg-surface-container-low p-3.5 rounded-2xl border border-primary/20 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Demo Student Account
            </span>
            <span className="text-[12px] text-on-surface-variant">arjun.sharma@mit.edu</span>
          </div>
          <button
            type="button"
            onClick={handleDemoFill}
            className="text-[12px] font-bold bg-primary/10 text-primary hover:bg-primary/20 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            Auto-fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* College Email Input */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
              College Email
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                school
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arjun.sharma@mit.edu"
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
                  errors.email
                    ? 'border-error ring-1 ring-error'
                    : 'border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[11px] font-bold text-error mt-0.5">{errors.email}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[12px] font-semibold text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full pl-11 pr-11 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
                  errors.password
                    ? 'border-error ring-1 ring-error'
                    : 'border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] font-bold text-error mt-0.5">{errors.password}</span>
            )}
          </div>

          {/* Primary Log In Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
            icon="login"
            className="mt-1 font-bold shadow-md"
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </Button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-outline-variant/40" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline">OR</span>
          <div className="flex-1 h-px bg-outline-variant/40" />
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-[16px] border-2 border-outline-variant/40 hover:bg-surface-container-high bg-transparent text-on-surface font-button-lg text-[14px] font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] cursor-pointer"
        >
          {/* Google Color G SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link to Signup */}
        <div className="text-center pt-1 border-t border-outline-variant/20">
          <p className="font-body-sm text-[13px] text-on-surface-variant">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
