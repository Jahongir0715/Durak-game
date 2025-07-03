// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log(`👤 Игрок подключился: ${socket.id}`);

  if (waitingPlayer) {
    const roomId = `${waitingPlayer.id}-${socket.id}`;
    socket.join(roomId);
    waitingPlayer.join(roomId);

    // Отправляем обоим сигнал о начале игры
    io.to(roomId).emit('game_start', {
      roomId,
      players: [waitingPlayer.id, socket.id],
      yourId: socket.id
    });

    console.log(`🎮 Началась игра между ${waitingPlayer.id} и ${socket.id}`);
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit('waiting');
    console.log(`🕐 Ожидание второго игрока...`);
  }

  socket.on('play_card', (data) => {
    // Отправляем карту второму игроку
    socket.to(data.roomId).emit('opponent_card', data.card);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Игрок отключился: ${socket.id}`);
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });
});

app.use(express.static('public')); // если хранишь index.html там

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
