# 🚀 SplitBill - Deployment Information

## Smart Contract

**Network:** Base Sepolia Testnet  
**Chain ID:** 84532  
**Contract Address:** `0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79`

**Explorer Link:**  
https://sepolia.basescan.org/address/0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79

**Contract Features:**
- Escrow bill creation
- Multi-participant payment tracking
- Automatic settlement when all participants pay
- Refund mechanism for failed bills

## Frontend Deployment

### Quick Deploy to Vercel

```bash
# Option 1: Use deployment script
./DEPLOY_NOW.sh

# Option 2: Manual deployment
npm run build
vercel --prod
```

### Environment Variables Required

```env
NEXT_PUBLIC_ONCHAINKIT_API_KEY=edaac29e-097c-428f-af3a-a93c407dbec7
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79
```

### Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Framework: Next.js
4. Root Directory: `splitbill`
5. Add environment variables (see above)
6. Click "Deploy"

## Features

✅ **Real-time ETH Price Oracle**
- Updates every second
- Multiple API sources (CoinGecko, Coinbase, Binance)
- No fallback values - always real data

✅ **Escrow Smart Contract**
- Secure fund holding
- Automatic settlement
- Gas estimation
- Transaction tracking

✅ **Direct Payments**
- Pay without escrow
- Instant transfers
- Lower gas costs

✅ **User Experience**
- Basename resolution
- QR code sharing
- Dark mode support
- Mobile responsive

## Testing the Deployment

1. **Connect Wallet**
   - Use Base Sepolia testnet
   - Get test ETH from faucet

2. **Create Bill**
   - Enable escrow protection
   - Add items and participants
   - Activate escrow

3. **Make Payment**
   - View real-time ETH price
   - Pay exact amount from contract
   - Track transaction status

## Contract Verification

To verify the contract on BaseScan:

```bash
cd contracts
forge verify-contract \
  0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79 \
  SplitBillEscrow \
  --chain base-sepolia \
  --watch
```

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Contract verified on BaseScan
- [ ] Test bill creation
- [ ] Test escrow activation
- [ ] Test payment flow
- [ ] Test on mobile devices
- [ ] Share deployment URL

## Support & Documentation

- Contract code: `contracts/SplitBillEscrow.sol`
- Frontend code: `src/`
- Tests: `tests/`
- Documentation: `README.md`

## Known Issues & Fixes

✅ Fixed: "Incorrect amount" error - now reads from contract  
✅ Fixed: Data loss on escrow activation - no more page reload  
✅ Fixed: Demo exchange rates - real-time prices every second  

---

**Ready to deploy!** Run `./DEPLOY_NOW.sh` or follow manual steps above.
