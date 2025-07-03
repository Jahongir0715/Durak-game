// === Элементы интерфейса ===
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const trumpSuitDiv = document.getElementById('trump-suit');
const gameLogDiv = document.getElementById('game-log');
const startBtn = document.getElementById('start-game-btn');
const battlefieldDiv = document.getElementById('battlefield');

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

// Анимация карты на стол
function animateCardToBattle(cardEl, callback) {
  cardEl.classList.add('move-up');
  cardEl.addEventListener('animationend', () => {
    callback();
  }, { once: true });
}

// Отключить клики на руке игрока
function disablePlayerHand() {
  Array.from(playerHandDiv.children).forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.6';
  });
}

// Включить клики на руке игрока
function enablePlayerHand() {
  Array.from(playerHandDiv.children).forEach(el => {
    el.style.pointerEvents = 'auto';
    el.style.opacity = '1';
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
  battlefieldDiv.innerHTML = '';
  gameLogDiv.textContent = 'Игра началась! Ваш ход.';
  enablePlayerHand();
}

// Ход игрока с анимацией
function playerPlayCard(index) {
  const card = playerHand.splice(index, 1)[0];

  const cardEl = playerHandDiv.children[index];
  disablePlayerHand();

  const animCard = cardEl.cloneNode(true);
  animCard.classList.add('battle-card');
  if (card.suit === '♥' || card.suit === '♦') animCard.classList.add('red');

  battlefieldDiv.appendChild(animCard);

  animateCardToBattle(animCard, () => {
    renderHand(playerHand, playerHandDiv, false, playerPlayCard);
    gameLogDiv.textContent = `Вы походили: ${card.rank}${card.suit}. Бот думает...`;
    botPlay(card, animCard);
  });
}

// Ход бота с анимацией
function botPlay(playerCard, animCard) {
  if (botHand.length === 0) {
    gameLogDiv.textContent = "Поздравляем! Вы выиграли, у бота закончились карты.";
    enablePlayerHand();
    return;
  }

  const botCard = botHand.shift();

  const botCardEl = document.createElement('div');
  botCardEl.className = 'battle-card';
  botCardEl.textContent = botCard.rank + botCard.suit;
  if (botCard.suit === '♥' || botCard.suit === '♦') botCardEl.classList.add('red');

  battlefieldDiv.appendChild(botCardEl);

  setTimeout(() => {
    setTimeout(() => {
      battlefieldDiv.innerHTML = '';
      renderHand(botHand, botHandDiv, true);
      gameLogDiv.textContent = `Бот ответил: ${botCard.rank}${botCard.suit}. Ваш ход снова.`;
      enablePlayerHand();
    }, 1000);
  }, 700);
}

// Кнопка запуска
startBtn.onclick = startGame;
