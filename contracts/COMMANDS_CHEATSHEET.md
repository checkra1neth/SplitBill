# Команды для работы с Upgradeable контрактами

## Первоначальная установка

```bash
# Установить OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit

# Установить jq (для парсинга JSON)
brew install jq  # macOS
```

## Деплой (первый раз)

```bash
export PRIVATE_KEY=your_key
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

cd contracts
./deploy-upgradeable.sh
```

Сохраните PROXY адреса в `.env.local`!

## Обновление контрактов

```bash
# После изменения кода в *Upgradeable.sol файлах
./upgrade-contracts.sh
```

## Проверка версии

```bash
# Escrow
cast call $ESCROW_PROXY "version()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL

# Metadata
cast call $METADATA_PROXY "version()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

## Проверка implementation адреса

```bash
# Узнать текущий implementation
cast implementation $ESCROW_PROXY --rpc-url $BASE_SEPOLIA_RPC_URL
```

## Проверка owner

```bash
cast call $ESCROW_PROXY "owner()(address)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

## Передача ownership (для безопасности)

```bash
# На multisig или другой адрес
cast send $ESCROW_PROXY \
  "transferOwnership(address)" $NEW_OWNER \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Mainnet деплой

```bash
export BASE_MAINNET_RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=your_mainnet_key

./deploy-upgradeable.sh
```

## Откат на предыдущую версию (emergency)

```bash
# Если что-то пошло не так, можно откатиться
cast send $ESCROW_PROXY \
  "upgradeTo(address)" $OLD_IMPLEMENTATION_ADDRESS \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Тестирование локально

```bash
# Запустить локальную ноду
anvil

# В другом терминале
export BASE_SEPOLIA_RPC_URL=http://localhost:8545
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

./deploy-upgradeable.sh
```

## Верификация на Basescan

```bash
forge verify-contract \
  --chain-id 84532 \
  --compiler-version v0.8.20 \
  $IMPLEMENTATION_ADDRESS \
  contracts/SplitBillEscrowUpgradeable.sol:SplitBillEscrowUpgradeable \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Полезные проверки

```bash
# Баланс контракта
cast balance $ESCROW_PROXY --rpc-url $BASE_SEPOLIA_RPC_URL

# Вызов функции
cast call $ESCROW_PROXY \
  "getBillInfo(bytes32)" $BILL_ID \
  --rpc-url $BASE_SEPOLIA_RPC_URL

# Отправка транзакции
cast send $ESCROW_PROXY \
  "payShare(bytes32)" $BILL_ID \
  --value 1ether \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```
