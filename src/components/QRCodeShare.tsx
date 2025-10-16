'use client';

import { useMemo, useState } from 'react';
import QRCode from 'react-qr-code';

interface QRCodeShareProps {
  url: string;
}

const QR_SIZE = 184;

export function QRCodeShare({ url }: QRCodeShareProps) {
  const [showQR, setShowQR] = useState(false);

  const prettyUrl = useMemo(() => {
    if (!url) return '';

    try {
      const parsed = new URL(url);
      const shareParam = parsed.searchParams.get('share');

      if (!shareParam) {
        return url;
      }

      const shortened = `${shareParam.slice(0, 8)}…${shareParam.slice(-4)}`;
      return `${parsed.origin}${parsed.pathname}?share=${shortened}`;
    } catch {
      return url;
    }
  }, [url]);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowQR((open) => !open)}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
      >
        {showQR ? 'Hide QR Code' : 'Show QR Code'}
      </button>

      {showQR && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-indigo-100/40 p-6 text-center shadow-sm dark:border-indigo-800 dark:from-indigo-950 dark:via-slate-950 dark:to-indigo-900/60">
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <QRCode
              value={url}
              size={QR_SIZE}
              bgColor="transparent"
              fgColor="#312e81"
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
          </div>
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
            {prettyUrl}
          </p>
        </div>
      )}
    </div>
  );
}
