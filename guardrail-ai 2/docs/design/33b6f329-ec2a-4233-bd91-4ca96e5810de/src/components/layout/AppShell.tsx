import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileTabBar } from './MobileTabBar';
import { pageTitles } from '../../data/navigation';

export function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={pageTitles[pathname] ?? 'Guardrail AI'} />
        <main id="main" className="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>);

}