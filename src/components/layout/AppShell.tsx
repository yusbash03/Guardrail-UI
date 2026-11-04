import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileTabBar } from './MobileTabBar';
import { pageTitles } from '../../data/navigation';
import { useOnline } from '../../hooks/useOnline';
import { PageLoading } from '../PageState';

function titleFor(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const base = `/${pathname.split('/')[1]}`;
  return pageTitles[base] ?? 'Guardrail AI';
}

export function AppShell() {
  const { pathname } = useLocation();
  const online = useOnline();
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={titleFor(pathname)} />
        {!online &&
        <div role="status" className="flex shrink-0 items-center gap-2 border-b border-approval/30 bg-approval/10 px-4 py-2 text-sm font-medium text-approval-fg lg:px-8">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            You're offline. Guardrail needs a connection to show your money.
          </div>
        }
        <main id="main" className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">
          {online ? <Suspense fallback={<PageLoading label="Loading page" />}><Outlet /></Suspense> : <OfflineContent />}
        </main>
      </div>
      <MobileTabBar />
    </div>);

}

/** No financial data is shown offline (PWA_REQUIREMENTS.md §5). */
function OfflineContent() {
  return (
    <div className="mx-auto flex max-w-[1280px] px-4 py-10 lg:px-8 lg:py-16">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-card border border-border bg-card px-6 py-12 text-center shadow-soft">
        <WifiOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-medium">Unavailable offline</p>
        <p className="mt-1 text-sm text-muted-foreground">Balances, budgets, purchases and messages appear when you're back online.</p>
      </div>
    </div>);

}
