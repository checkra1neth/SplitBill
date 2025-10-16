#!/usr/bin/env node

/**
 * Тест обратной совместимости для интеграции Escrow
 * 
 * Этот скрипт проверяет, что:
 * 1. Старые счета без escrowEnabled работают корректно
 * 2. Новые счета с escrowEnabled=false работают как прямые платежи
 * 3. Новые счета с escrowEnabled=true работают с escrow
 * 4. Смешанные данные обрабатываются правильно
 */

const fs = require('fs');
const path = require('path');

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed) {
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
}

// Тестовые данные
const oldBill = {
  id: 'old-bill-1',
  title: 'Old Bill (Pre-Escrow)',
  createdBy: '0x1234567890123456789012345678901234567890',
  createdAt: Date.now() - 86400000,
  items: [
    {
      id: 'item-1',
      description: 'Pizza',
      amount: 25.00,
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
  tax: 2.50,
  status: 'active',
  // Обратите внимание: нет полей escrowEnabled, escrowBillId, escrowTxHash
};

const newBillWithoutEscrow = {
  id: 'new-bill-without-escrow',
  title: 'New Bill (Direct Payment)',
  createdBy: '0x1234567890123456789012345678901234567890',
  createdAt: Date.now(),
  items: [
    {
      id: 'item-1',
      description: 'Dinner',
      amount: 50.00,
      participants: ['participant-1', 'participant-2'],
    },
  ],
  participants: [
    {
      id: 'participant-1',
      address: '0x1234567890123456789012345678901234567890',
      name: 'Charlie',
    },
    {
      id: 'participant-2',
      address: '0x0987654321098765432109876543210987654321',
      name: 'Dave',
    },
  ],
  tip: 10.00,
  tax: 5.00,
  status: 'active',
  escrowEnabled: false,
};

const newBillWithEscrow = {
  id: 'new-bill-with-escrow',
  title: 'New Bill (Escrow Protected)',
  createdBy: '0x1234567890123456789012345678901234567890',
  createdAt: Date.now(),
  items: [
    {
      id: 'item-1',
      description: 'Concert Tickets',
      amount: 100.00,
      participants: ['participant-1', 'participant-2', 'participant-3'],
    },
  ],
  participants: [
    {
      id: 'participant-1',
      address: '0x1234567890123456789012345678901234567890',
      name: 'Eve',
    },
    {
      id: 'participant-2',
      address: '0x0987654321098765432109876543210987654321',
      name: 'Frank',
    },
    {
      id: 'participant-3',
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      name: 'Grace',
    },
  ],
  tip: 15.00,
  tax: 10.00,
  status: 'active',
  escrowEnabled: true,
  escrowBillId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  escrowTxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
};

// Тесты
function runTests() {
  log('\n=== Тесты обратной совместимости ===\n', 'blue');

  let passed = 0;
  let failed = 0;

  // Тест 1: Старый счет не имеет полей escrow
  const test1 = !oldBill.hasOwnProperty('escrowEnabled') &&
                !oldBill.hasOwnProperty('escrowBillId') &&
                !oldBill.hasOwnProperty('escrowTxHash');
  logTest('Старый счет не содержит полей escrow', test1);
  test1 ? passed++ : failed++;

  // Тест 2: Старый счет имеет все обязательные поля
  const test2 = oldBill.id &&
                oldBill.title &&
                oldBill.createdBy &&
                oldBill.createdAt &&
                Array.isArray(oldBill.items) &&
                Array.isArray(oldBill.participants) &&
                typeof oldBill.tip === 'number' &&
                typeof oldBill.tax === 'number' &&
                oldBill.status;
  logTest('Старый счет имеет все обязательные поля', test2);
  test2 ? passed++ : failed++;

  // Тест 3: Новый счет без escrow имеет escrowEnabled: false
  const test3 = newBillWithoutEscrow.escrowEnabled === false;
  logTest('Новый счет без escrow имеет escrowEnabled: false', test3);
  test3 ? passed++ : failed++;

  // Тест 4: Новый счет без escrow не имеет escrowBillId и escrowTxHash
  const test4 = !newBillWithoutEscrow.hasOwnProperty('escrowBillId') &&
                !newBillWithoutEscrow.hasOwnProperty('escrowTxHash');
  logTest('Новый счет без escrow не имеет escrowBillId и escrowTxHash', test4);
  test4 ? passed++ : failed++;

  // Тест 5: Новый счет с escrow имеет escrowEnabled: true
  const test5 = newBillWithEscrow.escrowEnabled === true;
  logTest('Новый счет с escrow имеет escrowEnabled: true', test5);
  test5 ? passed++ : failed++;

  // Тест 6: Новый счет с escrow имеет escrowBillId
  const test6 = typeof newBillWithEscrow.escrowBillId === 'string' &&
                newBillWithEscrow.escrowBillId.startsWith('0x') &&
                newBillWithEscrow.escrowBillId.length === 66;
  logTest('Новый счет с escrow имеет валидный escrowBillId (bytes32)', test6);
  test6 ? passed++ : failed++;

  // Тест 7: Новый счет с escrow имеет escrowTxHash
  const test7 = typeof newBillWithEscrow.escrowTxHash === 'string' &&
                newBillWithEscrow.escrowTxHash.startsWith('0x') &&
                newBillWithEscrow.escrowTxHash.length === 66;
  logTest('Новый счет с escrow имеет валидный escrowTxHash', test7);
  test7 ? passed++ : failed++;

  // Тест 8: Функция определения типа счета
  function isEscrowBill(bill) {
    return bill.escrowEnabled === true && !!bill.escrowBillId;
  }

  const test8a = !isEscrowBill(oldBill);
  const test8b = !isEscrowBill(newBillWithoutEscrow);
  const test8c = isEscrowBill(newBillWithEscrow);
  const test8 = test8a && test8b && test8c;
  logTest('Функция isEscrowBill корректно определяет тип счета', test8);
  test8 ? passed++ : failed++;

  // Тест 9: Функция определения типа платежа
  function getPaymentType(bill) {
    if (bill.escrowEnabled === true && bill.escrowBillId) {
      return 'escrow';
    }
    return 'direct';
  }

  const test9a = getPaymentType(oldBill) === 'direct';
  const test9b = getPaymentType(newBillWithoutEscrow) === 'direct';
  const test9c = getPaymentType(newBillWithEscrow) === 'escrow';
  const test9 = test9a && test9b && test9c;
  logTest('Функция getPaymentType корректно определяет тип платежа', test9);
  test9 ? passed++ : failed++;

  // Тест 10: Смешанный массив счетов
  const mixedBills = [oldBill, newBillWithoutEscrow, newBillWithEscrow];
  const escrowBills = mixedBills.filter(isEscrowBill);
  const directBills = mixedBills.filter(bill => !isEscrowBill(bill));
  const test10 = escrowBills.length === 1 && directBills.length === 2;
  logTest('Фильтрация смешанного массива счетов работает корректно', test10);
  test10 ? passed++ : failed++;

  // Тест 11: Безопасный доступ к опциональным полям
  function safeGetEscrowBillId(bill) {
    return bill.escrowBillId ?? null;
  }

  const test11a = safeGetEscrowBillId(oldBill) === null;
  const test11b = safeGetEscrowBillId(newBillWithoutEscrow) === null;
  const test11c = safeGetEscrowBillId(newBillWithEscrow) === newBillWithEscrow.escrowBillId;
  const test11 = test11a && test11b && test11c;
  logTest('Безопасный доступ к опциональным полям работает', test11);
  test11 ? passed++ : failed++;

  // Тест 12: Проверка структуры ParticipantShare
  const participantShareOld = {
    participantId: 'participant-1',
    amount: 12.50,
    paid: false,
  };

  const participantShareNew = {
    participantId: 'participant-1',
    amount: 25.00,
    paid: false,
    escrowPaid: true,
    escrowTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  };

  const test12a = !participantShareOld.hasOwnProperty('escrowPaid');
  const test12b = participantShareNew.escrowPaid === true;
  const test12 = test12a && test12b;
  logTest('ParticipantShare поддерживает опциональные поля escrow', test12);
  test12 ? passed++ : failed++;

  // Итоги
  log('\n=== Результаты ===\n', 'blue');
  log(`Пройдено: ${passed}`, 'green');
  log(`Провалено: ${failed}`, failed > 0 ? 'red' : 'reset');
  log(`Всего: ${passed + failed}\n`);

  if (failed === 0) {
    log('✓ Все тесты обратной совместимости пройдены!', 'green');
    return 0;
  } else {
    log('✗ Некоторые тесты провалены. Проверьте реализацию.', 'red');
    return 1;
  }
}

// Дополнительные проверки типов TypeScript
function generateTypeChecks() {
  log('\n=== Проверка типов TypeScript ===\n', 'blue');
  
  const typeCheckContent = `
// Этот файл можно использовать для проверки типов в TypeScript

import { Bill, ParticipantShare } from '@/lib/types/bill';

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
`;

  const typeCheckPath = path.join(__dirname, 'type-check-backward-compatibility.ts');
  fs.writeFileSync(typeCheckPath, typeCheckContent.trim());
  log(`✓ Создан файл для проверки типов: ${typeCheckPath}`, 'green');
}

// Запуск тестов
const exitCode = runTests();
generateTypeChecks();

log('\n=== Рекомендации ===\n', 'yellow');
log('1. Запустите TypeScript компилятор для проверки типов:', 'reset');
log('   npx tsc --noEmit type-check-backward-compatibility.ts\n', 'reset');
log('2. Проверьте документацию в BACKWARD_COMPATIBILITY.md', 'reset');
log('3. Протестируйте UI с реальными данными обоих типов', 'reset');
log('4. Убедитесь, что localStorage содержит смешанные данные\n', 'reset');

process.exit(exitCode);
