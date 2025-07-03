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
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Создаём колоду
function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Перемешиваем колоду
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

let attackCards = []; // Карты на столе для атаки
let defenseCards = []; // Карты для отбивания

let playerTurn = true; // Кто ходит — true если игрок атакует

function rankValue(rank) {
  return ranks.indexOf(rank);
}

// Проверка, может ли карта отбить другую
function canBeat(attackCard, defenseCard) {
  if (defenseCard.suit === attackCard.suit) {
    return rankValue(defenseCard.rank) > rankValue(attackCard.rank);
  }
  if (defenseCard.suit === trumpSuit && attackCard.suit !== trumpSuit) {
    return true;
  }
  return false;
}

// Рендер карт игрока с кликами
function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';

  playerHand.forEach((card, i) => {
    const cardElem = document.createElement('div');
    cardElem.textContent = card.rank + card.suit;
    cardElem.className = 'card';
    cardElem.onclick = () => onPlayerCardClick(i);
    container.appendChild(cardElem);
  });
}

// Рендер карт бота — рубашкой
function renderBotHand() {
  const container = document.getElementById('bot-hand');
  container.innerHTML = '';

  botHand.forEach(() => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card bot-card';
    container.appendChild(cardElem);
  });
}

// Отрисовка карт на столе (атака + защита)
function renderTable() {
  const container = document.getElementById('table-cards');
  container.innerHTML = '';

  for (let i = 0; i < attackCards.length; i++) {
    const attackCard = attackCards[i];
    const defenseCard = defenseCards[i];

    const pairDiv = document.createElement('div');
    pairDiv.className = 'table-pair';

    const attackElem = document.createElement('div');
    attackElem.className = 'card';
    attackElem.textContent = attackCard.rank + attackCard.suit;
    pairDiv.appendChild(attackElem);

    if (defenseCard) {
      const defenseElem = document.createElement('div');
      defenseElem.className = 'card';
      defenseElem.textContent = defenseCard.rank + defenseCard.suit;
      pairDiv.appendChild(defenseElem);
    }

    container.appendChild(pairDiv);
  }
}

// Ход игрока — выбрать карту для атаки или отбивания
function onPlayerCardClick(cardIndex) {
  if (playerTurn) {
    // Ход игрока атакует — карта уходит на стол
    const card = playerHand[cardIndex];
    if (attackCards.length === 0 || attackCards.some(c => c.rank === card.rank)) {
      attackCards.push(card);
      defenseCards.push(null);
      playerHand.splice(cardIndex, 1);
      renderGame();
      setTimeout(botDefend, 500);
      playerTurn = false;
    } else {
      alert('Можно класть только карты с такими же рангами, как на столе.');
    }
  } else {
    // Игрок отбивается
    alert('Сейчас ход бота на отбивание.');
  }
}

// Бот пытается отбиться
function botDefend() {
  for (let i = 0; i < attackCards.length; i++) {
    if (!defenseCards[i]) {
      const attackCard = attackCards[i];
      const defenseCard = botHand.find(c => canBeat(attackCard, c));
      if (defenseCard) {
        defenseCards[i] = defenseCard;
        botHand.splice(botHand.indexOf(defenseCard), 1);
      } else {
        // Бот не может отбиться — забирает все карты
        botHand.push(...attackCards.filter((_, idx) => !defenseCards[idx]));
        botHand.push(...defenseCards.filter(c => c));
        attackCards = [];
        defenseCards = [];
        refillHands();
        renderGame();
        alert('Бот не смог отбиться и забирает карты. Ваш ход снова.');
        playerTurn = true;
        return;
      }
    }
  }
  // Если бот отбился успешно — ход игрока на добор/атаку
  attackCards = [];
  defenseCards = [];
  refillHands();
  renderGame();
  alert('Бот отбился. Ваш ход.');
  playerTurn = true;
}

// Добор карт из колоды, если меньше 6 карт
function refillHands() {
  while (playerHand.length < 6 && deck.length) {
    playerHand.push(deck.pop());
  }
  while (botHand.length < 6 && deck.length) {
    botHand.push(deck.pop());
  }
  checkWin();
}

