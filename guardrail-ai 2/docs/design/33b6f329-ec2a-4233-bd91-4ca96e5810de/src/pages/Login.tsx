import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextField } from '../components/auth/TextField';
import { Button } from '../components/ui/Button';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('amara@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    setLoading(true);
    window.setTimeout(() => navigate('/'), 500);
  };

  return (
    <AuthLayout title="Log in" subtitle="Welcome back. Your rules are right where you left them.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => {setEmail(e.target.value);setError(null);}} />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {setPassword(e.target.value);setError(null);}}
          error={error} />
        
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Guardrail?{' '}
        <Link to="/register" className="font-medium text-primary-ink hover:underline">Create an account</Link>
      </p>
    </AuthLayout>);

}