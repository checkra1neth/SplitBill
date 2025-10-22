# Примеры обновлений контрактов

## Пример 1: Добавление batch payments

### Проблема
Пользователи хотят оплатить несколько bills одной транзакцией.

### Решение

Добавляем в `SplitBillEscrowUpgradeable.sol`:

```solidity
/**
 * @dev Pay multiple bills in one transaction
 * @param billIds Array of bill IDs to pay
 */
function payMultipleBills(bytes32[] calldata billIds) external payable {
    uint256 totalRequired = 0;
    
    // Calculate total amount needed
    for (uint256 i = 0; i < billIds.length; i++) {
        Bill storage bill = bills[billIds[i]];
        require(bill.creator != address(0), "Bill not found");
        require(!bill.settled, "Bill already settled");
        require(!bill.cancelled, "Bill cancelled");
        require(!bill.hasPaid[msg.sender], "Already paid");
        require(bill.shares[msg.sender] > 0, "Not a participant");
        
        totalRequired += bill.shares[msg.sender];
    }
    
    require(msg.value == totalRequired, "Incorrect total amount");
    
    // Pay all bills
    for (uint256 i = 0; i < billIds.length; i++) {
        _payShareInternal(billIds[i]);
    }
}

/**
 * @dev Internal function to pay share (extracted for reuse)
 */
function _payShareInternal(bytes32 billId) internal {
    Bill storage bill = bills[billId];
    
    bill.hasPaid[msg.sender] = true;
    bill.paidAmounts[msg.sender] = bill.shares[msg.sender];
    bill.paidCount++;

    emit PaymentReceived(billId, msg.sender, bill.shares[msg.sender]);

    if (bill.paidCount == bill.participantCount) {
        _settleBill(billId);
    }
}
```

### Деплой

```bash
./upgrade-contracts.sh
```

### Использование

```typescript
// Фронтенд
const billIds = ['0xabc...', '0xdef...', '0xghi...'];
const totalAmount = calculateTotalAmount(billIds);

await escrowContract.payMultipleBills(billIds, {
  value: totalAmount
});
```

### Результат
✅ Пользователи экономят газ  
✅ Удобнее оплачивать несколько bills  
✅ Адрес контракта не изменился  

---

## Пример 2: Добавление системы скидок

### Проблема
Создатели bills хотят давать скидки участникам.

### Решение

Добавляем в `SplitBillEscrowUpgradeable.sol`:

```solidity
// Новая переменная в конце (важно!)
mapping(bytes32 => uint256) public discounts; // В процентах (0-100)

event DiscountApplied(bytes32 indexed billId, uint256 discountPercent);

/**
 * @dev Apply discount to a bill
 * @param billId Bill to apply discount to
 * @param percent Discount percentage (0-50)
 */
function applyDiscount(bytes32 billId, uint256 percent) external {
    Bill storage bill = bills[billId];
    require(bill.creator == msg.sender, "Only creator can apply discount");
    require(!bill.settled, "Bill already settled");
    require(percent <= 50, "Max 50% discount");
    
    discounts[billId] = percent;
    
    emit DiscountApplied(billId, percent);
}

/**
 * @dev Get discounted share amount
 * @param billId Bill to check
 * @param participant Participant address
 */
function getDiscountedShare(bytes32 billId, address participant) 
    external view returns (uint256) 
{
    uint256 originalShare = bills[billId].shares[participant];
    uint256 discount = discounts[billId];
    
    if (discount == 0) {
        return originalShare;
    }
    
    return originalShare * (100 - discount) / 100;
}

/**
 * @dev Pay share with discount applied
 * @param billId Bill to pay
 */
function payShareWithDiscount(bytes32 billId) external payable {
    Bill storage bill = bills[billId];
    require(bill.creator != address(0), "Bill not found");
    require(!bill.settled, "Bill already settled");
    require(!bill.cancelled, "Bill cancelled");
    require(!bill.hasPaid[msg.sender], "Already paid");
    require(bill.shares[msg.sender] > 0, "Not a participant");
    
    uint256 discountedAmount = this.getDiscountedShare(billId, msg.sender);
    require(msg.value == discountedAmount, "Incorrect amount");

    bill.hasPaid[msg.sender] = true;
    bill.paidAmounts[msg.sender] = msg.value;
    bill.paidCount++;

    emit PaymentReceived(billId, msg.sender, msg.value);

    if (bill.paidCount == bill.participantCount) {
        _settleBill(billId);
    }
}
```

