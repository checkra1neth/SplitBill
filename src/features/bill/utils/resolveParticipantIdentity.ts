import { getAddress as checksumAddress, isAddress } from 'viem';
import type { Chain } from 'viem';
import {
  getAddress as resolveNameToAddress,
  getName,
  isBasename,
} from '@coinbase/onchainkit/identity';
import { DEFAULT_CHAIN } from '@/lib/config/chains';


type ParticipantIdentityResult = {
  address: string;
  name?: string;
  basename?: string;
};

type ResolveOptions = {
  chain?: Chain;
};

const BASE_NAME_SUFFIX = '.base.eth';
const BASE_TEST_SUFFIX = '.basetest.eth';

// Cache for resolved identities to avoid repeated lookups
const identityCache = new Map<string, ParticipantIdentityResult>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

const normalizeBasename = (value: string) => {
  if (
    value.endsWith(BASE_NAME_SUFFIX) ||
    value.endsWith(BASE_TEST_SUFFIX)
  ) {
    return value.toLowerCase();
  }

  return value;
};

/**
 * Resolve a participant identifier that may be an Ethereum address,
 * ENS name, or Basename. Returns the normalized address along with
 * any human-readable identifier we can derive.
 */
export async function resolveParticipantIdentity(
  identifier: string,
  options: ResolveOptions = {},
): Promise<ParticipantIdentityResult> {
  const trimmed = identifier.trim();

  if (!trimmed) {
    throw new Error('Participant identifier is empty');
  }

  // Check cache first
  const cacheKey = `${trimmed}:${options.chain?.id || DEFAULT_CHAIN.id}`;
  const cached = identityCache.get(cacheKey);
  const cacheTime = cacheTimestamps.get(cacheKey);
  
  if (cached && cacheTime && Date.now() - cacheTime < CACHE_TTL) {
    return cached;
  }

  const chain = options.chain ?? DEFAULT_CHAIN;

  if (isAddress(trimmed, { strict: false })) {
    const address = checksumAddress(trimmed);
    let basename: string | undefined;

    try {
      // Use Promise.race to timeout after 10 seconds
      const namePromise = getName({
        address,
        chain,
      });
      
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 10000)
      );
      
      const potentialName = await Promise.race([namePromise, timeoutPromise]);

      if (potentialName && isBasename(potentialName)) {
        basename = normalizeBasename(potentialName);
      }
    } catch {
      // Ignore lookup failures and fall back to raw address.
    }

    const result = {
      address,
      basename,
    };
    
    // Cache the result
    identityCache.set(cacheKey, result);
    cacheTimestamps.set(cacheKey, Date.now());
    
    return result;
  }

  const normalized = normalizeBasename(trimmed);

  if (isBasename(normalized)) {
    try {
      // Use Promise.race to timeout after 15 seconds for basename resolution
      const addressPromise = resolveNameToAddress({
        name: normalized,
      });
      
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 15000)
      );
      
      const resolvedAddress = await Promise.race([addressPromise, timeoutPromise]);

      if (!resolvedAddress) {
        throw new Error('Unable to resolve Basename - request timed out or name not found');
      }

      const result = {
        address: checksumAddress(resolvedAddress),
        basename: normalized,
      };
      
      // Cache the result
      identityCache.set(cacheKey, result);
      cacheTimestamps.set(cacheKey, Date.now());
      
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unable to resolve Basename');
    }
  }

  try {
    // Use Promise.race to timeout after 15 seconds for ENS resolution
    const addressPromise = resolveNameToAddress({
      name: trimmed,
    });
    
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 15000)
    );
    
    const ensResolved = await Promise.race([addressPromise, timeoutPromise]);

    if (ensResolved) {
      const result = {
        address: checksumAddress(ensResolved),
        name: trimmed,
      };
      
      // Cache the result
      identityCache.set(cacheKey, result);
      cacheTimestamps.set(cacheKey, Date.now());
      
      return result;
    }
  } catch {
    // Fall through to error
  }

  throw new Error('Unsupported participant identifier');
}
