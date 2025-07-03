const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Создаем приложение Express
const app = express();

// Создаем HTTP-сервер
const server = http.createServer(app);

// Создаем Socket.IO сервер, связанный с HTTP-сервером
const io = new Server(server);

// Обслуживаем статические файлы из папки public (создадим позже)
app.use(express.static('public'));

// При подключении нового клиента через сокет
io.on('connection', (socket) => {
  console.log('Пользователь подключился, id:', socket.id);

  // Пример обработки события от клиента
  socket.on('message', (msg) => {
    console.log('Сообщение от клиента:', msg);

    // Можно отправить ответ всем подключенным клиентам
    io.emit('message', `От сервера: ${msg}`);
  });

  // Обработка отключения клиента
  socket.on('disconnect', () => {
    console.log('Пользователь отключился, id:', socket.id);
  });
});

// Запускаем сервер на порту 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
const path = require('path');

app.use(express.static(path.join(__dirname, '..')));
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg); // отправляем всем подключенным
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});
// Получить позицию элемента на экране
function getPos(elem) {
  const rect = elem.getBoundingClientRect();
  return {x: rect.left + window.scrollX, y: rect.top + window.scrollY};
}

// Функция анимированной раздачи карты
function dealCardWithAnimation(targetContainer, card, delay = 0) {
  return new Promise(resolve => {
    // Создаем DOM элемент карты поверх всего
    const flyingCard = createCardDiv(card);
    flyingCard.style.position = 'absolute';
    flyingCard.style.zIndex = 1000;
    flyingCard.style.width = '60px';
    flyingCard.style.height = '90px';

    // Позиция колоды — старт анимации
    const deckPos = getPos(deckElem);
    flyingCard.style.left = deckPos.x + 'px';
    flyingCard.style.top = deckPos.y + 'px';
    flyingCard.style.transform = 'scale(0.5)';
    document.body.appendChild(flyingCard);

    // Цель — позиция контейнера руки игрока/бота
    const targetPos = getPos(targetContainer);

    // Смещение (примерно, можно точнее сделать)
    const tx = targetPos.x - deckPos.x;
    const ty = targetPos.y - deckPos.y;

    // Запускаем анимацию через CSS переменные и transition
    setTimeout(() => {
      flyingCard.style.transition = 'transform 0.6s ease, left 0.6s ease, top 0.6s ease, opacity 0.6s ease';
      flyingCard.style.transform = 'scale(1)';
      flyingCard.style.left = targetPos.x + 'px';
      flyingCard.style.top = targetPos.y + 'px';
    }, delay);

    // По окончании анимации удаляем летящую карту и обновляем руку
    flyingCard.addEventListener('transitionend', () => {
      flyingCard.remove();
      renderHand(targetContainer, targetContainer === playerHandElem ? playerHand : botHand, targetContainer === botHandElem);
      resolve();
    });
  });
}

// Новая функция раздачи с анимацией
async function dealCardsAnimated() {
  while (playerHand.length < 6 && deck.length > 0) {
    playerHand.push(deck.pop());
    await dealCardWithAnimation(playerHandElem, playerHand[playerHand.length-1], 0);
    renderDeck();
  }
  while (botHand.length < 6 && deck.length > 0) {
    botHand.push(deck.pop());
    await dealCardWithAnimation(botHandElem, botHand[botHand.length-1], 0);
    renderDeck();
  }
}
