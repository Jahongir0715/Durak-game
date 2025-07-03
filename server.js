<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Дурак Онлайн</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="game-container">

    <header>
      <h1>🃏 Дурак Онлайн</h1>
    </header>

    <div class="game-board">
      <!-- Верхняя часть: противник -->
      <section class="opponent-area">
        <h2>Противник</h2>
        <div id="opponent-hand" class="card-row"></div>
      </section>

      <!-- Игровое поле -->
      <section class="battlefield-area">
        <div class="deck-info">
          <div id="deck" class="deck">🂠</div>
          <div id="trump-card" class="trump-card">Козырь: ?</div>
        </div>

        <div id="battlefield" class="battlefield">
          <!-- сюда кладутся карты атаки/защиты -->
        </div>

        <div id="controls" class="controls">
          <button id="pass-btn" disabled>Бито</button>
          <button id="take-btn" disabled>Беру</button>
        </div>
      </section>

      <!-- Нижняя часть: игрок -->
      <section class="player-area">
        <h2>Вы</h2>
        <div id="player-hand" class="card-row"></div>
      </section>
    </div>

    <!-- Сообщения -->
    <div id="game-log" class="game-log">Ожидание подключения...</div>
  </div>

  <!-- Подключаем socket.io и скрипт -->
  <script src="/socket.io/socket.io.js"></script>
  <script src="script.js"></script>
</body>
</html>
