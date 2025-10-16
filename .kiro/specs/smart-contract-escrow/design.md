# Design Document - Smart Contract Escrow Integration

## Overview

This design document outlines the integration of the `SplitBillEscrow` smart contract into the SplitBill frontend application. The integration will provide users with an optional escrow-based payment system alongside the existing direct payment method. The design follows the existing modular architecture, adding new hooks, utilities, and UI components while maintaining backward compatibility.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              UI Layer (Components)                    │  │
│  │  - EscrowToggle                                       │  │
│  │  - EscrowPaymentButton                                │  │
│  │  - EscrowStatusDisplay                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Feature Layer (Hooks)                       │  │
│  │  - useEscrow (contract interactions)                  │  │
│  │  - useEscrowStatus (status monitoring)                │  │
│  │  - useBill (extended with escrow support)             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Core Layer (Utils & Config)                │  │
│  │  - escrowConfig.ts (contract address & ABI)           │  │
│  │  - escrowUtils.ts (helper functions)                  │  │
│  │  - bill.ts (extended types)                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Wagmi / Viem Layer                        │
│  - useReadContract (read contract state)                    │
│  - useWriteContract (write to contract)                     │
│  - useWatchContractEvent (listen to events)                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              SplitBillEscrow Smart Contract                  │
│                    (Base Sepolia)                            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Type Extensions

**File:** `src/lib/types/bill.ts`

```typescript
// Extend existing Bill interface
export interface Bill {
  id: string;
  title: string;
  createdBy: string;
  createdAt: number;
  items: BillItem[];
  participants: Participant[];
  tip: number;
  tax: number;
  status: 'draft' | 'active' | 'settled';
  // NEW: Escrow-related fields
  escrowEnabled?: boolean;
  escrowBillId?: string; // bytes32 hash for contract
  escrowTxHash?: string; // creation transaction hash
}

// Extend ParticipantShare
export interface ParticipantShare {
  participantId: string;
  amount: number;
  paid: boolean;
  // NEW: Escrow payment tracking
  escrowPaid?: boolean;
  escrowTxHash?: string;
}

// NEW: Escrow status interface
export interface EscrowStatus {
  creator: string;
  totalAmount: bigint;
  participantCount: number;
  paidCount: number;
  settled: boolean;
}
```

### 2. Escrow Configuration

**File:** `src/lib/config/escrow.ts`

```typescript
import { Address } from 'viem';

// Contract ABI (generated from SplitBillEscrow.sol)
export const ESCROW_ABI = [
  // createBill function
  {
    name: 'createBill',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'participants', type: 'address[]' },
      { name: 'shares', type: 'uint256[]' },
    ],
    outputs: [],
  },
  // payShare function
  {
    name: 'payShare',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [],
  },
  // getBillInfo function
  {
    name: 'getBillInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'participantCount', type: 'uint256' },
      { name: 'paidCount', type: 'uint256' },
      { name: 'settled', type: 'bool' },
    ],
  },
  // hasPaid function
  {
    name: 'hasPaid',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'participant', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  // getShare function
  {
    name: 'getShare',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'participant', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Events
  {
    name: 'BillCreated',
    type: 'event',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'totalAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'PaymentReceived',
    type: 'event',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'participant', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'BillSettled',
    type: 'event',
    inputs: [{ name: 'billId', type: 'bytes32', indexed: true }],
  },
] as const;

// Contract address (to be set after deployment)
export const ESCROW_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as Address) ||
  '0x0000000000000000000000000000000000000000';

// Check if escrow is available
export const isEscrowAvailable = (): boolean => {
  return (
    ESCROW_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000'
  );
};
```

### 3. Escrow Utilities

**File:** `src/lib/utils/escrow.ts`

```typescript
import { keccak256, toBytes, parseEther } from 'viem';
import { Bill, ParticipantShare } from '@/lib/types/bill';

/**
 * Generate bytes32 bill ID for smart contract
 * Uses keccak256 hash of the UUID
 */
export function generateEscrowBillId(billId: string): `0x${string}` {
  return keccak256(toBytes(billId));
}

/**
 * Convert participant shares to contract format
 * Returns arrays of addresses and amounts in wei
 */
export function prepareEscrowData(
  bill: Bill,
  shares: ParticipantShare[],
): {
  participants: `0x${string}`[];
  amounts: bigint[];
} {
  const participants = bill.participants.map(
    (p) => p.address as `0x${string}`,
  );
  
  const amounts = shares.map((share) => {
    // Convert USD amount to ETH (for demo, 1 USD = 0.001 ETH)
    // In production, use real price oracle
    const ethAmount = share.amount * 0.001;
    return parseEther(ethAmount.toString());
  });

  return { participants, amounts };
}

/**
 * Format escrow status for display
 */
export function formatEscrowStatus(
  paidCount: number,
  totalCount: number,
): string {
  return `${paidCount}/${totalCount} paid`;
}

/**
 * Check if all participants have paid
 */
export function isEscrowComplete(paidCount: number, totalCount: number): boolean {
  return paidCount === totalCount && totalCount > 0;
}

/**
 * Get Base Sepolia explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
```

