#!/bin/bash

# Contract verification script for BaseScan
# 
# Usage:
#   chmod +x contracts/verify.sh
#   BASESCAN_API_KEY=your_key ./contracts/verify.sh [CONTRACT_ADDRESS]
# 
# Or read from deployment.json:
#   BASESCAN_API_KEY=your_key ./contracts/verify.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔍 SplitBillEscrow Contract Verification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check if BaseScan API key is set
if [ -z "$BASESCAN_API_KEY" ]; then
    echo -e "${RED}❌ Error: BASESCAN_API_KEY environment variable not set${NC}"
    echo -e "\nGet API key from: ${BLUE}https://basescan.org/myapikey${NC}"
    echo -e "\nUsage:"
    echo -e "  ${YELLOW}BASESCAN_API_KEY=your_key ./contracts/verify.sh${NC}"
    exit 1
fi

# Get contract address from argument or deployment.json
if [ -n "$1" ]; then
    CONTRACT_ADDRESS=$1
elif [ -f "contracts/deployment.json" ]; then
    CONTRACT_ADDRESS=$(cat contracts/deployment.json | jq -r '.contractAddress')
    echo -e "${GREEN}📄 Reading contract address from deployment.json${NC}"
else
    echo -e "${RED}❌ Error: No contract address provided${NC}"
    echo -e "\nUsage:"
    echo -e "  ${YELLOW}./contracts/verify.sh CONTRACT_ADDRESS${NC}"
    echo -e "Or deploy first to create deployment.json"
    exit 1
fi

echo -e "Contract Address: ${GREEN}$CONTRACT_ADDRESS${NC}\n"

# Verify contract
echo -e "${YELLOW}🔍 Verifying contract on BaseScan...${NC}"

forge verify-contract \
    --chain-id 84532 \
    --compiler-version v0.8.20 \
    --etherscan-api-key $BASESCAN_API_KEY \
    $CONTRACT_ADDRESS \
    contracts/SplitBillEscrow.sol:SplitBillEscrow

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Contract verified successfully!${NC}"
    echo -e "\nView on BaseScan:"
    echo -e "${BLUE}https://sepolia.basescan.org/address/$CONTRACT_ADDRESS#code${NC}"
else
    echo -e "\n${RED}❌ Verification failed${NC}"
    echo -e "\nPossible reasons:"
    echo -e "  - Contract already verified"
    echo -e "  - Wrong compiler version"
    echo -e "  - Invalid API key"
    echo -e "  - Contract not yet indexed by BaseScan (wait a few minutes)"
    exit 1
fi
