// ===== Элементы интерфейса =====
const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const trumpSuitDiv = document.getElementById('trump-suit');
const gameLogDiv = document.getElementById('game-log');
const startBtn = document.getElementById('start-game-btn');
const battlefieldDiv = document.getElementById('battlefield');

// ===== Игровые данные =====
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let botHand = [];
let trumpCard = null;
let trumpSuit = '';

let attackingCards = [];  // карты на столе, атака
let defendingCards = [];  // карты на столе, защита

let playerTurn = true;  // кто ходит сейчас?

// ===== Создание и тасовка колоды =====
function createDeck() {
  return suits.flatMap(suit => ranks.map(rank => ({ suit, rank })));
}

function shuffle(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ===== Отрисовка руки =====
function renderHand(hand, container, hide=false, clickHandler=null) {
  container.innerHTML = '';
  hand.forEach((card, index) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.textContent = hide ? '🂠' : card.rank + card.suit;
    if ((clickHandler) && !hide) {
      el.style.cursor = 'pointer';
      el.onclick = () => clickHandler(index);
    }
    if (card.suit === '♥' || card.suit === '♦') {
      el.classList.add('red');
    }
    container.appendChild(el);
  });
}

// ===== Отрисовка карт на столе =====
function renderBattlefield() {
  battlefieldDiv.innerHTML = '';
  for(let i=0; i < attackingCards.length; i++) {
    const atkCard = document.createElement('div');
    atkCard.className = 'battle-card';
    atkCard.textContent = attackingCards[i].rank + attackingCards[i].suit;
    if (attackingCards[i].suit === '♥' || attackingCards[i].suit === '♦') {
      atkCard.classList.add('red');
    }
    battlefieldDiv.appendChild(atkCard);

    if(defendingCards[i]) {
      const defCard = document.createElement('div');
      defCard.className = 'battle-card';
      defCard.textContent = defendingCards[i].rank + defendingCards[i].suit;
      if (defendingCards[i].suit === '♥' || defendingCards[i].suit === '♦') {
        defCard.classList.add('red');
      }
      defCard.style.position = 'absolute';
      defCard.style.top = '50px';
      defCard.style.left = `${i*60}px`;
      battlefieldDiv.appendChild(defCard);
    }
  }
}

// ===== Начало игры =====
function startGame() {
  deck = createDeck();
  shuffle(deck);

  playerHand = deck.splice(0,6);
  botHand = deck.splice(0,6);
  trumpCard = deck[deck.length -1];
  trumpSuit = trumpCard.suit;

  trumpSuitDiv.textContent = `Козырь: ${trumpCard.rank}${trumpCard.suit}`;
  attackingCards = [];
  defendingCards = [];

  playerTurn = true;

  renderHand(playerHand, playerHandDiv, false, onPlayerAttack);
  renderHand(botHand, botHandDiv, true);
  renderBattlefield();
  gameLogDiv.textContent = 'Игра началась! Ваш ход.';
  enablePlayerHand();
}

// ===== Правила битвы карт =====
function canBeat(attackingCard, defendingCard) {
  // бьет карту, если та же масть и старше, или козырь бьет не козырь
  if(defendingCard.suit === attackingCard.suit) {
    return ranks.indexOf(defendingCard.rank) > ranks.indexOf(attackingCard.rank);
  }
  if(defendingCard.suit === trumpSuit && attackingCard.suit !== trumpSuit) {
    return true;
  }
  return false;
}

// ===== Ход игрока (атака) =====
function onPlayerAttack(cardIndex) {
  if (!playerTurn) {
    gameLogDiv.textContent = "Сейчас ход бота, подождите.";
    return;
  }

  const card = playerHand[cardIndex];

  // Проверяем, можно ли атаковать (первая карта или совпадает ранг на столе)
  if(attackingCards.length > 0
