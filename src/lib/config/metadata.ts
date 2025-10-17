import { Address } from 'viem';

export const BILL_METADATA_ABI = [
  // publishBill - with IPFS, tags, privacy
  {
    type: 'function',
    name: 'publishBill',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'ipfsHash', type: 'string' },
      { name: 'tags', type: 'string[]' },
      { name: 'isPrivate', type: 'bool' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  // updateBill
  {
    type: 'function',
    name: 'updateBill',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'newIpfsHash', type: 'string' },
    ],
    outputs: [],
  },
  // getBill
  {
    type: 'function',
    name: 'getBill',
    stateMutability: 'view',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [
      { name: 'ipfsHash', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'tags', type: 'string[]' },
      { name: 'isPrivate', type: 'bool' },
      { name: 'rating', type: 'uint8' },
      { name: 'ratingCount', type: 'uint16' },
    ],
  },
  // getUserBills
  {
    type: 'function',
    name: 'getUserBills',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  // getBillsByTag
  {
    type: 'function',
    name: 'getBillsByTag',
    stateMutability: 'view',
    inputs: [{ name: 'tag', type: 'string' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  // grantAccess
  {
    type: 'function',
    name: 'grantAccess',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'user', type: 'address' },
    ],
    outputs: [],
  },
  // revokeAccess
  {
    type: 'function',
    name: 'revokeAccess',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'user', type: 'address' },
    ],
    outputs: [],
  },
  // rateBill
  {
    type: 'function',
    name: 'rateBill',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'rating', type: 'uint8' },
    ],
    outputs: [],
  },
  // hasAccess
  {
    type: 'function',
    name: 'hasAccess',
    stateMutability: 'view',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  // getUserStats
  {
    type: 'function',
    name: 'getUserStats',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'billsCount', type: 'uint256' },
      { name: 'amountTotal', type: 'uint256' },
      { name: 'lastActivityTime', type: 'uint256' },
    ],
  },
  // getGlobalStats
  {
    type: 'function',
    name: 'getGlobalStats',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'billsCount', type: 'uint256' },
      { name: 'volumeTotal', type: 'uint256' },
    ],
  },
  // getBillRating
  {
    type: 'function',
    name: 'getBillRating',
    stateMutability: 'view',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [
      { name: 'averageRating', type: 'uint8' },
      { name: 'ratingCount', type: 'uint16' },
    ],
  },
  // Events
  {
    type: 'event',
    name: 'BillPublished',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'ipfsHash', type: 'string', indexed: false },
      { name: 'isPrivate', type: 'bool', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'BillUpdated',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'newIpfsHash', type: 'string', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AccessGranted',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'grantedBy', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'BillRated',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'rater', type: 'address', indexed: true },
      { name: 'rating', type: 'uint8', indexed: false },
    ],
  },
] as const;

export const BILL_METADATA_CONTRACT_ADDRESS: Address | undefined =
  process.env.NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS as Address | undefined;

export const isMetadataRegistryConfigured = (): boolean => {
  return !!BILL_METADATA_CONTRACT_ADDRESS;
};
