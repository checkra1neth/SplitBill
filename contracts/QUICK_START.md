# 🚀 Быстрый старт - Upgradeable Contracts

## За 5 минут до деплоя

### 1. Установка (1 минута)

```bash
cd splitbill/contracts

# Установить OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit

# Установить jq (если нет)
brew install jq  # macOS
```

### 2. Настройка (1 минута)

```bash
# Экспортировать приватный ключ
export PRIVATE_KEY=your_private_key_without_0x

# Проверить баланс (нужно ~0.01 ETH)
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url https://sepolia.base.org
```

Нет ETH? Получите здесь: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### 3. Деплой (2 минуты)

```bash
# Запустить деплой
./deploy-upgradeable.sh
```

Вы получите:
```
✅ Deployment Complete!

SplitBillEscrow Proxy:        0xABC...
BillMetadataRegistry Proxy:   0xDEF...
```

### 4. Сохранить адреса (1 минута)

Добавьте в `splitbill/.env.local`:

```env
NEXT_PUBLIC_ESCROW_ADDRESS=0xABC...
NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=0xDEF...
```

### 5. Готово! 🎉

Контракты задеплоены и готовы к использованию!

---

## Обновление контракта (когда нужно)

### Добавили новую функцию?

```bash
# 1. Отредактируйте SplitBillEscrowUpgradeable.sol
# 2. Запустите upgrade
./upgrade-contracts.sh
```

**Адреса не меняются!** Фронтенд продолжает работать.

---

## Проверка работы

```bash
# Установить адрес proxy
export ESCROW_PROXY=0xABC...

# Проверить версию
cast call $ESCROW_PROXY "version()(uint256)" --rpc-url https://sepolia.base.org
# Должно вернуть: 1

# Проверить owner
cast call $ESCROW_PROXY "owner()(address)" --rpc-url https://sepolia.base.org
# Должно вернуть: ваш адрес
```

---

## Что дальше?

### Для изучения архитектуры
📖 Читайте: `UPGRADEABLE_SUMMARY.md`

### Для деплоя в mainnet
📋 Следуйте: `DEPLOYMENT_CHECKLIST.md`

### Для всех команд
📝 Смотрите: `COMMANDS_CHEATSHEET.md`

### Для понимания схемы
🏗️ Изучайте: `ARCHITECTURE.md`

---

## Частые вопросы

### Нужно ли обновлять адреса после upgrade?
❌ Нет! Адреса proxy остаются теми же навсегда.

### Сохранятся ли данные после upgrade?
✅ Да! Все bills, payments, metadata остаются на месте.

### Можно ли откатиться на старую версию?
✅ Да! Используйте `upgradeTo()` с адресом старого implementation.

### Кто может обновлять контракты?
🔒 Только owner (ваш кошелек при деплое).

### Сколько стоит upgrade?
💰 ~$1-2 (только деплой нового implementation).

---

## Помощь

Если что-то не работает:

1. Проверьте баланс ETH
2. Убедитесь что PRIVATE_KEY правильный
3. Проверьте что OpenZeppelin установлен
4. Посмотрите логи в терминале
5. Читайте `UPGRADEABLE_SUMMARY.md`

---

## Команды на каждый день

```bash
# Проверить версию
cast call $PROXY "version()(uint256)" --rpc-url $RPC_URL

# Проверить owner
cast call $PROXY "owner()(address)" --rpc-url $RPC_URL

# Проверить implementation
cast implementation $PROXY --rpc-url $RPC_URL

# Обновить контракт
./upgrade-contracts.sh

# Проверить баланс
cast balance $PROXY --rpc-url $RPC_URL
```

---

**Готово! Теперь у вас upgradeable контракты! 🚀**

Один раз деплоите → обновляете сколько угодно раз!
