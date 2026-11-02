import { useEffect, useState } from 'react';
import { formatClock } from '../utils/time';

export function useCountdown(initialSeconds: number, running = true) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const expired = seconds <= 0;

  useEffect(() => {
    if (!running || expired) return;
    const id = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, expired]);

  return { seconds, label: formatClock(seconds), expired };
}