# Smart Contract Deployment Guide

Quick reference for deploying SplitBillEscrow to Base Sepolia.

## Prerequisites Checklist

- [ ] Foundry installed (`forge --version`)
- [ ] Wallet with Base Sepolia ETH (~0.01 ETH)
- [ ] Private key exported (NEVER use mainnet wallet)
- [ ] BaseScan API key (optional, for verification)

## Quick Start (5 minutes)

### 1. Get Testnet ETH

Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### 2. Deploy Contract

```bash
# Set your private key (without 0x prefix)
export PRIVATE_KEY=your_private_key_here

# Run deployment script
./contracts/deploy.sh
```

### 3. Verify Contract (Optional)

```bash
# Get API key from https://basescan.org/myapikey
export BASESCAN_API_KEY=your_api_key_here

# Run verification script
./contracts/verify.sh
```

### 4. Start Frontend

```bash
npm run dev
```

That's it! The escrow feature is now enabled.

## Manual Deployment

If the automated script doesn't work:

```bash
# 1. Compile
forge build --contracts contracts/SplitBillEscrow.sol

# 2. Deploy
forge create \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  contracts/SplitBillEscrow.sol:SplitBillEscrow

# 3. Copy the "Deployed to:" address

# 4. Add to .env.local
echo "NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0xYourContractAddress" >> .env.local

# 5. Verify (optional)
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20 \
  --etherscan-api-key $BASESCAN_API_KEY \
  0xYourContractAddress \
  contracts/SplitBillEscrow.sol:SplitBillEscrow
```

## Deployment Outputs

After successful deployment:

1. **contracts/deployment.json** - Deployment metadata
2. **.env.local** - Updated with contract address
3. **out/** - Compiled artifacts

## Testing Deployment

```bash
# Set contract address
export CONTRACT_ADDRESS=0xYourContractAddress

# Test reading (should return zeros for non-existent bill)
cast call $CONTRACT_ADDRESS \
  "getBillInfo(bytes32)" \
  0x0000000000000000000000000000000000000000000000000000000000000000 \
  --rpc-url https://sepolia.base.org

# If this works, deployment is successful!
```

## Troubleshooting

### "forge: command not found"
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
# Restart terminal
```

### "Insufficient funds for gas"
- Get more ETH from faucet
- Check balance: `cast balance YOUR_ADDRESS --rpc-url https://sepolia.base.org`

### "Contract creation failed"
- Verify you're on Base Sepolia (Chain ID: 84532)
- Check private key is correct (64 hex chars, no 0x)
- Ensure RPC URL is correct

### "Verification failed"
- Wait 1-2 minutes after deployment
- Check compiler version is v0.8.20
- Verify API key is correct
- Contract might already be verified

## Network Information

- **Network**: Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

## Security Reminders

⚠️ **NEVER**:
- Use mainnet wallet for testnet deployment
- Commit private keys to git
- Share private keys with anyone
- Deploy to mainnet without audit

✅ **ALWAYS**:
- Use dedicated testnet wallet
- Store private keys securely
- Test thoroughly on testnet
- Get professional audit before mainnet

## Next Steps

After deployment:

1. ✅ Test creating a bill with escrow enabled
2. ✅ Test payment flow with multiple participants
3. ✅ Verify settlement works correctly
4. ✅ Check transaction history on BaseScan
5. ✅ Test error cases (wrong amount, duplicate payment, etc.)

## Support

- **Documentation**: See `contracts/README.md` for detailed info
- **Design**: See `.kiro/specs/smart-contract-escrow/design.md`
- **Requirements**: See `.kiro/specs/smart-contract-escrow/requirements.md`

## Mainnet Deployment (Future)

Before deploying to mainnet:

1. [ ] Professional security audit
2. [ ] Extensive testing on testnet
3. [ ] Bug bounty program
4. [ ] Multi-sig wallet setup
5. [ ] Incident response plan
6. [ ] Insurance/coverage consideration
7. [ ] Legal review
8. [ ] Gradual rollout plan

**DO NOT deploy to mainnet without completing all items above.**
