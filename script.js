// Элементы DOM
const startBtn = document.getElementById('start-game-btn');
const deckDiv = document.getElementById('deck');
const takeCardBtn = document.getElementById('take-card-btn');
const trumpSuitDiv = document.getElementById('trump-suit');
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const battlefieldDiv = document.getElementById('battlefield');
const gameLogDiv = document.getElementById('game-log');

// Карты и состояния
let deck = [];
let trumpCard = null;
let trumpSuit = null;
let playerHand = [];
let botHand = [];
let attackingCard = null;
let defendingCard = null;

// Старшинство карт (по правилу)
const ranksOrder = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];

// Создать колоду
function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
  const d = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      d.push({rank, suit});
    }
  }
  return d;
}

// Тасование колоды (Fisher-Yates)
function shuffle(array) {
  for(let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Определение кто ходит первым (у кого младшая козырная карта)
function findFirstPlayer() {
  let minTrumpIndex = Infinity;
  let firstPlayer = 'player'; // player или bot
  playerHand.forEach(card => {
    if (card.suit === trumpSuit) {
      const idx = ranksOrder.indexOf(card.rank);
      if (idx < minTrumpIndex) {
        minTrumpIndex = idx;
        firstPlayer = 'player';
      }
    }
  });
  botHand.forEach(card => {
    if (card.suit === trumpSuit) {
      const idx = ranksOrder.indexOf(card.rank);
      if (idx < minTrumpIndex) {
        minTrumpIndex = idx;
        firstPlayer = 'bot';
      }
    }
  });
  return firstPlayer;
}

// Отображение козырной масти
function renderTrumpSuit() {
  if (!trumpCard) {
    trumpSuitDiv.textContent = '';
    return;
  }
  trumpSuitDiv.textContent = `Козырь: ${trumpCard.rank}${trumpCard.suit}`;
  trumpSuitDiv.style.fontSize = '24px';
  trumpSuitDiv.style.fontWeight = '700';
  if (trumpCard.suit === '♥' || trumpCard.suit === '♦') {
    trumpSuitDiv.style.color = '#dc3545';
  } else {
    trumpSuitDiv.style.color = '#222';
  }
}

// Отображение колоды
function renderDeck() {
  if (deck.length === 0) {
    deckDiv.textContent = 'Колода пуста';
    takeCardBtn.disabled = true;
  } else {
    deckDiv.textContent = '🂠';
    takeCardBtn.disabled = false;
  }
}

// Отображение руки
function renderHand(hand, container, hide = false, clickHandler = null) {
  container.innerHTML = '';
  hand.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.textContent = hide ? '🂠' : card.rank + card.suit;
    if (card.suit === '♥' || card.suit === '♦') el.classList.add('red');
    if (clickHandler) {
      el.addEventListener('click', () => clickHandler(i));
    }
    container.appendChild(el);
  });
}

// Добавление пары карт на стол (атака и защита)
function addBattlePair(attackCard, defenseCard = null) {
  const pairDiv = document.createElement('div');
  pairDiv.className = 'battle-pair';

  const attackEl = document.createElement('div');
  attackEl.className = 'battle-card attack-card';
  attackEl.textContent = attackCard.rank + attackCard.suit;
  if (attackCard.suit === '♥' || attackCard.suit === '♦') attackEl.classList.add('red');
  pairDiv.appendChild(attackEl);

  if (defenseCard) {
    const defenseEl = document.createElement('div');
    defenseEl.className = 'battle-card defense-card';
    defenseEl.textContent = defenseCard.rank + defenseCard.suit;
    if (defenseCard.suit === '♥' || defenseCard.suit === '♦') defenseEl.classList.add('red');
    pairDiv.appendChild(defenseEl);
  }

  battlefieldDiv.appendChild(pairDiv);
}

// Очистка стола
function clearBattlefield() {
  battlefieldDiv.innerHTML = '';
}

// Функция сравнения карт по старшинству с учётом козыря
// Возвращает true, если карта b бьёт карту a
function beats(a, b) {
  // Если карты одной масти, сравниваем ранги
  if (a.suit === b.suit) {
    return ranksOrder.indexOf(b.rank) > ranksOrder.indexOf(a.rank);
  }
  // Если b — козырь, а a нет — бьет
  if (b.suit === trumpSuit && a.suit !== trumpSuit) {
    return true;
  }
  return false;
}

// Добор карт из колоды по очереди (начиная с атакующего)
function refillHands(attacker) {
  const order = attacker === 'player' ? [playerHand, botHand] : [botHand, playerHand];
  order.forEach(hand => {
    while (hand.length < 6 && deck.length > 0) {
      hand.push(deck.pop());
    }
  });
}

// Переменные для контроля состояния игры
let currentAttacker = null; // 'player' или 'bot'
let isPlayerTurn = false;
let attackingPairs = []; // пары {attack: card, defense: card|null}

