const socket = io();

const suitsIcons = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

let playerId = null;
let trump = null;
let playerHand = [];
let turn = null;

const statusDiv = document.getElementById('status');
const trumpSpan = document.querySelector('#trump span');
const battlefieldDiv = document.getElementById('battlefield');
const playerHandDiv = document.getElementById('player-hand');

socket.on('waiting', (msg) => {
  statusDiv.textContent = msg;
});

socket.on('game_start', (data) => {
  statusDiv.textContent = 'Игра началась!';
  playerId = socket.id;
  trump = data.trump;
  playerHand = data.hands[playerId];
  turn = data.turn;

  trumpSpan.textContent = suitsIcons[trump.suit];

  renderHand();
  renderBattlefield([]);
  updateTurnStatus();
});

socket.on('update', (data) => {
  playerHand = data.hands[playerId];
  turn = data.turn;

  renderHand();
  renderBattlefield(data.battlefield);
  updateTurnStatus();
});

socket.on('player_disconnect', (id) => {
  statusDiv.textContent = `Игрок ${id} отключился. Игра завершена.`;
  disableAll();
});

socket.on('error_msg', (msg) => {
  alert(msg);
});

function renderHand() {
  playerHandDiv.innerHTML = '';
  playerHand.forEach((card, idx) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `${card.rank}<br>${suitsIcons[card.suit]}`;
    cardDiv.onclick = () => {
      if (turn !== playerId) {
        alert('Сейчас не ваш ход!');
        return;
      }
      playCard(idx);
    };
    playerHandDiv.appendChild(cardDiv);
  });
}

function renderBattlefield(battlefield) {
  battlefieldDiv.innerHTML = '';
  battlefield.forEach(({ playerId: pid, card }) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `${card.rank}<br>${suitsIcons[card.suit]}`;
    if (pid === playerId) {
      cardDiv.style.border = '2px solid green';
    } else {
      cardDiv.style.border = '2px solid red';
    }
    battlefieldDiv.appendChild(cardDiv);
  });
}

function playCard(index) {
  const card = playerHand[index];
  socket.emit('play_card', { roomId: null, card }); // roomId не нужен, сервер знает комнату по сокету
}

function updateTurnStatus() {
  if (turn === playerId) {
    statusDiv.textContent = 'Ваш ход!';
  } else {
    statusDiv.textContent = 'Ход соперника...';
  }
}

function disableAll() {
  playerHandDiv.innerHTML = '';
  battlefieldDiv.innerHTML = '';
}
