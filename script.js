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

const table = [];

function renderGame() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h2>Козырь: ${trumpCard.rank}${trumpCard.suit}</h2>
    <h3>Ваш ход — выберите карту:</h3>
    <div id="player-hand"></div>
    <h3>Карты бота:</h3>
    <div id="bot-hand"></div>
    <h3>Стол:</h3>
    <div id="table"></div>
  `;

  const playerHandDiv = document.getElementById('player-hand');
  playerHandDiv.innerHTML = '';
  playerHand.forEach((card, index) => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card';
    cardElem.textContent = card.rank + card.suit;
    cardElem.onclick = () => playerAttack(index);
    playerHandDiv.appendChild(cardElem);
  });

  const botHandDiv = document.getElementById('bot-hand');
  botHandDiv.innerHTML = '';
  botHand.forEach(() => {
    const cardElem = document.createElement('div');
    cardElem.className = 'card bot-card';
    botHandDiv.appendChild(cardElem);
  });

  renderTable();
}

function renderTable() {
  const tableDiv = document.getElementById('table');
  tableDiv.innerHTML = '';
  table.forEach(pair => {
    const pairDiv = document.createElement('div');
    pairDiv.className = 'table-pair';
    
    const attackCard = document.createElement('div');
    attackCard.className = 'card';
    attackCard.textContent = pair.attack.rank + pair.attack.suit;
    pairDiv.appendChild(attackCard);
    
    if (pair.defense) {
      const defenseCard = document.createElement('div');
      defenseCard.className = 'card';
      defenseCard.textContent = pair.defense.rank + pair.defense.suit;
      pairDiv.appendChild(defenseCard);
    }
    
    tableDiv.appendChild(pairDiv);
  });
}

function playerAttack(cardIndex) {
  const attackCard = playerHand.splice(cardIndex, 1)[0];
  table.push({ attack: attackCard, defense: null });
  renderGame();
  botDefend();
}

function botDefend() {
  const lastAttack = table[table.length - 1];
  if (!lastAttack) return;

  const cardToBeat = lastAttack.attack;
  const defenseCardIndex = botHand.findIndex(card => canBeat(card, cardToBeat));
  
  if (defenseCardIndex === -1) {
    alert('Бот не смог отбиться и берет карты со стола!');
    table.forEach(pair => {
      botHand.push(pair.attack);
      if (pair.defense) botHand.push(pair.defense);
    });
    table.length = 0;
  } else {
    const defenseCard = botHand.splice(defenseCardIndex, 1)[0];
    lastAttack.defense = defenseCard;
  }

  renderGame();
}

function canBeat(defenseCard, attackCard) {
  if (defenseCard.suit === attackCard.suit) {
    return ranks.indexOf(defenseCard.rank) > ranks.indexOf(attackCard.rank);
  } else {
    return defenseCard.suit === trumpSuit;
  }
}

renderGame();
