#!/bin/bash

# Upgrade existing contracts to new implementations
# This preserves all data while updating logic

set -e

echo "🔄 Upgrading Contracts"
echo "====================="

# Check environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set"
    exit 1
fi

if [ -z "$BASE_SEPOLIA_RPC_URL" ]; then
    BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
fi

# Get proxy addresses from .env.local or command line
if [ -z "$ESCROW_PROXY" ]; then
    if [ -f "../.env.local" ]; then
        ESCROW_PROXY=$(grep NEXT_PUBLIC_ESCROW_ADDRESS ../.env.local | cut -d '=' -f2)
    fi
fi

if [ -z "$METADATA_PROXY" ]; then
    if [ -f "../.env.local" ]; then
        METADATA_PROXY=$(grep NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS ../.env.local | cut -d '=' -f2)
    fi
fi

if [ -z "$ESCROW_PROXY" ] || [ -z "$METADATA_PROXY" ]; then
    echo "❌ Error: Proxy addresses not found"
    echo "   Set ESCROW_PROXY and METADATA_PROXY environment variables"
    echo "   Or ensure they're in ../.env.local"
    exit 1
fi

echo "📍 Proxy Addresses:"
echo "   Escrow: $ESCROW_PROXY"
echo "   Metadata: $METADATA_PROXY"
echo ""

# Deploy new implementations
echo "1️⃣  Deploying new Escrow implementation..."
NEW_ESCROW_IMPL=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    contracts/SplitBillEscrowUpgradeable.sol:SplitBillEscrowUpgradeable \
    --json | jq -r '.deployedTo')

echo "   ✅ New implementation: $NEW_ESCROW_IMPL"

echo ""
echo "2️⃣  Deploying new Metadata implementation..."
NEW_METADATA_IMPL=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    contracts/BillMetadataRegistryUpgradeable.sol:BillMetadataRegistryUpgradeable \
    --json | jq -r '.deployedTo')

echo "   ✅ New implementation: $NEW_METADATA_IMPL"

echo ""
echo "3️⃣  Upgrading Escrow proxy..."
cast send $ESCROW_PROXY \
    "upgradeTo(address)" $NEW_ESCROW_IMPL \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY

echo "   ✅ Escrow upgraded!"

echo ""
echo "4️⃣  Upgrading Metadata proxy..."
cast send $METADATA_PROXY \
    "upgradeTo(address)" $NEW_METADATA_IMPL \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY

echo "   ✅ Metadata upgraded!"

echo ""
echo "5️⃣  Verifying versions..."
ESCROW_VERSION=$(cast call $ESCROW_PROXY "version()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL)
METADATA_VERSION=$(cast call $METADATA_PROXY "version()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL)

echo "   Escrow version: $ESCROW_VERSION"
echo "   Metadata version: $METADATA_VERSION"

echo ""
echo "=================================================="
echo "✅ Upgrade Complete!"
echo ""
echo "📝 New Implementation Addresses:"
echo "   Escrow: $NEW_ESCROW_IMPL"
echo "   Metadata: $NEW_METADATA_IMPL"
echo ""
echo "⚠️  Your app continues using the same proxy addresses"
echo "   No frontend changes needed!"
