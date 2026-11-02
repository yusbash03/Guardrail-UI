import React, { useEffect, useState } from 'react';
import { FlaskConical, Loader2, LogOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { useDemoReset, useProfile, useUpdateMe, useUpdateProfile } from '../lib/queries';
import { errorMessage } from '../lib/errorCopy';

const commonTimeZones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Africa/Lagos', 'Asia/Singapore', 'Australia/Sydney', 'UTC'];
const APP_VERSION = `${__APP_VERSION__} (${__BUILD_DATE__})`;

export function Settings() {
  const { user, logout, updateUser } = useAuth();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const updateMe = useUpdateMe();
  const [name, setName] = useState('');
  const demoReset = useDemoReset();
  const [tz, setTz] = useState<string>('');
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (profile.data) setTz(profile.data.timeZone);
  }, [profile.data]);

  useEffect(() => {
    if (user) setName(user.displayName);
  }, [user]);

  const nameChanged = !!user && name.trim() !== user.displayName;
  const tzChanged = !!profile.data && tz !== profile.data.timeZone;
  const saving = updateProfile.isPending || updateMe.isPending;

  const saveProfile = async () => {
    if (!name.trim()) {
      toast.error('Display name can’t be empty');
      return;
    }
    try {
      if (nameChanged) updateUser(await updateMe.mutateAsync(name.trim()));
      if (tzChanged) await updateProfile.mutateAsync(tz);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const timeZones = tz && !commonTimeZones.includes(tz) ? [tz, ...commonTimeZones] : commonTimeZones;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <Card className="divide-y divide-border">
        <section aria-labelledby="profile-title" className="grid gap-4 p-5 md:grid-cols-[200px_1fr] lg:p-6">
          <div>
            <h2 id="profile-title" className="text-base font-semibold">Profile</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Budgets reset in your time zone.</p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void saveProfile();
            }}>
            
            <div>
              <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium">Display name</label>
              <input
                id="display-name"
                value={name}
                maxLength={60}
                autoComplete="nickname"
                onChange={(e) => setName(e.target.value)}
                aria-describedby="display-name-hint"
                className="h-10 w-full rounded-btn border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              <p id="display-name-hint" className="mt-1.5 text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <label htmlFor="tz" className="mb-1.5 block text-sm font-medium">Time zone</label>
              <Select id="tz" options={timeZones} value={tz} onChange={(e) => setTz(e.target.value)} className="w-full" disabled={!profile.data} />
            </div>
            <Button type="submit" disabled={(!nameChanged && !tzChanged) || saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save profile
            </Button>
          </form>
        </section>

        <section aria-labelledby="security-title" className="grid gap-4 p-5 md:grid-cols-[200px_1fr] lg:p-6">
          <div>
            <h2 id="security-title" className="text-base font-semibold">Security</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Sign out of every session.</p>
          </div>
          <div>
            {confirmLogout ?
            <div className="rounded-btn border border-blocked/30 bg-blocked/5 p-4">
                <p className="text-sm">This signs you out on every device, including this one.</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmLogout(false)}>Cancel</Button>
                  <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setConfirmLogout(false);
                    void logout().then(() => toast.success('Logged out everywhere'));
                  }}>
                  
                    Log out everywhere
                  </Button>
                </div>
              </div> :

            <Button variant="secondary" onClick={() => setConfirmLogout(true)}>
                <LogOut className="h-4 w-4" aria-hidden="true" /> Log out everywhere
              </Button>
            }
          </div>
        </section>

        {user?.role === 'ADMIN' &&
        <section aria-labelledby="demo-title" className="grid gap-4 p-5 md:grid-cols-[200px_1fr] lg:p-6">
            <div>
              <h2 id="demo-title" className="text-base font-semibold">Demo</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Admin only.</p>
            </div>
            <div>
              {confirmReset ?
            <div className="rounded-btn border border-blocked/30 bg-blocked/5 p-4">
                  <p className="text-sm">Resets the demo user to seed data. Purchases, rules and chats are replaced.</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
                    <Button
                  variant="danger"
                  size="sm"
                  disabled={demoReset.isPending}
                  onClick={() =>
                  demoReset.mutate(undefined, {
                    onSuccess: () => {
                      setConfirmReset(false);
                      toast.success('Demo reset');
                    },
                    onError: (err) => toast.error(errorMessage(err))
                  })
                  }>
                  
                      Reset demo
                    </Button>
                  </div>
                </div> :

            <Button variant="secondary" onClick={() => setConfirmReset(true)}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset demo data
                </Button>
            }
            </div>
          </section>
        }

        <section aria-labelledby="about-title" className="grid gap-4 p-5 md:grid-cols-[200px_1fr] lg:p-6">
          <h2 id="about-title" className="text-base font-semibold">About</h2>
          <div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Environment</dt>
                <dd className="inline-flex items-center gap-1.5 font-medium">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> PayPal Sandbox — no real money moves
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">App version</dt>
                <dd className="tabular font-medium">{APP_VERSION}</dd>
              </div>
            </dl>
          </div>
        </section>
      </Card>
    </div>);

}
