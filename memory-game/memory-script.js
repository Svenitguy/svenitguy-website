const board = document.getElementById('game-board');
const turnsDisplay = document.getElementById('turns');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('exitBtn');
const playerNameInput = document.getElementById('playerName');
const highscoreBody = document.getElementById('highscoreBody');
const overlayTitle = document.getElementById('overlay-title');
const overlayDescription = document.getElementById('overlay-description');

const matchSound = document.getElementById('matchSound');
const winSound = document.getElementById('winSound');
const failSound = document.getElementById('failSound'); // Nieuw geluid bij mismatch

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let turns = 0;
let playerName = "";

const emojis = ['🍕', '🚀', '🎧', '🐱', '🌟', '🍩', '⚽', '🎲'];

// Container voor foutmeldingen onder input
const errorMessage = document.createElement('div');
errorMessage.style.color = '#e6a743';
errorMessage.style.marginBottom = '1rem';
errorMessage.style.fontWeight = 'bold';
playerNameInput.parentNode.insertBefore(errorMessage, playerNameInput.nextSibling);

// UUID generator (voor unieke ID's)
function generateUUID() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

startBtn.addEventListener('click', () => {
  errorMessage.textContent = '';
  const name = playerNameInput.value.trim();

  if (!name) {
    errorMessage.textContent = "Vul alsjeblieft je naam in om te starten.";
    playerNameInput.focus();
    return;
  }

  if (name.length > 8) {
    errorMessage.textContent = "Je naam mag maximaal 8 tekens bevatten.";
    playerNameInput.focus();
    return;
  }

  playerName = name;
  overlay.classList.remove('active');

  // Reset overlay tekst naar starttekst
  overlayTitle.textContent = "Memory Game";
  overlayDescription.innerHTML = `
    Test je geheugen in dit eenvoudige <strong>memory-spel</strong>.<br />
    Klik op de kaarten om paren te vinden.<br />
    Elk paar dat je vindt blijft zichtbaar.<br />
    Vul je naam in om je score op te slaan in de highscorelijst.
  `;

  startGame();
});

exitBtn.addEventListener('click', () => {
  window.location.href = "https://www.svenitguy.be";
});

function startGame() {
  const gameCards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());

  board.innerHTML = '';
  cards = [];
  turns = 0;
  turnsDisplay.textContent = turns;
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  localStorage.removeItem('latestScore'); // Verwijder laatste score bij nieuw spel

  gameCards.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;
    card.textContent = '';
    card.addEventListener('click', handleCardClick);
    board.appendChild(card);
    cards.push(card);
  });

  // Haal scores van server en toon
  showHighscores();
}

