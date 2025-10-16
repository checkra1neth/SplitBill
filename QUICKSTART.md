# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd splitbill
npm install
```

### 2. Get API Key
1. Go to https://portal.cdp.coinbase.com/
2. Sign in
3. Create project
4. Copy API key

### 3. Configure Environment
```bash
# Create .env.local with required API key
echo "NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here" > .env.local

# Optional: Add escrow contract address to enable escrow features
# echo "NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x..." >> .env.local
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

### 5. Test the App

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Use Coinbase Wallet (create if needed)
   - Switch to Base Sepolia network

2. **Get Testnet ETH**
   - Go to https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Enter your wallet address
   - Get free testnet ETH

3. **Create Your First Bill**
   - Enter bill title: "Test Dinner"
   - (Optional) Toggle "Use Escrow Protection" if contract is deployed
   - Click "Create Bill"

4. **Add Items**
   - Description: "Pizza"
   - Amount: 20
   - Click "Add Item"

5. **Add Participant**
   - Use a second wallet address (or friend's)
   - Click "Add Participant"

6. **Set Tip & Tax**
   - Tip: 3
   - Tax: 2
   - Click "Update"

7. **Share Bill**
   - Copy the URL
   - Open in another browser/device
   - Or scan QR code

8. **Pay**
   - Click "Pay My Share" (direct payment) or "Pay via Escrow" (if escrow enabled)
   - Confirm transaction in wallet
   - Wait for confirmation
   - For escrow bills: funds are held until all participants pay

9. **Verify on Explorer**
   - Copy transaction hash
   - Go to https://sepolia.basescan.org
   - Paste hash to verify

## Common Issues

### "Wallet not connected"
- Make sure you're on Base Sepolia network
- Refresh page and reconnect

### "Insufficient funds"
- Get testnet ETH from faucet
- Wait a few minutes for it to arrive

### "Transaction failed"
- Check you have enough ETH for gas
- Try again with higher gas

### API key not working
- Make sure it's in .env.local
- Restart dev server after adding
- Check no extra spaces in key

## Using Escrow Protection (Optional)

Escrow provides trustless bill settlement through smart contracts:

### Enable Escrow

1. **Deploy Contract** (one-time setup)
   ```bash
   # See contracts/DEPLOYMENT_GUIDE.md for detailed instructions
   cd contracts
   ./deploy.sh
   ```

2. **Configure Frontend**
   - Contract address is automatically added to `.env.local`
   - Restart dev server to load new config

3. **Create Escrow Bill**
   - Toggle "Use Escrow Protection" when creating bill
   - Confirm transaction to create escrow on-chain
   - Share bill link with participants

4. **Participants Pay**
   - Each participant clicks "Pay via Escrow"
   - Funds are locked in contract
   - Payment status updates in real-time

5. **Automatic Settlement**
   - When all participants pay, contract automatically transfers funds to creator
   - No additional action needed
   - View settlement transaction on BaseScan

### Benefits of Escrow

- ✅ **Trustless**: No need to trust the bill creator
- ✅ **Transparent**: All payments visible on-chain
- ✅ **Automatic**: Settlement happens instantly when complete
- ✅ **Secure**: Funds locked until everyone pays

### When to Use Escrow

**Use Escrow For:**
- Large bills with unfamiliar participants
- Group events with many people
- When trust is a concern
- When you want on-chain proof

**Use Direct Payment For:**
- Small bills with friends
- Quick splits with trusted people
- When minimizing gas costs is priority

## Next Steps

1. Deploy to Vercel (see DEPLOYMENT.md)
2. Record video demo (see VIDEO_SCRIPT.md)
3. Submit to Base Batches
4. Share with friends!

## Need Help?

- Check README.md for full documentation
- Review ARCHITECTURE.md for code structure
- See CHECKLIST.md for submission requirements
- Join Base Discord for support

Happy building! 🚀
