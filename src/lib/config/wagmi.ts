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
      preference: 'all', // Show both mobile and extension options
    }),
    // Injected wallets (MetaMask, Rabby, Trust Wallet, etc.)
    injected({
      target: 'metaMask',
    }),
    injected({
      target: 'trust',
    }),
    // WalletConnect (supports 300+ wallets with full modal)
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: APP_NAME,
        description: 'Split bills fairly with blockchain escrow protection',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://splitbill.app',
        icons: ['https://splitbill.app/icon.png'],
      },
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '9999',
        },
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
          'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
          '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
          '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
          '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // Phantom
          '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget Wallet
          '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
        ],
        explorerExcludedWalletIds: 'ALL', // Show all wallets, not just recommended
      },
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
