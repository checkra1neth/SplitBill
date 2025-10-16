// Этот файл можно использовать для проверки типов в TypeScript

import { Bill, ParticipantShare } from './src/lib/types/bill';

// Старый счет без escrow полей - должен компилироваться
const oldBill: Bill = {
  id: 'old-bill-1',
  title: 'Old Bill',
  createdBy: '0x1234567890123456789012345678901234567890',
  createdAt: Date.now(),
  items: [],
  participants: [],
  tip: 0,
  tax: 0,
  status: 'active',
  // escrowEnabled, escrowBillId, escrowTxHash отсутствуют
};

// Новый счет с escrowEnabled: false - должен компилироваться
const newBillDirect: Bill = {
  id: 'new-bill-direct',
  title: 'New Direct Bill',
  createdBy: '0x1234567890123456789012345678901234567890',
  createdAt: Date.now(),
  items: [],
  participants: [],
  tip: 0,
  tax: 0,
  status: 'active',
  escrowEnabled: false,
};

// Новый счет с escrow - должен компилироваться
const newBillEscrow: Bill = {
  id: 'new-bill-escrow',
  title: 'New Escrow Bill',
  createdBy: '0x1234567890123456789012345678901234567890',
  createdAt: Date.now(),
  items: [],
  participants: [],
  tip: 0,
  tax: 0,
  status: 'active',
  escrowEnabled: true,
  escrowBillId: '0x1234...',
  escrowTxHash: '0xabcd...',
};

// Функция для безопасной работы с опциональными полями
function processEscrowBill(bill: Bill): void {
  // Проверка типа с type guard
  if (bill.escrowEnabled && bill.escrowBillId) {
    // TypeScript знает, что здесь escrowBillId определен
    console.log('Escrow Bill ID:', bill.escrowBillId);
    
    // Optional chaining для безопасного доступа
    console.log('Escrow TX Hash:', bill.escrowTxHash ?? 'Not available');
  } else {
    console.log('Direct payment bill');
  }
}

// ParticipantShare с опциональными полями
const shareOld: ParticipantShare = {
  participantId: 'p1',
  amount: 10,
  paid: false,
};

const shareNew: ParticipantShare = {
  participantId: 'p2',
  amount: 20,
  paid: false,
  escrowPaid: true,
  escrowTxHash: '0x1234...',
};

// Все варианты должны компилироваться без ошибок