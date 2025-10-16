import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SUPPORTED_CHAINS } from './chains';
import { WALLETCONNECT_PROJECT_ID } from './wagmi';

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId: WALLETCONNECT_PROJECT_ID,
  networks: SUPPORTED_CHAINS,
});

// Create AppKit modal
export const appkit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: WALLETCONNECT_PROJECT_ID,
  networks: SUPPORTED_CHAINS,
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
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Zerion
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18', // Zerion
    'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger Live
    '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662', // Bitget Wallet
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
    'c286eebc742a537cd1d6818363e9dc53b21759a1e8e5d9b263d0c03ec7703576', // 1inch Wallet
    '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66', // TokenPocket
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3 Wallet
  ],
});
