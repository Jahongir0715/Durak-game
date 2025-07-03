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
