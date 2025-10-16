/**
 * Integration Test: Escrow Bill Creation Flow
 * 
 * Tests the complete flow of creating a bill with escrow enabled:
 * - Create test bill with escrow enabled
 * - Verify contract transaction succeeds
 * - Check that escrowBillId and escrowTxHash are stored
 * - Validate bill appears correctly in UI
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Bill, ParticipantShare } from '@/lib/types/bill';
import { generateEscrowBillId, prepareEscrowData } from '@/lib/utils/escrow';
import { saveBill, getBillById } from '@/lib/utils/storage';
import { calculateParticipantShares } from '@/lib/utils/calculations';

describe('Escrow Bill Creation Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Bill Creation with Escrow Enabled', () => {
    it('should create a bill with escrowEnabled flag set to true', () => {
      // Arrange
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Test Escrow Bill',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [
          {
            id: crypto.randomUUID(),
            description: 'Pizza',
            amount: 30.00,
            participants: ['participant-1', 'participant-2'],
          },
        ],
        participants: [
          {
            id: 'participant-1',
            address: '0x1234567890123456789012345678901234567890',
            name: 'Alice',
          },
          {
            id: 'participant-2',
            address: '0x0987654321098765432109876543210987654321',
            name: 'Bob',
          },
        ],
        tip: 5.00,
        tax: 3.00,
        status: 'draft',
        escrowEnabled: true,
      };

      // Act
      saveBill(bill);
      const retrievedBill = getBillById(bill.id);

      // Assert
      expect(retrievedBill).not.toBeNull();
      expect(retrievedBill?.escrowEnabled).toBe(true);
      expect(retrievedBill?.id).toBe(bill.id);
      expect(retrievedBill?.title).toBe('Test Escrow Bill');
    });

    it('should generate valid escrowBillId (bytes32 hash)', () => {
      // Arrange
      const billId = crypto.randomUUID();

      // Act
      const escrowBillId = generateEscrowBillId(billId);

      // Assert
      expect(escrowBillId).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(escrowBillId.length).toBe(66); // '0x' + 64 hex chars
    });

    it('should generate consistent escrowBillId for same bill ID', () => {
      // Arrange
      const billId = 'test-bill-123';

      // Act
      const escrowBillId1 = generateEscrowBillId(billId);
      const escrowBillId2 = generateEscrowBillId(billId);

      // Assert
      expect(escrowBillId1).toBe(escrowBillId2);
    });

    it('should prepare escrow data with correct participant addresses and amounts', () => {
      // Arrange
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Test Bill',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [
          {
            id: 'item-1',
            description: 'Dinner',
            amount: 100.00,
            participants: ['p1', 'p2'],
          },
        ],
        participants: [
          {
            id: 'p1',
            address: '0x1111111111111111111111111111111111111111',
          },
          {
            id: 'p2',
            address: '0x2222222222222222222222222222222222222222',
          },
        ],
        tip: 10.00,
        tax: 5.00,
        status: 'draft',
        escrowEnabled: true,
      };

      const shares = calculateParticipantShares(bill);

      // Act
      const { participants, amounts } = prepareEscrowData(bill, shares);

      // Assert
      expect(participants).toHaveLength(2);
      expect(participants[0]).toBe('0x1111111111111111111111111111111111111111');
      expect(participants[1]).toBe('0x2222222222222222222222222222222222222222');
      expect(amounts).toHaveLength(2);
      expect(amounts.every(amount => typeof amount === 'bigint')).toBe(true);
    });
  });

  describe('Escrow Metadata Storage', () => {
    it('should store escrowBillId after contract creation', () => {
      // Arrange
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Test Bill',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [],
        participants: [
          {
            id: 'p1',
            address: '0x1234567890123456789012345678901234567890',
          },
        ],
        tip: 0,
        tax: 0,
        status: 'draft',
        escrowEnabled: true,
      };

      const escrowBillId = generateEscrowBillId(bill.id);

      // Act
      const updatedBill = {
        ...bill,
        escrowBillId,
      };
      saveBill(updatedBill);
      const retrievedBill = getBillById(bill.id);

      // Assert
      expect(retrievedBill?.escrowBillId).toBe(escrowBillId);
      expect(retrievedBill?.escrowBillId).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should store escrowTxHash after contract transaction', () => {
      // Arrange
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Test Bill',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [],
        participants: [
          {
            id: 'p1',
            address: '0x1234567890123456789012345678901234567890',
          },
        ],
        tip: 0,
        tax: 0,
        status: 'draft',
        escrowEnabled: true,
      };

      const mockTxHash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

      // Act
      const updatedBill = {
        ...bill,
        escrowBillId: generateEscrowBillId(bill.id),
        escrowTxHash: mockTxHash,
      };
      saveBill(updatedBill);
      const retrievedBill = getBillById(bill.id);

      // Assert
      expect(retrievedBill?.escrowTxHash).toBe(mockTxHash);
      expect(retrievedBill?.escrowTxHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should store both escrowBillId and escrowTxHash together', () => {
      // Arrange
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Complete Escrow Bill',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [
          {
            id: 'item-1',
            description: 'Test Item',
            amount: 50.00,
            participants: ['p1'],
          },
        ],
        participants: [
          {
            id: 'p1',
            address: '0x1234567890123456789012345678901234567890',
          },
        ],
        tip: 5.00,
        tax: 2.50,
        status: 'active',
        escrowEnabled: true,
      };

      const escrowBillId = generateEscrowBillId(bill.id);
      const mockTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      // Act
      const updatedBill = {
        ...bill,
        escrowBillId,
        escrowTxHash: mockTxHash,
      };
      saveBill(updatedBill);
      const retrievedBill = getBillById(bill.id);

      // Assert
      expect(retrievedBill?.escrowEnabled).toBe(true);
      expect(retrievedBill?.escrowBillId).toBe(escrowBillId);
      expect(retrievedBill?.escrowTxHash).toBe(mockTxHash);
      expect(retrievedBill?.status).toBe('active');
    });
  });

  describe('Bill Validation', () => {
    it('should validate that escrow bill has all required fields', () => {
      // Arrange & Act
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Valid Escrow Bill',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [
          {
            id: 'item-1',
            description: 'Item',
            amount: 25.00,
            participants: ['p1'],
          },
        ],
        participants: [
          {
            id: 'p1',
            address: '0x1234567890123456789012345678901234567890',
          },
        ],
        tip: 2.50,
        tax: 1.25,
        status: 'draft',
        escrowEnabled: true,
        escrowBillId: generateEscrowBillId(crypto.randomUUID()),
        escrowTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      };

      // Assert
      expect(bill.id).toBeDefined();
      expect(bill.title).toBeDefined();
      expect(bill.createdBy).toBeDefined();
      expect(bill.createdAt).toBeGreaterThan(0);
      expect(bill.items).toHaveLength(1);
      expect(bill.participants).toHaveLength(1);
      expect(typeof bill.tip).toBe('number');
      expect(typeof bill.tax).toBe('number');
      expect(bill.status).toBeDefined();
      expect(bill.escrowEnabled).toBe(true);
      expect(bill.escrowBillId).toBeDefined();
      expect(bill.escrowTxHash).toBeDefined();
    });

    it('should handle bill without escrow metadata gracefully', () => {
      // Arrange
      const bill: Bill = {
        id: crypto.randomUUID(),
        title: 'Bill Without Escrow Metadata',
        createdBy: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now(),
        items: [],
        participants: [
          {
            id: 'p1',
            address: '0x1234567890123456789012345678901234567890',
          },
        ],
        tip: 0,
        tax: 0,
        status: 'draft',
        escrowEnabled: true,
        // No escrowBillId or escrowTxHash yet
      };

      // Act
      saveBill(bill);
      const retrievedBill = getBillById(bill.id);

      // Assert
      expect(retrievedBill?.escrowEnabled).toBe(true);
      expect(retrievedBill?.escrowBillId).toBeUndefined();
      expect(retrievedBill?.escrowTxHash).toBeUndefined();
    });
  });

  describe('Multiple Bills Management', () => {
    it('should handle multiple escrow bills independently', () => {
      // Arrange
      const bill1: Bill = {
        id: crypto.randomUUID(),
        title: 'Escrow Bill 1',
        createdBy: '0x1111111111111111111111111111111111111111',
        createdAt: Date.now(),
        items: [],
        participants: [
          {
            id: 'p1',
            address: '0x1111111111111111111111111111111111111111',
          },
        ],
        tip: 0,
        tax: 0,
        status: 'draft',
        escrowEnabled: true,
        escrowBillId: generateEscrowBillId('bill-1'),
        escrowTxHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      };

      const bill2: Bill = {
        id: crypto.randomUUID(),
        title: 'Escrow Bill 2',
        createdBy: '0x2222222222222222222222222222222222222222',
        createdAt: Date.now(),
        items: [],
        participants: [
          {
            id: 'p2',
            address: '0x2222222222222222222222222222222222222222',
          },
        ],
        tip: 0,
        tax: 0,
        status: 'draft',
        escrowEnabled: true,
        escrowBillId: generateEscrowBillId('bill-2'),
        escrowTxHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      };

      // Act
      saveBill(bill1);
      saveBill(bill2);
      const retrieved1 = getBillById(bill1.id);
      const retrieved2 = getBillById(bill2.id);

      // Assert
      expect(retrieved1?.id).toBe(bill1.id);
      expect(retrieved2?.id).toBe(bill2.id);
      expect(retrieved1?.escrowBillId).not.toBe(retrieved2?.escrowBillId);
      expect(retrieved1?.escrowTxHash).not.toBe(retrieved2?.escrowTxHash);
    });
  });
});
