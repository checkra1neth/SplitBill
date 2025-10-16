import { Bill } from '@/lib/types/bill';

const SHARE_VERSION = 1;

const toBase64 = (value: string): string => {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'utf-8').toString('base64');
  }

  return window.btoa(unescape(encodeURIComponent(value)));
};

const fromBase64 = (value: string): string => {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'base64').toString('utf-8');
  }

  return decodeURIComponent(escape(window.atob(value)));
};

const toBase64Url = (value: string): string =>
  value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const fromBase64Url = (value: string): string => {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
};

interface SharePayload {
  version: number;
  bill: Bill;
}

export function encodeBillForShare(bill: Bill): string {
  const payload: SharePayload = {
    version: SHARE_VERSION,
    bill,
  };

  const base64 = toBase64(JSON.stringify(payload));
  return toBase64Url(base64);
}

export function decodeBillFromShare(encoded: string): Bill | null {
  try {
    const base64 = fromBase64Url(encoded);
    const json = fromBase64(base64);
    const payload = JSON.parse(json) as SharePayload;

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    if (!payload.bill || payload.version !== SHARE_VERSION) {
      return null;
    }

    return payload.bill;
  } catch (error) {
    console.error('Failed to decode shared bill:', error);
    return null;
  }
}

export function buildShareableBillUrl(bill: Bill, origin: string): string {
  const encoded = encodeBillForShare(bill);
  return `${origin}/bill/${bill.id}?share=${encoded}`;
}

export const SHARE_QUERY_PARAM = 'share';
