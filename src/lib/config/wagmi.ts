import { http, createConfig } from 'wagmi';
import { baseAccount, coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';
import { SUPPORTED_CHAINS } from './chains';
import { baseSepolia } from 'wagmi/chains';

const APP_NAME = 'SplitBill';
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

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
    }),
    // Injected wallets (MetaMask, Rabby, etc.)
    injected({
      target: 'metaMask',
    }),
    // WalletConnect (supports 300+ wallets)
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: APP_NAME,
        description: 'Split bills fairly with blockchain escrow protection',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://splitbill.app',
        icons: ['https://splitbill.app/icon.png'],
      },
      showQrModal: true,
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC, {
      batch: true,
      timeout: 30_000, // Increased to 30 seconds for basename resolution
    }),
  },
});
