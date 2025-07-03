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
   
