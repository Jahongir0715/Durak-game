// script.js

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHand = [];
let botHand = [];
let trumpSuit = null;

function createDeck() {
  const cards = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      cards.push({ suit, rank });
    }
  }
  return cards;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function startGame() {
  deck = shuffleDeck(createDeck());
  trumpSuit = deck[deck.length - 1].suit;

  playerHand = deck.splice(0, 6);
  botHand = deck.splice(0, 6);

  document.getElementById('trump').innerText = trumpSuit;
  document.getElementById('bot-count').innerText = botHand.length;
  renderPlayerHand();
}

function renderPlayerHand() {
  const container = document.getElementById('player-hand');
  container.innerHTML = '';
  playerHand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `${card.rank}<br>${card.suit[0].toUpperCase()}`;
    cardDiv.onclick = () => playCard(index);
    container.appendChild(cardDiv);
  });
}

function playCard(index) {
  const card = playerHand[index];
  const field = document.getElementById('battlefield');

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card';
  cardDiv.innerHTML = `${card.rank}<br>${card.suit[0].toUpperCase()}`;
  field.appendChild(cardDiv);

  playerHand.splice(index, 1);
  renderPlayerHand();
}

window.onload = () => {
  Telegram.WebApp.ready(); // для Telegram Web App
  startGame();
};
