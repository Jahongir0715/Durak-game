const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Отдаем статику из папки public
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Здесь будут обработчики событий для игры

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