### 4. Escrow Hook

**File:** `src/features/payment/hooks/useEscrow.ts`

```typescript
'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { Bill, ParticipantShare } from '@/lib/types/bill';
import { generateEscrowBillId, prepareEscrowData } from '@/lib/utils/escrow';

export function useEscrow() {
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Create escrow bill in smart contract
   */
  const createEscrowBill = async (
    bill: Bill,
    shares: ParticipantShare[],
  ): Promise<string> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (chain?.id !== baseSepolia.id) {
      throw new Error('Please switch to Base Sepolia network');
    }

    const escrowBillId = generateEscrowBillId(bill.id);
    const { participants, amounts } = prepareEscrowData(bill, shares);

    writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'createBill',
      args: [escrowBillId, participants, amounts],
      chainId: baseSepolia.id,
    });

    return escrowBillId;
  };

  /**
   * Pay share via escrow contract
   */
  const payEscrowShare = async (
    escrowBillId: string,
    amount: bigint,
  ): Promise<void> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (chain?.id !== baseSepolia.id) {
      throw new Error('Please switch to Base Sepolia network');
    }

    writeContract({
      address: ESCROW_CONTRACT_ADDRESS,
      abi: ESCROW_ABI,
      functionName: 'payShare',
      args: [escrowBillId as `0x${string}`],
      value: amount,
      chainId: baseSepolia.id,
    });
  };

  return {
    createEscrowBill,
    payEscrowShare,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  };
}
```

### 5. Escrow Status Hook

**File:** `src/features/payment/hooks/useEscrowStatus.ts`

```typescript
'use client';

import { useReadContract, useWatchContractEvent } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';
import { EscrowStatus } from '@/lib/types/bill';
import { useEffect, useState } from 'react';

export function useEscrowStatus(escrowBillId?: string) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Read bill info from contract
  const { data, isLoading, refetch } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'getBillInfo',
    args: escrowBillId ? [escrowBillId as `0x${string}`] : undefined,
    query: {
      enabled: !!escrowBillId,
      refetchInterval: 10000, // Poll every 10 seconds
    },
  });

  // Watch for payment events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    eventName: 'PaymentReceived',
    onLogs: (logs) => {
      const relevantLog = logs.find(
        (log) => log.args.billId === escrowBillId,
      );
      if (relevantLog) {
        setLastUpdate(Date.now());
        refetch();
      }
    },
  });

  // Watch for settlement events
  useWatchContractEvent({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    eventName: 'BillSettled',
    onLogs: (logs) => {
      const relevantLog = logs.find(
        (log) => log.args.billId === escrowBillId,
      );
      if (relevantLog) {
        setLastUpdate(Date.now());
        refetch();
      }
    },
  });

  const escrowStatus: EscrowStatus | null = data
    ? {
        creator: data[0],
        totalAmount: data[1],
        participantCount: Number(data[2]),
        paidCount: Number(data[3]),
        settled: data[4],
      }
    : null;

  return {
    escrowStatus,
    isLoading,
    lastUpdate,
    refetch,
  };
}
```

### 6. Check Participant Payment Status Hook

**File:** `src/features/payment/hooks/useParticipantPaymentStatus.ts`

```typescript
'use client';

import { useReadContract } from 'wagmi';
import { ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from '@/lib/config/escrow';

export function useParticipantPaymentStatus(
  escrowBillId?: string,
  participantAddress?: string,
) {
  const { data: hasPaid, isLoading } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS,
    abi: ESCROW_ABI,
    functionName: 'hasPaid',
    args:
      escrowBillId && participantAddress
        ? [escrowBillId as `0x${string}`, participantAddress as `0x${string}`]
        : undefined,
    query: {
      enabled: !!escrowBillId && !!participantAddress,
      refetchInterval: 10000,
    },
  });

  return {
    hasPaid: hasPaid ?? false,
    isLoading,
  };
}
```

### 7. UI Components

#### EscrowToggle Component

**File:** `src/features/bill/components/EscrowToggle.tsx`

