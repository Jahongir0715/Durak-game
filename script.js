// === Элементы интерфейса ===
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const trumpSuitDiv = document.getElementById('trump-suit');
const gameLogDiv = document.getElementById('game-log');
const startBtn = document.getElementById('start-game-btn');
const botMoveDiv = document.getElementById('bot-move');

// === Данные игры ===
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['6','7','8','9','10','J','Q','K','A'];
let deck = [], playerHand = [], botHand = [], trumpCard = {}, trumpSuit = '';

// === Функции ===

// Создание и перемешивание колоды
function createDeck() {
  return suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Отображение руки
function renderHand(hand, container, hide = false, clickHandler = null) {
  container.innerHTML = '';
  hand.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.textContent = hide ? '🂠' : card.rank + card.suit;
    if (clickHandler && !hide) {
      el.onclick = () => clickHandler(i);
      el.style.cursor = 'pointer';
    }
    container.appendChild(el);
  });
}

// Старт игры
function startGame() {
  deck = createDeck();
  shuffle(deck);
  playerHand = deck.splice(0, 6);
  botHand = deck.splice(0, 6);
  trumpCard = deck[deck.length - 1];
  trumpSuit = trumpCard.suit;

  trumpSuitDiv.textContent = `Козырь: ${trumpCard.rank}${trumpCard.suit}`;
  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
  renderHand(botHand, botHandDiv, true);
  botMoveDiv.innerHTML = '';
  gameLogDiv.textContent = 'Игра началась! Ваш ход.';
}

// Ход игрока
function playerPlayCard(index) {
  const card = playerHand.splice(index, 1)[0];
  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
  gameLogDiv.textContent = `Вы походили: ${card.rank}${card.suit}. Бот думает...`;
  setTimeout(() => botPlay(card), 1000);
}

// Ход бота
function botPlay(playerCard) {
  const botCard = botHand.shift();
  renderHand(botHand, botHandDiv, true);

  // Показываем карту хода бота
  botMoveDiv.innerHTML = '';
  const botCardElem = document.createElement('div');
  botCardElem.className = 'card';
  botCardElem.textContent = botCard.rank + botCard.suit;
  botMoveDiv.appendChild(botCardElem);

  gameLogDiv.textContent = `Бот ответил: ${botCard.rank}${botCard.suit}. Ваш ход снова.`;
}

// Кнопка запуска
startBtn.onclick = startGame;
const battlefieldDiv = document.getElementById('battlefield');

let battlefieldCards = [];  // карты, на столе сейчас
function renderBattlefield() {
  battlefieldDiv.innerHTML = '';
  battlefieldCards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card';
    el.textContent = card.rank + card.suit;
    battlefieldDiv.appendChild(el);
  });
}
