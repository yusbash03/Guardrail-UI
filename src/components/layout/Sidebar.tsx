import React from 'react';
import { NavLink } from 'react-router-dom';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';
import { navItems } from '../../data/navigation';
import { useApprovals } from '../../contexts/ApprovalsContext';
import { cn } from '../../utils/cn';

export function Sidebar() {
  const { pendingCount } = useApprovals();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex-1 space-y-0.5 px-3 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-btn px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'bg-primary/10 text-primary-ink' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
              }>
              
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
              {item.to === '/approvals' && pendingCount > 0 &&
              <span className="tabular ml-auto rounded-full bg-approval/15 px-2 text-xs font-semibold text-approval-fg">
                  {pendingCount}
                  <span className="sr-only"> pending</span>
                </span>
              }
            </NavLink>);

        })}
      </nav>
      <UserMenu />
    </aside>);

}