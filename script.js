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
let battlefieldCards = [];  // карты на столе (ход)

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

// Отрисовка стола (хода)
function renderBattlefield() {
  battlefieldDiv.innerHTML = '';
  battlefieldCards.forEach(pair => {
    const attackEl = document.createElement('div');
    attackEl.className = 'card attack';
    attackEl.textContent = pair.attack.rank + pair.attack.suit;
    battlefieldDiv.appendChild(attackEl);
    if (pair.defense) {
      const defendEl = document.createElement('div');
      defendEl.className = 'card defense';
      defendEl.textContent = pair.defense.rank + pair.defense.suit;
      battlefieldDiv.appendChild(defendEl);
    }
  });
}

// Проверка, может ли карта защитить другую
function canBeat(attackCard, defenseCard) {
  if (defenseCard.suit === trumpSuit && attackCard.suit !== trumpSuit) return true;
  if (defenseCard.suit === attackCard.suit) {
    return ranks.indexOf(defenseCard.rank) > ranks.indexOf(attackCard.rank);
  }
  return false;
}

// Старт игры
function startGame() {
  deck = createDeck();
  shuffle(deck);
  playerHand = deck.splice(0, 6);
  botHand = deck.splice(0, 6);
  trumpCard = deck[deck.length - 1];
  trumpSuit = trumpCard.suit;

  battlefieldCards = [];

  trumpSuitDiv.textContent = `Козырь: ${trumpCard.rank}${trumpCard.suit}`;
  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
  renderHand(botHand, botHandDiv, true);
  renderBattlefield();
  gameLogDiv.textContent = 'Игра началась! Ваш ход.';
}

// Ход игрока (атака)
function playerPlayCard(index) {
  const card = playerHand.splice(index, 1)[0];
  battlefieldCards.push({ attack: card, defense: null });
  renderBattlefield();
  renderHand(playerHand, playerHandDiv, false, null);
  gameLogDiv.textContent = `Вы походили: ${card.rank}${card.suit}. Ход бота...`;
  setTimeout(() => botDefend(), 1000);
}

// Ход бота (защита)
function botDefend() {
  for (let i = 0; i < botHand.length; i++) {
    if (canBeat(battlefieldCards[0].attack, botHand[i])) {
      battlefieldCards[0].defense = botHand.splice(i, 1)[0];
      renderBattlefield();
      renderHand(botHand, botHandDiv, true);
      gameLogDiv.textContent = `Бот побил карту. Ваш ход снова.`;
      renderHand(playerHand, playerHandDiv, false, playerPlayCard);
      return;
    }
  }
  // Бот не может побить
  gameLogDiv.textContent = `Бот не может побить — он забирает карты. Ваш ход снова.`;
  botHand = botHand.concat(battlefieldCards.map(c => c.attack));
  battlefieldCards.forEach(c => { if (c.defense) botHand.push(c.defense); });
  battlefieldCards = [];
  renderBattlefield();
  renderHand(botHand, botHandDiv, true);
  renderHand(playerHand, playerHandDiv, false, playerPlayCard);
}

// Кнопка запуска
startBtn.onclick = startGame;