```typescript
'use client';

import { useState } from 'react';
import { isEscrowAvailable } from '@/lib/config/escrow';
import { useAccount } from 'wagmi';

interface EscrowToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function EscrowToggle({ enabled, onChange }: EscrowToggleProps) {
  const { isConnected } = useAccount();
  const [showInfo, setShowInfo] = useState(false);

  if (!isEscrowAvailable()) {
    return null; // Hide if escrow not deployed
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked)}
            disabled={!isConnected}
            className="rounded"
          />
          <span>Use Escrow Protection</span>
        </label>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-sm text-blue-600"
        >
          What's this?
        </button>
      </div>

      {showInfo && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <p className="font-semibold mb-1">Escrow Protection:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Funds locked until everyone pays</li>
            <li>Automatic settlement when complete</li>
            <li>On-chain proof of payment</li>
            <li>Small gas fee required</li>
          </ul>
        </div>
      )}

      {!isConnected && (
        <p className="text-sm text-gray-500">
          Connect wallet to enable escrow
        </p>
      )}
    </div>
  );
}
```

#### EscrowPaymentButton Component

**File:** `src/features/payment/components/EscrowPaymentButton.tsx`

```typescript
'use client';

import { useEscrow } from '../hooks/useEscrow';
import { useToast } from '@/lib/providers/ToastProvider';
import { getExplorerUrl } from '@/lib/utils/escrow';
import { parseEther } from 'viem';

interface EscrowPaymentButtonProps {
  escrowBillId: string;
  amount: number; // in USD
  disabled?: boolean;
}

export function EscrowPaymentButton({
  escrowBillId,
  amount,
  disabled,
}: EscrowPaymentButtonProps) {
  const { payEscrowShare, isPending, isConfirming, isSuccess, hash } =
    useEscrow();
  const { showToast } = useToast();

  const handlePay = async () => {
    try {
      // Convert USD to ETH (demo rate: 1 USD = 0.001 ETH)
      const ethAmount = amount * 0.001;
      const weiAmount = parseEther(ethAmount.toString());

      await payEscrowShare(escrowBillId, weiAmount);
      
      showToast('Payment submitted! Waiting for confirmation...', 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      showToast(message, 'error');
    }
  };

  if (isSuccess && hash) {
    return (
      <div className="text-center space-y-2">
        <p className="text-green-600 font-semibold">✓ Payment Successful!</p>
        <a
          href={getExplorerUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 underline"
        >
          View on Explorer
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handlePay}
      disabled={disabled || isPending || isConfirming}
      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending || isConfirming
        ? 'Processing...'
        : `Pay ${amount.toFixed(2)} USD via Escrow`}
    </button>
  );
}
```

#### EscrowStatusDisplay Component

**File:** `src/features/bill/components/EscrowStatusDisplay.tsx`

