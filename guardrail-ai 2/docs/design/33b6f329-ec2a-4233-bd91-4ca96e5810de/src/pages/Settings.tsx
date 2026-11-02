import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';

const timeZones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London'] as const;

export function Settings() {
  const [name, setName] = useState('Amara');
  const [tz, setTz] = useState<string>('America/New_York');
  const [confirmLogout, setConfirmLogout] = useState(false);

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
              if (!name.trim()) {
                toast.error('Display name can’t be empty');
                return;
              }
              toast.success('Profile saved');
            }}>
            
            <div>
              <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium">Display name</label>
              <input
                id="display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-btn border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
              
            </div>
            <div>
              <label htmlFor="tz" className="mb-1.5 block text-sm font-medium">Time zone</label>
              <Select id="tz" options={timeZones} value={tz} onChange={(e) => setTz(e.target.value)} className="w-full" />
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </section>

        <section aria-labelledby="security-title" className="grid gap-4 p-5 md:grid-cols-[200px_1fr] lg:p-6">
          <div>
            <h2 id="security-title" className="text-base font-semibold">Security</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Signed in on 2 devices.</p>
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
                    toast.success('Logged out everywhere');
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
                <dd className="tabular font-medium">1.0.0 (2026.11.01)</dd>
              </div>
            </dl>
            <Link to="/components" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-ink hover:underline">
              View component sheet <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </Card>
    </div>);

}