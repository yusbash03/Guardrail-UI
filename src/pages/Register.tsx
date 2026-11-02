import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout } from '../components/auth/AuthLayout';
import { TextField } from '../components/auth/TextField';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { isApiError } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';

type Form = {name: string;email: string;password: string;confirm: string;};

/** Server validation keys (camelCase DTO fields) → form fields. */
const serverField: Record<string, keyof Form> = { displayName: 'name', email: 'email', password: 'password' };

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<Form>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Enter a display name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    if (form.confirm !== form.password) next.confirm = 'Passwords don’t match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await register({ email: form.email.trim(), password: form.password, displayName: form.name.trim() });
      navigate('/rules', { replace: true });
    } catch (err) {
      setLoading(false);
      if (isApiError(err) && err.errors) {
        const mapped: typeof errors = {};
        Object.entries(err.errors).forEach(([key, messages]) => {
          const field = serverField[key.charAt(0).toLowerCase() + key.slice(1)];
          if (field) mapped[field] = messages[0];
        });
        if (Object.keys(mapped).length) {
          setErrors(mapped);
          return;
        }
      }
      toast.error(errorMessage(err));
    }
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
