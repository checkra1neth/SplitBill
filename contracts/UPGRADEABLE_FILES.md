# Upgradeable Contracts - Список файлов

## Контракты

### Основные контракты
- **SplitBillEscrowUpgradeable.sol** - Upgradeable версия эскроу контракта
- **BillMetadataRegistryUpgradeable.sol** - Upgradeable версия метаданных

### Legacy (старые версии)
- SplitBillEscrow.sol - Оригинальная версия (не upgradeable)
- BillMetadataRegistry.sol - Оригинальная версия (не upgradeable)

## Скрипты деплоя

- **deploy-upgradeable.sh** - Первоначальный деплой с proxy (ОСНОВНОЙ)
- **upgrade-contracts.sh** - Обновление существующих контрактов (ОСНОВНОЙ)
- test-upgrade.sh - Тестирование upgrade функционала
- deploy.sh - Legacy деплой (старая версия)
- deploy-simple.sh - Упрощенный деплой (старая версия)
- deploy-metadata-registry.sh - Деплой только метаданных (старая версия)

## Конфигурация

- **foundry-upgradeable.toml** - Конфигурация Foundry для upgradeable контрактов
- foundry.toml - Основная конфигурация Foundry

## Документация

### Основная документация (ЧИТАТЬ В ПЕРВУЮ ОЧЕРЕДЬ)
1. **UPGRADEABLE_SUMMARY.md** - Итоговая документация (НАЧНИТЕ ОТСЮДА)
2. **UPGRADEABLE_GUIDE.md** - Полное руководство по архитектуре
3. **MIGRATION_PLAN.md** - План миграции с legacy версий
4. **COMMANDS_CHEATSHEET.md** - Шпаргалка по всем командам

### Дополнительная документация
5. **ARCHITECTURE.md** - Визуальные схемы архитектуры
6. **DEPLOYMENT_CHECKLIST.md** - Чеклист для деплоя
7. **UPGRADEABLE_FILES.md** - Этот файл (список всех файлов)
8. README.md - Общая документация (обновлена с upgradeable)

## Структура проекта

```
contracts/
├── Контракты
│   ├── SplitBillEscrowUpgradeable.sol          ⭐ НОВЫЙ
│   ├── BillMetadataRegistryUpgradeable.sol     ⭐ НОВЫЙ
│   ├── SplitBillEscrow.sol                     (legacy)
│   └── BillMetadataRegistry.sol                (legacy)
│
├── Скрипты
│   ├── deploy-upgradeable.sh                   ⭐ ОСНОВНОЙ
│   ├── upgrade-contracts.sh                    ⭐ ОСНОВНОЙ
│   ├── test-upgrade.sh
│   ├── deploy.sh                               (legacy)
│   ├── deploy-simple.sh                        (legacy)
│   ├── deploy-metadata-registry.sh             (legacy)
│   ├── test-refund-features.sh
│   └── verify.sh
│
├── Конфигурация
│   ├── foundry-upgradeable.toml                ⭐ НОВЫЙ
│   └── foundry.toml
│
└── Документация
    ├── UPGRADEABLE_SUMMARY.md                  ⭐ НАЧНИТЕ ОТСЮДА
    ├── UPGRADEABLE_GUIDE.md                    ⭐ ВАЖНО
    ├── MIGRATION_PLAN.md                       ⭐ ВАЖНО
    ├── COMMANDS_CHEATSHEET.md                  ⭐ ВАЖНО
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT_CHECKLIST.md
    ├── UPGRADEABLE_FILES.md                    (этот файл)
    └── README.md                               (обновлен)
```

## Быстрый старт

### Для нового проекта

1. Читайте: `UPGRADEABLE_SUMMARY.md`
2. Установите зависимости: `forge install OpenZeppelin/openzeppelin-contracts-upgradeable`
3. Деплойте: `./deploy-upgradeable.sh`
4. Сохраните адреса в `.env.local`

### Для обновления

1. Редактируйте: `SplitBillEscrowUpgradeable.sol`
2. Обновляйте: `./upgrade-contracts.sh`
3. Готово! Адреса не меняются

### Для изучения

1. `UPGRADEABLE_SUMMARY.md` - Общий обзор
2. `ARCHITECTURE.md` - Визуальные схемы
3. `UPGRADEABLE_GUIDE.md` - Детальное руководство
4. `COMMANDS_CHEATSHEET.md` - Все команды

## Что использовать

### ✅ Используйте (Upgradeable)

- SplitBillEscrowUpgradeable.sol
- BillMetadataRegistryUpgradeable.sol
- deploy-upgradeable.sh
- upgrade-contracts.sh
- foundry-upgradeable.toml

### ⚠️ Legacy (не используйте для новых деплоев)

- SplitBillEscrow.sol
- BillMetadataRegistry.sol
- deploy.sh
- deploy-simple.sh
- deploy-metadata-registry.sh

## Зависимости

### Требуется установить

```bash
# OpenZeppelin Upgradeable
forge install OpenZeppelin/openzeppelin-contracts-upgradeable --no-commit

# jq (для парсинга JSON)
brew install jq  # macOS
apt install jq   # Linux
```

### Проверка установки

```bash
forge --version          # Foundry
cast --version           # Cast
jq --version             # jq
ls lib/openzeppelin-contracts-upgradeable  # OpenZeppelin
```

## Переменные окружения

### Для testnet

```bash
export PRIVATE_KEY=your_key_without_0x
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

### Для mainnet

```bash
export PRIVATE_KEY=your_mainnet_key
export BASE_MAINNET_RPC_URL=https://mainnet.base.org
```

### В .env.local

```env
NEXT_PUBLIC_ESCROW_ADDRESS=0x...              # Proxy адрес
NEXT_PUBLIC_METADATA_REGISTRY_ADDRESS=0x...   # Proxy адрес
```

## Важные адреса

После деплоя сохраните:

1. **Proxy адреса** (используются в приложении)
   - Escrow Proxy: 0x...
   - Metadata Proxy: 0x...

2. **Implementation адреса** (для отката)
   - Escrow Implementation V1: 0x...
   - Metadata Implementation V1: 0x...

3. **Owner адрес** (кто может обновлять)
   - Owner: 0x...

## Полезные ссылки

- [OpenZeppelin Upgradeable Contracts](https://docs.openzeppelin.com/contracts/4.x/upgradeable)
- [UUPS Pattern](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable)
- [Foundry Book](https://book.getfoundry.sh/)
- [Base Documentation](https://docs.base.org/)

## Поддержка

Если возникли вопросы:

1. Проверьте `UPGRADEABLE_SUMMARY.md`
2. Посмотрите `COMMANDS_CHEATSHEET.md`
3. Изучите `ARCHITECTURE.md`
4. Проверьте `DEPLOYMENT_CHECKLIST.md`

## Changelog

- **2025-10-21**: Создана upgradeable архитектура
  - Добавлены UUPS proxy контракты
  - Созданы скрипты деплоя и upgrade
  - Написана полная документация
  - Готово для production

---

**Все готово для масштабируемого развития проекта! 🚀**
