// Проверяем, что Telegram Web App API доступен
const tg = window.Telegram.WebApp;

document.getElementById('start-game').addEventListener('click', () => {
  tg.sendData("start_game");
  alert("Игра началась! (Это заглушка)");
});
