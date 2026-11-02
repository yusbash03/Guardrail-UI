import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative border-t border-border p-3">
      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: 4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute bottom-full left-3 right-3 mb-1 rounded-btn border border-border bg-card p-1 shadow-lift">
          
            <Link role="menuitem" to="/settings" onClick={() => setOpen(false)} className="flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted">
              <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Settings
            </Link>
            <button
            role="menuitem"
            type="button"
            onClick={() => navigate('/login')}
            className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm hover:bg-muted">
            
              <LogOut className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Log out
            </button>
          </motion.div>
        }
      </AnimatePresence>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-btn p-2 text-left transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">A</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">Amara</span>
          <span className="block truncate text-xs text-muted-foreground">amara@example.com</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>
    </div>);

}