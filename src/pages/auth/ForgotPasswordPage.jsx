import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your college email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email format');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please check your email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-4 sm:p-6 antialiased">
      {/* Ambient background decorative blurs */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-surface-container-lowest/95 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 border border-outline-variant/30 shadow-xl flex flex-col gap-6">
        {/* Branding & Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <h1 className="font-display-lg-mobile text-[26px] font-extrabold text-secondary tracking-tight">
              CampusSwap
            </h1>
          </Link>

          <div>
            <h2 className="font-heading-xl text-[24px] font-extrabold text-on-surface">
              Reset your password
            </h2>
            <p className="font-body-sm text-[13px] text-on-surface-variant mt-0.5">
              Enter your registered college email and we'll send you a password recovery link.
            </p>
          </div>
        </div>

        {/* Success Alert View */}
        {success ? (
          <div className="flex flex-col items-center gap-4 text-center py-2 animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                mark_email_read
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Reset Link Sent!
              </h3>
              <p className="font-body-sm text-[13px] text-on-surface-variant max-w-xs">
                We've sent a password reset link to <strong className="text-on-surface">{email}</strong>. Please check your inbox and student webmail spam folder.
              </p>
            </div>

            <Link to="/login" className="w-full mt-2">
              <Button variant="primary" size="lg" fullWidth icon="arrow_back">
                Back to Log In
              </Button>
            </Link>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-2xl flex items-center gap-2.5 text-[13px] font-semibold">
                <span className="material-symbols-outlined text-error text-[20px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                College Email Address
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  school
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. arjun.sharma@mit.edu"
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              icon="send"
              className="mt-1 font-bold shadow-md"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </Button>

            <div className="text-center pt-2 border-t border-outline-variant/20">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-primary font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
