import { Bill } from '@/lib/types/bill';

const STORAGE_KEY = 'splitbill_bills';
let memoryStore: Bill[] = [];

const readPersistentStores = (): Bill[] => {
  if (typeof window === 'undefined') {
    return memoryStore;
  }

  const sources: Array<() => string | null> = [
    () => window.sessionStorage.getItem(STORAGE_KEY),
    () => window.localStorage.getItem(STORAGE_KEY),
  ];

  for (const getSource of sources) {
    try {
      const raw = getSource();
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as Bill[];
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        return memoryStore;
      }
    } catch (error) {
      console.error('Failed to read bills from storage:', error);
    }
  }

  memoryStore = [];
  return memoryStore;
};

const writePersistentStores = (bills: Bill[]): void => {
  memoryStore = bills;

  if (typeof window === 'undefined') {
    return;
  }

  const payload = JSON.stringify(bills);

  try {
    window.sessionStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.error('Failed to persist bills to sessionStorage:', error);
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.error('Failed to persist bills to localStorage:', error);
  }
};

export function saveBill(bill: Bill): void {
  const bills = readPersistentStores();
  const index = bills.findIndex((b) => b.id === bill.id);

  if (index >= 0) {
    bills[index] = bill;
  } else {
    bills.push(bill);
  }

  writePersistentStores([...bills]);
}

export function getAllBills(): Bill[] {
  return [...readPersistentStores()];
}

export function getBillById(id: string): Bill | null {
  const bills = readPersistentStores();
  return bills.find((b) => b.id === id) || null;
}

export function deleteBill(id: string): void {
  const bills = readPersistentStores().filter((b) => b.id !== id);
  writePersistentStores(bills);
}