// Проверка окончания игры
function checkWin() {
  if (playerHand.length === 0) {
    alert('Поздравляем! Вы выиграли!');
    resetGame();
  } else if (botHand.length === 0) {
    alert('Бот выиграл. Попробуйте снова.');
    resetGame();
  }
}

// Перезапуск игры
function resetGame() {
  location.reload();
}

// Рендер всей игры
function renderGame() {
  document.getElementById('trump-card').textContent = trumpCard.rank + trumpCard.suit;
  renderPlayerHand();
  renderBotHand();
  renderTable();
}

// Инициализация таблицы в HTML
document.getElementById('game-container').innerHTML = `
  <h2>Козырь: <span id="trump-card"></span></h2>
  <h3>Ваша рука:</h3>
  <div id="player-hand"></div>
  <h3>Карты бота:</h3>
  <div id="bot-hand"></div>
  <h3>Карты на столе:</h3>
  <div id="table-cards" style="min-height: 120px;"></div>
`;

renderGame();
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

let playerHand = deck.splice(0, 6);
let botHand = deck.splice(0, 6);

const trumpCard = deck[deck.length - 1];
const trumpSuit = trumpCard.suit;

let tableCards = []; // Массив пар {attack: карта, defense: карта или null}

let playerTurn = true; // true — ход игрока (атакует), false — ход бота

// Помощь — ранжируем карты
function rankValue(rank) {
  return ranks.indexOf(rank);
}

// Проверка, может ли отбить defenseCard карту attackCard
function canBeat(attackCard, defenseCard) {
  if (defenseCard.suit === attackCard.suit) {
    return rankValue(defenseCard.rank) > rankValue(attackCard.rank);
  }
  if (defenseCard.suit === trumpSuit && attackCard.suit !== trumpSuit) {
    return true;
  }
  return false;
}

