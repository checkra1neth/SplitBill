# План миграции на Upgradeable контракты

## Что изменилось

**Было:** Каждый раз новый контракт → новый адрес → обновление конфига  
**Стало:** Один адрес навсегда → обновление логики без смены адреса

## Шаги миграции

### 1. Установка зависимостей

```bash
cd splitbill/contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit
```

### 2. Деплой upgradeable версий

```bash
# Убедитесь что PRIVATE_KEY установлен
export PRIVATE_KEY=your_private_key
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Деплой
./deploy-upgradeable.sh
```

Вы получите:
```
SplitBillEscrow Proxy: 0xABC...
BillMetadataRegistry Proxy: 0xDEF...
```

### 3. Обновление конфига

В `.env.local` замените старые адреса на **PROXY** адреса:

```env
NEXT_PUBLIC_ESCROW_ADDRESS=0xABC...  # Proxy адрес
NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=0xDEF...  # Proxy адрес
```

### 4. Тестирование

Все должно работать как раньше, но теперь контракты обновляемые!

## Будущие обновления

Когда нужно добавить функционал:

```bash
# 1. Редактируете SplitBillEscrowUpgradeable.sol
# 2. Запускаете upgrade
./upgrade-contracts.sh
```

**Адреса не меняются!** Фронтенд продолжает работать без изменений.

## Для mainnet

Та же процедура:
```bash
BASE_MAINNET_RPC_URL=https://mainnet.base.org ./deploy-upgradeable.sh
```

Один раз задеплоили → навсегда используете этот адрес.

## Безопасность

- Только owner (ваш кошелек) может обновлять контракты
- Все данные (bills, metadata) сохраняются при обновлениях
- Можно передать ownership на multisig для дополнительной безопасности

## Примеры будущих обновлений

### Добавление batch payment
```solidity
function payMultipleBills(bytes32[] calldata billIds) external payable {
    // Новая функция - просто добавляем и делаем upgrade
}
```

### Добавление скидок
```solidity
mapping(bytes32 => uint256) public discounts;

function applyDiscount(bytes32 billId, uint256 percent) external {
    // Новая функция + новая переменная
}
```

Все это без смены адреса контракта!
