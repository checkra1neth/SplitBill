# Smart Contracts

## SplitBillEscrow.sol

Smart contract for trustless bill settlement on Base blockchain. Holds funds in escrow until all participants pay, then automatically distributes to the bill creator.

### Features
- **Trustless Escrow**: Funds locked in contract until all participants pay
- **Automatic Settlement**: Instant transfer to creator when bill is complete
- **Payment Verification**: On-chain proof of who paid and when
- **Duplicate Prevention**: Contract rejects duplicate payments
- **Amount Validation**: Ensures exact share amounts are paid

### How It Works

1. **Create Bill**: Creator calls `createBill()` with participant addresses and their shares
2. **Pay Share**: Each participant calls `payShare()` with exact amount in ETH
3. **Auto-Settle**: When last participant pays, contract automatically transfers total to creator

### Contract Functions

#### Write Functions

- `createBill(bytes32 billId, address[] participants, uint256[] shares)`
  - Creates a new bill with participant shares
  - Emits: `BillCreated` event
  
- `payShare(bytes32 billId) payable`
  - Pays your share of the bill
  - Must send exact share amount
  - Emits: `PaymentReceived` event
  - Auto-settles if last payment

#### Read Functions

- `getBillInfo(bytes32 billId)` → `(address creator, uint256 totalAmount, uint256 participantCount, uint256 paidCount, bool settled)`
  - Returns bill status and details
  
- `hasPaid(bytes32 billId, address participant)` → `bool`
  - Check if participant has paid
  
- `getShare(bytes32 billId, address participant)` → `uint256`
  - Get participant's share amount

### Events

- `BillCreated(bytes32 indexed billId, address indexed creator, uint256 totalAmount)`
- `PaymentReceived(bytes32 indexed billId, address indexed participant, uint256 amount)`
- `BillSettled(bytes32 indexed billId)`

## Deployment Guide

### Prerequisites

1. **Install Foundry** (Solidity toolkit)
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Get Base Sepolia ETH**
   - Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Connect wallet and claim testnet ETH
   - Need ~0.01 ETH for deployment gas

3. **Prepare Deployer Wallet**
   - Export private key from MetaMask or create new wallet
   - **NEVER use mainnet wallet with real funds**
   - Store private key securely (never commit to git)

### Quick Deployment

Use the automated deployment script:

```bash
# Set your private key (without 0x prefix)
export PRIVATE_KEY=your_private_key_here

# Run deployment script
./contracts/deploy.sh
```

The script will:
- ✅ Check Foundry installation
- ✅ Verify wallet balance
- ✅ Compile contract
- ✅ Deploy to Base Sepolia
- ✅ Save deployment info to `contracts/deployment.json`
- ✅ Update `.env.local` with contract address

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. Compile contract
forge build --contracts contracts/SplitBillEscrow.sol

# 2. Deploy to Base Sepolia
forge create \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  contracts/SplitBillEscrow.sol:SplitBillEscrow

# 3. Save the contract address from output
# Example output:
# Deployed to: 0x1234567890abcdef1234567890abcdef12345678
# Transaction hash: 0xabcdef...

# 4. Add to .env.local
echo "NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678" >> .env.local
```

### Verify Contract on BaseScan

Verification allows users to read the contract source code on the block explorer:

```bash
# Get BaseScan API key from https://basescan.org/myapikey

forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20 \
  --etherscan-api-key YOUR_BASESCAN_API_KEY \
  YOUR_CONTRACT_ADDRESS \
  contracts/SplitBillEscrow.sol:SplitBillEscrow
```

### Post-Deployment Testing

Test the deployed contract:

```bash
# Set contract address
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Test 1: Read bill info (should return zeros for non-existent bill)
cast call $CONTRACT_ADDRESS \
  "getBillInfo(bytes32)" \
  0x0000000000000000000000000000000000000000000000000000000000000000 \
  --rpc-url https://sepolia.base.org

# Expected output: (0x0000000000000000000000000000000000000000, 0, 0, 0, false)

# Test 2: Create a test bill (requires gas)
cast send $CONTRACT_ADDRESS \
  "createBill(bytes32,address[],uint256[])" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  "[0xYourAddress,0xFriendAddress]" \
  "[1000000000000000000,2000000000000000000]" \
  --private-key $PRIVATE_KEY \
  --rpc-url https://sepolia.base.org

# Test 3: Read the created bill
cast call $CONTRACT_ADDRESS \
  "getBillInfo(bytes32)" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  --rpc-url https://sepolia.base.org

