import React from 'react';
import { Toaster } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

export function ThemedToaster() {
  const { dark } = useTheme();
  return <Toaster theme={dark ? 'dark' : 'light'} position="bottom-right" offset={24} toastOptions={{ style: { fontFamily: 'Inter, sans-serif', borderRadius: 12 } }} />;
}