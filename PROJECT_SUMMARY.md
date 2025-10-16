# SplitBill - Project Summary

## 🎯 Overview
SplitBill is an onchain bill-splitting application built on Base blockchain that makes group payments instant, transparent, and trustless.

## ✨ Key Features
- **Smart Wallet Integration**: Coinbase Smart Wallet + Base Account connector for frictionless onboarding
- **Automatic Calculations**: Split items, tax, and tips proportionally
- **Identity-Aware Participants**: Resolve Basename/ENS names, prevent duplicates, and search across identities
- **Guided UX**: Toast notifications, loading skeletons, and error boundaries keep users informed
- **Adaptive Interface**: Built-in dark mode toggle with persistent preference
- **Multi-Currency View**: Present totals in USD/EUR/GBP (demo FX) alongside onchain amounts
- **Easy Sharing**: Share bills via link or QR code
- **Instant Payments**: Pay onchain in seconds
- **Responsive Design**: Works on mobile and desktop

## 🏗️ Architecture

### Modular Structure
```
src/
├── app/              # Next.js pages (routing)
├── components/       # Reusable UI components
├── features/         # Feature modules (bill, payment)
│   ├── bill/
│   │   ├── components/
│   │   └── hooks/
│   └── payment/
│       └── hooks/
└── lib/              # Core utilities
    ├── config/       # Chain & wallet config
    ├── providers/    # React providers (Onchain, Theme, Toast)
    ├── types/        # TypeScript types
    └── utils/        # Helper functions (calculations, currency, storage)
```

### Design Principles
1. **Separation of Concerns**: UI, logic, and data are separated
2. **Modularity**: Features are self-contained modules
3. **Scalability**: Easy to add new features
4. **Type Safety**: Full TypeScript coverage

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React hooks + localStorage

### Blockchain
- **Network**: Base (Sepolia testnet)
- **Wallet**: OnchainKit + Wagmi + Viem
- **Smart Wallet**: Coinbase Smart Wallet

### Tools
- **OnchainKit**: Wallet, identity, transactions
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library
- **TanStack Query**: Async state management

## 📦 Project Structure

### Core Files
- `src/lib/types/bill.ts` - TypeScript interfaces
- `src/lib/utils/calculations.ts` - Bill calculation logic
- `src/lib/config/chains.ts` - Blockchain configuration
- `src/lib/config/wagmi.ts` - Wallet configuration

### Features
- `src/features/bill/` - Bill management
  - `hooks/useBill.ts` - Bill state management
  - `components/CreateBillForm.tsx` - Bill creation UI
  - `components/BillSummary.tsx` - Bill display
- `src/features/payment/` - Payment handling
  - `hooks/usePayment.ts` - Payment transactions

### Pages
- `src/app/page.tsx` - Home page (create bill)
- `src/app/bill/[id]/page.tsx` - Bill detail page

## 🚀 Getting Started

### Quick Setup
```bash
cd splitbill
npm install
echo "NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_key" > .env.local
npm run dev
```

### Get API Key
1. Visit https://portal.cdp.coinbase.com/
2. Create project
3. Copy API key

### Test on Base Sepolia
1. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect wallet
3. Create bill and test payment

## 📋 Documentation

- **README.md** - Project overview and setup
- **QUICKSTART.md** - 5-minute setup guide
- **ARCHITECTURE.md** - Detailed architecture explanation
- **DEPLOYMENT.md** - Deployment instructions
- **ROADMAP.md** - Future development plans
- **CHECKLIST.md** - Pre-submission checklist
- **VIDEO_SCRIPT.md** - Video demo script
- **HACKATHON_SUBMISSION.md** - Submission details

## 🎬 Demo Flow

1. **Connect Wallet** → Base Account or Coinbase Smart Wallet
2. **Create Bill** → "Dinner at Restaurant"
3. **Add Items** → Pizza ($18), Pasta ($22)
4. **Add Participants** → Friend's wallet address or Basename
5. **Set Tip & Tax** → Tip ($10), Tax ($5)
6. **Show Split** → Toggle USD/EUR/GBP to preview converted totals
7. **Switch Theme** → Highlight dark mode experience
8. **Share** → Copy link or show QR code
9. **Pay** → Each person pays their calculated share
10. **Verify** → Check transaction on Base Sepolia explorer

## 🔮 Future Enhancements

### Phase 2: Enhanced UX
- ✅ Basenames + identity integration (display + search)
- ✅ Toast notifications & skeleton states
- ✅ Dark mode with theme persistence
- ✅ Multi-currency share display
- ✅ Base Account connector
- ⏳ Optimistic UI updates

### Phase 3: Smart Contracts
- Escrow contract (see `contracts/SplitBillEscrow.sol`)
- Automatic settlement
- Bill NFTs as receipts

### Phase 4: Advanced Features
- USDC/stablecoin support
- Receipt OCR
- Multiple split methods
- Recurring bills

### Phase 5: Mobile & Social
- React Native app
- Push notifications
- Group management
- Analytics dashboard

## 📊 Success Metrics

### MVP Goals
- ✅ Working bill creation
- ✅ Automatic calculations
- ✅ Wallet integration
- ✅ Payment transactions
- ✅ Share functionality

### Hackathon Goals
- [ ] 100+ test bills created
- [ ] 50+ successful transactions
- [ ] Deployed on Vercel
- [ ] Video demo completed
- [ ] Submitted to Base Batches

## 🎯 Base Batches Alignment

### Requirements Met
✅ Built on Base (Sepolia)
✅ OnchainKit integration
✅ Smart Wallet support
✅ Publicly accessible URL
✅ Open-source repository
✅ Video demo
✅ Proof of deployment

### Evaluation Criteria
✅ **Onchain**: Built on Base blockchain
✅ **Technicality**: Full working app with wallet integration
✅ **Originality**: Unique approach to bill splitting
✅ **Viability**: Clear target audience (everyone splits bills)
✅ **Specific**: Focused on bill-splitting use case
✅ **Practicality**: Usable by anyone with a wallet
✅ **Wow Factor**: Instant settlement, transparent payments

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

### How to Add Features

1. Create feature module in `src/features/`
2. Add types in `src/lib/types/`
3. Add utilities in `src/lib/utils/`
4. Create components and hooks
5. Integrate in pages
6. Test thoroughly

### Code Style
- Use TypeScript
- Follow existing patterns
- Add comments for complex logic
- Keep components small and focused
- Use meaningful variable names

## 📝 License
MIT

## 👥 Team
[Your Name/Team]

## 🔗 Links
- **Live Demo**: [Vercel URL]
- **GitHub**: [Repository URL]
- **Video**: [Demo video URL]
- **Transaction**: [Base Sepolia explorer URL]

## 🙏 Acknowledgments
- Base team for the amazing blockchain
- Coinbase for OnchainKit and Smart Wallet
- Devfolio for hosting Base Batches
- The Ethereum community

---

**Built with ❤️ for Base Batches 002: Builder Track**

*Bringing a billion users onchain, one bill at a time* 🚀