# Expected output: (YourAddress, 3000000000000000000, 2, 0, false)

# Test 4: Check if participant has paid
cast call $CONTRACT_ADDRESS \
  "hasPaid(bytes32,address)" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  0xYourAddress \
  --rpc-url https://sepolia.base.org

# Expected output: false

# Test 5: Pay share (requires gas)
cast send $CONTRACT_ADDRESS \
  "payShare(bytes32)" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  --value 1000000000000000000 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://sepolia.base.org

# Test 6: Verify payment
cast call $CONTRACT_ADDRESS \
  "hasPaid(bytes32,address)" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  0xYourAddress \
  --rpc-url https://sepolia.base.org

# Expected output: true
```

### Example Deployment Commands

Here are complete example commands for reference:

```bash
# Full deployment workflow
export PRIVATE_KEY=your_64_char_private_key_without_0x
export BASESCAN_API_KEY=your_basescan_api_key

# 1. Check balance
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url https://sepolia.base.org

# 2. Compile
forge build --contracts contracts/SplitBillEscrow.sol

# 3. Deploy
forge create \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY \
  contracts/SplitBillEscrow.sol:SplitBillEscrow

# 4. Save contract address from output
export CONTRACT_ADDRESS=0xYourDeployedContractAddress

# 5. Verify
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20 \
  --etherscan-api-key $BASESCAN_API_KEY \
  $CONTRACT_ADDRESS \
  contracts/SplitBillEscrow.sol:SplitBillEscrow

# 6. Update .env.local
echo "NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local

# 7. Test contract
cast call $CONTRACT_ADDRESS \
  "getBillInfo(bytes32)" \
  0x0000000000000000000000000000000000000000000000000000000000000000 \
  --rpc-url https://sepolia.base.org
```

### Deployment Artifacts

After deployment, you'll have:

1. **contracts/deployment.json** - Deployment metadata
   ```json
   {
     "network": "Base Sepolia",
     "chainId": 84532,
     "contractAddress": "0x...",
     "transactionHash": "0x...",
     "deployerAddress": "0x...",
     "timestamp": "2025-01-15T10:30:00Z",
     "explorerUrl": "https://sepolia.basescan.org/address/0x..."
   }
   ```

2. **.env.local** - Updated with contract address
   ```
   NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x...
   ```

3. **out/** - Compiled contract artifacts (ABI, bytecode)

### Troubleshooting

#### Deployment Issues

**"Insufficient funds for gas"**
- Get more testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- Check balance: `cast balance YOUR_ADDRESS --rpc-url https://sepolia.base.org`
- Need at least 0.01 ETH for deployment

**"Nonce too low"**
- Wait for previous transaction to confirm
- Check pending transactions: `cast nonce YOUR_ADDRESS --rpc-url https://sepolia.base.org`
- If stuck, wait 5-10 minutes for network to catch up

**"Contract creation failed"**
- Verify Solidity version matches (0.8.20): `forge --version`
- Check RPC URL is correct: `https://sepolia.base.org`
- Confirm network is Base Sepolia (Chain ID: 84532)
- Ensure contract compiles: `forge build --contracts contracts/SplitBillEscrow.sol`

**"Foundry not found"**
- Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
- Run: `foundryup`
- Restart terminal
- Verify installation: `forge --version`

**"Private key invalid"**
- Remove `0x` prefix from private key
- Ensure key is exactly 64 hex characters
- Never use mainnet wallet with real funds
- Test key format: `echo $PRIVATE_KEY | wc -c` (should be 65 including newline)

#### Verification Issues

**"Verification failed"**
- Wait 1-2 minutes after deployment before verifying
- Check compiler version matches: `v0.8.20`
- Verify BaseScan API key is correct
- Contract might already be verified (check BaseScan)
- Try manual verification on BaseScan website

**"Contract not found"**
- Ensure deployment transaction confirmed
- Check contract address is correct
- View on explorer: `https://sepolia.basescan.org/address/YOUR_ADDRESS`

#### Frontend Integration Issues

**"Escrow toggle not showing"**
- Check `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` is set in `.env.local`
- Restart dev server after adding environment variable
- Verify address is not zero address
- Check `isEscrowAvailable()` returns true

**"Transaction fails when creating bill"**
- Ensure wallet is connected
- Check you're on Base Sepolia network
- Verify you have enough ETH for gas
- Check contract address is correct
- View error in browser console

