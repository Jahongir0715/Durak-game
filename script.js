// === UI элементы ===
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const trumpSuitDiv = document.getElementById('trump-suit');
const gameLogDiv = document.getElementById('game-log');
const startBtn = document.getElementById('start-game-btn');
const battlefieldDiv = document.getElementById('battlefield');
const botMoveDiv = document.getElementById('bot-move');

// === Игра ===
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['6','7','8','9','10','J','Q','K','A'];

let deck = [], playerHand = [], botHand = [], trumpCard = {}, trumpSuit = '';
let isMyTurn = false;
let isOnlineGame = false;
let roomId = '';
let socket = null;

// === Создаём колоду и тасуем ===
function createDeck() {
  return suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
}
function shuffle(array) {
  for (let i = array.length -1; i>0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// === Отрисовка руки ===
function renderHand(hand, container, hide = false, clickHandler = null) {
  container.innerHTML = '';
  hand.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.textContent = hide ? '🂠' : card.rank + card.suit;
    if (clickHandler && !hide) {
      el.onclick = () => clickHandler(i);
      el.style.cursor = 'pointer';
    }
    container.appendChild(el);
  });
}

// === Старт игры ===
function startGame(online = false) {
  isOnlineGame = online;
  deck = createDeck();
  shuffle(deck);
  playerHand = deck.splice(0, 6);
  botHand = deck.splice(0, 6);
  trumpCard = deck[deck.length - 1];
  trumpSuit = trumpCard.suit;

  trumpSuitDiv.textContent = `Козырь: ${trumpCard.rank}${trumpCard.suit}`;
  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
  renderHand(botHand, botHandDiv, online ? true : true); // бот — скрытый
  battlefieldDiv.innerHTML = '';
  gameLogDiv.textContent = online ? 'Игра началась! Ваш ход или ждите...' : 'Игра началась! Ваш ход.';
  botMoveDiv.textContent = '';

  if (online) {
    // В сете первый ход пусть делает игрок, кто первый подключился
    isMyTurn = true;
    disablePlayerHand(!isMyTurn);
  } else {
    // Игра с ботом, игрок ходит первым
    isMyTurn = true;
    disablePlayerHand(!isMyTurn);
  }
}

// === Ход игрока ===
function playerPlayCard(index) {
  if (!isMyTurn) return;

  const card = playerHand.splice(index, 1)[0];

  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
  battlefieldDiv.innerHTML = card.rank + card.suit;
  gameLogDiv.textContent = `Вы походили: ${card.rank}${card.suit}`;

  isMyTurn = false;
  disablePlayerHand(true);

  if (isOnlineGame) {
    socket.emit('playerMove', { roomId, move: card });
    botMoveDiv.textContent = 'Ждем ход соперника...';
  } else {
    // Игра с ботом
    botPlay(card);
  }
}

// === Ход бота (заглушка) ===
function botPlay(playerCard) {
  const botCard = botHand.shift();
  renderHand(botHand, botHandDiv, true);
  battlefieldDiv.innerHTML += ' | ' + botCard.rank + botCard.suit;
  gameLogDiv.textContent = `Бот ответил: ${botCard.rank}${botCard.suit}. Ваш ход снова.`;
  botMoveDiv.textContent = '';
  isMyTurn = true;
  disablePlayerHand(false);
}

// === Включаем/выключаем клики по картам игрока ===
function disablePlayerHand(disable) {
  Array.from(playerHandDiv.children).forEach(el => {
    el.style.pointerEvents = disable ? 'none' : 'auto';
    el.style.opacity = disable ? '0.6' : '1';
  });
}

// === Подключение к серверу ===
function setupSocket() {
  socket = io();

  roomId = prompt('Введите ID комнаты для игры (например: game123):');
  socket.emit('joinGame', roomId);

  socket.on('startGame', (data) => {
    gameLogDiv.textContent = data.message;
    startGame(true);
  });

  socket.on('opponentMove', (card) => {
    battlefieldDiv.innerHTML += ' | ' + card.rank + card.suit;
    gameLogDiv.textContent = `Соперник походил: ${card.rank}${card.suit}. Ваш ход.`;
    botMoveDiv.textContent = '';
    isMyTurn = true;
    disablePlayerHand(false);
  });

  socket.on('roomFull', () => {
    alert('Комната заполнена, попробуйте другую.');
  });
}

// === Обработчик кнопки старта ===
startBtn.onclick = () => {
  if (!socket) {
    setupSocket();
  } else {
    startGame(false);
  }
};
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Статика для клиента
app.use(express.static(path.join(__dirname, 'public')));

const rooms = {}; // { roomId: { players: [socketId,...], gameState: {...} } }

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('joinGame', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], gameState: null };
    }
    rooms[roomId].players.push(socket.id);

    if (rooms[roomId].players.length > 2) {
      // Максимум 2 игрока
      socket.emit('roomFull');
      socket.leave(roomId);
      rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
      return;
    }

    if (rooms[roomId].players.length === 2) {
      io.to(roomId).emit('startGame', { message: 'Игра начинается!' });
    }
  });

  socket.on('playerMove', ({ roomId, move }) => {
    // Передаём ход другому игроку в комнате
    socket.to(roomId).emit('opponentMove', move);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    // Убираем игрока из всех комнат
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
      if (rooms[roomId].players.length === 0) delete rooms[roomId];
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
