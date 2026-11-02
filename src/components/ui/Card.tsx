import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-border bg-card shadow-soft', className)} {...props} />;
}