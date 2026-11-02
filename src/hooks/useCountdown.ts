import { useEffect, useState } from 'react';
import { formatClock, secondsUntil } from '../utils/time';

/** Counts down to an ISO deadline (e.g. approval expiresAt), or from a fixed number of seconds. */
export function useCountdown(target: string | number, running = true) {
  const compute = () => (typeof target === 'string' ? secondsUntil(target) : target);
  const [seconds, setSeconds] = useState(compute);
  const expired = seconds <= 0;

  useEffect(() => setSeconds(compute()), [target]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!running || expired) return;
    const id = window.setInterval(
      () => setSeconds((s) => (typeof target === 'string' ? secondsUntil(target) : Math.max(0, s - 1))),
      1000,
    );
    return () => window.clearInterval(id);
  }, [running, expired, target]);

  return { seconds, label: formatClock(seconds), expired };
}
