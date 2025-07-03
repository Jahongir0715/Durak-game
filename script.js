// Получаем элементы
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const battlefieldDiv = document.getElementById('battlefield');
const deckDiv = document.getElementById('deck');
const trumpCardDiv = document.getElementById('trump-card');
const gameLogDiv = document.getElementById('game-log');
const startBtn = document.getElementById('start-game-btn');

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Старшинство рангов по индексу
function rankValue(rank) {
  return ranks.indexOf(rank);
}

let deck = [];
let playerHand = [];
let botHand = [];
let trumpCard = null;
let trumpSuit = null;

let attackingCards = []; // массив объектов { card, defendedCard }
let defendingCards = [];

let playerTurn = false; // кто атакует
let gameStarted = false;

// Создаём и перемешиваем колоду
function createDeck() {
  const newDeck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      newDeck.push({ suit, rank });
    }
  }
  return newDeck;
}

function shuffle(deck) {
  for(let i = deck.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Показываем карту в DOM
function createCardElement(card, faceUp = true) {
  const div = document.createElement('div');
  div.classList.add('card');
  if(!faceUp) {
    div.classList.add('back');
    div.textContent = '🂠';
  } else {
    div.textContent = card.rank + card.suit;
    if(card.suit === '♥' || card.suit === '♦') {
      div.classList.add('red');
    }
  }
  return div;
}

// Обновить отображение колоды и козыря
function renderDeckAndTrump() {
  if(deck.length > 0) {
    deckDiv.style.display = 'block';
    deckDiv.textContent = `🂠\n(${deck.length})`;
  } else {
    deckDiv.style.display = 'none';
  }

  if(trumpCard) {
    trumpCardDiv.style.display = 'block';
    trumpCardDiv.textContent = trumpCard.rank + trumpCard.suit;
    if(trumpCard.suit === '♥' || trumpCard.suit === '♦') {
      trumpCardDiv.classList.add('red');
    } else {
      trumpCardDiv.classList.remove('red');
    }
  } else {
    trumpCardDiv.style.display = 'none';
  }
}

// Отрисовываем руки игроков
function renderHands() {
  playerHandDiv.innerHTML = '';
  botHandDiv.innerHTML = '';

  // Игрок может кликать по карте чтобы атаковать/отбивать
  playerHand.forEach((card, idx) => {
    const cardEl = createCardElement(card, true);
    cardEl.onclick = () => onPlayerCardClick(idx);
    playerHandDiv.appendChild(cardEl);
  });

  // Бот — карты рубашкой вверх
  botHand.forEach(card => {
    const cardEl = createCardElement(card, false);
    botHandDiv.appendChild(cardEl);
  });
}

// Отрисовать карты на поле боя (пары атакующей и отбивающей)
function renderBattlefield() {
  battlefieldDiv.innerHTML = '';
  attackingCards.forEach(({card, defendedCard}, index) => {
    // Карта атакующего
    const atkDiv = document.createElement('div');
    atkDiv.classList.add('battle-card');
    atkDiv.textContent = card.rank + card.suit;
    if(card.suit === '♥' || card.suit === '♦') atkDiv.classList.add('red');
    atkDiv.style.position = 'relative';
    atkDiv.style.zIndex = 10;
    battlefieldDiv.appendChild(atkDiv);

    // Карта защитника (если есть)
    if(defendedCard) {
      const defDiv = document.createElement('div');
      defDiv.classList.add('battle-card', 'defense');
      defDiv.textContent = defendedCard.rank + defendedCard.suit;
      if(defendedCard.suit === '♥' || defendedCard.suit === '♦') defDiv.classList.add('red');
      defDiv.style.position = 'absolute';
      defDiv.style.top = '40px';
      defDiv.style.left = `${index * 60}px`;
      battlefieldDiv.appendChild(defDiv);
    }
  });
}

// Найти игрока с младшим козырём — начинает первым
function findFirstAttacker() {
  let minTrumpPlayer = null;
  let minTrumpCard = null;

  function checkHand(hand, playerName) {
    for(const card of hand) {
      if(card.suit === trumpSuit) {
        if(!minTrumpCard || rankValue(card.rank) < rankValue(minTrumpCard.rank)) {
          minTrumpCard = card;
          minTrumpPlayer = playerName;
        }
      }
    }
  }

  checkHand(playerHand, 'player');
  checkHand(botHand, 'bot');

  return minTrumpPlayer;
}

// Начать новую игру
async function startGame() {
  gameLogDiv.textContent = 'Игра началась!';
  deck = createDeck();
  shuffle(deck);

  trumpCard = deck[deck.length - 1];
  trumpSuit = trumpCard.suit;

  playerHand = [];
  botHand = [];
  attackingCards = [];
  defendingCards = [];

  // Раздаем по 6 карт с анимацией
  await dealInitialCards();

  renderDeckAndTrump();
  renderHands();
  renderBattlefield();

  playerTurn = findFirstAttacker() === 'player';

  gameLogDiv.textContent = playerTurn ? 'Вы ходите первым.' : 'Первым ходит бот. Ожидайте...';

  if(!playerTurn) {
    await botAttack();
  }
}

// Анимация раздачи 6 карт каждому по очереди
async function dealInitialCards() {
  for(let i=0; i < 6; i++) {
    await dealCardTo(playerHandDiv, playerHand, true);
    await dealCardTo(botHandDiv, botHand, false);
  }
}

async function dealCardTo(handDiv, hand, faceUp) {
  if(deck.length === 0) return;

  // Берём карту сверху
  const card = deck.pop();
  hand.push(card);

  // Создаем временный элемент карты возле колоды для анимации
  const tempCard = createCardElement(card, false);
  tempCard.classList.add('move-card');
  document.body.appendChild(tempCard);

  // Позиция колоды
  const deckRect = deckDiv.getBoundingClientRect();
  tempCard.style.top = `${deckRect.top}px`;
  tempCard.style.left = `${deckRect.left}px`;

  await new Promise(r => setTimeout(r, 200));

  // Позиция куда идти (в руку игрока/бота)
  const handRect = handDiv.getBoundingClientRect();

  // Располагаем на руку — на позицию последней карты
  const cardCount = hand.length - 1;
  const offsetX = cardCount * 20; // сдвиг карт

  // Позиция для анимации
  tempCard.style.top = `${handRect.top}px`;
  tempCard.style.left = `${handRect.left + offsetX}px`;

  await new Promise(r => setTimeout(r, 400));

  document.body.removeChild(tempCard);

  // Обновить руки после анимации
  renderHands();
  renderDeckAndTrump();
}

// Обработчик клика по карте игрока
function onPlayerCardClick(cardIdx) {
  if(!playerTurn) return;

  // Если игрок атакует, можно положить карту на стол, если допустимо
  const card = playerHand[cardIdx];

  if(canPlayerAttackWithCard(card)) {
    attackingCards.push({card, defendedCard: null});
    playerHand.splice(cardIdx, 1);
    renderHands();
    renderBattlefield();

    gameLogDiv.textContent = 'Вы положили карту. Ходит бот...';
    playerTurn = false;

    setTimeout(botDefend, 1000);
  } else {
    gameLogDiv.textContent = 'Вы не можете положить эту карту сейчас.';
  }
}

// Проверка — можно ли атаковать данной картой (первый ход или подкидывание)
function canPlayerAttackWithCard(card) {
  if(attackingCards.length === 0) {
    return true; // первая карта любой ранга
  } else {
    // Можно класть карты, ранги которых совпадают с картами на столе (атакующие или отбивающие)
    const ranksOnTable = attackingCards.flatMap(({card, defendedCard}) => [card.rank, defendedCard ? defendedCard.rank : null])
      .filter(r => r !== null);

    return ranksOnTable.includes(card.rank);
  }
}

// Ход бота (атака)
async function botAttack() {
  // Логика атаки — бот кладёт самую младшую карту или подходит по рангу
  // Для простоты бот кладет одну карту

  const card = chooseBotAttackCard();
  if(!card) {
    gameLogDiv.textContent = 'Бот не может атаковать, ход переходит вам.';
    playerTurn = true;
    return;
  }

  attackingCards.push({card, defendedCard: null});
  removeCardFromHand(botHand, card);

  renderHands();
  renderBattlefield();

  gameLogDiv.textContent = 'Бот атакует. Ваш ход — отбивайтесь.';
  playerTurn = true;
}

// Выбор карты для атаки ботом
function chooseBotAttackCard() {
  if(attackingCards.length === 0) {
    // Первая карта — минимальная по рангу
    return botHand.reduce((minCard, c) => {
      if(!minCard) return c;
      return rankValue(c.rank) < rankValue(minCard.rank) ? c : minCard;
    }, null);
  } else {
    // Можно подкинуть карту по рангу на столе
    const ranksOnTable = attackingCards.flatMap(({card, defendedCard}) => [card.rank, defendedCard ? defendedCard.rank : null])
      .filter(r => r !== null);

    for(const c of botHand) {
      if(ranksOnTable.includes(c.rank)) {
        return c;
      }
    }
  }
  return null;
}

// Удалить карту из руки (по объекту)
function removeCardFromHand(hand, card) {
  const idx = hand.findIndex(c => c.rank === card.rank && c.suit === card.suit);
  if(idx >= 0) hand.splice(idx, 1);
}

// Защита бота (отбивание)
function botDefend() {
  // Бот отбивает карты по очереди
  for(let i=0; i < attackingCards.length; i++) {
    const attackCard = attackingCards[i].card;
    if(attackingCards[i].defendedCard) continue;

    // Ищем карту для отбивания
    const defenseCard = botFindDefenseCard(attackCard);
    if(!defenseCard) {
      // Не может отбиться, забирает карты
      botTakesCards();
      return;
    }
    // Отбивается
    attackingCards[i].defendedCard = defenseCard;
    removeCardFromHand(botHand, defenseCard);
  }

  renderHands();
  renderBattlefield();

  gameLogDiv.textContent = 'Бот отбился. Ваш ход — можно подкинуть карты или закончить ход.';
  playerTurn = true;
}

// Поиск у бота карты для отбивания
function botFindDefenseCard(attackCard) {
  // Проверяем все карты бота
  for(const c of botHand) {
    if(canBeatCard(attackCard, c)) {
      return c;
    }
  }
  return null;
}

// Логика отбивания: можно ли отбить атаку защитной картой
function canBeatCard(attackCard, defenseCard) {
  if(defenseCard.suit === attackCard.suit) {
    return rankValue(defenseCard.rank) > rankValue(attackCard.rank);
  }
  if(defenseCard.suit === trumpSuit && attackCard.suit !== trumpSuit) {
    return true;
  }
  return false;
}

// Бот забирает все карты со стола
function botTakesCards() {
  gameLogDiv.textContent = 'Бот не смог отбиться и забирает карты.';
  attackingCards.forEach(({card, defendedCard}) => {
    botHand.push(card);
    if(defendedCard) botHand.push(defendedCard);
  });
  attackingCards = [];
  defendingCards = [];
  playerTurn = true;

  // После забора — добираем карты
  refillHandsAfterTurn();
  renderHands();
  renderBattlefield();
}

// Добор карт из колоды, чтобы у каждого было по 6
function refillHandsAfterTurn() {
  while(playerHand.length < 6 && deck.length > 0) {
    playerHand.push(deck.pop());
  }
  while(botHand.length < 6 && deck.length > 0) {
    botHand.push(deck.pop());
  }
  renderHands();
  renderDeckAndTrump();
}

// Кнопка старт
startBtn.onclick = () => {
  if(!gameStarted) {
    gameStarted = true;
    startBtn.disabled = true;
    startGame();
  }
};
