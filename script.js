const socket = io();

let roomId = null;

socket.on('waiting', () => {
  alert('Ожидаем второго игрока...');
});

socket.on('game_start', (data) => {
  roomId = data.roomId;
  console.log(`Игра началась. Ты — ${data.yourId}`);
  startGame();
});

function playCard(index) {
  const card = playerHand[index];

  // отправляем ход на сервер
  socket.emit('play_card', {
    roomId,
    card,
  });

  // отображаем карту у себя
  const field = document.getElementById('battlefield');
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.innerHTML = `${card.rank}<br>${card.suit[0].toUpperCase()}`;
  field.appendChild(cardDiv);

  playerHand.splice(index, 1);
  renderPlayerHand();
}

socket.on('opponent_card', (card) => {
  const field = document.getElementById('battlefield');
  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.innerHTML = `${card.rank}<br>${card.suit[0].toUpperCase()}`;
  cardDiv.style.backgroundColor = '#ffe'; // визуально отличим
  field.appendChild(cardDiv);
});
