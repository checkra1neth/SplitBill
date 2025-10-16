export const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// wagmiConfig is now created by AppKit's WagmiAdapter
// Import it from appkit.ts instead
export { wagmiAdapter } from './appkit';