// Обновляем интерфейс игры
function renderGame() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h2>Козырь: ${trumpCard.rank}${trumpCard.suit}</h2>

    <h3>Ваша рука:</h3>
    <div id="player-hand"></div>

    <h3>Карты бота:</h3>
    <div id="bot-hand"></div>

    <h3>Карты на столе:</h3>
    <div id="table-cards"></div>

    <button id="end-turn-btn" style="margin-top:20px;">Закончить ход</button>
  `;

  renderPlayerHand();
  renderBotHand();
  renderTable();

  document.getElementById('end-turn-btn').onclick = endTurn;
}

function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';
  playerHand.forEach((card, index) => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card';
    cardElem.textContent = card.rank + card.suit;
    cardElem.onclick = () => onPlayerCardClick(index);
    container.appendChild(cardElem);
  });
}

function renderBotHand() {
  const container = document.getElementById('bot-hand');
  container.innerHTML = '';
  botHand.forEach(() => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card bot-card';
    container.appendChild(cardElem);
  });
}

function renderTable() {
  const container = document.getElementById('table-cards');
  container.innerHTML = '';
  tableCards.forEach(pair => {
    const pairDiv = document.createElement('div');
    pairDiv.className = 'table-pair';

    const attackDiv = document.createElement('div');
    attackDiv.className = 'card';
    attackDiv.textContent = pair.attack.rank + pair.attack.suit;
    pairDiv.appendChild(attackDiv);

    if (pair.defense) {
      const defenseDiv = document.createElement('div');
      defenseDiv.className = 'card';
      defenseDiv.textContent = pair.defense.rank + pair.defense.suit;
      pairDiv.appendChild(defenseDiv);
    }

    container.appendChild(pairDiv);
  });
}

// Обработка клика игрока по карте
function onPlayerCardClick(cardIndex) {
  const selectedCard = playerHand[cardIndex];

  if (playerTurn) {
    // Игрок атакует — кладём карту на стол
    if (tableCards.length === 0 || tableCards.some(pair => pair.attack.rank === selectedCard.rank || (pair.defense && pair.defense.rank === selectedCard.rank))) {
      tableCards.push({ attack: selectedCard, defense: null });
      playerHand.splice(cardIndex, 1);
      renderGame();

      setTimeout(botDefend, 500);
      playerTurn = false;
    } else {
      alert('Можно класть карты только с рангом, который уже на столе');
    }
  } else {
    // Игрок должен отбиваться — выбирает карту для защиты
    let undefended = tableCards.find(pair => pair.defense === null);
    if (!undefended) {
      alert('Нет карт для защиты');
      return;
    }
    if (canBeat(undefended.attack, selectedCard)) {
      undefended.defense = selectedCard;
      playerHand.splice(cardIndex, 1);
      renderGame();

      setTimeout(botAttackOrFinish, 500);
    } else {
      alert('Эта карта не может отбить карту на столе');
    }
  }
}

// Ход бота — пытается отбиться
function botDefend() {
  let undefended = tableCards.find(pair => pair.defense === null);
  if (!undefended) {
    // Все карты отбиты — ход игрока на добор или атака
    refillHands();
    alert('Бот отбился! Ваш ход.');
    playerTurn = true;
    renderGame();
    return;
  }

  // Ищем карту бота, чтобы отбить undefended.attack
  const defendCard = botHand.find(c => canBeat(undefended.attack, c));
  if (defendCard) {
    undefended.defense = defendCard;
    botHand.splice(botHand.indexOf(defendCard), 1);
    renderGame();

    setTimeout(playerAttackOrFinish, 500);
  } else {
    // Бот не может отбиться — забирает все карты
    botHand.push(...tableCards.filter(pair => pair.attack).map(pair => pair.attack));
    botHand.push(...tableCards.filter(pair => pair.defense).map(pair => pair.defense));
    tableCards = [];
    refillHands();
    alert('Бот не смог отбиться и забирает карты. Ваш ход снова.');
    playerTurn = true;
    renderGame();
  }
}

// После отбивания бот может атаковать если есть карты с рангом уже на столе (расширение правил)
function botAttackOrFinish() {
  // Найдем все ранги на столе
  let ranksOnTable = tableCards.flatMap(pair => [pair.attack.rank, pair.defense?.rank]).filter(Boolean);

  // Ищем карту у бота, которая совпадает по рангу с картами на столе
  let attackCard = botHand.find(card => ranksOnTable.includes(card.rank));
  if (attackCard && playerHand.length > 0) {
    tableCards.push({ attack: attackCard, defense: null });
    botHand.splice(botHand.indexOf(attackCard), 1);
    playerTurn = false;
    renderGame();
    setTimeout(botDefend, 500);
  } else {
    // Бот заканчивает ход
    refillHands();
    alert('Ход бота завершён. Ваш ход.');
    playerTurn = true;
    renderGame();
  }
}

// После игрока отбился, он может положить карту или закончить ход
function playerAttackOrFinish() {
  // Аналогично бот атакует, но для простоты оставим так — ход за игроком
  alert('Ваш ход: атакуйте или закончите ход кнопкой.');
  playerTurn = true;
}

// Обработка нажатия кнопки "Закончить ход"
function endTurn() {
  if (!playerTurn) {
    alert('Сейчас ход бота, подождите.');
    return;
  }
  if (tableCards.some(pair => pair.defense === null)) {
    alert('Вы должны отбиться от всех карт или продолжать атаку');
    return;
  }
  tableCards = [];
  refillHands();
  playerTurn = false;
  renderGame();
  setTimeout(botAttack, 500);
}

// Ход бота на атаку (начало хода)
function botAttack() {
  if (botHand.length === 0) {
    alert('Бот выиграл!');
    resetGame();
    return;
  }
  // Бот выбирает самую слабую карту для атаки
  let attackCard = botHand.reduce((minCard, card) => {
    if (!minCard) return card;
    if (card.suit === trumpSuit && minCard.suit !== trumpSuit) return minCard;
    if (card.suit !== trumpSuit && minCard.suit === trumpSuit) return card;
    return rankValue(card.rank) < rankValue(minCard.rank) ? card : minCard;
  }, null);

  tableCards.push({ attack: attackCard, defense: null });
  botHand.splice(botHand.indexOf(attackCard), 1);
  renderGame();

  alert('Бот атакует. Ваша очередь отбиваться
