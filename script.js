const battlefieldDiv = document.getElementById('battlefield');

function animateCardToBattle(cardEl, callback) {
  cardEl.classList.add('move-up');
  cardEl.addEventListener('animationend', () => {
    callback();
  }, { once: true });
}

function playerPlayCard(index) {
  const card = playerHand.splice(index, 1)[0];

  // Найдем элемент карты в руке игрока
  const cardEl = playerHandDiv.children[index];

  // Отключаем клики пока анимация идет
  disablePlayerHand();

  // Клонируем карту для анимации на стол
  const animCard = cardEl.cloneNode(true);
  animCard.classList.add('battle-card');
  if (card.suit === '♥' || card.suit === '♦') animCard.classList.add('red');

  // Добавляем на стол, позиционируем поверх
  battlefieldDiv.appendChild(animCard);

  animateCardToBattle(animCard, () => {
    // После анимации обновляем руки и вызываем ход бота
    renderHand(playerHand, playerHandDiv, false, playerPlayCard);
    gameLogDiv.textContent = `Вы походили: ${card.rank}${card.suit}. Бот думает...`;
    botPlay(card, animCard);
  });
}

function botPlay(playerCard, animCard) {
  // Тут бот выбирает карту (для примера просто первая)
  const botCard = botHand.shift();

  // Клонируем карту бота для анимации на стол
  const botCardEl = document.createElement('div');
  botCardEl.className = 'battle-card';
  botCardEl.textContent = botCard.rank + botCard.suit;
  if (botCard.suit === '♥' || botCard.suit === '♦') botCardEl.classList.add('red');
  battlefieldDiv.appendChild(botCardEl);

  // Анимация бота (можно сделать по-другому, для простоты просто задержка)
  setTimeout(() => {
    // Удаляем карты со стола через секунду
    setTimeout(() => {
      battlefieldDiv.innerHTML = '';
      renderHand(botHand, botHandDiv, true);
      gameLogDiv.textContent = `Бот ответил: ${botCard.rank}${botCard.suit}. Ваш ход снова.`;
      enablePlayerHand();
    }, 1000);
  }, 700);
}

function disablePlayerHand() {
  Array.from(playerHandDiv.children).forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.6';
  });
}

function enablePlayerHand() {
  Array.from(playerHandDiv.children).forEach(el => {
    el.style.pointerEvents = 'auto';
    el.style.opacity = '1';
  });
}
