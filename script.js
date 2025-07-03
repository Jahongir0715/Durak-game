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
