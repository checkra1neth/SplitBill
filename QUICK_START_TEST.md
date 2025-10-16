# ⚡ Быстрый старт и тестирование

## 🚀 Запуск за 2 минуты

### 1. Запустить приложение
```bash
cd splitbill
npm run dev
```

### 2. Открыть браузер
Перейти на http://localhost:3000

### 3. Быстрый тест (5 минут)

#### ✅ Тест 1: Создание счета
1. Нажать "Connect Wallet"
2. Выбрать Coinbase Smart Wallet или Base Account
3. Подключить кошелек
4. Ввести название: "Test Dinner"
5. Добавить позицию: "Pizza" - $18
6. Добавить позицию: "Pasta" - $22
7. Добавить свой адрес как участника
8. Чаевые: $10, Налог: $5
9. Нажать "Create Bill"

**Ожидаемый результат**: ✅ Счет создан, появился toast, перенаправление на страницу счета

#### ✅ Тест 2: Sharing
1. На странице счета нажать "Copy Link"
2. Открыть ссылку в новой вкладке
3. Нажать "Show QR Code"

**Ожидаемый результат**: ✅ Счет загружается, QR код отображается

#### ✅ Тест 3: Темная тема
1. Нажать на иконку 🌙/☀️ в header
2. Обновить страницу

**Ожидаемый результат**: ✅ Тема меняется и сохраняется

#### ✅ Тест 4: Мультивалюта
1. На странице счета найти переключатель валют
2. Переключить USD → EUR → GBP

**Ожидаемый результат**: ✅ Суммы пересчитываются

#### ✅ Тест 5: Responsive
1. Открыть DevTools (F12)
2. Переключить на iPhone view
3. Проверить интерфейс

**Ожидаемый результат**: ✅ Интерфейс адаптируется

---

## 🎯 Если все работает

### Следующие шаги:

1. **Деплой на Vercel** (10 минут)
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SplitBill"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```
   Затем на vercel.com:
   - Import repository
   - Add env: NEXT_PUBLIC_ONCHAINKIT_API_KEY
   - Deploy

2. **Записать видео** (15 минут)
   - Открыть VIDEO_SCRIPT.md
   - Записать через Loom или OBS
   - Показать весь flow из тестов выше
   - Загрузить на YouTube

3. **Отправить на Base Batches** (5 минут)
   - Перейти на https://base-batches-builder-track.devfolio.co/
   - Заполнить форму
   - Добавить ссылки (Vercel URL, GitHub, Video)
   - Submit!

---

## 🐛 Если что-то не работает

### Проблема: Кошелек не подключается
**Решение**: 
- Проверить, что API ключ в .env.local
- Перезапустить dev сервер
- Попробовать другой браузер

### Проблема: Build ошибки
**Решение**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Проблема: Страница не загружается
**Решение**:
- Проверить консоль браузера (F12)
- Проверить терминал на ошибки
- Очистить localStorage

---

## 📊 Чеклист готовности

- [ ] Приложение запускается без ошибок
- [ ] Можно создать счет
- [ ] Sharing работает
- [ ] Темная тема работает
- [ ] Мультивалюта работает
- [ ] Responsive дизайн работает
- [ ] Кошелек подключается

**Если все ✅ - готов к деплою!**

---

## 🎬 Для видео демо

### Сценарий (2 минуты)

**0:00-0:10** - Intro
"Hi! This is SplitBill - an onchain bill splitting app on Base"

**0:10-0:25** - Problem
"Ever split a dinner bill? It's messy. Who paid? Who owes? SplitBill solves this."

**0:25-1:25** - Demo (показать все 5 тестов выше)
- Connect wallet
- Create bill
- Add items
- Share via QR
- Show calculations
- Switch theme
- Show responsive

**1:25-1:40** - Tech
"Built with OnchainKit, Base Sepolia, Smart Wallet. Optional escrow for security."

**1:40-1:50** - Value
"Instant, transparent, trustless. No more awkward money conversations."

**1:50-2:00** - Closing
"SplitBill - bringing a billion users onchain, one bill at a time. Try it now!"

---

**Готов? Запускай `npm run dev` и тестируй! 🚀**
