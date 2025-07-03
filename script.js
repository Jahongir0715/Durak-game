const suits = ['♠', '♥', '♦', '♣'];
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

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

const deck = createDeck();
shuffle(deck);

const playerHand = deck.splice(0, 6);
const botHand = deck.splice(0, 6);

const trumpCard = deck[deck.length - 1];
const trumpSuit = trumpCard.suit;

console.log('Козырь:', trumpSuit);
console.log('Рука игрока:', playerHand);
console.log('Рука бота:', botHand);

function renderGame() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `
    <h2>Козырь: ${trumpCard.rank}${trumpCard.suit}</h2>
    <h3>Ваша рука:</h3>
    <div id="player-hand"></div>
  `;

  renderCards(playerHand, 'player-hand');
}

function renderCards(hand, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  hand.forEach(card => {
    const cardElem = document.createElement('div');
    cardElem.textContent = card.rank + card.suit;
    cardElem.className = 'card';
    container.appendChild(cardElem);
  });
}

// Проверяем, есть ли Telegram WebApp API
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();

  console.log('Telegram WebApp API доступен');

  // Можно добавить сюда взаимодействие с tg, если нужно
} else {
  console.log('Telegram WebApp API не доступен — запусти в Telegram');
}

// Запускаем отрисовку игры
renderGame();
// Отрисовка карт игрока с кликом
function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';

  playerHand.forEach((card, index) => {
    const cardElem = document.createElement('div');
    cardElem.textContent = card.rank + card.suit;
    cardElem.className = 'card';
    cardElem.onclick = () => playerPlaysCard(index);
    container.appendChild(cardElem);
  });
}

// Функция, которая вызывается, когда игрок выбирает карту
function playerPlaysCard(cardIndex) {
  const playedCard = playerHand[cardIndex];
  console.log('Игрок ходит картой:', playedCard.rank + playedCard.suit);

  // Тут добавим логику хода игрока
  // Пока просто уберём карту из руки и перерисуем
  playerHand.splice(cardIndex, 1);

  renderPlayerHand();
}

// Запускаем отрисовку в самом конце renderGame
function renderGame() {
  const gameContainer = document.getElementById('game-container');
  gameContainer.innerHTML = `
    <h2>Козырь: ${trumpCard.rank}${trumpCard.suit}</h2>
    <h3>Ваша рука:</h3>
    <div id="player-hand"></div>
  `;

  renderPlayerHand();
}

// Вызовем функцию для начальной отрисовки
renderGame();

// Отрисовка карт игрока с кликом (как раньше)
function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';

  playerHand.forEach((card, index) => {
    const cardElem = document.createElement('div');
    cardElem.textContent = card.rank + card.suit;
    cardElem.className = 'card';
    cardElem.onclick = () => playerPlaysCard(index);
    container.appendChild(cardElem);
  });
}

// Отрисовка карт бота (рубашкой, без клика)
function renderBotHand() {
  const container = document.getElementById('bot-hand');
  container.innerHTML = '';

  botHand.forEach(() => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card bot-card';
    container.appendChild(cardElem);
  });
}

function renderGame() {
  document.getElementById('trump-card').textContent = trumpCard.rank + trumpCard.suit;

  renderPlayerHand();
  renderBotHand();
}

// При клике карта уходит из руки игрока
function playerPlaysCard(cardIndex) {
  const playedCard = playerHand[cardIndex];
  console.log('Игрок ходит картой:', playedCard.rank + playedCard.suit);

  playerHand.splice(cardIndex, 1);

  renderGame();
}

// Изначальный вызов
renderGame();
