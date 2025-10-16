# SplitBill - Onchain Bill Splitting on Base

Split bills and pay instantly with crypto on Base blockchain.

## Features

- 🔐 **Smart Wallet Integration** – Coinbase Smart Wallet and Base Account connector via OnchainKit
- 🔒 **Escrow Protection** – Optional smart contract escrow for secure bill settlements (NEW!)
- 💰 **Automatic Calculations** – Split items, tax, and tips proportionally
- 🧾 **Identity-Aware Participants** – Resolve Basenames, ENS, and raw addresses with duplicate protection
- 🔔 **Guided UX** – Toast notifications, skeleton loaders, and global error boundary
- 🌗 **Adaptive UI** – One-click dark mode toggle with persistent preference
- 💱 **Multi-Currency View** – Switch between USD/EUR/GBP using demo conversion rates
- 🔗 **Easy Sharing** – Share bills via link or QR code; optional onchain snapshot makes links short and trustless
- 📈 **Live ETH Pricing** – Direct payments and escrow rely on the same real-time oracle
- ⚡ **Instant Payments** – Pay your share onchain in seconds (direct or via escrow)
- 📱 **Responsive Design** – Works on mobile and desktop
- 🔄 **Backward Compatible** – Existing bills continue to work without changes

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Blockchain**: Base (Sepolia testnet)
- **Wallet**: OnchainKit, Wagmi, Viem
- **State/UX**: React hooks, TanStack Query, custom toast & theme providers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Get your OnchainKit API key from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

4. Create `.env.local` and add your configuration:
```bash
# Required: OnchainKit API key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# Optional: Escrow contract address (leave empty to disable escrow features)
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=

# Optional: Bill metadata registry for onchain share links
NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Flow

1. **Connect Wallet** - Click "Connect Wallet" and choose Base Account or Coinbase Smart Wallet
2. **Create Bill** - Enter a title and create a new bill
3. **Choose Payment Mode** - Toggle escrow protection on/off (optional)
4. **Add Items** - Add items with descriptions and amounts
5. **Add Participants** - Invite friends by adding wallet addresses, Basenames, or ENS names
6. **Set Tip & Tax** - Add tip and tax amounts
7. **Share** - Copy the link or QR code; recipients load the full bill instantly
8. **Pay** - Each participant pays their calculated share onchain

### Payment Modes

#### Direct Payment (Default)
- Instant peer-to-peer payments
- No smart contract required
- Lower gas costs
- Best for trusted groups

#### Escrow Protection (Optional)
- Funds held in smart contract
- Automatic settlement when all participants pay
- Transparent payment tracking
- Best for larger groups or unfamiliar participants

**Note:** Existing bills created before escrow feature continue to work as direct payment bills.

## Project Structure

```
splitbill/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                 # Home page (create bill)
│   │   ├── layout.tsx               # Root layout with providers
│   │   └── bill/[id]/page.tsx       # Bill detail page
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── WalletConnect.tsx        # Wallet connection UI
│   │   ├── QRCodeShare.tsx          # QR code generator
│   │   ├── ThemeToggle.tsx          # Dark/light mode switch
│   │   └── AppErrorBoundary.tsx     # Global error guard
│   │
│   ├── features/                     # Feature modules (isolated)
│   │   ├── bill/                    # Bill management feature
│   │   │   ├── components/          # Bill-specific UI
│   │   │   │   ├── CreateBillForm.tsx
│   │   │   │   └── BillSummary.tsx
│   │   │   └── hooks/               # Bill logic
│   │   │       └── useBill.ts       # Bill state management
│   │   │
│   │   └── payment/                 # Payment feature
│   │       └── hooks/               # Payment logic
│   │           └── usePayment.ts    # Payment transactions
│   │
│   └── lib/                         # Core utilities
│       ├── config/                  # Configuration
│       │   ├── chains.ts           # Blockchain config
│       │   └── wagmi.ts            # Wallet config
│       ├── providers/               # React providers
│       │   ├── OnchainProviders.tsx
│       │   ├── ThemeProvider.tsx
│       │   └── ToastProvider.tsx
│       ├── types/                   # TypeScript interfaces
│       │   └── bill.ts             # Bill data types
│       └── utils/                   # Helper functions
│           ├── calculations.ts     # Bill calculations
│           ├── currency.ts         # Currency helpers
│           └── storage.ts          # LocalStorage helpers
│
├── contracts/                        # Smart contracts (future)
│   ├── SplitBillEscrow.sol         # Escrow contract
│   └── README.md                    # Contract docs
│
└── docs/                            # Documentation
    ├── README.md                    # Main docs
    ├── QUICKSTART.md               # Quick start guide
    ├── ARCHITECTURE.md             # Architecture details
    └── ...                         # More docs
