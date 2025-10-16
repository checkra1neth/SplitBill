'use client';

import { useEffect, useState } from 'react';

interface ClientTimeProps {
  format?: 'full' | 'short';
}

export function ClientTime({ format = 'full' }: ClientTimeProps) {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date();
      if (format === 'short') {
        setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setTime(now.toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [format]);

  if (!mounted) {
    return <span>--:--</span>;
  }

  return <span>{time}</span>;
}