```typescript
'use client';

import { useEscrowStatus } from '@/features/payment/hooks/useEscrowStatus';
import { formatEscrowStatus, isEscrowComplete } from '@/lib/utils/escrow';

interface EscrowStatusDisplayProps {
  escrowBillId: string;
}

export function EscrowStatusDisplay({ escrowBillId }: EscrowStatusDisplayProps) {
  const { escrowStatus, isLoading } = useEscrowStatus(escrowBillId);

  if (isLoading) {
    return <div className="animate-pulse">Loading escrow status...</div>;
  }

  if (!escrowStatus) {
    return <div className="text-red-600">Escrow status unavailable</div>;
  }

  const isComplete = isEscrowComplete(
    escrowStatus.paidCount,
    escrowStatus.participantCount,
  );

  return (
    <div className="bg-gray-50 p-4 rounded space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Escrow Status:</span>
        <span
          className={`px-2 py-1 rounded text-sm ${
            escrowStatus.settled
              ? 'bg-green-100 text-green-800'
              : isComplete
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {escrowStatus.settled
            ? 'Settled'
            : isComplete
              ? 'Awaiting Settlement'
              : 'In Progress'}
        </span>
      </div>

      <div className="text-sm text-gray-600">
        <p>
          Payments:{' '}
          {formatEscrowStatus(
            escrowStatus.paidCount,
            escrowStatus.participantCount,
          )}
        </p>
      </div>

      {isComplete && !escrowStatus.settled && (
        <p className="text-sm text-yellow-600">
          All participants paid! Settlement in progress...
        </p>
      )}
    </div>
  );
}
```

## Data Models

### Extended Bill Storage

The bill data model is extended to include escrow metadata while maintaining backward compatibility:

```typescript
// Old bills (no escrow fields) continue to work
// New bills with escrow have additional fields:
{
  id: "uuid",
  title: "Dinner",
  // ... existing fields ...
  escrowEnabled: true,
  escrowBillId: "0x123...", // bytes32 hash
  escrowTxHash: "0xabc...", // creation tx
}
```

### Contract State Mapping

```
Frontend Bill ID (UUID) → keccak256 → Contract Bill ID (bytes32)
Frontend Participant → address → Contract Participant
Frontend Amount (USD) → conversion → Contract Amount (wei)
```

## Error Handling

### Error Types and Handling Strategy

1. **Wallet Not Connected**
   - Show: "Please connect your wallet"
   - Action: Disable escrow features

2. **Wrong Network**
   - Show: "Please switch to Base Sepolia"
   - Action: Prompt network switch

3. **Insufficient Gas**
   - Show: "Insufficient funds for gas fees"
   - Action: Display estimated gas cost

4. **Transaction Rejected**
   - Show: "Transaction rejected by user"
   - Action: Allow retry

5. **Contract Revert**
   - Parse revert reason
   - Show user-friendly message
   - Log technical details

6. **Network Error**
   - Show: "Network error, please try again"
   - Action: Retry with exponential backoff

### Error Boundary Integration

Leverage existing `AppErrorBoundary` for catastrophic failures. For escrow-specific errors, use toast notifications and inline error messages.

## Testing Strategy

### Unit Tests

1. **Utility Functions** (`escrow.ts`)
   - Test `generateEscrowBillId` produces consistent hashes
   - Test `prepareEscrowData` formats correctly
   - Test conversion functions

2. **Type Guards**
   - Test escrow availability check
   - Test bill type detection (escrow vs direct)

### Integration Tests

1. **Hooks** (`useEscrow`, `useEscrowStatus`)
   - Mock Wagmi hooks
   - Test state transitions
   - Test error handling

2. **Components**
   - Test EscrowToggle interactions
   - Test payment button states
   - Test status display updates

### E2E Tests (Manual for MVP)

1. Create escrow bill
2. Multiple participants pay
3. Verify settlement
4. Check transaction history

## Performance Considerations

### Optimization Strategies

1. **Contract Reads**
   - Use `refetchInterval` of 10 seconds (not too aggressive)
   - Cache contract data in React state
   - Only poll when bill page is active

2. **Event Listening**
   - Use `useWatchContractEvent` for real-time updates
   - Filter events by bill ID to reduce noise
   - Unsubscribe when component unmounts

3. **Gas Optimization**
   - Contract already optimized (no loops, minimal storage)
   - Use reasonable gas limits
   - Batch operations where possible (future enhancement)

4. **Bundle Size**
   - ABI is small (~2KB)
   - Lazy load escrow components
   - Tree-shake unused Wagmi hooks

## Security Considerations

### Frontend Security

1. **Input Validation**
   - Validate addresses before contract calls
   - Validate amounts are positive
   - Check bill ID format

2. **Transaction Safety**
   - Always show transaction preview
   - Display gas estimates
   - Confirm amounts before submission

3. **Contract Interaction**
   - Use typed ABI (TypeScript safety)
   - Handle all revert cases
   - Never expose private keys

### Smart Contract Security

The contract includes:
- Reentrancy protection (checks-effects-interactions pattern)
- Access control (only participants can pay)
- Amount validation (exact share required)
- Duplicate payment prevention

**Note:** Contract should be audited before mainnet deployment.

## Deployment Strategy

### Phase 1: Contract Deployment

1. Deploy `SplitBillEscrow.sol` to Base Sepolia
2. Verify contract on BaseScan
3. Test all functions manually
4. Record contract address

### Phase 2: Frontend Integration

1. Add contract address to `.env.local`
2. Implement hooks and utilities
3. Add UI components
4. Test with testnet

### Phase 3: User Testing

1. Create test bills with escrow
2. Invite test participants
3. Verify full payment flow
4. Check event listening

### Phase 4: Production (Future)

1. Audit smart contract
2. Deploy to Base mainnet
3. Update frontend config
4. Monitor for issues

## Migration and Backward Compatibility

### Handling Existing Bills

- Old bills (no `escrowEnabled` field) → treated as direct payment
- New bills → user chooses escrow or direct
- No data migration needed (additive changes only)

### Feature Flag

```typescript
// In config
export const ESCROW_FEATURE_ENABLED = isEscrowAvailable();

// In components
if (ESCROW_FEATURE_ENABLED) {
  // Show escrow option
}
```

### Graceful Degradation

If contract is not deployed or unavailable:
- Hide escrow toggle
- Fall back to direct payment
- Show informational message

## Future Enhancements

### Phase 3 Extensions

1. **Refund Mechanism**
   - Allow creator to cancel and refund
   - Time-based auto-refund

2. **Partial Payments**
   - Allow paying in installments
   - Track payment history

3. **Multi-Token Support**
   - Accept USDC, DAI, etc.
   - Token selection UI

4. **Bill NFTs**
   - Mint NFT as receipt
   - Display in wallet

5. **Reputation System**
   - Track payment reliability
   - Display badges

### Performance Improvements

1. **Optimistic UI**
   - Update UI before confirmation
   - Revert on failure

2. **Batch Operations**
   - Create multiple bills at once
   - Batch payment queries

3. **Caching Layer**
   - Cache contract reads
   - Reduce RPC calls

## Conclusion

This design provides a robust, scalable integration of the escrow smart contract while maintaining the existing architecture patterns. The modular approach allows for easy testing, future enhancements, and graceful degradation if the contract is unavailable.
