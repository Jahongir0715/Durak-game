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
function playerPlayCard(index) {
  const card = playerHand.splice(index, 1)[0];
  battlefieldCards.push({ attack: card, defense: null });
  renderBattlefield();
  renderHand(playerHand, playerHandDiv, false, null); // убираем выбор карт пока бот ходит
  gameLogDiv.textContent = `Вы походили: ${card.rank}${card.suit}. Ход бота...`;
  setTimeout(() => botDefend(), 1000);
}
function canBeat(attackCard, defenseCard) {
  // Возвращает true, если defenseCard бьет attackCard

  // если defenseCard козырь, а attackCard нет — побеждает
  if (defenseCard.suit === trumpSuit && attackCard.suit !== trumpSuit) return true;

  // если масти совпадают — сравниваем ранги
  if (defenseCard.suit === attackCard.suit) {
    return ranks.indexOf(defenseCard.rank) > ranks.indexOf(attackCard.rank);
  }

  return false;
}

function botDefend() {
  // Бот ищет карту для защиты
  for (let i = 0; i < botHand.length; i++) {
    if (canBeat(battlefieldCards[0].attack, botHand[i])) {
      battlefieldCards[0].defense = botHand.splice(i, 1)[0];
      renderBattlefield();
      renderHand(botHand, botHandDiv, true);
      gameLogDiv.textContent = `Бот побил карту. Ваш ход — подкидывайте карту или заканчивайте ход.`;
      // Тут дальше будет логика подкидывания или окончания хода
      playerCanThrow = true; // флаг для подкидывания, добавим позже
      renderHand(playerHand, playerHandDiv, false, playerThrowCard);
      return;
    }
  }
  // Если защититься не может
  gameLogDiv.textContent = `Бот не может побить — он забирает карты. Ваш ход снова.`;
  botHand = botHand.concat(battlefieldCards.map(c => c.attack));
  if (battlefieldCards.some(c => c.defense)) {
    botHand = botHand.concat(battlefieldCards.filter(c => c.defense).map(c => c.defense));
  }
  battlefieldCards = [];
  renderBattlefield();
  renderHand(botHand, botHandDiv, true);
  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
}
