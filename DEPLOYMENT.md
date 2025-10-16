# SplitBill Deployment Info

## Smart Contract (Base Sepolia)

**Contract Address:** `0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79`

**Network:** Base Sepolia Testnet  
**Chain ID:** 84532

**Explorer:**  
https://sepolia.basescan.org/address/0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79

**Deployment TX:**  
Check DEPLOYMENT_SUMMARY.md in contracts folder

## Frontend Deployment

### Vercel Deployment Steps

1. Install Vercel CLI (if not installed):
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from splitbill directory:
```bash
cd splitbill
vercel --prod
```

### Environment Variables (Vercel)

Set these in Vercel dashboard or via CLI:

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=edaac29e-097c-428f-af3a-a93c407dbec7
NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79
```

### Alternative: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git repository
3. Set environment variables
4. Deploy

## Features Deployed

✅ Real-time ETH price oracle (updates every second)  
✅ Escrow smart contract integration  
✅ Direct payment support  
✅ QR code sharing  
✅ Basename resolution  
✅ Gas estimation  
✅ Multi-participant bill splitting  

## Testing the Deployment

1. Connect wallet (Base Sepolia)
2. Create bill with escrow enabled
3. Add items and participants
4. Activate escrow protection
5. Pay via escrow

## Contract Functions

- `createBill(bytes32 billId, address[] participants, uint256[] shares)`
- `payShare(bytes32 billId)` payable
- `getBillInfo(bytes32 billId)` view
- `getShare(bytes32 billId, address participant)` view
- `hasPaid(bytes32 billId, address participant)` view

## Support

For issues or questions, check the documentation in the repo.
