# Upgradeable Contracts - Итоговая документация

## Что сделано

Создана полноценная upgradeable архитектура для SplitBill на основе UUPS Proxy Pattern.

## Файлы

### Контракты
- `SplitBillEscrowUpgradeable.sol` - Upgradeable версия эскроу
- `BillMetadataRegistryUpgradeable.sol` - Upgradeable версия метаданных

### Скрипты
- `deploy-upgradeable.sh` - Первоначальный деплой с proxy
- `upgrade-contracts.sh` - Обновление существующих контрактов
- `test-upgrade.sh` - Тестирование upgrade функционала

### Документация
- `UPGRADEABLE_GUIDE.md` - Полное руководство по архитектуре
- `MIGRATION_PLAN.md` - План миграции с legacy версий
- `COMMANDS_CHEATSHEET.md` - Шпаргалка по командам
- `foundry-upgradeable.toml` - Конфигурация Foundry

## Ключевые преимущества

### 1. Постоянный адрес
```
User → 0xABC... (Proxy) → Implementation V1
                        → Implementation V2 (после upgrade)
                        → Implementation V3 (после upgrade)
```

Адрес `0xABC...` никогда не меняется!

### 2. Сохранение данных
Все bills, payments, metadata остаются на месте при обновлениях.

### 3. Гибкость обновлений
Можно добавлять:
- Новые функции
- Новые переменные
- Исправления багов
- Оптимизации

### 4. Безопасность
- Только owner может обновлять
- Версионирование встроено
- Можно откатиться на предыдущую версию

## Как использовать

### Первый деплой (testnet)

```bash
export PRIVATE_KEY=your_key
cd contracts
./deploy-upgradeable.sh
```

Получите адреса:
```
Escrow Proxy: 0xABC...
Metadata Proxy: 0xDEF...
```

Добавьте в `.env.local`:
```env
NEXT_PUBLIC_ESCROW_ADDRESS=0xABC...
NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=0xDEF...
```

### Обновление контракта

Когда нужно добавить функционал:

```bash
# 1. Редактируете SplitBillEscrowUpgradeable.sol
# 2. Запускаете upgrade
./upgrade-contracts.sh
```

Адреса остаются те же! Фронтенд работает без изменений.

### Mainnet деплой

```bash
export BASE_MAINNET_RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=your_mainnet_key
./deploy-upgradeable.sh
```

Один раз задеплоили → используете навсегда.

## Примеры будущих обновлений

### Добавление batch payments

```solidity
// В SplitBillEscrowUpgradeable.sol добавляем:

function payMultipleBills(bytes32[] calldata billIds) external payable {
    uint256 totalRequired = 0;
    for (uint256 i = 0; i < billIds.length; i++) {
        totalRequired += bills[billIds[i]].shares[msg.sender];
    }
    require(msg.value == totalRequired, "Incorrect total amount");
    
    for (uint256 i = 0; i < billIds.length; i++) {
        _payShareInternal(billIds[i]);
    }
}
```

Запускаем `./upgrade-contracts.sh` → функция доступна!

### Добавление скидок

```solidity
// Добавляем новую переменную в конец
mapping(bytes32 => uint256) public discounts; // В процентах

function applyDiscount(bytes32 billId, uint256 percent) external {
    require(bills[billId].creator == msg.sender, "Only creator");
    require(percent <= 50, "Max 50% discount");
    discounts[billId] = percent;
}

function getDiscountedShare(bytes32 billId, address participant) 
    external view returns (uint256) 
{
    uint256 originalShare = bills[billId].shares[participant];
    uint256 discount = discounts[billId];
    return originalShare * (100 - discount) / 100;
}
```

Запускаем upgrade → скидки работают!

### Добавление рейтинга участников

```solidity
struct ParticipantRating {
    uint256 totalBills;
    uint256 paidOnTime;
    uint256 reputation; // 0-100
}

mapping(address => ParticipantRating) public ratings;

function updateRating(address participant, bool paidOnTime) internal {
    ParticipantRating storage rating = ratings[participant];
    rating.totalBills++;
    if (paidOnTime) {
        rating.paidOnTime++;
    }
    rating.reputation = (rating.paidOnTime * 100) / rating.totalBills;
}
```

## Правила безопасности

### ✅ МОЖНО:
- Добавлять новые функции
- Добавлять новые переменные **в конец**
- Менять логику функций
- Добавлять events
- Оптимизировать газ

### ❌ НЕЛЬЗЯ:
- Менять порядок существующих переменных
- Удалять существующие переменные
- Менять типы существующих переменных
- Менять наследование контрактов

### Пример НЕПРАВИЛЬНОГО обновления:

```solidity
// ❌ НЕПРАВИЛЬНО - меняем порядок
struct Bill {
    uint256 totalAmount;      // Было вторым
    address creator;          // Было первым
    // ... остальное
}
```

Это сломает все существующие bills!

### Пример ПРАВИЛЬНОГО обновления:

```solidity
// ✅ ПРАВИЛЬНО - добавляем в конец
struct Bill {
    address creator;          // Порядок не меняется
    uint256 totalAmount;      // Порядок не меняется
    // ... все старые поля
    uint256 newField;         // Новое поле в конце
}
```

## Проверка перед upgrade

```bash
# 1. Проверить версию
cast call $ESCROW_PROXY "version()(uint256)" --rpc-url $RPC_URL

# 2. Проверить owner
cast call $ESCROW_PROXY "owner()(address)" --rpc-url $RPC_URL

# 3. Проверить что данные на месте
cast call $ESCROW_PROXY "getBillInfo(bytes32)" $BILL_ID --rpc-url $RPC_URL

# 4. Сделать upgrade
./upgrade-contracts.sh

# 5. Проверить новую версию
cast call $ESCROW_PROXY "version()(uint256)" --rpc-url $RPC_URL

# 6. Проверить что данные сохранились
cast call $ESCROW_PROXY "getBillInfo(bytes32)" $BILL_ID --rpc-url $RPC_URL
```

## Откат (Emergency)

Если что-то пошло не так:

```bash
# Откатываемся на предыдущий implementation
cast send $ESCROW_PROXY \
  "upgradeTo(address)" $OLD_IMPLEMENTATION \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

## Передача ownership на multisig

Для дополнительной безопасности в mainnet:

```bash
# Создайте multisig на Safe.global
# Затем передайте ownership:
cast send $ESCROW_PROXY \
  "transferOwnership(address)" $MULTISIG_ADDRESS \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

Теперь для upgrade нужно согласие нескольких владельцев.

## Мониторинг

Отслеживайте события:

```solidity
event ContractUpgraded(uint256 indexed newVersion);
```

Настройте алерты на BaseScan для этого события.

## Тестирование

Перед каждым upgrade:

1. Тестируйте на локальной ноде (anvil)
2. Деплойте на testnet
3. Проверяйте все функции
4. Только потом mainnet

## Стоимость

- Первый деплой: ~$2-5 (proxy + implementation)
- Каждый upgrade: ~$1-2 (только новый implementation)
- Использование: такое же как обычный контракт

## Итог

Теперь у вас:
- ✅ Upgradeable контракты готовы
- ✅ Скрипты для деплоя и upgrade
- ✅ Полная документация
- ✅ Примеры использования
- ✅ Готово для mainnet

**Один раз деплоите → обновляете сколько угодно раз!**
