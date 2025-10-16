#!/bin/bash

echo "🚀 SplitBill Deployment Script"
echo "================================"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🌐 Deploying to Vercel..."
echo ""
echo "Make sure you have set these environment variables in Vercel:"
echo "  NEXT_PUBLIC_ONCHAINKIT_API_KEY=edaac29e-097c-428f-af3a-a93c407dbec7"
echo "  NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79"
echo ""
echo "Press Enter to continue with deployment..."
read

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Contract Info:"
echo "  Address: 0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79"
echo "  Network: Base Sepolia"
echo "  Explorer: https://sepolia.basescan.org/address/0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79"