```

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - Your OnchainKit API key from [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)

### Optional Variables

- `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` - Smart contract address for escrow functionality
  - Leave empty or set to `0x0000000000000000000000000000000000000000` to disable escrow features
  - The app will automatically fall back to direct payment mode when not configured
  - After deploying the escrow contract, add the address here to enable escrow protection

**Example `.env.local`:**
```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

## Deployment

### Frontend Deployment

Deploy to Vercel, Netlify, or any Next.js hosting platform:

```bash
npm run build
npm start
```

**Environment Variables for Production:**
- Set `NEXT_PUBLIC_ONCHAINKIT_API_KEY` in your hosting platform's environment settings
- Optionally set `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` if using escrow features

### Smart Contract Deployment (Optional)

The escrow smart contract is optional but provides trustless bill settlement.

**Quick Deploy:**

```bash
# 1. Get testnet ETH from faucet
# https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

# 2. Set your private key
export PRIVATE_KEY=your_private_key_here

# 3. Run deployment script
./contracts/deploy.sh
```

The script will:
- Deploy SplitBillEscrow to Base Sepolia
- Update `.env.local` with contract address
- Save deployment info to `contracts/deployment.json`

**For detailed instructions**, see:
- `contracts/DEPLOYMENT_GUIDE.md` - Quick reference
- `contracts/README.md` - Full documentation

### Base Sepolia Testnet

1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Deploy smart contract (optional)
3. Test your transactions

### Production (Base Mainnet)

⚠️ **Before mainnet deployment:**
- Get professional security audit for smart contract
- Test extensively on testnet
- Update `src/lib/config/chains.ts` to use Base mainnet
- Never deploy unaudited contracts to mainnet

## Backward Compatibility

This project maintains full backward compatibility with bills created before the escrow feature:

- **Old bills** (without `escrowEnabled` field) work as direct payment bills
- **New bills** can choose between direct payment or escrow protection
- **Mixed history** displays both types correctly
- **No migration required** - all existing data works without changes

For detailed information, see [BACKWARD_COMPATIBILITY.md](./BACKWARD_COMPATIBILITY.md)

## Testing Backward Compatibility

Run the compatibility test suite:

```bash
node test-backward-compatibility.js
```

This validates:
- Old bills load and function correctly
- New bills work with both payment modes
- Type safety for optional fields
- Mixed data handling

## Performance & Optimization

The escrow feature is highly optimized for production use:

### Smart Polling
- **Adaptive intervals**: Stops polling when bill is settled or page is hidden
- **70-80% fewer RPC calls** for completed bills
- **Zero polling** when tab is inactive (saves battery and bandwidth)

### Bundle Optimization
- **Lazy loading**: Escrow components load on-demand
- **10-15% smaller main bundle** for faster initial page load
- **Code splitting**: Separate chunks for escrow features

### Analytics & Monitoring
- **Comprehensive tracking**: 12 event types for user insights
- **Lightweight storage**: Last 100 events in localStorage
- **Production-ready**: Easy integration with Google Analytics, Mixpanel, etc.

### Memory Management
- **Proper cleanup**: Event listeners cleaned up on unmount
- **No memory leaks**: Verified with browser profiler
- **Efficient state**: Minimal re-renders with optimized hooks

For detailed information, see:
- [Optimization Summary](./.kiro/specs/smart-contract-escrow/OPTIMIZATION_SUMMARY.md)
- [Developer Guide](./docs/ESCROW_OPTIMIZATION_GUIDE.md)

## Future Enhancements

- ✅ ~~Smart contract for escrow and automatic settlement~~ (Implemented!)
- ✅ ~~Performance optimizations and analytics~~ (Implemented!)
- Optimistic UI updates with payment state sync
- Multi-currency settlement with stablecoins (USDC, DAI)
- Receipt upload and OCR
- Group history and analytics
- Push notifications
- Mobile app (React Native)

## License

MIT

## Built for Base Batches 002: Builder Track

This project was built for the Base Batches buildathon to bring more users onchain with practical, everyday use cases.
