import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Moon, Sun } from 'lucide-react';
import { LogoMark } from '../Logo';
import { SandboxBadge } from './SandboxBadge';
import { useApprovals } from '../../contexts/ApprovalsContext';
import { useTheme } from '../../contexts/ThemeContext';

export function TopBar({ title }: {title: string;}) {
  const { pendingCount } = useApprovals();
  const { dark, toggle } = useTheme();
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-8">
      <LogoMark className="h-7 w-7 lg:hidden" />
      <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-1.5">
        <SandboxBadge />
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-10 w-10 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          
          {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden="true" /> : <Moon className="h-[18px] w-[18px]" aria-hidden="true" />}
        </button>
        <Link
          to="/approvals"
          aria-label={`Purchase approvals, ${pendingCount} pending`}
          className="relative flex h-10 w-10 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          {pendingCount > 0 &&
          <span className="tabular absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-approval px-1 text-[10px] font-bold text-white ring-2 ring-card">
              {pendingCount}
            </span>
          }
        </Link>
      </div>
    </header>);

}