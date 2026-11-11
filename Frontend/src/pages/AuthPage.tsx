import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AlertCircle, Lock, Mail, User as UserIcon } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side quick validation matching backend rules
    if (mode === 'register') {
      if (!name.trim() || name.length < 2 || name.length > 50) {
        setFieldErrors((prev) => ({ ...prev, name: 'Name must be between 2 and 50 characters' }));
        return;
      }
      if (password.length < 6) {
        setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long' }));
        return;
      }
      if (!/\d/.test(password)) {
        setFieldErrors((prev) => ({ ...prev, password: 'Password must contain at least one number' }));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errors: Record<string, string> = {};
        err.response.data.errors.forEach((e: any) => {
          if (e.path) errors[e.path] = e.msg;
        });
        setFieldErrors(errors);
      } else {
        setError(
          err.response?.data?.message || err.response?.data?.error || 'Authentication failed. Please check credentials.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-yc-bg-secondary/40">
      <Card className="w-full max-w-sm p-6 sm:p-8 bg-white border border-yc-border shadow-none">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-8 h-8 bg-yc-orange rounded-[4px] flex items-center justify-center text-white text-sm font-bold mx-auto mb-3 select-none">
            A
          </div>
          <h2 className="text-xl font-bold text-yc-text">
            {mode === 'login' ? 'Sign in to AUTO-JOB-APPLY' : 'Create candidate account'}
          </h2>
          <p className="text-xs text-yc-text-secondary mt-1">
            {mode === 'login'
              ? 'Enter your credentials to manage your job search pipeline'
              : 'Join the AI-powered automated application engine'}
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-yc-error-bg border border-yc-error-border rounded-[4px] text-xs text-yc-error">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder={mode === 'register' ? 'Min 6 chars + at least 1 number' : '••••••••'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

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

        {/* Switch Mode Footer */}
        <div className="mt-6 pt-4 border-t border-yc-border-subtle text-center text-xs text-yc-text-secondary">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setFieldErrors({});
                }}
                className="font-medium text-yc-orange hover:underline"
              >
                Sign up
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

