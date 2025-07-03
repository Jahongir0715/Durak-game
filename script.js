// Создаем колоду 36 карт
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Переменные для хранения состояния игры
let deck = [];
let playerHand = [];
let botHand = [];
let trumpCard = null;
let trumpSuit = null;

const startGameBtn = document.getElementById('start-game-btn');
const trumpSuitDiv = document.getElementById('trump-suit');
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const gameLogDiv = document.getElementById('game-log');

// Функция создания колоды
function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Перемешивание колоды (фишер-йейтс)
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Отрисовка руки игрока и бота
function renderHand(hand, container, hideCards = false) {
  container.innerHTML = '';
  hand.forEach(card => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card';
    cardElem.textContent = hideCards ? '🂠' : card.rank + card.suit;
    container.appendChild(cardElem);
  });
}

// Запуск новой игры
function startGame() {
  deck = createDeck();
  shuffle(deck);

  playerHand = deck.splice(0, 6);
  botHand = deck.splice(0, 6);

  trumpCard = deck[deck.length - 1];
  trumpSuit = trumpCard.suit;

  trumpSuitDiv.textContent = `Козырь: ${trumpCard.rank}${trumpCard.suit}`;

  renderHand(playerHand, playerHandDiv);
  renderHand(botHand, botHandDiv, true);

  gameLogDiv.textContent = 'Игра началась! Ваш ход.';
}

// Слушатель кнопки
startGameBtn.addEventListener('click', startGame);
function renderHand(hand, container, hideCards = false, isPlayer = false) {
  container.innerHTML = '';
  hand.forEach((card, index) => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card';
    cardElem.textContent = hideCards ? '🂠' : card.rank + card.suit;

    if (isPlayer && !hideCards) {
      cardElem.style.cursor = 'pointer';
      cardElem.addEventListener('click', () => playerPlayCard(index));
    }

    container.appendChild(cardElem);
  });
}
