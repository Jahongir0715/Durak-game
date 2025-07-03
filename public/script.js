const socket = io();

let myCards = [];
let isMyTurn = false;

const handDiv = document.getElementById('hand');
const statusDiv = document.getElementById('status');
const tableDiv = document.getElementById('table');

socket.on('gameStarted', (gameState) => {
  console.log('Game started', gameState);
  myCards = gameState.playersCards[socket.id];
  renderHand();
  statusDiv.textContent = `Трамп: ${gameState.trump}. Ход игрока: ${gameState.turn}`;
  isMyTurn = gameState.turn === socket.id;
});

function renderHand() {
  handDiv.innerHTML = '';
  myCards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.textContent = card.rank + card.suit;
    cardDiv.onclick = () => {
      if (!isMyTurn) {
        alert('Сейчас не ваш ход');
        return;
      }
      socket.emit('playCard', card);
    };
    handDiv.appendChild(cardDiv);
  });
}

socket.on('connect', () => {
  statusDiv.textContent = 'Ожидание других игроков...';
});

