import { Address } from 'viem';

/**
 * Contract ABI for SplitBillEscrow
 * Generated from SplitBillEscrow.sol
 */
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
      { name: 'cancelled', type: 'bool' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  // isExpired function
  {
    name: 'isExpired',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  // getTimeRemaining function
  {
    name: 'getTimeRemaining',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // getPaidAmount function
  {
    name: 'getPaidAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'participant', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // canRefund function
  {
    name: 'canRefund',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'participant', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  // cancelAndRefund function
  {
    name: 'cancelAndRefund',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [],
  },
  // autoRefundIfExpired function
  {
    name: 'autoRefundIfExpired',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [],
  },
  // partialSettle function
  {
    name: 'partialSettle',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [],
  },
  // refundParticipant function
  {
    name: 'refundParticipant',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'participant', type: 'address' },
    ],
    outputs: [],
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
      { name: 'deadline', type: 'uint256', indexed: false },
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
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'totalAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'BillCancelled',
    type: 'event',
    inputs: [{ name: 'billId', type: 'bytes32', indexed: true }],
  },
  {
    name: 'RefundIssued',
    type: 'event',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'participant', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'PartialSettlement',
    type: 'event',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'settledAmount', type: 'uint256', indexed: false },
      { name: 'participantsPaid', type: 'uint256', indexed: false },
    ],
  },
] as const;

/**
 * Contract address from environment variable
 * Defaults to zero address if not configured
 */
export const ESCROW_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as Address) ||
  '0x0000000000000000000000000000000000000000';

/**
 * Check if escrow functionality is available
 * Returns true if contract address is configured (not zero address)
 */
export const isEscrowAvailable = (): boolean => {
  return (
    ESCROW_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
    ESCROW_CONTRACT_ADDRESS !== undefined
  );
};
