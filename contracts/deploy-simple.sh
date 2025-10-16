#!/bin/bash

# Simple deployment script for SplitBillEscrow contract
# Usage: ./contracts/deploy-simple.sh
# Reads PRIVATE_KEY from .env.local

set -e

echo "🚀 SplitBillEscrow Deployment to Base Sepolia"
echo "=============================================="
echo ""

# Configuration
RPC_URL="https://sepolia.base.org"
CHAIN_ID=84532

# Load .env.local if exists
if [ -f ".env.local" ]; then
    echo "📄 Loading .env.local..."
    export $(grep -v '^#' .env.local | grep PRIVATE_KEY | xargs)
else
    echo "⚠️  Warning: .env.local not found"
fi

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not found in .env.local"
    echo ""
    echo "Please add PRIVATE_KEY to .env.local:"
    echo "  PRIVATE_KEY=0x..."
    echo ""
    echo "⚠️  IMPORTANT: Use a testnet-only wallet!"
    echo "   Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
    exit 1
fi

# Check if forge is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Error: Foundry (forge) not found"
    echo ""
    echo "Install Foundry:"
    echo "  curl -L https://foundry.paradigm.xyz | bash"
    echo "  foundryup"
    exit 1
fi

echo "✅ Foundry found: $(forge --version | head -n 1)"
echo "📡 RPC URL: $RPC_URL"
echo "🔗 Chain ID: $CHAIN_ID"
echo ""

# Deploy contract
echo "🔨 Deploying SplitBillEscrow contract..."
echo ""

forge create \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --legacy \
    --broadcast \
    contracts/SplitBillEscrow.sol:SplitBillEscrow

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the 'Deployed to:' address above"
    echo "2. Add it to .env.local:"
    echo "   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x..."
    echo "3. Restart dev server: npm run dev"
    echo ""
    echo "🔍 Verify on BaseScan:"
    echo "   https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS"
else
    echo ""
    echo "❌ Deployment failed"
    echo ""
    echo "Common issues:"
    echo "- Insufficient gas (need ~0.01 ETH)"
    echo "- Wrong network"
    echo "- Invalid private key"
    exit 1
fi