**"Payment transaction rejected"**
- Verify participant is in the bill
- Check payment amount matches share exactly
- Ensure participant hasn't already paid
- Confirm wallet has enough ETH (share amount + gas)

**"Status not updating"**
- Wait 10 seconds for polling interval
- Check browser console for errors
- Verify contract address is correct
- Ensure RPC endpoint is responding
- Try refreshing the page

#### Network Issues

**"RPC request failed"**
- Check internet connection
- Try alternative RPC: `https://base-sepolia.blockpi.network/v1/rpc/public`
- Wait a few minutes and retry
- Check Base Sepolia network status

**"Transaction pending too long"**
- Base Sepolia can be slow during high usage
- Wait up to 5 minutes for confirmation
- Check transaction on BaseScan
- If stuck >10 minutes, may need to resubmit with higher gas

#### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Bill already exists" | Duplicate bill ID | Use different bill ID or check existing bill |
| "Already paid" | Duplicate payment | Check payment status before paying |
| "Not a participant" | Address not in bill | Verify participant was added to bill |
| "Incorrect amount" | Wrong payment amount | Check exact share amount required |
| "Bill not found" | Invalid bill ID | Verify bill was created on-chain |
| "Insufficient gas" | Not enough ETH | Get more ETH from faucet |
| "Wrong network" | Not on Base Sepolia | Switch to Base Sepolia in wallet |

#### Getting Help

If you're still stuck:

1. **Check Logs**
   - Browser console (F12)
   - Terminal output
   - Transaction hash on BaseScan

2. **Verify Setup**
   - Run `forge --version` (should show Foundry)
   - Check `.env.local` has correct values
   - Verify wallet has ETH on Base Sepolia

3. **Test Contract Directly**
   ```bash
   # Test reading from contract
   cast call $CONTRACT_ADDRESS \
     "getBillInfo(bytes32)" \
     0x0000000000000000000000000000000000000000000000000000000000000000 \
     --rpc-url https://sepolia.base.org
   ```

