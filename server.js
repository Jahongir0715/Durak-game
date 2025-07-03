const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let waitingPlayer = null;

// Карты и логика игры
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Комнаты с играми: roomId -> {players: [socket1, socket2], gameState: {...}}
const games = {};

io.on('connection', (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  if (waitingPlayer) {
    // Создаем комнату
    const roomId = `${waitingPlayer.id}#${socket.id}`;
    socket.join(roomId);
    waitingPlayer.join(roomId);

    // Создаем новую игру
    const deck = shuffleDeck(createDeck());
    const trumpCard = deck[deck.length - 1];
    const player1Hand = deck.slice(0, 6);
    const player2Hand = deck.slice(6, 12);
    const restDeck = deck.slice(12, deck.length - 1);

    games[roomId] = {
      players: [waitingPlayer.id, socket.id],
      hands: {
        [waitingPlayer.id]: player1Hand,
        [socket.id]: player2Hand,
      },
      trump: trumpCard,
      deck: restDeck,
      battlefield: [],
      turn: waitingPlayer.id, // кто ходит первым
    };

    // Отправляем начало игры обоим игрокам
    io.to(roomId).emit('game_start', {
      trump: trumpCard,
      hands: {
        [waitingPlayer.id]: player1Hand,
        [socket.id]: player2Hand,
      },
      turn: waitingPlayer.id,
    });

    waitingPlayer = null;

  } else {
    waitingPlayer = socket;
    socket.emit('waiting', 'Ожидаем второго игрока...');
  }

  socket.on('play_card', ({ roomId, card }) => {
    const game = games[roomId];
    if (!game) return;

    if (socket.id !== game.turn) {
      socket.emit('error_msg', 'Сейчас не ваш ход!');
      return;
    }

    // Проверяем, есть ли у игрока такая карта
    const hand = game.hands[socket.id];
    const cardIndex = hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (cardIndex === -1) {
      socket.emit('error_msg', 'У вас нет такой карты!');
      return;
    }

    // Удаляем карту из руки и кладём на поле
    hand.splice(cardIndex, 1);
    game.battlefield.push({ playerId: socket.id, card });

    // Передаём ход другому игроку
    game.turn = game.players.find(id => id !== socket.id);

    // Обновляем состояние игры для обоих игроков
    io.to(roomId).emit('update', {
      hands: game.hands,
      battlefield: game.battlefield,
      turn: game.turn,
    });
  });

  socket.on('disconnect', () => {
    console.log(`Игрок отключился: ${socket.id}`);

    // Если игрок был в ожидании, убираем
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    // Находим игры, где был игрок, и уведомляем оппонента
    for (const roomId in games) {
      if (games[roomId].players.includes(socket.id)) {
        io.to(roomId).emit('player_disconnect', socket.id);
        delete games[roomId];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