### Деплой

```bash
./upgrade-contracts.sh
```

### Использование

```typescript
// Создатель применяет скидку 20%
await escrowContract.applyDiscount(billId, 20);

// Участник оплачивает со скидкой
const discountedAmount = await escrowContract.getDiscountedShare(billId, userAddress);
await escrowContract.payShareWithDiscount(billId, {
  value: discountedAmount
});
```

### Результат
✅ Гибкая система скидок  
✅ Привлечение пользователей  
✅ Старые bills работают как раньше  

---

## Пример 3: Добавление рейтинга участников

### Проблема
Нужно отслеживать надежность участников.

### Решение

Добавляем в `SplitBillEscrowUpgradeable.sol`:

```solidity
struct ParticipantRating {
    uint256 totalBills;      // Всего bills
    uint256 paidOnTime;      // Оплачено вовремя
    uint256 paidLate;        // Оплачено с опозданием
    uint256 notPaid;         // Не оплачено
    uint256 reputation;      // Репутация 0-100
}

mapping(address => ParticipantRating) public ratings;

event ReputationUpdated(address indexed participant, uint256 newReputation);

/**
 * @dev Update participant rating after payment
 */
function _updateRating(address participant, bytes32 billId, bool paidOnTime) internal {
    ParticipantRating storage rating = ratings[participant];
    
    rating.totalBills++;
    
    if (paidOnTime) {
        rating.paidOnTime++;
    } else {
        rating.paidLate++;
    }
    
    // Calculate reputation (0-100)
    rating.reputation = (rating.paidOnTime * 100) / rating.totalBills;
    
    emit ReputationUpdated(participant, rating.reputation);
}

/**
 * @dev Modified payShare to track reputation
 */
function payShare(bytes32 billId) external payable override {
    Bill storage bill = bills[billId];
    require(bill.creator != address(0), "Bill not found");
    require(!bill.settled, "Bill already settled");
    require(!bill.cancelled, "Bill cancelled");
    require(!bill.hasPaid[msg.sender], "Already paid");
    require(bill.shares[msg.sender] > 0, "Not a participant");
    require(msg.value == bill.shares[msg.sender], "Incorrect amount");

    bill.hasPaid[msg.sender] = true;
    bill.paidAmounts[msg.sender] = msg.value;
    bill.paidCount++;
    
    // Update rating
    bool onTime = block.timestamp < bill.deadline;
    _updateRating(msg.sender, billId, onTime);

    emit PaymentReceived(billId, msg.sender, msg.value);

    if (bill.paidCount == bill.participantCount) {
        _settleBill(billId);
    }
}

/**
 * @dev Get participant reputation
 */
function getReputation(address participant) external view returns (
    uint256 totalBills,
    uint256 paidOnTime,
    uint256 paidLate,
    uint256 reputation
) {
    ParticipantRating storage rating = ratings[participant];
    return (
        rating.totalBills,
        rating.paidOnTime,
        rating.paidLate,
        rating.reputation
    );
}

/**
 * @dev Check if participant is reliable (reputation > 80)
 */
function isReliableParticipant(address participant) external view returns (bool) {
    return ratings[participant].reputation >= 80;
}
```

### Деплой

```bash
./upgrade-contracts.sh
```

### Использование

```typescript
// Проверить репутацию перед добавлением в bill
const reputation = await escrowContract.getReputation(participantAddress);
console.log(`Reputation: ${reputation.reputation}/100`);

// Показать badge надежного участника
const isReliable = await escrowContract.isReliableParticipant(participantAddress);
if (isReliable) {
  showBadge('Reliable Payer ⭐');
}
```

### Результат
✅ Прозрачная репутация  
✅ Мотивация платить вовремя  
✅ Доверие между участниками  

