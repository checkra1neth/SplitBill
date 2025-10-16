import { Bill, ParticipantShare } from '@/lib/types/bill';
import { type SupportedCurrency } from './currency';

export function calculateParticipantShares(bill: Bill): ParticipantShare[] {
  const shares: Map<string, number> = new Map();

  // Initialize all participants with 0
  bill.participants.forEach((p) => shares.set(p.id, 0));

  // Calculate item shares
  bill.items.forEach((item) => {
    const sharePerPerson = item.amount / item.participants.length;
    item.participants.forEach((participantId) => {
      const current = shares.get(participantId) || 0;
      shares.set(participantId, current + sharePerPerson);
    });
  });

  // Calculate subtotal
  const subtotal = Array.from(shares.values()).reduce((sum, val) => sum + val, 0);

  // Add proportional tax and tip
  return bill.participants.map((participant) => {
    const baseAmount = shares.get(participant.id) || 0;
    const proportion = subtotal > 0 ? baseAmount / subtotal : 0;
    const taxShare = bill.tax * proportion;
    const tipShare = bill.tip * proportion;
    const totalAmount = baseAmount + taxShare + tipShare;

    return {
      participantId: participant.id,
      amount: totalAmount,
      paid: false,
    };
  });
}

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD',
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
