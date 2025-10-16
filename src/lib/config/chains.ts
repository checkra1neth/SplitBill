import { baseSepolia } from 'wagmi/chains';

export const SUPPORTED_CHAINS = [baseSepolia] as const;

export const DEFAULT_CHAIN = baseSepolia;

export const CHAIN_CONFIG = {
  [baseSepolia.id]: {
    name: 'Base Sepolia',
    explorer: 'https://sepolia.basescan.org',
  },
} as const;
