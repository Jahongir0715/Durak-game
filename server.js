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
