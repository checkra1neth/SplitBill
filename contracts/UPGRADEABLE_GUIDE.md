# Upgradeable Contracts Guide

## Архитектура

Используем **UUPS Proxy Pattern** от OpenZeppelin:

```
User → Proxy (постоянный адрес) → Implementation (обновляемая логика)
         ↓
      Storage (сохраняется при обновлениях)
```

## Преимущества

✅ **Один адрес навсегда** - пользователи всегда используют один и тот же адрес  
✅ **Обновляемая логика** - можно добавлять функции, исправлять баги  
✅ **Сохранение данных** - все bills, metadata остаются на месте  
✅ **Газ-эффективность** - дешевле чем миграция данных  
✅ **Безопасность** - только owner может обновлять  

## Первый деплой

```bash
cd contracts
chmod +x deploy-upgradeable.sh
./deploy-upgradeable.sh
```

Сохраните **PROXY** адреса в `.env.local`:
```
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=0x...
```

## Обновление контрактов

Когда нужно добавить новую функцию или исправить баг:

```bash
# 1. Обновите код в SplitBillEscrowUpgradeable.sol
# 2. Запустите upgrade
./upgrade-contracts.sh
```

**Важно:** Адреса в `.env.local` НЕ меняются!

## Правила обновления

⚠️ **НЕЛЬЗЯ:**
- Менять порядок переменных в storage
- Удалять существующие переменные
- Менять типы существующих переменных

✅ **МОЖНО:**
- Добавлять новые функции
- Добавлять новые переменные в конец
- Исправлять логику функций
- Добавлять events

## Пример обновления

### Добавление новой функции

```solidity
// В SplitBillEscrowUpgradeable.sol добавляем:

function getBillStatus(bytes32 billId) external view returns (string memory) {
    Bill storage bill = bills[billId];
    if (bill.settled) return "settled";
    if (bill.cancelled) return "cancelled";
    if (block.timestamp >= bill.deadline) return "expired";
    return "active";
}
```

Запускаем upgrade - функция сразу доступна!

## Проверка версии

```bash
cast call $ESCROW_PROXY "version()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

## Mainnet деплой

Та же процедура, просто меняете RPC:

```bash
BASE_MAINNET_RPC_URL=https://mainnet.base.org ./deploy-upgradeable.sh
```

Адрес будет один и навсегда!
