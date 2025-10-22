# Архитектура Upgradeable Contracts

## Схема работы

```
┌─────────────────────────────────────────────────────────────┐
│                         ПОЛЬЗОВАТЕЛЬ                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Вызывает функции
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROXY CONTRACT                            │
│                  (Постоянный адрес)                          │
│                                                              │
│  0xABC...  ◄── Этот адрес НИКОГДА не меняется              │
│                                                              │
│  Storage:                                                    │
│  ├─ bills mapping                                           │
│  ├─ payments mapping                                        │
│  ├─ metadata                                                │
│  └─ implementation address ──┐                              │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               │ delegateCall
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              IMPLEMENTATION CONTRACT                         │
│                (Обновляемая логика)                          │
│                                                              │
│  Version 1: 0xDEF...                                        │
│  ├─ createBill()                                            │
│  ├─ payShare()                                              │
│  └─ getBillInfo()                                           │
│                                                              │
│  Version 2: 0xGHI...  ◄── После upgrade                    │
│  ├─ createBill()                                            │
│  ├─ payShare()                                              │
│  ├─ getBillInfo()                                           │
│  ├─ payMultipleBills()  ◄── Новая функция!                 │
│  └─ applyDiscount()     ◄── Новая функция!                 │
│                                                              │
│  Version 3: 0xJKL...  ◄── После следующего upgrade         │
│  └─ ... еще больше функций                                 │
└─────────────────────────────────────────────────────────────┘
```

## Процесс обновления

```
┌──────────────┐
│   Разработка │
│              │
│  Добавляем   │
│  новую       │
│  функцию     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Компиляция │
│              │
│  forge build │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Деплой    │
│ Implementation│
│              │
│  forge create│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Upgrade    │
│              │
│ upgradeTo()  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Готово!    │
│              │
│ Новая функция│
│  доступна    │
└──────────────┘
```

## Сравнение подходов

### Старый подход (Версионирование)

```
Bill #1 → Contract V1 (0xAAA...)
Bill #2 → Contract V1 (0xAAA...)
                ↓
         Нужно обновление
                ↓
Bill #3 → Contract V2 (0xBBB...)  ◄── Новый адрес!
Bill #4 → Contract V2 (0xBBB...)

Проблемы:
❌ Разные адреса для разных версий
❌ Нужно обновлять конфиг
❌ Старые bills на старом контракте
❌ Фрагментация данных
```

### Новый подход (UUPS Proxy)

```
Bill #1 → Proxy (0xAAA...) → Implementation V1
Bill #2 → Proxy (0xAAA...) → Implementation V1
                ↓
         Делаем upgrade
                ↓
Bill #3 → Proxy (0xAAA...) → Implementation V2  ◄── Тот же адрес!
Bill #4 → Proxy (0xAAA...) → Implementation V2

Преимущества:
✅ Один адрес навсегда
✅ Конфиг не меняется
✅ Все bills в одном месте
✅ Централизованные данные
```

## Storage Layout

### Критически важно!

```solidity
// ✅ ПРАВИЛЬНО - добавляем в конец

// Version 1
contract V1 {
    mapping(bytes32 => Bill) public bills;  // Slot 0
    uint256 public version;                  // Slot 1
}

// Version 2 - добавляем новые переменные
contract V2 {
    mapping(bytes32 => Bill) public bills;  // Slot 0 (не трогаем!)
    uint256 public version;                  // Slot 1 (не трогаем!)
    mapping(bytes32 => uint256) public discounts;  // Slot 2 (новое!)
}

// ❌ НЕПРАВИЛЬНО - меняем порядок

// Version 1
contract V1 {
    mapping(bytes32 => Bill) public bills;  // Slot 0
    uint256 public version;                  // Slot 1
}

// Version 2 - ОШИБКА!
contract V2 {
    uint256 public version;                  // Slot 0 ← ОШИБКА!
    mapping(bytes32 => Bill) public bills;  // Slot 1 ← ОШИБКА!
    // Все данные сломаются!
}
```

## Безопасность

```
┌─────────────────────────────────────────────────────────────┐
│                      OWNER (Deployer)                        │
│                                                              │
│  Единственный кто может:                                    │
│  ├─ upgradeTo(newImplementation)                            │
│  ├─ transferOwnership(newOwner)                             │
│  └─ renounceOwnership() ◄── Осторожно!                     │
└─────────────────────────────────────────────────────────────┘
                               │
                               │ Для дополнительной безопасности
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    MULTISIG (Safe)                           │
│                                                              │
│  Требует подписи нескольких владельцев:                     │
│  ├─ Owner 1 ✓                                               │
│  ├─ Owner 2 ✓                                               │
│  └─ Owner 3 ✓                                               │
│                                                              │
│  Только после 2 из 3 подписей → upgrade                    │
└─────────────────────────────────────────────────────────────┘
```

## Газ-эффективность

```
Операция                  | Обычный контракт | Proxy контракт
─────────────────────────────────────────────────────────────
Деплой (первый раз)      | ~150,000 gas     | ~300,000 gas
Вызов функции            | ~50,000 gas      | ~52,000 gas (+4%)
Обновление логики        | Новый деплой     | ~100,000 gas
Миграция данных          | Очень дорого     | Не нужна!
```

**Вывод:** Proxy немного дороже при вызовах (+4%), но экономит огромные суммы на обновлениях!

## Примеры использования

### Добавление новой функции

```solidity
// Шаг 1: Добавляем функцию в SplitBillEscrowUpgradeable.sol

function getBillsByCreator(address creator) 
    external view returns (bytes32[] memory) 
{
    // Новая функция для поиска bills по создателю
    // Реализация...
}

// Шаг 2: Запускаем upgrade
// ./upgrade-contracts.sh

// Шаг 3: Функция доступна на том же адресе!
```

### Исправление бага

```solidity
// Было (с багом):
function payShare(bytes32 billId) external payable {
    // ... код
    bill.paidCount++;  // Баг: инкремент до проверки
    require(msg.value == bill.shares[msg.sender], "Wrong amount");
}

// Стало (исправлено):
function payShare(bytes32 billId) external payable {
    require(msg.value == bill.shares[msg.sender], "Wrong amount");
    bill.paidCount++;  // Правильно: инкремент после проверки
}

// Запускаем upgrade → баг исправлен для всех!
```

## Мониторинг версий

```bash
# Проверить текущую версию
cast call $PROXY_ADDRESS "version()(uint256)" --rpc-url $RPC_URL

# Проверить implementation адрес
cast implementation $PROXY_ADDRESS --rpc-url $RPC_URL

# История upgrades (через события)
cast logs \
  --address $PROXY_ADDRESS \
  --from-block 0 \
  "ContractUpgraded(uint256)" \
  --rpc-url $RPC_URL
```

## Roadmap обновлений

```
Version 1 (Текущая)
├─ Базовый escrow
├─ Создание bills
├─ Оплата shares
└─ Auto-settlement

Version 2 (Планируется)
├─ Batch payments
├─ Скидки
├─ Рейтинг участников
└─ Уведомления

Version 3 (Будущее)
├─ Multi-token support
├─ Автоматические напоминания
├─ Интеграция с DeFi
└─ NFT receipts

Все на одном адресе! 🎉
```

## Заключение

UUPS Proxy Pattern дает:
- 🔒 Безопасность (только owner может обновлять)
- 🚀 Гибкость (добавляйте функции когда угодно)
- 💾 Сохранность данных (все bills остаются)
- 💰 Экономию (не нужна миграция)
- 🎯 Простоту (один адрес навсегда)

**Идеально для production!**
