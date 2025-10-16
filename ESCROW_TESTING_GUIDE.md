# 🧪 Escrow Testing Guide - Полное тестирование

## Как протестировать Escrow с несколькими плательщиками

### Подготовка

#### Вариант 1: Два кошелька (рекомендуется)
1. Основной кошелек (уже подключен)
2. Второй кошелек (другой браузер или incognito mode)

#### Вариант 2: Один кошелек (для быстрого теста)
1. Добавить себя как участника дважды
2. Оплатить обе доли

---

## 📋 Полный сценарий тестирования

### Шаг 1: Создание Escrow счета

1. **Откройте главную страницу**
   - http://localhost:3000

2. **Подключите кошелек**
   - Нажмите "Connect Wallet"
   - Выберите Coinbase Smart Wallet или Base Account

3. **Создайте счет с Escrow**
   - Введите название: "Test Escrow Dinner"
   - ✅ Включите checkbox "Use Escrow Protection"
   - Нажмите "Create Bill"
   - Увидите: "Bill created! Add items and participants to activate escrow"

### Шаг 2: Добавление позиций

1. **Добавьте первую позицию**
   - Description: "Pizza"
   - Amount: 20
   - Нажмите "Add Item"

2. **Добавьте вторую позицию**
   - Description: "Drinks"
   - Amount: 10
   - Нажмите "Add Item"

3. **Установите чаевые и налог**
   - Tip: 5
   - Tax: 3
   - Нажмите "Update"

**Total должен быть: $38**

### Шаг 3: Добавление участников

#### Вариант A: Два разных кошелька
1. **Добавьте себя** (автоматически добавлен как создатель)
2. **Добавьте второго участника**
   - Введите адрес второго кошелька
   - Или basename (например: friend.base.eth)
   - Нажмите "Add Participant"

#### Вариант B: Один кошелек (для теста)
1. Вы уже добавлены как создатель
2. Добавьте тестовый адрес:
   ```
   0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ```

**Каждый участник должен платить: $19**

### Шаг 4: Активация Escrow

1. **Найдите блок "Ready to Activate Escrow Protection"**
   ```
   🔐 Ready to Activate Escrow Protection
   Your bill is ready! Activate escrow to lock funds until everyone pays.
   [Activate Escrow Protection]
   ```

2. **Нажмите "Activate Escrow Protection"**
   - Откроется кошелек
   - Подтвердите транзакцию
   - Дождитесь подтверждения (~2-5 секунд)

3. **Проверьте результат**
   - Появится блок "Escrow Status"
   - Статус: "In Progress"
   - Payments: "0/2 paid"
   - Ссылка "View on BaseScan" для проверки контракта

### Шаг 5: Первая оплата (Вы)

1. **Найдите секцию "Split"**
   - Ваш адрес: 0x984F...2D4f
   - Ваша доля: $19.00

2. **Нажмите "Pay My Share"**
   - Если escrow активирован - используется EscrowPaymentButton
   - Если нет - используется обычный payment
   - Подтвердите транзакцию в кошельке

3. **Дождитесь подтверждения**
   - Toast: "Payment confirmed onchain"
   - Появится ✅ рядом с вашим именем
   - Ссылка "Receipt →" для просмотра транзакции

4. **Проверьте Escrow Status**
   - Обновится автоматически
   - Payments: "1/2 paid"
   - Статус: "In Progress"

### Шаг 6: Вторая оплата (Второй участник)

#### Вариант A: Второй кошелек

1. **Скопируйте ссылку на счет**
   - Нажмите "Copy" в секции "Share Bill"
   - Или используйте QR код

2. **Откройте в другом браузере/incognito**
   - Вставьте ссылку
   - Подключите второй кошелек

3. **Оплатите долю**
   - Найдите свой адрес в списке участников
   - Нажмите "Pay My Share"
   - Подтвердите транзакцию

#### Вариант B: Симуляция (для теста)

Если у вас только один кошелек, вы можете:
1. Проверить контракт на BaseScan
2. Увидеть что 1/2 оплачено
3. Дождаться когда кто-то еще оплатит (или добавить testnet ETH на второй адрес)

### Шаг 7: Проверка Settlement

После того как все участники оплатили:

1. **Escrow Status обновится**
   - Payments: "2/2 paid"
   - Статус: "Awaiting Settlement"
   - Затем: "Settled"

