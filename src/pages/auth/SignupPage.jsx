import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

const ENGINEERING_BRANCHES = [
  'Computer Science & Engineering',
  'Electronics & Communication (ECE)',
  'Electrical & Electronics (EEE)',
  'Mechanical & Mechatronics',
  'Robotics & Automation',
  'Information Technology',
  'Civil Engineering',
  'Chemical & Materials',
  'Biomedical Engineering',
  'M.Tech / Research Scholar'
];

const STUDY_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Research'
];

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dept: ENGINEERING_BRANCHES[0],
    year: '3rd Year',
    studentId: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'College email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid college email format';
    }

    if (!formData.studentId.trim()) {
      errs.studentId = 'Student ID / Enrollment ID is required';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.dept) {
      errs.dept = 'Branch is required';
    }

    if (!formData.year) {
      errs.year = 'Year is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate('/login', {
        state: {
          message: 'Account created successfully! Please log in with your credentials.'
        }
      });
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col justify-center items-center p-4 sm:p-6 antialiased py-10">
      {/* Background ambient decorative blurs */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Signup Container */}
      <div className="w-full max-w-lg bg-surface-container-lowest/95 backdrop-blur-xl rounded-[24px] p-6 sm:p-8 border border-outline-variant/30 shadow-xl flex flex-col gap-5">
        {/* Branding & Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
            </div>
            <h1 className="font-display-lg-mobile text-[26px] font-extrabold text-secondary tracking-tight">
              CampusSwap
            </h1>
          </Link>
          <h2 className="font-heading-xl text-[24px] font-extrabold text-on-surface">
            Create your account
          </h2>
        </div>

        {/* Visual Campus Verification Banner */}
        <div className="p-3.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-primary/20 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-extrabold text-primary uppercase tracking-wide">
              🎓 Verified Campus Account
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              CampusSwap is exclusively designed for engineering students on campus.
            </span>
          </div>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-2xl flex items-center gap-2.5 text-[13px] font-semibold">
            <span className="material-symbols-outlined text-error text-[20px]">error</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                person
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Arjun Sharma"
                className={`w-full pl-11 pr-4 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
                  errors.name
                    ? 'border-error ring-1 ring-error'
                    : 'border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.name && (
              <span className="text-[11px] font-bold text-error mt-0.5">{errors.name}</span>
            )}
          </div>

          {/* College Email & Student ID Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College Email */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                College Email *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  alternate_email
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@mit.edu"
                  className={`w-full pl-11 pr-3 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
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

            {/* Student ID / Enrollment ID */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Student ID / Enrollment *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  badge
                </span>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. 22ENG048"
                  className={`w-full pl-11 pr-3 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
                    errors.studentId
                      ? 'border-error ring-1 ring-error'
                      : 'border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.studentId && (
                <span className="text-[11px] font-bold text-error mt-0.5">{errors.studentId}</span>
              )}
            </div>
          </div>

          {/* Branch & Year Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Engineering Branch Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Engineering Branch *
              </label>
              <select
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                className="w-full px-3.5 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                {ENGINEERING_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Academic Year *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3.5 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
              >
                {STUDY_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password & Confirm Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Password *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  className={`w-full pl-11 pr-10 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
                    errors.password
                      ? 'border-error ring-1 ring-error'
                      : 'border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <span className="text-[11px] font-bold text-error mt-0.5">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Confirm Password *
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  lock_reset
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full pl-11 pr-3 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none transition-all ${
                    errors.confirmPassword
                      ? 'border-error ring-1 ring-error'
                      : 'border-outline-variant/30 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[11px] font-bold text-error mt-0.5">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          {/* Create Account Primary Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
            icon="how_to_reg"
            className="mt-2 font-bold shadow-md"
          >
            {isSubmitting ? 'Registering Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Link back to Login */}
        <div className="text-center pt-2 border-t border-outline-variant/20">
          <p className="font-body-sm text-[13px] text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
