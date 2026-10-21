import { useEffect, useState } from 'react';

export const NOTICE_DURATION_MS = 10000;

export function useTimedNotice(initial: string | null = null) {
  const [notice, setNotice] = useState<string | null>(initial);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), NOTICE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return [notice, setNotice] as const;
}