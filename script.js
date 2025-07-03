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

renderGame();
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  // здесь код с tg
} else {
  // можно вывести предупреждение или просто не делать ничего
  console.log('Telegram WebApp API не доступен — запусти в Telegram');
}
