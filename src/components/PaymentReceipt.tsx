'use client';

interface PaymentReceiptProps {
  participantName: string;
  amount: number;
  txHash?: string;
  paid: boolean;
}

export function PaymentReceipt({
  participantName,
  amount,
  txHash,
  paid,
}: PaymentReceiptProps) {
  if (!paid || !txHash) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg bg-green-50 p-3 dark:bg-green-950">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            ✅ Paid by {participantName}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Amount: ${amount.toFixed(2)}
          </p>
        </div>
        <a
          href={`https://sepolia.basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-green-600 hover:underline dark:text-green-400"
        >
          Receipt →
        </a>
      </div>
    </div>
  );
}
