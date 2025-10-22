# Чеклист деплоя Upgradeable контрактов

## Перед деплоем

### Подготовка окружения

- [ ] Установлен Foundry (`forge --version`)
- [ ] Установлен jq (`jq --version`)
- [ ] Установлен cast (`cast --version`)
- [ ] Есть приватный ключ для деплоя
- [ ] Есть ETH на кошельке для газа

### Проверка кода

- [ ] Контракты компилируются без ошибок
- [ ] Все тесты проходят
- [ ] Storage layout правильный (новые переменные в конце)
- [ ] Нет критических изменений в существующих переменных
- [ ] Версия Solidity: 0.8.20

### Безопасность

- [ ] Код проверен на уязвимости
- [ ] Нет hardcoded адресов
- [ ] Правильные access control модификаторы
- [ ] События для всех важных операций

## Testnet деплой (Base Sepolia)

### 1. Установка зависимостей

```bash
cd splitbill/contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit
```

- [ ] OpenZeppelin установлен
- [ ] Нет конфликтов зависимостей

### 2. Настройка переменных окружения

```bash
export PRIVATE_KEY=your_private_key_without_0x
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

- [ ] PRIVATE_KEY установлен
- [ ] BASE_SEPOLIA_RPC_URL установлен
- [ ] Проверен баланс: `cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url $BASE_SEPOLIA_RPC_URL`

### 3. Деплой

```bash
./deploy-upgradeable.sh
```

- [ ] Скрипт выполнился без ошибок
- [ ] Получены адреса Proxy контрактов
- [ ] Получены адреса Implementation контрактов
- [ ] Транзакции подтверждены на BaseScan

### 4. Сохранение адресов

```bash
# Добавить в .env.local
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=0x...
```

- [ ] Адреса сохранены в `.env.local`
- [ ] Адреса сохранены в безопасном месте (password manager)
- [ ] Создан backup адресов

### 5. Верификация

```bash
# Проверить версию
cast call $ESCROW_PROXY "version()(uint256)" --rpc-url $BASE_SEPOLIA_RPC_URL
```

- [ ] Версия = 1
- [ ] Owner = ваш адрес
- [ ] Implementation адрес корректный

### 6. Тестирование

- [ ] Создан тестовый bill
- [ ] Оплачен share
- [ ] Проверен статус bill
- [ ] Все функции работают
- [ ] События эмитятся корректно

## Mainnet деплой (Base)

### Дополнительные проверки

- [ ] Все тесты на testnet прошли успешно
- [ ] Контракты работали на testnet минимум 1 неделю
- [ ] Нет критических багов
- [ ] Проведен security audit (рекомендуется)
- [ ] Подготовлен emergency plan

### Безопасность mainnet

- [ ] Используется отдельный кошелек для деплоя
- [ ] Приватный ключ хранится в hardware wallet
- [ ] Настроен multisig для ownership (рекомендуется)
- [ ] Есть план на случай взлома

### Деплой на mainnet

```bash
export BASE_MAINNET_RPC_URL=https://mainnet.base.org
export PRIVATE_KEY=your_mainnet_private_key
./deploy-upgradeable.sh
```

- [ ] Деплой выполнен успешно
- [ ] Адреса сохранены
- [ ] Транзакции подтверждены
- [ ] Контракты верифицированы на BaseScan

### После деплоя mainnet

- [ ] Обновлен `.env.local` с mainnet адресами
- [ ] Ownership передан на multisig (если используется)
- [ ] Настроен мониторинг событий
- [ ] Создан dashboard для отслеживания
- [ ] Команда уведомлена об адресах

## Первое обновление (Upgrade)

### Подготовка

- [ ] Новый код протестирован
- [ ] Storage layout не нарушен
- [ ] Версия инкрементирована
- [ ] Changelog обновлен

### Процесс upgrade

```bash
./upgrade-contracts.sh
```

- [ ] Upgrade выполнен успешно
- [ ] Версия увеличилась
- [ ] Старые данные сохранились
- [ ] Новые функции работают
- [ ] События эмитятся

### Проверка после upgrade

```bash
# Проверить версию
cast call $PROXY "version()(uint256)" --rpc-url $RPC_URL

# Проверить старые данные
cast call $PROXY "getBillInfo(bytes32)" $OLD_BILL_ID --rpc-url $RPC_URL

# Проверить новую функцию
cast call $PROXY "newFunction()" --rpc-url $RPC_URL
```

- [ ] Версия обновилась
- [ ] Старые bills доступны
- [ ] Новые функции работают
- [ ] Нет ошибок в логах

## Мониторинг

### Настройка алертов

- [ ] Алерты на ContractUpgraded события
- [ ] Алерты на OwnershipTransferred события
- [ ] Мониторинг баланса контракта
- [ ] Мониторинг количества транзакций

### Регулярные проверки

- [ ] Еженедельная проверка версии
- [ ] Ежемесячная проверка owner
- [ ] Проверка implementation адреса
- [ ] Анализ событий и транзакций

## Emergency Plan

### Если что-то пошло не так

```bash
# Откат на предыдущую версию
cast send $PROXY \
  "upgradeTo(address)" $OLD_IMPLEMENTATION \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

- [ ] Есть список всех implementation адресов
- [ ] Есть доступ к owner кошельку
- [ ] Команда знает процедуру отката
- [ ] Есть контакты для экстренной связи

### Контакты

- [ ] Список разработчиков с контактами
- [ ] Контакты security аудиторов
- [ ] Контакты Base support
- [ ] Контакты community managers

## Документация

### Обновление документации

- [ ] README обновлен с новыми адресами
- [ ] Changelog обновлен
- [ ] API документация актуальна
- [ ] Примеры кода обновлены

### Коммуникация

- [ ] Команда уведомлена о деплое
- [ ] Пользователи уведомлены (если нужно)
- [ ] Документация опубликована
- [ ] Блог пост написан (опционально)

## Финальная проверка

- [ ] Все адреса сохранены
- [ ] Все тесты прошли
- [ ] Мониторинг настроен
- [ ] Документация обновлена
- [ ] Команда обучена
- [ ] Emergency plan готов

## Полезные команды

```bash
# Проверить версию
cast call $PROXY "version()(uint256)" --rpc-url $RPC_URL

# Проверить owner
cast call $PROXY "owner()(address)" --rpc-url $RPC_URL

# Проверить implementation
cast implementation $PROXY --rpc-url $RPC_URL

# Проверить баланс
cast balance $PROXY --rpc-url $RPC_URL

# История upgrades
cast logs --address $PROXY "ContractUpgraded(uint256)" --rpc-url $RPC_URL
```

---

**Готово к production? Проверьте все пункты! ✅**
