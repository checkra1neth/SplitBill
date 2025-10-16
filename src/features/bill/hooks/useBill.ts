'use client';

import { useState, useEffect } from 'react';
import { Bill, BillItem, Participant } from '@/lib/types/bill';
import { saveBill, getBillById } from '@/lib/utils/storage';
import { trackEvent } from '@/lib/utils/analytics';

export function useBill(billId?: string) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (billId) {
      const loadedBill = getBillById(billId);
      setBill(loadedBill);
    }
  }, [billId, refreshTrigger]);

  const refreshBill = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const createBill = (title: string, creatorAddress: string, escrowEnabled: boolean = false) => {
    const newBill: Bill = {
      id: crypto.randomUUID(),
      title,
      createdBy: creatorAddress,
      createdAt: Date.now(),
      items: [],
      participants: [{
        id: crypto.randomUUID(),
        address: creatorAddress,
      }],
      tip: 0,
      tax: 0,
      status: 'draft',
      escrowEnabled,
    };
    setBill(newBill);
    saveBill(newBill);
    return newBill;
  };

  const updateEscrowMetadata = (escrowBillId: string, escrowTxHash: string) => {
    if (!bill) return;
    
    const updatedBill = {
      ...bill,
      escrowBillId,
      escrowTxHash,
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);

    // Track successful escrow bill creation
    trackEvent('escrow_bill_created', {
      billId: bill.id,
      participantCount: bill.participants.length,
    });
  };

  const addParticipant = (
    participant: { address: string; name?: string; basename?: string },
  ): Participant | null => {
    if (!bill) return null;
    
    const normalizedAddress = participant.address.toLowerCase();

    const exists = bill.participants.some(
      (existing) => existing.address.toLowerCase() === normalizedAddress,
    );

    if (exists) {
      return null;
    }
    
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      address: participant.address,
      name: participant.name,
      basename: participant.basename,
    };
    
    const updatedBill = {
      ...bill,
      participants: [...bill.participants, newParticipant],
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
    return newParticipant;
  };

  const removeParticipant = (participantId: string): boolean => {
    if (!bill) return false;
    
    // Don't allow removing the bill creator
    const participantToRemove = bill.participants.find(p => p.id === participantId);
    if (!participantToRemove) return false;
    
    if (participantToRemove.address.toLowerCase() === bill.createdBy.toLowerCase()) {
      return false;
    }

    // Don't allow removing participants if escrow is already activated
    if (bill.escrowBillId) {
      return false;
    }
    
    const updatedBill = {
      ...bill,
      participants: bill.participants.filter(p => p.id !== participantId),
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
    return true;
  };

  const addItem = (description: string, amount: number, participantIds: string[]) => {
    if (!bill) return;
    
    const newItem: BillItem = {
      id: crypto.randomUUID(),
      description,
      amount,
      participants: participantIds,
    };
    
    const updatedBill = {
      ...bill,
      items: [...bill.items, newItem],
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
  };

  const updateTipAndTax = (tip: number, tax: number) => {
    if (!bill) return;
    
    const updatedBill = {
      ...bill,
      tip,
      tax,
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
  };

  const updateStatus = (status: Bill['status']) => {
    if (!bill) return;
    
    const updatedBill = {
      ...bill,
      status,
    };
    
    setBill(updatedBill);
    saveBill(updatedBill);
  };

  return {
    bill,
    createBill,
    addParticipant,
    removeParticipant,
    addItem,
    updateTipAndTax,
    updateStatus,
    updateEscrowMetadata,
    refreshBill,
  };
}
