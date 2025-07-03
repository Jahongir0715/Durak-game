const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

let players = [];  // массив игроков {id, hand}
let deck = [];
let trumpCard = null;
let battlefield = [];
let currentAttackerIndex = 0; // индекс в players - кто ходит

function createDeck() {
  const suits = ['♠', '♣', '♥', '♦'];
  const ranks = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
  let newDeck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      newDeck.push({ suit, rank });
    }
  }
  return newDeck.sort(() => Math.random() - 0.5);
}

function dealCards() {
  for (let player of players) {
    player.hand = deck.splice(0, 6);
  }
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Добавляем игрока в список
  players.push({ id: socket.id, hand: [] });

  // Если достаточно игроков — начинаем игру
  if (players.length >= 2 && !trumpCard) {
    startGame();
  }

  // Отправить игроку обновления
  sendGameState();

  // Когда игрок ходит
  socket.on('playerMove', (cardIndex) => {
    if (players[currentAttackerIndex].id !== socket.id) {
      socket.emit('errorMessage', 'Сейчас не ваш ход!');
      return;
    }
    // TODO: логика проверки и обработки хода игрока
    // Для простоты пока просто передаем ход дальше

    // Пример: удаляем карту из руки атакующего
    let player = players[currentAttackerIndex];
    const card = player.hand.splice(cardIndex, 1)[0];
    battlefield.push({ attacker: card, defender: null });

    // Переходим к следующему игроку (простой круг)
    currentAttackerIndex = (currentAttackerIndex + 1) % players.length;

    sendGameState();
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    players = players.filter(p => p.id !== socket.id);
    // Если игроков меньше 2 — сбрасываем игру
    if (players.length < 2) {
      resetGame();
    } else {
      sendGameState();
    }
  });
});

function startGame() {
  deck = createDeck();
  trumpCard = deck[deck.length - 1];
  dealCards();
  battlefield = [];
  currentAttackerIndex = 0;
  console.log('Game started!');
  sendGameState();
}

function resetGame() {
  deck = [];
  trumpCard = null;
  battlefield = [];
  currentAttackerIndex = 0;
  console.log('Game reset due to insufficient players');
}

function sendGameState() {
  for (let player of players) {
    const otherPlayers = players.filter(p => p.id !== player.id);
    io.to(player.id).emit('gameState', {
      yourHand: player.hand,
      battlefield,
      trumpCard,
      playersCount: players.length,
      yourTurn: players[currentAttackerIndex].id === player.id,
      otherPlayers: otherPlayers.map(p => ({ id: p.id, handCount: p.hand.length })),
    });
  }
}

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