4. **Resources**
   - [Foundry Documentation](https://book.getfoundry.sh/)
   - [Base Documentation](https://docs.base.org/)
   - [Wagmi Documentation](https://wagmi.sh/)
   - [Base Discord](https://discord.gg/buildonbase)

5. **Debug Mode**
   - Enable verbose logging in browser console
   - Check network tab for failed requests
   - Use BaseScan to verify contract state

### Environment Variables

Required for deployment:
- `PRIVATE_KEY` - Deployer wallet private key (without 0x)
- `BASE_SEPOLIA_RPC_URL` - RPC endpoint (optional, defaults to public)
- `BASESCAN_API_KEY` - For contract verification (optional)

Required for frontend:
- `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS` - Deployed contract address

See `.env.local.example` for template.

### Integration with Frontend

The contract integrates with the frontend through Wagmi hooks. See the design document for full implementation details.

**Key Integration Points:**

1. **Contract Configuration** (`src/lib/config/escrow.ts`)
   - Contract ABI and address
   - Network validation
   - Availability checks

2. **Escrow Hooks** (`src/features/payment/hooks/`)
   - `useEscrow` - Write operations (create bill, pay share)
   - `useEscrowStatus` - Read operations (bill status, payment tracking)
   - `useParticipantPaymentStatus` - Check individual payment status

3. **UI Components** (`src/features/bill/components/`)
   - `EscrowToggle` - Enable/disable escrow for new bills
   - `EscrowPaymentButton` - Pay share via escrow
   - `EscrowStatusDisplay` - Show bill status and progress

**Example Usage:**

```typescript
import { useEscrow } from '@/features/payment/hooks/useEscrow';
import { generateEscrowBillId } from '@/lib/utils/escrow';

function PaymentButton({ bill, share }) {
  const { payEscrowShare, isPending } = useEscrow();
  
  const handlePay = async () => {
    const billId = generateEscrowBillId(bill.id);
    const amount = parseEther((share.amount * 0.001).toString());
    await payEscrowShare(billId, amount);
  };
  
  return (
    <button onClick={handlePay} disabled={isPending}>
      {isPending ? 'Processing...' : 'Pay via Escrow'}
    </button>
  );
}
```

### Security Considerations

**Current Implementation:**
- ✅ Checks-effects-interactions pattern (prevents reentrancy)
- ✅ Access control (only participants can pay)
- ✅ Amount validation (exact share required)
- ✅ Duplicate payment prevention
- ✅ No loops (gas-efficient)

**Before Mainnet Deployment:**
- [ ] Professional security audit
- [ ] Extensive testing with edge cases
- [ ] Consider adding pause mechanism
- [ ] Consider upgrade mechanism (proxy pattern)
- [ ] Add time limits for bills (prevent indefinite locks)
- [ ] Add dispute resolution mechanism
- [ ] Add emergency withdrawal for creator

**Security Best Practices:**
- Never deploy to mainnet without audit
- Test thoroughly on testnet first
- Use multi-sig for contract ownership
- Monitor contract events for suspicious activity
- Have incident response plan

### Gas Optimization

The contract is already optimized:
- ✅ Uses `calldata` for function parameters
- ✅ Minimal storage operations
- ✅ No loops in critical paths
- ✅ Events for off-chain data
- ✅ Efficient struct packing

**Estimated Gas Costs (Base Sepolia):**
- Create Bill: ~150,000 gas (~$0.50 at 50 gwei)
- Pay Share: ~80,000 gas (~$0.25 at 50 gwei)
- Settlement: Automatic (included in last payment)

### Testing

Create a test file for comprehensive testing:

```solidity
// test/SplitBillEscrow.t.sol
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/SplitBillEscrow.sol";

contract SplitBillEscrowTest is Test {
    SplitBillEscrow public escrow;
    address public creator = address(1);
    address public participant1 = address(2);
    address public participant2 = address(3);
    
    function setUp() public {
        escrow = new SplitBillEscrow();
        vm.deal(creator, 10 ether);
        vm.deal(participant1, 10 ether);
        vm.deal(participant2, 10 ether);
    }
    
    function testCreateBill() public {
        bytes32 billId = keccak256("test-bill");
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        
        uint256[] memory shares = new uint256[](2);
        shares[0] = 1 ether;
        shares[1] = 2 ether;
        
        vm.prank(creator);
        escrow.createBill(billId, participants, shares);
        
        (address billCreator, uint256 total, , , bool settled) = escrow.getBillInfo(billId);
        assertEq(billCreator, creator);
        assertEq(total, 3 ether);
        assertFalse(settled);
    }
    
    function testPayShare() public {
        // Setup bill
        bytes32 billId = keccak256("test-bill");
        address[] memory participants = new address[](1);
        participants[0] = participant1;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;
        
        vm.prank(creator);
        escrow.createBill(billId, participants, shares);
        
        // Pay share
        vm.prank(participant1);
        escrow.payShare{value: 1 ether}(billId);
        
        assertTrue(escrow.hasPaid(billId, participant1));
    }
    
    function testAutoSettle() public {
        // Setup bill with 2 participants
        bytes32 billId = keccak256("test-bill");
        address[] memory participants = new address[](2);
        participants[0] = participant1;
        participants[1] = participant2;
        uint256[] memory shares = new uint256[](2);
        shares[0] = 1 ether;
        shares[1] = 2 ether;
        
        vm.prank(creator);
        escrow.createBill(billId, participants, shares);
        
        uint256 creatorBalanceBefore = creator.balance;
        
        // Both participants pay
        vm.prank(participant1);
        escrow.payShare{value: 1 ether}(billId);
        
        vm.prank(participant2);
        escrow.payShare{value: 2 ether}(billId);
        
        // Check settlement
        (, , , , bool settled) = escrow.getBillInfo(billId);
        assertTrue(settled);
        assertEq(creator.balance, creatorBalanceBefore + 3 ether);
    }
    
    function testRevertDuplicatePayment() public {
        bytes32 billId = keccak256("test-bill");
        address[] memory participants = new address[](1);
        participants[0] = participant1;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;
        
        vm.prank(creator);
        escrow.createBill(billId, participants, shares);
        
        vm.prank(participant1);
        escrow.payShare{value: 1 ether}(billId);
        
        // Try to pay again
        vm.prank(participant1);
        vm.expectRevert("Already paid");
        escrow.payShare{value: 1 ether}(billId);
    }
}
```

Run tests:
```bash
forge test -vv
```

## Future Contracts

### BillNFT.sol
- Mint NFT as receipt for each bill
- Transferable proof of participation
- Collectible for frequent users

### ReputationSystem.sol
- Track payment history
- Issue badges for reliable payers
- Penalty for late/non-payment

### MultiTokenEscrow.sol
- Support USDC, DAI, and other tokens
- Automatic conversion
- Multi-currency bills
