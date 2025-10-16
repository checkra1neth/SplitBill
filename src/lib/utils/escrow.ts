import { keccak256, toBytes, parseEther } from 'viem';
import { Bill, ParticipantShare } from '@/lib/types/bill';

/**
 * Generate bytes32 bill ID for smart contract
 * Uses keccak256 hash of the UUID
 * @param billId - The UUID of the bill
 * @returns bytes32 hash suitable for contract use
 */
export function generateEscrowBillId(billId: string): `0x${string}` {
  return keccak256(toBytes(billId));
}

/**
 * Convert participant shares to contract format
 * Returns arrays of addresses and amounts in wei
 * @param bill - The bill containing participant information
 * @param shares - Array of participant shares with amounts
 * @param ethPrice - Current ETH price in USD (from price oracle)
 * @returns Object with participants addresses and amounts in wei
 */
export function prepareEscrowData(
  bill: Bill,
  shares: ParticipantShare[],
  ethPrice: number,
): {
  participants: `0x${string}`[];
  amounts: bigint[];
} {
  const payableShares = shares.filter((share) => share.amount > 0);

  if (payableShares.length === 0) {
    throw new Error('Bill has no payable participants. Add amounts before activating escrow.');
  }

  const participants = payableShares.map((share) => {
    const participant = bill.participants.find((p) => p.id === share.participantId);
    if (!participant) {
      throw new Error('Participant referenced in shares was not found in bill.');
    }
    return participant.address as `0x${string}`;
  });

  const amounts = payableShares.map((share) => {
    // Convert USD amount to ETH using real price
    const ethAmount = share.amount / ethPrice;

    // Round to 18 decimal places (wei precision)
    // This prevents floating point errors
    const ethAmountFixed = parseFloat(ethAmount.toFixed(18));

    return parseEther(ethAmountFixed.toString());
  });

  return { participants, amounts };
}

/**
 * Format escrow status for display
 * @param paidCount - Number of participants who have paid
 * @param totalCount - Total number of participants
 * @returns Formatted string like "2/5 paid"
 */
export function formatEscrowStatus(
  paidCount: number,
  totalCount: number,
): string {
  return `${paidCount}/${totalCount} paid`;
}

/**
 * Check if all participants have paid
 * @param paidCount - Number of participants who have paid
 * @param totalCount - Total number of participants
 * @returns true if all participants have paid
 */
export function isEscrowComplete(
  paidCount: number,
  totalCount: number,
): boolean {
  return paidCount === totalCount && totalCount > 0;
}

/**
 * Get Base Sepolia explorer URL for transaction
 * @param txHash - Transaction hash
 * @returns Full URL to view transaction on BaseScan
 */
export function getExplorerUrl(txHash: string): string {
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
