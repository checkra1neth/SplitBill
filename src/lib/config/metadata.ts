import { Address } from 'viem';

export const BILL_METADATA_ABI = [
  {
    type: 'function',
    name: 'publishBill',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'billId', type: 'bytes32' },
      { name: 'metadata', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getBill',
    stateMutability: 'view',
    inputs: [{ name: 'billId', type: 'bytes32' }],
    outputs: [
      { name: 'metadata', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'updatedAt', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'BillPublished',
    inputs: [
      { name: 'billId', type: 'bytes32', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'updatedAt', type: 'uint256', indexed: false },
    ],
  },
] as const;

export const BILL_METADATA_CONTRACT_ADDRESS: Address | undefined =
  process.env.NEXT_PUBLIC_BILL_METADATA_CONTRACT_ADDRESS as Address | undefined;

export const isMetadataRegistryConfigured = (): boolean => {
  return !!BILL_METADATA_CONTRACT_ADDRESS;
};
