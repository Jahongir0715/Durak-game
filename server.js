const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = [];
let gameState = {
  deck: [],
  playersCards: {},
  trump: null,
  attackCards: [],
  defenseCards: [],
  turn: null,
};

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = [6,7,8,9,10,'J','Q','K','A'];
  const deck = [];
  for(const suit of suits) {
    for(const rank of ranks) {
      deck.push({suit, rank});
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Add player
  players.push(socket.id);
  gameState.playersCards[socket.id] = [];

  // Start game if 2 players connected
  if(players.length === 2) {
    startGame();
  }

  socket.on('playCard', (card) => {
    // TODO: обработать ход
    console.log(`Player ${socket.id} played`, card);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    players = players.filter(p => p !== socket.id);
    delete gameState.playersCards[socket.id];
  });
});

function startGame() {
  gameState.deck = createDeck();
  gameState.trump = gameState.deck[gameState.deck.length -1].suit;
  players.forEach(p => {
    gameState.playersCards[p] = gameState.deck.splice(0, 6);
  });
  gameState.turn = players[0];

  io.emit('gameStarted', gameState);
}

http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
