import { decompressFromEncodedURIComponent, compressToEncodedURIComponent } from 'lz-string';
import { Bill } from '@/lib/types/bill';
import { isMetadataRegistryConfigured } from '@/lib/config/metadata';

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

  try {
    const compressed = compressToEncodedURIComponent(JSON.stringify(payload));
    if (compressed && compressed.length > 0) {
      return compressed;
    }
  } catch (error) {
    console.error('Failed to compress bill payload. Falling back to base64.', error);
  }

  const base64 = toBase64(JSON.stringify(payload));
  return toBase64Url(base64);
}

export function decodeBillFromShare(encoded: string): Bill | null {
  const decodePayload = (json: string): Bill | null => {
    try {
      const payload = JSON.parse(json) as SharePayload;
      if (!payload || typeof payload !== 'object') {
        return null;
      }

      if (!payload.bill || payload.version !== SHARE_VERSION) {
        return null;
      }

      return payload.bill;
    } catch (error) {
      console.error('Failed to parse shared bill payload:', error);
      return null;
    }
  };

  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (json) {
      const bill = decodePayload(json);
      if (bill) {
        return bill;
      }
    }
  } catch (error) {
    console.error('Failed to decompress shared bill. Attempting base64 fallback.', error);
  }

  try {
    const base64 = fromBase64Url(encoded);
    const json = fromBase64(base64);
    return decodePayload(json);
  } catch (error) {
    console.error('Failed to decode shared bill fallback:', error);
    return null;
  }
}

export function buildShareableBillUrl(bill: Bill, origin: string): string {
  if (isMetadataRegistryConfigured()) {
    return `${origin}/bill/${bill.id}`;
  }

  const encoded = encodeBillForShare(bill);
  return `${origin}/bill/${bill.id}?share=${encoded}`;
}

export const SHARE_QUERY_PARAM = 'share';
