#!/bin/bash

# Deployment script for BillMetadataRegistry contract to Base Sepolia using Foundry
# 
# Prerequisites:
# - Foundry installed (forge, cast)
# - Private key with Base Sepolia ETH for gas
# 
# Usage:
#   chmod +x contracts/deploy-metadata-registry.sh
#   PRIVATE_KEY=your_key ./contracts/deploy-metadata-registry.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_SEPOLIA_RPC_URL=${BASE_SEPOLIA_RPC_URL:-"https://sepolia.base.org"}
BASE_SEPOLIA_CHAIN_ID=84532
EXPLORER_URL="https://sepolia.basescan.org"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 BillMetadataRegistry Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo -e "${RED}❌ Error: Foundry not installed${NC}"
    echo -e "\nInstall Foundry:"
    echo -e "  ${YELLOW}curl -L https://foundry.paradigm.xyz | bash${NC}"
    echo -e "  ${YELLOW}foundryup${NC}"
    exit 1
fi

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY environment variable not set${NC}"
    echo -e "\nUsage:"
    echo -e "  ${YELLOW}PRIVATE_KEY=your_private_key ./contracts/deploy-metadata-registry.sh${NC}"
    exit 1
fi

# Get deployer address
DEPLOYER_ADDRESS=$(cast wallet address $PRIVATE_KEY)
echo -e "${GREEN}📡 Deployment Configuration:${NC}"
echo -e "   Network: Base Sepolia"
echo -e "   Chain ID: $BASE_SEPOLIA_CHAIN_ID"
echo -e "   RPC URL: $BASE_SEPOLIA_RPC_URL"
echo -e "   Deployer: $DEPLOYER_ADDRESS"

# Check balance
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $BASE_SEPOLIA_RPC_URL)
BALANCE_ETH=$(cast --from-wei $BALANCE)
echo -e "   Balance: ${BALANCE_ETH} ETH\n"

if [ "$BALANCE" = "0" ]; then
    echo -e "${RED}❌ Error: Deployer wallet has no ETH for gas fees${NC}"
    echo -e "\nGet testnet ETH from:"
    echo -e "  ${BLUE}https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet${NC}"
    exit 1
fi

# Compile contract
echo -e "${YELLOW}📝 Compiling contract...${NC}"
forge build --contracts contracts/BillMetadataRegistry.sol

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Compilation failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Compilation successful${NC}\n"

# Deploy contract
echo -e "${YELLOW}🚀 Deploying BillMetadataRegistry...${NC}"
DEPLOY_OUTPUT=$(forge create \
    --rpc-url $BASE_SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY \
    contracts/BillMetadataRegistry.sol:BillMetadataRegistry \
    --json)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Parse deployment output
CONTRACT_ADDRESS=$(echo $DEPLOY_OUTPUT | jq -r '.deployedTo')
TX_HASH=$(echo $DEPLOY_OUTPUT | jq -r '.transactionHash')

echo -e "${GREEN}✓ Deployment successful!${NC}\n"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}📋 Deployment Summary:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "Contract Address: ${GREEN}$CONTRACT_ADDRESS${NC}"
echo -e "Transaction Hash: ${BLUE}$TX_HASH${NC}"
echo -e "Explorer: ${BLUE}$EXPLORER_URL/address/$CONTRACT_ADDRESS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Save deployment info
DEPLOYMENT_FILE="contracts/metadata-registry-deployment.json"
cat > $DEPLOYMENT_FILE << EOF
{
  "network": "Base Sepolia",
  "chainId": $BASE_SEPOLIA_CHAIN_ID,
  "contractAddress": "$CONTRACT_ADDRESS",
  "transactionHash": "$TX_HASH",
  "deployerAddress": "$DEPLOYER_ADDRESS",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "explorerUrl": "$EXPLORER_URL/address/$CONTRACT_ADDRESS"
}
EOF

echo -e "${GREEN}✓ Deployment info saved to: $DEPLOYMENT_FILE${NC}\n"

# Update .env.local
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    # Check if the variable already exists
    if grep -q "NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS" "$ENV_FILE"; then
        # Update existing variable
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" "$ENV_FILE"
        fi
        echo -e "${GREEN}✓ Updated NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS in $ENV_FILE${NC}"
    else
        # Add new variable
        echo "NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> "$ENV_FILE"
        echo -e "${GREEN}✓ Added NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS to $ENV_FILE${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Warning: $ENV_FILE not found${NC}"
    echo -e "   Create it and add: NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
fi

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "1. Verify contract on BaseScan:"
echo -e "   ${BLUE}forge verify-contract \\${NC}"
echo -e "   ${BLUE}  --chain-id $BASE_SEPOLIA_CHAIN_ID \\${NC}"
echo -e "   ${BLUE}  --compiler-version v0.8.20 \\${NC}"
echo -e "   ${BLUE}  --etherscan-api-key YOUR_BASESCAN_API_KEY \\${NC}"
echo -e "   ${BLUE}  $CONTRACT_ADDRESS \\${NC}"
echo -e "   ${BLUE}  contracts/BillMetadataRegistry.sol:BillMetadataRegistry${NC}"
echo -e "\n2. Test the contract:"
echo -e "   ${BLUE}cast call $CONTRACT_ADDRESS \"getBill(bytes32)\" 0x0000000000000000000000000000000000000000000000000000000000000000 --rpc-url $BASE_SEPOLIA_RPC_URL${NC}"
echo -e "\n3. Deploy frontend to Vercel:"
echo -e "   ${BLUE}vercel --prod${NC}"

echo -e "\n${GREEN}✨ Deployment complete!${NC}\n"
