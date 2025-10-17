import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { cookieStorage, createStorage, http } from 'wagmi';

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!WALLETCONNECT_PROJECT_ID && typeof window !== 'undefined') {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local');
}

// Create Wagmi Adapter with persistent storage and custom RPC
// Using public RPC to avoid WalletConnect RPC issues
export const wagmiAdapter = new WagmiAdapter({
  projectId: WALLETCONNECT_PROJECT_ID,
  networks: [baseSepolia],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});

// Export wagmi config for use in providers
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Create AppKit modal - must be called at module level for SSR compatibility
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: WALLETCONNECT_PROJECT_ID,
  networks: [baseSepolia],
  metadata: {
    name: 'SplitBill',
    description: 'Split bills fairly with blockchain escrow protection',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://splitbill.app',
    icons: ['https://splitbill.app/icon.png'],
  },
  features: {
    analytics: false, // Disable to reduce WalletConnect requests
    email: false,
    socials: false,
    swaps: false, // Disable to reduce WalletConnect requests
    onramp: false, // Disable to reduce WalletConnect requests
  },
  enableWalletConnect: true,
  enableInjected: true, // Enable browser extension connections (doesn't use WalletConnect)
  themeMode: 'light',
  themeVariables: {
    '--w3m-z-index': 9999,
    '--w3m-accent': '#000080',
  },
  // Allow all wallets - AppKit will detect Rabby, OKX, MetaMask automatically
  allWallets: 'SHOW',
  // Featured popular wallets (shown first)
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // Uniswap Wallet
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // Phantom
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3 Wallet
    '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f', // Safe
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150', // Safepal
    'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef', // Imtoken
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // Tokenary
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Zerion
    '18388be9ac2d02726dbac9777c96efaac06d744b2f6d580fccdd4127a6d01fd1', // Rabby Wallet
    '0c01b1e2c9d1f8c3e5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8', // Argent
    '8308656f4548bb81b3508afe355cfbb7f0cb6253d1cc7f998080601f838ecee3', // Crypto.com DeFi Wallet
  ],
});

// Debug logging (only on client)
if (typeof window !== 'undefined') {
  console.log('✅ AppKit initialized');
  console.log('📝 Project ID:', WALLETCONNECT_PROJECT_ID);
  console.log('📝 Network:', baseSepolia.name);
}
