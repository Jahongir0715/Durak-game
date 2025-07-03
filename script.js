// --- Константы и данные карт ---

const SUITS = ['♠', '♥', '♦', '♣']; // Пики, червы, бубны, трефы
const RANKS = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т']; // 6 - Туз

// Старшинство для сравнения карт (индексы из RANKS)
const rankValue = rank => RANKS.indexOf(rank);

// --- Переменные состояния ---

let deck = [];
let trumpSuit = null;
let playerHand = [];
let botHand = [];
let battlefield = []; // карты в текущем ходе (атака и защита)

// --- Элементы DOM ---

const deckElem = document.getElementById('deck');
const trumpElem = document.getElementById('trump');
const playerHandElem = document.getElementById('player-hand');
const botHandElem = document.getElementById('bot-hand');
const battlefieldElem = document.getElementById('battlefield');
const startBtn = document.getElementById('start-game-btn');
const gameLog = document.getElementById('game-log');

// --- Создаем колоду 36 карт ---

function createDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({suit, rank});
    }
  }
  return cards;
}

// --- Перемешивание колоды (Fisher-Yates) ---

function shuffle(deck) {
  for (let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i +1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// --- Выбираем козырь (последняя карта в колоде) ---

function chooseTrump(deck) {
  const trumpCard = deck[deck.length -1];
  return trumpCard.suit;
}

// --- Отрисовка карт в элементе (рука игрока/бота) ---

function renderHand(container, hand, hideCards = false) {
  container.innerHTML = '';
  hand.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    if (card.suit === '♥' || card.suit === '♦') cardDiv.classList.add('red');

    if (hideCards) {
      cardDiv.textContent = '🂠';
    } else {
      cardDiv.innerHTML = `<div class="top-left">${card.rank}${card.suit}</div><div class="bottom-right">${card.rank}${card.suit}</div>`;
    }

    container.appendChild(cardDiv);
  });
}

// --- Обновление отображения колоды и козыря ---

function renderDeck() {
  deckElem.textContent = deck.length > 0 ? `🂠 (${deck.length})` : 'Пусто';
  trumpElem.textContent = trumpSuit ? trumpSuit : '';
}

// --- Раздача карт (по 6 каждому, если есть карты в колоде) ---

function dealCards() {
  while (playerHand.length < 6 && deck.length > 0) {
    playerHand.push(deck.pop());
  }
  while (botHand.length < 6 && deck.length > 0) {
    botHand.push(deck.pop());
  }
}

// --- Лог игры ---

function addLog(text) {
  const p = document.createElement('p');
  p.textContent = text;
  gameLog.appendChild(p);
  gameLog.scrollTop = gameLog.scrollHeight;
}

// --- Запуск новой игры ---

function startGame() {
  deck = createDeck();
  shuffle(deck);
  trumpSuit = chooseTrump(deck);

  playerHand = [];
  botHand = [];
  battlefield = [];

  dealCards();

  renderDeck();
  renderHands();
  renderBattlefield();

  addLog('Игра началась! Козырь: ' + trumpSuit);
  startBtn.disabled = true;
}

// --- Обновление рук игроков ---

function renderHands() {
  renderHand(playerHandElem, playerHand);
  renderHand(botHandElem, botHand, true); // ботские карты скрыты
}

// --- Обновление стола ---

function renderBattlefield() {
  battlefieldElem.innerHTML = '';
  battlefield.forEach(pair => {
    // pair: {attack: card, defense: card|null}
    const pairDiv = document.createElement('div');
    pairDiv.style.display = 'flex';
    pairDiv.style.flexDirection = 'column';
    pairDiv.style.gap = '5px';

    const attackCard = createCardDiv(pair.attack);
    pairDiv.appendChild(attackCard);

    if (pair.defense) {
      const defenseCard = createCardDiv(pair.defense);
      pairDiv.appendChild(defenseCard);
    } else {
      const defensePlaceholder = document.createElement('div');
      defensePlaceholder.style.width = '60px';
      defensePlaceholder.style.height = '90px';
      pairDiv.appendChild(defensePlaceholder);
    }

    battlefieldElem.appendChild(pairDiv);
  });
}

// --- Создать DOM элемент для карты ---

function createCardDiv(card) {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card');
  if (card.suit === '♥' || card.suit === '♦') cardDiv.classList.add('red');
  cardDiv.innerHTML = `<div class="top-left">${card.rank}${card.suit}</div><div class="bottom-right">${card.rank}${card.suit}</div>`;
  return cardDiv;
}

// --- Обработчики ---

startBtn.addEventListener('click', startGame);

// --- Начинаем ---

// Отрисуем пустое поле при загрузке
renderDeck();
renderHands();
renderBattlefield();
addLog('Нажмите "Начать игру" чтобы стартовать');

