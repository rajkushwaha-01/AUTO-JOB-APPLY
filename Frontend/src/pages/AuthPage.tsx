import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Keep mode in sync with route prop
  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setFieldErrors({});
  }, [initialMode]);

  // Password validation checks for registration
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side validation matching backend express-validator
    if (mode === 'register') {
      const errs: Record<string, string> = {};
      if (!name.trim()) {
        errs.name = 'Name is required';
      } else if (name.trim().length < 2 || name.trim().length > 50) {
        errs.name = 'Name must be between 2 and 50 characters';
      }

      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        errs.email = 'Please provide a valid email address';
      }

      if (!hasMinLength) {
        errs.password = 'Password must be at least 6 characters long';
      } else if (!hasNumber) {
        errs.password = 'Password must contain at least one number';
      }

      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        return;
      }
    } else {
      if (!email.trim()) {
        setFieldErrors({ email: 'Email is required' });
        return;
      }
      if (!password) {
        setFieldErrors({ password: 'Password is required' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ name: name.trim(), email: email.trim(), password });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errs: Record<string, string> = {};
        err.response.data.errors.forEach((e: any) => {
          if (e.path) errs[e.path] = e.msg;
        });
        setFieldErrors(errs);
      } else if (err.response?.status === 409) {
        setError('Email is already registered. Please sign in instead.');
      } else if (err.response?.status === 401) {
        setError('Invalid credentials. Please verify your email and password.');
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            'Unable to communicate with authentication server.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-yc-bg-secondary/40">
      <Card className="w-full max-w-sm p-6 sm:p-8 bg-white border border-yc-border shadow-none">
        {/* Brand Mark */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-yc-orange rounded-[4px] flex items-center justify-center text-white text-xs font-bold select-none">
              A
            </div>
            <span className="font-bold text-sm tracking-tight text-yc-text">
              AUTO-JOB-APPLY
            </span>
          </Link>
          <h2 className="text-xl font-bold text-yc-text">
            {mode === 'login' ? 'Sign In to Your Workspace' : 'Create Candidate Account'}
          </h2>
          <p className="text-xs text-yc-text-secondary mt-1">
            {mode === 'login'
              ? 'Access your job matches and application pipeline'
              : 'Vectorize your resume and connect to ATS feeds'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-yc-bg-secondary border border-yc-border rounded-[4px] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-1 text-xs font-medium rounded-[2px] transition-colors ${
              mode === 'login'
                ? 'bg-white text-yc-text font-semibold shadow-none border border-yc-border'
                : 'text-yc-text-secondary hover:text-yc-text'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-1 text-xs font-medium rounded-[2px] transition-colors ${
              mode === 'register'
                ? 'bg-white text-yc-text font-semibold shadow-none border border-yc-border'
                : 'text-yc-text-secondary hover:text-yc-text'
            }`}
          >
            Register
          </button>
        </div>

        {/* Global Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-yc-error-bg border border-yc-error-border rounded-[4px] text-xs text-yc-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              leftIcon={<UserIcon className="w-4 h-4" />}
              autoComplete="name"
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="alex.morgan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'register' ? 'Min 6 chars with 1 number' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-yc-text-muted hover:text-yc-text focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
            />

            {/* Registration Password Requirements Indicator */}
            {mode === 'register' && password && (
              <div className="pt-1.5 space-y-1 text-[11px] text-yc-text-secondary">
                <div className="flex items-center gap-1.5">
                  {hasMinLength ? (
                    <CheckCircle2 className="w-3 h-3 text-yc-success" />
                  ) : (
                    <XCircle className="w-3 h-3 text-yc-text-muted" />
                  )}
                  <span className={hasMinLength ? 'text-yc-success' : 'text-yc-text-muted'}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumber ? (
                    <CheckCircle2 className="w-3 h-3 text-yc-success" />
                  ) : (
                    <XCircle className="w-3 h-3 text-yc-text-muted" />
                  )}
                  <span className={hasNumber ? 'text-yc-success' : 'text-yc-text-muted'}>
                    At least one number (0-9)
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isSubmitting}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        {/* Footer Note */}
        <div className="mt-5 pt-4 border-t border-yc-border-subtle text-center text-xs text-yc-text-secondary">
          {mode === 'login' ? (
            <p>
              New candidate?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setFieldErrors({});
                }}
                className="font-medium text-yc-orange hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setFieldErrors({});
                }}
                className="font-medium text-yc-orange hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
