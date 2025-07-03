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
