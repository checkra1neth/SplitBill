export interface Participant {
  id: string;
  address: string;
  name?: string;
  basename?: string;
}

export interface BillItem {
  id: string;
  description: string;
  amount: number;
  participants: string[]; // participant IDs
}

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
  // Escrow-related fields
  escrowEnabled?: boolean;
  escrowBillId?: string; // bytes32 hash for contract
  escrowTxHash?: string; // creation transaction hash
}

export interface ParticipantShare {
  participantId: string;
  amount: number;
  paid: boolean;
  // Escrow payment tracking
  escrowPaid?: boolean;
  escrowTxHash?: string;
}

/**
 * Escrow status from smart contract
 */
export interface EscrowStatus {
  creator: string;
  totalAmount: bigint;
  participantCount: number;
  paidCount: number;
  settled: boolean;
}
