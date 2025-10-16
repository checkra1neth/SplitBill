/**
 * Deployment script for SplitBillEscrow contract to Base Sepolia
 * 
 * Prerequisites:
 * - Node.js installed
 * - Private key with Base Sepolia ETH for gas
 * - RPC URL for Base Sepolia
 * 
 * Usage:
 *   node contracts/deploy.js
 * 
 * Environment variables:
 *   PRIVATE_KEY - Deployer wallet private key (without 0x prefix)
 *   BASE_SEPOLIA_RPC_URL - RPC endpoint (default: public endpoint)
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Contract source
const contractPath = path.join(__dirname, 'SplitBillEscrow.sol');

async function main() {
  console.log('🚀 SplitBillEscrow Deployment Script\n');
  console.log('═══════════════════════════════════════════════════════════');

  // Validate environment
  if (!PRIVATE_KEY) {
    console.error('❌ Error: PRIVATE_KEY environment variable not set');
    console.log('\nUsage:');
    console.log('  PRIVATE_KEY=your_private_key node contracts/deploy.js');
    process.exit(1);
  }

  // Setup provider and wallet
  console.log('📡 Connecting to Base Sepolia...');
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log(`   Deployer address: ${wallet.address}`);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error('\n❌ Error: Deployer wallet has no ETH for gas fees');
    console.log('   Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
    process.exit(1);
  }

  // Verify network
  const network = await provider.getNetwork();
  console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})`);
  
  if (Number(network.chainId) !== BASE_SEPOLIA_CHAIN_ID) {
    console.error(`\n❌ Error: Connected to wrong network (expected Chain ID ${BASE_SEPOLIA_CHAIN_ID})`);
    process.exit(1);
  }

  console.log('\n📝 Contract Information:');
  console.log(`   Source: ${contractPath}`);
  
  // Contract bytecode and ABI (compiled manually or using solc)
  // For this script, we'll use a pre-compiled version
  // In production, integrate with Hardhat or Foundry
  
  console.log('\n⚠️  Note: This script requires pre-compiled contract bytecode.');
  console.log('   Please use Foundry or Hardhat for compilation and deployment.');
  console.log('\n   Recommended approach:');
  console.log('   1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash');
  console.log('   2. Run: foundryup');
  console.log('   3. Deploy: forge create --rpc-url $BASE_SEPOLIA_RPC_URL \\');
  console.log('              --private-key $PRIVATE_KEY \\');
  console.log('              contracts/SplitBillEscrow.sol:SplitBillEscrow');
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('See contracts/README.md for detailed deployment instructions');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  });
