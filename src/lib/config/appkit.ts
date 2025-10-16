import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { baseSepolia } from '@reown/appkit/networks';
import { cookieStorage, createStorage } from 'wagmi';

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!WALLETCONNECT_PROJECT_ID && typeof window !== 'undefined') {
  console.error('❌ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env.local');
}

// Create Wagmi Adapter with persistent storage
export const wagmiAdapter = new WagmiAdapter({
  projectId: WALLETCONNECT_PROJECT_ID,
  networks: [baseSepolia],
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
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-z-index': 9999,
  },
  // Allow all wallets - AppKit will detect Rabby, OKX, MetaMask automatically
  allWallets: 'SHOW',
});

// Debug logging (only on client)
if (typeof window !== 'undefined') {
  console.log('✅ AppKit initialized');
  console.log('📝 Project ID:', WALLETCONNECT_PROJECT_ID);
  console.log('📝 Network:', baseSepolia.name);
}
