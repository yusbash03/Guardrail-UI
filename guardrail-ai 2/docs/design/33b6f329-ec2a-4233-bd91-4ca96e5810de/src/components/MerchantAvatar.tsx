import React from 'react';
import { cn } from '../utils/cn';

interface MerchantAvatarProps {
  initials: string;
  hue: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-xs', lg: 'h-12 w-12 text-sm' };

export function MerchantAvatar({ initials, hue, size = 'md' }: MerchantAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', sizes[size])}
      style={{ backgroundColor: `hsl(${hue} 60% 50% / 0.14)`, color: `hsl(${hue} 55% var(--avatar-fg-l))` }}>
      
      {initials}
    </span>);

}