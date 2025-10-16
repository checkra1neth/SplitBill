import { http, createConfig } from 'wagmi';
import { baseAccount, coinbaseWallet, injected } from 'wagmi/connectors';
import { SUPPORTED_CHAINS } from './chains';
import { baseSepolia } from 'wagmi/chains';

const APP_NAME = 'SplitBill';
export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Use Coinbase's fast RPC for Base Sepolia
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    // Base Account (Coinbase Smart Wallet)
    baseAccount({
      appName: APP_NAME,
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: APP_NAME,
      preference: 'all',
    }),
    // Injected wallets (MetaMask, Rabby, Trust Wallet, Zerion, etc.)
    injected({
      target: 'metaMask',
    }),
    injected({
      target: 'trust',
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC, {
      batch: true,
      timeout: 30_000,
    }),
  },
});
