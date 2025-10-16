# Debug Escrow Payment Issue

## Проблема
Ошибка: "failed to estimate gas for user operation: useroperation reverted: Incorrect amount"

## Причина
Контракт ожидает точную сумму, которая была записана при создании escrow bill, но отправляется другая сумма.

## Что проверить

### 1. На BaseScan
Открой "View on BaseScan" и проверь:
- Contract Address: `0x8Aad350ee989Bb9b418d15CFc44635538b5d7a79`
- Найди функцию `getShare(billId, yourAddress)`
- Посмотри какая сумма записана в wei

### 2. В консоли браузера
```javascript
// Проверь сумму в контракте
const billId = "YOUR_ESCROW_BILL_ID"; // из localStorage
const address = "0x984F...2D4f";

// Эта сумма должна совпадать с тем что отправляется
```

### 3. Проверь расчеты
- Bill Total: $300.00
- Participants: 2
- Per Person: $150.00
- В ETH (demo rate 0.001): 0.150 ETH

## Возможные причины

### Причина 1: Разные участники
При создании контракта были одни участники, а сейчас другие.

**Решение**: Пересоздать счет

### Причина 2: Изменились позиции
После активации escrow были добавлены/изменены позиции.

**Решение**: Нельзя менять позиции после активации escrow

### Причина 3: Округление
Проблема с округлением при конвертации USD → ETH → Wei

**Решение**: Использовать точные суммы из контракта

## Быстрое решение

### Вариант 1: Пересоздать счет (рекомендуется)
1. Создай новый счет
2. Добавь позиции (например: 1 позиция $100)
3. Добавь участников
4. Активируй escrow
5. НЕ МЕНЯЙ позиции после активации
6. Оплати

### Вариант 2: Проверить контракт
1. Открой BaseScan
2. Найди функцию `getBillInfo`
3. Введи escrowBillId
4. Посмотри participantCount и totalAmount
5. Сравни с тем что в UI

### Вариант 3: Использовать getShare
Нужно изменить код чтобы читать точную сумму из контракта перед оплатой.

## Код для фикса

Добавить в EscrowPaymentButton:
```typescript
// Read exact amount from contract
const { data: contractShare } = useReadContract({
  address: ESCROW_CONTRACT_ADDRESS,
  abi: ESCROW_ABI,
  functionName: 'getShare',
  args: [escrowBillId, address],
});

// Use contract amount instead of calculated
const weiAmount = contractShare || parseEther(ethAmount.toString());
```

## Временное решение

Пока не исправлено, используй Direct Payment (без escrow) - он работает нормально.

Или создай простой счет:
- 1 позиция: $10
- 2 участника
- Total: $10
- Per person: $5
- В ETH: 0.005 ETH

Это проще для тестирования.
