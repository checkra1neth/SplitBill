#!/bin/bash

# SplitBill Escrow v2.0 - Quick Start Script
# This script helps you start testing the new refund features

set -e

echo "🚀 SplitBill Escrow v2.0 - Starting Development Server"
echo "======================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the splitbill directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Check .env.local
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found"
    echo "Please create .env.local with required environment variables"
    exit 1
fi

# Display contract info
echo "📋 Contract Information:"
echo "   Network: Base Sepolia"
echo "   Address: 0xB843cEab8d5F77aB356c935DB0836f113bD02581"
echo "   Explorer: https://sepolia.basescan.org/address/0xB843cEab8d5F77aB356c935DB0836f113bD02581"
echo ""

# Display new features
echo "✨ New Features in v2.0:"
echo "   ✅ Cancel & Refund (manual)"
echo "   ✅ Auto Refund (7-day deadline)"
echo "   ✅ Partial Settlement"
echo "   ✅ Deadline countdown"
echo "   ✅ Management panel for creators"
echo "   ✅ Refund claim for participants"
echo ""

# Display testing instructions
echo "🧪 Testing Instructions:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Connect your wallet (MetaMask/Coinbase)"
echo "   3. Switch to Base Sepolia network"
echo "   4. Get testnet ETH: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
echo "   5. Create a bill with 'Escrow Protection' enabled"
echo "   6. Test the new refund features!"
echo ""

echo "📖 Documentation:"
echo "   - Full Guide: ESCROW_REFUND_GUIDE.md"
echo "   - Testing Guide: READY_TO_TEST_V2.md"
echo "   - Summary: REFUND_FEATURES_SUMMARY.md"
echo ""

echo "🎯 Quick Test Scenarios:"
echo "   1. Create bill → All pay → Auto settle ✅"
echo "   2. Create bill → Some pay → Cancel & refund 🔄"
echo "   3. Create bill → Most pay → Partial settlement 💰"
echo ""

echo "======================================================"
echo "🚀 Starting development server..."
echo "======================================================"
echo ""

# Start the dev server
npm run dev