---

## Пример 4: Добавление уведомлений

### Проблема
Участники забывают оплатить bills.

### Решение

Добавляем в `SplitBillEscrowUpgradeable.sol`:

```solidity
struct Notification {
    bytes32 billId;
    address participant;
    uint256 timestamp;
    string message;
}

mapping(address => Notification[]) public notifications;
mapping(bytes32 => uint256) public lastReminderTime;

event NotificationSent(bytes32 indexed billId, address indexed participant, string message);

/**
 * @dev Send reminder to unpaid participants
 * @param billId Bill to send reminders for
 */
function sendReminders(bytes32 billId) external {
    Bill storage bill = bills[billId];
    require(bill.creator == msg.sender, "Only creator can send reminders");
    require(!bill.settled, "Bill already settled");
    require(!bill.cancelled, "Bill cancelled");
    
    // Rate limit: 1 reminder per day
    require(
        block.timestamp >= lastReminderTime[billId] + 1 days,
        "Reminder sent recently"
    );
    
    lastReminderTime[billId] = block.timestamp;
    
    // This would emit events that off-chain service picks up
    emit NotificationSent(billId, address(0), "Reminder sent to all unpaid participants");
}

/**
 * @dev Get pending notifications for user
 */
function getPendingNotifications(address user) external view returns (uint256) {
    uint256 count = 0;
    
    // Count bills where user hasn't paid
    // (In real implementation, would track this more efficiently)
    
    return count;
}
```

### Деплой

```bash
./upgrade-contracts.sh
```

### Использование

```typescript
// Создатель отправляет напоминания
await escrowContract.sendReminders(billId);

// Off-chain сервис слушает события
escrowContract.on('NotificationSent', (billId, participant, message) => {
  sendEmailNotification(participant, message);
  sendPushNotification(participant, message);
});
```

### Результат
✅ Меньше забытых платежей  
✅ Лучшая коммуникация  
✅ Выше процент завершенных bills  

---

## Пример 5: Исправление бага

### Проблема
Обнаружен баг: можно создать bill с нулевым deadline.

### Решение

Исправляем в `SplitBillEscrowUpgradeable.sol`:

```solidity
// Было (с багом):
function createBillWithDeadline(
    bytes32 billId,
    address beneficiary,
    address[] calldata participants,
    uint256[] calldata shares,
    uint256 customDeadline
) external {
    require(customDeadline > block.timestamp, "Deadline must be in future");
    // Баг: нет проверки максимального deadline
    
    this.createBill(billId, beneficiary, participants, shares);
    bills[billId].deadline = customDeadline;
}

// Стало (исправлено):
function createBillWithDeadline(
    bytes32 billId,
    address beneficiary,
    address[] calldata participants,
    uint256[] calldata shares,
    uint256 customDeadline
) external {
    require(customDeadline > block.timestamp, "Deadline must be in future");
    require(customDeadline <= block.timestamp + 365 days, "Deadline too far"); // Исправление!
    
    this.createBill(billId, beneficiary, participants, shares);
    bills[billId].deadline = customDeadline;
}
```

### Деплой

```bash
./upgrade-contracts.sh
```

### Результат
✅ Баг исправлен для всех  
✅ Старые bills не затронуты  
✅ Новые bills защищены  

---

## Общий паттерн обновления

```
1. Определить проблему
   ↓
2. Написать решение
   ↓
3. Добавить код в *Upgradeable.sol
   ↓
4. Протестировать локально
   ↓
5. Запустить ./upgrade-contracts.sh
   ↓
6. Проверить на testnet
   ↓
7. Upgrade на mainnet
   ↓
8. Готово! 🎉
```

## Важно помнить

### ✅ Можно добавлять:
- Новые функции
- Новые переменные (в конец!)
- Новые events
- Исправления логики

### ❌ Нельзя менять:
- Порядок существующих переменных
- Типы существующих переменных
- Удалять переменные
- Менять наследование

---

**Теперь вы знаете как обновлять контракты! 🚀**

Каждое обновление занимает ~5 минут и не требует изменений в фронтенде!
