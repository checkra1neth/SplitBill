# Escrow Activation Guide

## Как работает Escrow теперь

### 1. Создание счета с Escrow
1. На главной странице включите checkbox "Use Escrow Protection"
2. Введите название счета
3. Нажмите "Create Bill"
4. Появится сообщение: "Bill created! Add items and participants to activate escrow"

### 2. Добавление позиций и участников
1. На странице счета добавьте позиции (items)
2. Добавьте участников
3. Установите чаевые и налог (опционально)

### 3. Активация Escrow
После добавления позиций и участников появится блок:

**"Ready to Activate Escrow Protection"**
- Кнопка "Activate Escrow Protection"
- При нажатии откроется кошелек для подтверждения транзакции
- После подтверждения escrow будет активирован

### 4. Статусы Escrow

#### Ожидание активации
```
🔐 Escrow Protection Enabled
Add items to activate escrow protection
```

#### Готов к активации
```
🔐 Ready to Activate Escrow Protection
Your bill is ready! Activate escrow to lock funds until everyone pays.
[Activate Escrow Protection]
```

#### Активирован
После активации появится:
- Escrow status display
- Payment tracking
- Automatic settlement когда все оплатят

## Компоненты

### ActivateEscrowButton
**Файл**: `src/components/ActivateEscrowButton.tsx`

**Логика**:
- Показывается только если `bill.escrowEnabled === true`
- Скрывается если escrow уже активирован (`bill.escrowBillId` существует)
- Проверяет наличие позиций и участников
- Валидирует что все shares > 0

**Состояния**:
1. **Waiting**: Нужно добавить позиции
2. **Ready**: Можно активировать
3. **Activating**: Транзакция в процессе
4. **Activated**: Escrow активирован (компонент скрывается)

## Преимущества нового подхода

### ✅ Решает проблему "Invalid share"
- Escrow создается только когда есть валидные shares
- Нет ошибок при создании пустого счета

### ✅ Лучший UX
- Пользователь видит прогресс
- Понятные инструкции на каждом шаге
- Контроль над активацией

### ✅ Гибкость
- Можно создать счет, добавить позиции, затем решить использовать escrow или нет
- Можно изменить позиции перед активацией

## Технические детали

### Проверка готовности
```typescript
const canActivate =
  bill.escrowEnabled &&
  !bill.escrowBillId && // Not already activated
  bill.items.length > 0 && // Has items
  bill.participants.length > 0 && // Has participants
  !hasActivated;

const shares = calculateParticipantShares(bill);
const hasValidShares = shares.every((share) => share.amount > 0);
```

### Активация
```typescript
const escrowBillId = await createEscrowBill(bill, shares);
updateEscrowMetadata(escrowBillId, hash);
```

## Тестирование

### Сценарий 1: Создание с Escrow
1. ✅ Включить "Use Escrow Protection"
2. ✅ Создать счет
3. ✅ Увидеть сообщение о необходимости добавить позиции
4. ✅ Добавить позицию
5. ✅ Добавить участника
6. ✅ Увидеть кнопку "Activate Escrow Protection"
7. ✅ Нажать кнопку
8. ✅ Подтвердить транзакцию
9. ✅ Увидеть escrow status

### Сценарий 2: Создание без Escrow
1. ✅ Не включать checkbox
2. ✅ Создать счет
3. ✅ Добавить позиции
4. ✅ Использовать direct payment
5. ✅ Не видеть escrow UI

## Backward Compatibility

✅ Старые счета без escrow продолжают работать
✅ Новые счета могут использовать escrow или direct payment
✅ Escrow опционален - не обязателен

## Следующие шаги

### Для полного тестирования
1. Создать счет с escrow
2. Добавить позиции и участников
3. Активировать escrow
4. Оплатить доли
5. Проверить automatic settlement

### Для production
- ✅ UI готов
- ✅ Логика готова
- ✅ Error handling готов
- ⏳ Нужно больше testnet тестирования
- ⏳ Audit контракта

## Troubleshooting

### Кнопка не появляется
- Проверьте что `escrowEnabled: true` в bill
- Проверьте что есть позиции
- Проверьте что есть участники

### Ошибка "Invalid share"
- Убедитесь что все shares > 0
- Проверьте что позиции привязаны к участникам

### Транзакция не подтверждается
- Проверьте баланс testnet ETH
- Проверьте что подключены к Base Sepolia
- Проверьте gas price

---

**Готово к использованию!** 🎉
