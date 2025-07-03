const ranksOrder = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
const suits = ['♠', '♣', '♥', '♦'];

let deck = [];
let playerHand = [];
let botHand = [];
let trumpCard = null;
let trumpSuit = null;

const playerHandDiv = document.getElementById('player-hand');
const botHandDiv = document.getElementById('bot-hand');
const battlefieldDiv = document.getElementById('battlefield');
const trumpSuitDiv = document.getElementById('trump-suit');
const gameLogDiv = document.getElementById('game-log');
const deckDiv = document.getElementById('deck');
const startBtn = document.getElementById('start-game-btn');
const takeCardBtn = document.getElementById('take-card-btn');

function createDeck() {
  const d = [];
  suits.forEach(suit => {
    ranksOrder.forEach(rank => {
      d.push({rank, suit});
    });
  });
  return d;
}

function shuffle(array) {
  for(let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function findFirstPlayer() {
  let minTrumpIndex = ranksOrder.length;
  let firstPlayer = null;

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

function renderDeck() {
  if (deck.length === 0) {
    deckDiv.textContent = 'Колода пуста';
    takeCardBtn.disabled = true;
  } else {
    deckDiv.textContent = '🂠';
    takeCardBtn.disabled = false;
  }
}

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

function clearBattlefield() {
  battlefieldDiv.innerHTML = '';
}

function beats(a, b) {
  if (a.suit === b.suit) {
    return ranksOrder.indexOf(b.rank) > ranksOrder.indexOf(a.rank);
  }
  if (b.suit === trumpSuit && a.suit !== trumpSuit) {
    return true;
  }
  return false;
}

function refillHands(attacker) {
  const order = attacker === 'player' ? [playerHand, botHand] : [botHand, playerHand];
  order.forEach(hand => {
    while (hand.length < 6 && deck.length > 0) {
      hand.push(deck.pop());
    }
  });
}

let currentAttacker = null;
let isPlayerTurn = false;
let attackingPairs = [];

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

function botDefend() {
  if (attackingPairs.length === 0) return;

  const attackCard = attackingPairs[0].attack;
  const defendIndex = botHand.findIndex(card => beats(attackCard, card));

  if (defendIndex === -1) {
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

function disablePlayerHand() {
  playerHandDiv.querySelectorAll('.card').forEach(card => {
    card.style.pointerEvents = 'none';
    card.style.opacity = '0.5';
  });
}

function enablePlayerHand() {
  playerHandDiv.querySelectorAll('.card').forEach(card => {
    card.style.pointerEvents = 'auto';
    card.style.opacity = '1';
  });
}

startBtn.addEventListener('click', startGame);