// Начинаем новую игру
function startGame() {
  deck = createDeck();
  shuffle(deck);
  playerHand = [];
  botHand = [];
  attackingPairs = [];
  clearBattlefield();
  gameLogDiv.textContent = '';
  trumpCard = deck[deck.length - 1];
  trumpSuit = trumpCard.suit;

  // Раздача карт
  for (let i = 0; i < 6; i++) {
    playerHand.push(deck.pop());
    botHand.push(deck.pop());
  }

  renderTrumpSuit();
  renderDeck();
  renderHand(playerHand, playerHandDiv, false, onPlayerCardClick);
  renderHand(botHand, botHandDiv, true);

  currentAttacker = findFirstPlayer();
  isPlayerTurn = (currentAttacker === 'player');

  gameLogDiv.textContent = isPlayerTurn ? 'Ваш ход! Вы атакующий.' : 'Ход бота. Он атакует.';

  if (!isPlayerTurn) {
    setTimeout(botAttack, 1200);
  }
}

// Обработка клика игрока на карту (для атаки)
function onPlayerCardClick(index) {
  if (!isPlayerTurn) {
    gameLogDiv.textContent = 'Сейчас не ваш ход.';
    return;
  }
  if (attackingPairs.length > 0) {
    gameLogDiv.textContent = 'Вы уже ходили, ждите отбоя.';
    return;
  }

  const card = playerHand[index];
  attackingPairs.push({attack: card, defense: null});
  playerHand.splice(index, 1);

  clearBattlefield();
  attackingPairs.forEach(pair => addBattlePair(pair.attack, pair.defense));

  renderHand(playerHand, playerHandDiv, false, onPlayerCardClick);
  renderHand(botHand, botHandDiv, true);

  gameLogDiv.textContent = `Вы походили картой ${card.rank}${card.suit}. Бот отбивает...`;

  isPlayerTurn = false;

  setTimeout(botDefend, 1200);
}

// Бот отбивает карту
function botDefend() {
  if (attackingPairs.length === 0) return;

  const attackCard = attackingPairs[0].attack;

  // Находим первую карту, которая может побить карту атаки
  const defendIndex = botHand.findIndex(card => beats(attackCard, card));

  if (defendIndex === -1) {
    // Бот не может побить - берет карты
    botHand = botHand.concat(attackingPairs.map(p => p.attack));
    botHand = botHand.concat(attackingPairs.filter(p => p.defense).map(p => p.defense));
    attackingPairs = [];
    clearBattlefield();
    renderHand(botHand, botHandDiv, true);
    gameLogDiv.textContent = 'Бот не смог отбиться и взял карты. Ваш ход снова.';
    isPlayerTurn = true;
    refillHands('player');
    renderDeck();
    renderHand(playerHand, playerHandDiv, false, onPlayerCardClick);
    return;
  }

  const defendCard = botHand.splice(defendIndex, 1)[0];
  attackingPairs[0].defense = defendCard;

  clearBattlefield();
  attackingPairs.forEach(pair => addBattlePair(pair.attack, pair.defense));

  renderHand(botHand, botHandDiv, true);

  gameLogDiv.textContent = `Бот отбил карту ${attackCard.rank}${attackCard.suit} картой ${defendCard.rank}${defendCard.suit}. Ваш ход.`;

  isPlayerTurn = true;

  refillHands('bot');
  renderDeck();
  renderHand(playerHand, playerHandDiv, false, onPlayerCardClick);
}

// Ход бота - атака
function botAttack() {
  if (botHand.length === 0) {
    gameLogDiv.textContent = 'Бот выиграл!';
    disablePlayerHand();
    return;
  }
  const attackCard = botHand.shift();
  attackingPairs.push({attack: attackCard, defense: null});
  clearBattlefield();
  attackingPairs.forEach(pair => addBattlePair(pair.attack, pair.defense));
  renderHand(botHand, botHandDiv, true);
  renderHand(playerHand, playerHandDiv, false, onPlayerCardClick);
  gameLogDiv.textContent = `Бот атакует картой ${attackCard.rank}${attackCard.suit}. Отбейте её!`;
  isPlayerTurn = true;
}

// Блокировка рук игрока (отключение кликов)
function disablePlayerHand() {
  playerHandDiv.querySelectorAll('.card').forEach(card => {
    card.classList.add('disabled');
    card.style.pointerEvents = 'none';
  });
}

// Разблокировка рук игрока
function enablePlayerHand() {
  playerHandDiv.querySelectorAll('.card').forEach(card => {
    card.classList.remove('disabled');
    card.style.pointerEvents = 'auto';
  });
}

// Кнопка взять карту из колоды
takeCardBtn.addEventListener('click', () => {
  if (deck.length === 0) {
    alert('Колода пуста!');
    return;
  }
  if (!isPlayerTurn) {
    gameLogDiv.textContent = 'Сейчас не ваш ход.';
    return;
  }
  if (playerHand.length >= 6) {
    gameLogDiv.textContent = 'У вас уже 6 карт!';
    return;
  }
  const card = deck.pop();
  playerHand.push(card);
  renderHand(playerHand, playerHandDiv, false, onPlayerCardClick);
  renderDeck();
  gameLogDiv.textContent = `Вы взяли карту ${card.rank}${card.suit} из колоды.`;
});

// Кнопка старт игры
startBtn.addEventListener('click', () => {
  startGame();
});
