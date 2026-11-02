import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRegisterSW } from 'virtual:pwa-register/react';

/** registerType 'prompt': never reload silently (e.g. mid-checkout) — ask first (PWA_REQUIREMENTS.md §3). */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;
    toast('Update available', {
      description: 'A new version of Guardrail is ready.',
      duration: Infinity,
      action: { label: 'Reload', onClick: () => void updateServiceWorker(true) },
    });
  }, [needRefresh, updateServiceWorker]);

  return null;
}