2. **Automatic Settlement**
   - Контракт автоматически отправит средства создателю
   - Это происходит в той же транзакции, что и последний платеж

3. **Проверьте на BaseScan**
   - Откройте ссылку "View on BaseScan"
   - Увидите все транзакции:
     - Bill Created
     - Payment 1
     - Payment 2
     - Settlement

---

## 🔍 Что проверять

### После активации Escrow
- ✅ Escrow Status отображается
- ✅ Payments: "0/X paid"
- ✅ Статус: "In Progress"
- ✅ Ссылка на BaseScan работает

### После первой оплаты
- ✅ Toast: "Payment confirmed onchain"
- ✅ ✅ появляется рядом с участником
- ✅ Ссылка "Receipt →" работает
- ✅ Escrow Status: "1/X paid"
- ✅ Кнопка "Pay My Share" становится disabled

### После всех оплат
- ✅ Escrow Status: "X/X paid"
- ✅ Статус: "Awaiting Settlement" → "Settled"
- ✅ Все участники отмечены ✅
- ✅ Все receipts доступны

### На BaseScan
- ✅ Contract создан
- ✅ Все payments записаны
- ✅ Settlement выполнен
- ✅ Events: BillCreated, PaymentReceived, BillSettled

---

## 📝 Получение чеков (Receipts)

### Где найти чеки

#### 1. На странице счета
После оплаты появится:
```
✅ Paid by 0x984F...2D4f
Amount: $19.00
[Receipt →]
```

#### 2. В Escrow Status
```
Escrow Status: Settled
Payments: 2/2 paid
[View on BaseScan →]
```

#### 3. На BaseScan
- Откройте ссылку на контракт
- Вкладка "Transactions"
- Найдите свою транзакцию
- Скопируйте Transaction Hash

### Формат чека

Transaction Hash выглядит так:
```
0x2417c218217750f8adbca5c933fb8f139c5414914461bc6b0053c1c08e693911
```

Полная ссылка:
```
https://sepolia.basescan.org/tx/0x2417c218...
```

### Что содержит чек
- ✅ From: адрес плательщика
- ✅ To: адрес escrow контракта
- ✅ Value: сумма в ETH
- ✅ Gas Used: стоимость транзакции
- ✅ Timestamp: дата и время
- ✅ Status: Success/Failed
- ✅ Block Number: номер блока

---

## 🎯 Быстрый тест (5 минут)

Если нужно быстро протестировать:

1. **Создайте счет с escrow** (1 мин)
2. **Добавьте 1 позицию** (30 сек)
3. **Добавьте себя + тестовый адрес** (30 сек)
4. **Активируйте escrow** (1 мин)
5. **Оплатите свою долю** (1 мин)
6. **Проверьте статус** (1 мин)

Результат:
- ✅ Escrow работает
- ✅ Payment записан
- ✅ Status обновляется
- ✅ Receipt доступен

---

## 🐛 Troubleshooting

### Escrow Status не обновляется
- Подождите 10-15 секунд (polling interval)
- Обновите страницу
- Проверьте на BaseScan

### Кнопка "Pay My Share" не работает
- Проверьте что подключен правильный кошелек
- Проверьте баланс testnet ETH
- Проверьте что вы участник счета

### Transaction Failed
- Проверьте gas price
- Проверьте что сумма правильная
- Проверьте что вы еще не оплатили

### Второй участник не может оплатить
- Убедитесь что он открыл правильную ссылку
- Убедитесь что он подключил свой кошелек
- Убедитесь что у него есть testnet ETH

---

## 📊 Ожидаемые результаты

### Gas Costs (Base Sepolia)
- Create Escrow: ~$0.01-0.05
- Pay Share: ~$0.01-0.03
- Settlement: Автоматически (включено в последний payment)

### Timing
- Transaction confirmation: 2-5 секунд
- Status update: 10-15 секунд (polling)
- Settlement: Мгновенно после последнего payment

### Success Indicators
- ✅ All transactions confirmed
- ✅ All participants marked as paid
- ✅ Escrow status: "Settled"
- ✅ Receipts available for all payments

---

## 🎉 Готово!

После успешного тестирования у вас будет:
- ✅ Работающий escrow контракт
- ✅ Записи всех платежей on-chain
- ✅ Receipts для каждого участника
- ✅ Proof of settlement

Теперь можно:
1. Записать видео демо
2. Задеплоить на Vercel
3. Отправить на Base Batches

**Удачи! 🚀**
