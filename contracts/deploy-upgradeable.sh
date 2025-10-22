#!/bin/bash

# Deploy upgradeable contracts using Foundry
# This script deploys both Escrow and Metadata Registry with UUPS proxies

set -e

echo "🚀 Deploying Upgradeable Contracts to Base Sepolia"
echo "=================================================="

# Check environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set"
    exit 1
fi

if [ -z "$BASE_SEPOLIA_RPC_URL" ]; then
    BASE_SEPOLIA_RPC_URL="https://sepolia.base.org"
    echo "ℹ️  Using default RPC: $BASE_SEPOLIA_RPC_URL"
fi

# Install OpenZeppelin contracts if not present
if [ ! -d "lib/openzeppelin-contracts-upgradeable" ]; then
    echo "📦 Installing OpenZeppelin Upgradeable Contracts..."
    forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit
fi

echo ""
echo "1️⃣  Deploying SplitBillEscrow Implementation..."
ESCROW_IMPL=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    contracts/SplitBillEscrowUpgradeable.sol:SplitBillEscrowUpgradeable \
    --json | jq -r '.deployedTo')

echo "   ✅ Implementation deployed: $ESCROW_IMPL"

echo ""
echo "2️⃣  Deploying ERC1967Proxy for Escrow..."
# Encode initialize() call
INIT_DATA=$(cast calldata "initialize()")

ESCROW_PROXY=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args $ESCROW_IMPL $INIT_DATA \
    lib/openzeppelin-contracts-upgradeable/lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy \
    --json | jq -r '.deployedTo')

echo "   ✅ Proxy deployed: $ESCROW_PROXY"

echo ""
echo "3️⃣  Deploying BillMetadataRegistry Implementation..."
METADATA_IMPL=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    contracts/BillMetadataRegistryUpgradeable.sol:BillMetadataRegistryUpgradeable \
    --json | jq -r '.deployedTo')

echo "   ✅ Implementation deployed: $METADATA_IMPL"

echo ""
echo "4️⃣  Deploying ERC1967Proxy for Metadata..."
METADATA_PROXY=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args $METADATA_IMPL $INIT_DATA \
    lib/openzeppelin-contracts-upgradeable/lib/openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy \
    --json | jq -r '.deployedTo')

echo "   ✅ Proxy deployed: $METADATA_PROXY"

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo ""
echo "📝 Contract Addresses (USE THESE IN YOUR APP):"
echo ""
echo "SplitBillEscrow Proxy:        $ESCROW_PROXY"
echo "SplitBillEscrow Implementation: $ESCROW_IMPL"
echo ""
echo "BillMetadataRegistry Proxy:    $METADATA_PROXY"
echo "BillMetadataRegistry Implementation: $METADATA_IMPL"
echo ""
echo "⚠️  IMPORTANT: Always use PROXY addresses in your frontend!"
echo ""
echo "🔄 To upgrade later, run:"
echo "   ./contracts/upgrade-contracts.sh"
echo ""
echo "📋 Save these addresses to your .env.local:"
echo ""
echo "NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW_PROXY"
echo "NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=$METADATA_PROXY"
