import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { mobileTabs, moreItems } from '../../data/navigation';
import { useApprovals } from '../../contexts/ApprovalsContext';
import { cn } from '../../utils/cn';

export function MobileTabBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const { pendingCount } = useApprovals();
  const { pathname } = useLocation();
  const moreActive = moreItems.some((item) => pathname.startsWith(item.to));

  const tabClass = (active: boolean) =>
  cn('flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium', active ? 'text-primary-ink' : 'text-muted-foreground');

  return (
    <>
      <AnimatePresence>
        {moreOpen &&
        <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMoreOpen(false)} />
          
            <motion.nav
            aria-label="More"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 pb-8">
            
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">More</span>
                <button type="button" aria-label="Close" onClick={() => setMoreOpen(false)} className="rounded-btn p-2 hover:bg-muted">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                  cn('flex h-12 items-center gap-3 rounded-btn px-3 text-sm font-medium', isActive ? 'bg-primary/10 text-primary-ink' : 'hover:bg-muted')
                  }>
                  
                    <Icon className="h-5 w-5" aria-hidden="true" /> {item.label}
                  </NavLink>);

            })}
            </motion.nav>
          </div>
        }
      </AnimatePresence>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-border bg-card lg:hidden">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className={({ isActive }) => tabClass(isActive)}>
              <span className="relative">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {tab.to === '/approvals' && pendingCount > 0 &&
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-approval px-1 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                }
              </span>
              {tab.label}
            </NavLink>);

        })}
        <button type="button" onClick={() => setMoreOpen(true)} className={tabClass(moreActive)} aria-expanded={moreOpen}>
          <Menu className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </nav>
    </>);

}