function handleCardClick(e) {
  if (lockBoard) return;
  const clickedCard = e.currentTarget;
  if (clickedCard.classList.contains('revealed')) return;

  clickedCard.textContent = clickedCard.dataset.symbol;
  clickedCard.classList.add('revealed');

  if (!firstCard) {
    firstCard = clickedCard;
    return;
  }

  secondCard = clickedCard;
  lockBoard = true;
  turns++;
  turnsDisplay.textContent = turns;

  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

  if (isMatch) {
    if (matchSound.readyState >= 2) {
      matchSound.currentTime = 0;
      matchSound.play();
    }

    firstCard.removeEventListener('click', handleCardClick);
    secondCard.removeEventListener('click', handleCardClick);
    resetTurn();
    checkGameFinished();
  } else {
    // Speel failSound af bij mismatch
    if (failSound.readyState >= 2) {
      failSound.currentTime = 0;
      failSound.play();
    }
    setTimeout(() => {
      firstCard.textContent = '';
      secondCard.textContent = '';
      firstCard.classList.remove('revealed');
      secondCard.classList.remove('revealed');
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

async function sendScoreToServer(playerName, turns) {
  const scoreData = {
    playerName: playerName,
    turns: turns
  };

  try {
    const response = await fetch('https://memorygamefunc-sven-e7abhug3gra6cnfs.westeurope-01.azurewebsites.net/api/saveScore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData)
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('⚠️ Fout bij opslaan score op server:', text);
    } else {
      console.log('✅ Score succesvol opgeslagen:', text);
    }
  } catch (error) {
    console.error('❌ Fout bij versturen score:', error);
  }
}

async function fetchScoresFromServer() {
  try {
    const response = await fetch('https://memorygamefunc-sven-e7abhug3gra6cnfs.westeurope-01.azurewebsites.net/api/getScores?code=YM_K4pwyacs7fw7xe21R4IJwRekNnIjmPcyzeAcCDEFkAzFu_0HXwQ==');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data; // verwacht array van scores [{id, playername, turns, date, ...}]
  } catch (error) {
    console.error('❌ Fout bij ophalen scores:', error);
    return [];
  }
}

// Pas checkGameFinished aan om na posten score ook de server scores te laden en tonen
async function checkGameFinished() {
  const allRevealed = cards.every(card => card.classList.contains('revealed'));
  if (allRevealed) {
    if (winSound.readyState >= 2) {
      winSound.currentTime = 0;
      winSound.play();
    }

    const scoreEntry = {
      id: generateUUID(),
      playername: playerName,
      turns: turns,
      date: new Date().toISOString()
    };

    // Verstuur score naar Azure Function
    await sendScoreToServer(playerName, turns);

    // Bewaar laatste score lokaal (voor markering in lijst)
    localStorage.setItem('latestScore', JSON.stringify(scoreEntry));

    setTimeout(async () => {
      overlayTitle.textContent = `Proficiat, ${playerName}!`;

      overlayDescription.innerHTML = `
        Je hebt het spel uitgespeeld in <strong>${turns}</strong> beurten.<br>
        Je score is opgeslagen in de globale highscorelijst.
      `;

      playerNameInput.value = playerName;

      // Toon server scores (async)
      await showHighscores();

      overlay.classList.add('active');
      startBtn.textContent = "Opnieuw spelen";
    }, 700);
  }
}

// Pas showHighscores aan om server data te tonen
async function showHighscores() {
  const serverScores = await fetchScoresFromServer();
  const latestScore = JSON.parse(localStorage.getItem('latestScore'));

  highscoreBody.innerHTML = '';

  if (serverScores.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 4;
    td.textContent = 'Nog geen highscores van de server';
    tr.appendChild(td);
    highscoreBody.appendChild(tr);
    return;
  }

  // Sorteer op laagste aantal beurten
  serverScores.sort((a, b) => a.turns - b.turns);

  // Vind rank van laatste score via id
let playerRank = -1;

if (latestScore) {
  // Zoek jouw score op basis van playername en aantal beurten (en optioneel de datum)
  playerRank = serverScores.findIndex(s =>
    s.playername === latestScore.playername &&
    s.turns === latestScore.turns &&
    Math.abs(new Date(s.date) - new Date(latestScore.date)) < 10000 // binnen 10 sec
  );
}


  // Toon top 5 van server scores
  for (let i = 0; i < Math.min(5, serverScores.length); i++) {
    const score = serverScores[i];
    const tr = document.createElement('tr');

const isCurrentPlayer = latestScore &&
  score.playername === latestScore.playername &&
  score.turns === latestScore.turns &&
  Math.abs(new Date(score.date) - new Date(latestScore.date)) < 10000;

if (isCurrentPlayer) {
  tr.classList.add('my-score');
}


    const rankTd = document.createElement('td');
    if (i === 0) rankTd.textContent = '🥇';
    else if (i === 1) rankTd.textContent = '🥈';
    else if (i === 2) rankTd.textContent = '🥉';
    else rankTd.textContent = i + 1;
    tr.appendChild(rankTd);

    const nameTd = document.createElement('td');
    nameTd.textContent = score.playername || score.name;
    tr.appendChild(nameTd);

    const turnsTd = document.createElement('td');
    turnsTd.textContent = score.turns;
    tr.appendChild(turnsTd);

    const dateTd = document.createElement('td');
    dateTd.textContent = new Date(score.date).toLocaleDateString('nl-NL');
    tr.appendChild(dateTd);

    highscoreBody.appendChild(tr);
  }

  // Laat speler zijn score zien als die niet in top 5 staat maar wel in lijst
  if (playerRank >= 5) {
    const score = serverScores[playerRank];
    const tr = document.createElement('tr');
    tr.classList.add('my-score');

    const rankTd = document.createElement('td');
    rankTd.textContent = playerRank + 1;
    tr.appendChild(rankTd);

    const nameTd = document.createElement('td');
    nameTd.textContent = score.playername || score.name;
    tr.appendChild(nameTd);

    const turnsTd = document.createElement('td');
    turnsTd.textContent = score.turns;
    tr.appendChild(turnsTd);

    const dateTd = document.createElement('td');
    dateTd.textContent = new Date(score.date).toLocaleDateString('nl-NL');
    tr.appendChild(dateTd);

    highscoreBody.appendChild(tr);
  }
}

// Start het spel als pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
  overlay.classList.add('active');
  overlayTitle.textContent = "Memory Game";
  overlayDescription.innerHTML = `
    Test je geheugen in dit eenvoudige <strong>memory-spel</strong>.<br />
    Klik op de kaarten om paren te vinden.<br />
    Elk paar dat je vindt blijft zichtbaar.<br />
    Vul je naam in om je score op te slaan in de highscorelijst.
  `;

  playerNameInput.focus();

  showHighscores();
});
