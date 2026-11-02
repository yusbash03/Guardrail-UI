import React, { ReactNode } from 'react';
import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '../Logo';
import { SandboxBadge } from '../layout/SandboxBadge';
import { authBenefits } from '../../data/auth';

const icons = { rules: ShieldCheck, ai: Sparkles, lock: LockKeyhole };

export function AuthLayout({ title, subtitle, children }: {title: string;subtitle: string;children: ReactNode;}) {
  return (
    <div className="grid min-h-screen w-full bg-background lg:grid-cols-[1fr_1.1fr]">
      <aside className="hidden flex-col justify-between bg-primary p-10 text-white lg:flex xl:p-14">
        <div className="[&_path:first-child]:fill-white [&_path:not(:first-child)]:stroke-[hsl(var(--primary))]">
          <Logo inverted />
        </div>
        <div>
          <p className="max-w-md text-4xl font-semibold leading-tight tracking-tight">Your money. Your rules. Your AI.</p>
          <ul className="mt-10 space-y-5">
            {authBenefits.map((b) => {
              const Icon = icons[b.kind];
              return (
                <li key={b.id} className="flex items-center gap-3 text-[15px] text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  {b.text}
                </li>);

            })}
          </ul>
        </div>
        <p className="text-sm text-white/70">PayPal Sandbox — no real money moves.</p>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between lg:justify-end">
          <span className="lg:hidden">
            <Logo />
          </span>
          <SandboxBadge />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <p className="mb-6 text-lg font-semibold tracking-tight text-foreground lg:hidden">Your money. Your rules. Your AI.</p>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>);

}