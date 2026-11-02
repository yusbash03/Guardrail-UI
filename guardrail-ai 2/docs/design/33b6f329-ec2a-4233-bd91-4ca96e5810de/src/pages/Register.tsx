import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextField } from '../components/auth/TextField';
import { Button } from '../components/ui/Button';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Enter a display name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    if (form.confirm !== form.password) next.confirm = 'Passwords don’t match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => navigate('/'), 500);
  };

  return (
    <AuthLayout title="Create your account" subtitle="You'll set your first spending rule next.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField id="name" label="Display name" autoComplete="nickname" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField id="reg-email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField id="reg-password" label="Password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} hint="At least 8 characters. You'll use it to approve every cart." />
        <TextField id="confirm" label="Confirm password" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-ink hover:underline">Log in</Link>
      </p>
    </AuthLayout>);

}