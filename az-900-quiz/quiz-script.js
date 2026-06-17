let allQuestions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongQuestions = [];

const introScreen = document.getElementById('intro-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');
const quizContainer = document.getElementById('quiz-container');
const nextBtn = document.getElementById('nextBtn');
const resultText = document.getElementById('quiz-result');

document.getElementById('startBtn').addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);

function shuffleArray(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function startQuiz() {
  try {
    const res = await fetch('https://az900quizdata.blob.core.windows.net/quiz-questions/questions.json');
    allQuestions = await res.json();

    // 25 random vragen kiezen
    selectedQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 25);

    currentQuestionIndex = 0;
    score = 0;
    wrongQuestions = [];

    introScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    showQuestion();
  } catch (err) {
    alert("Fout bij het laden van vragen: " + err.message);
  }
}

function showQuestion() {
  const q = selectedQuestions[currentQuestionIndex];

  // Shuffle opties met indexen
  let optionsWithIndex = q.opties.map((opt, i) => ({ optie: opt, index: i }));
  shuffleArray(optionsWithIndex);

  // Nieuwe correcte index na shuffle
  let newCorrectIndex = optionsWithIndex.findIndex(o => o.index === q.correct);

  // Toon vraag en opties
  quizContainer.innerHTML = `
    <div class="question">
      <h3>Vraag ${currentQuestionIndex + 1} van 25</h3>
      <p>${q.vraag}</p>
      <div class="options">
        ${optionsWithIndex.map((o, i) => `
          <label>
            <input type="radio" name="option" value="${i}">
            ${o.optie}
          </label>
        `).join('')}
      </div>
    </div>
  `;

  // Bewaar de nieuwe correcte index voor de controle
  selectedQuestions[currentQuestionIndex].shuffledCorrect = newCorrectIndex;

  nextBtn.disabled = true;

  const radios = document.querySelectorAll('input[name="option"]');
  radios.forEach(r => r.addEventListener('change', () => {
    nextBtn.disabled = false;
  }));
}

function nextQuestion() {
  const selected = document.querySelector('input[name="option"]:checked');
  if (!selected) {
    alert("Kies een antwoord om door te gaan.");
    return;
  }

  const answer = parseInt(selected.value);
  const currentQ = selectedQuestions[currentQuestionIndex];

  if (answer === currentQ.shuffledCorrect) {
    score++;
  } else {
    wrongQuestions.push({
      vraag: currentQ.vraag,
      opties: currentQ.opties,
      correctIndex: currentQ.correct,
      uitleg: currentQ.uitleg || "Geen uitleg beschikbaar."
    });
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < selectedQuestions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const percentage = Math.round((score / selectedQuestions.length) * 100);
  let passFailText = percentage >= 70 ? "Geslaagd! 🎉" : "Niet geslaagd. ❌";
  let passFailClass = percentage >= 70 ? "pass" : "fail";

  resultText.innerHTML = `
    Je hebt <strong>${score}</strong> van de <strong>${selectedQuestions.length}</strong> vragen correct beantwoord.<br />
    Dat is <strong>${percentage}%</strong>. <span class="${passFailClass}">${passFailText}</span>
  `;

  // Voeg knop toe om fout beantwoorde vragen te bekijken
  if (wrongQuestions.length > 0) {
    const btn = document.createElement('button');
    btn.textContent = 'Bekijk fout beantwoorde vragen';
    btn.id = 'reviewBtn';
    btn.style.marginTop = '15px';
    btn.addEventListener('click', showReview);
    resultScreen.appendChild(btn);
  }
}

function showReview() {
  resultScreen.classList.add('hidden');
  quizScreen.classList.add('hidden');

  // Maak review scherm aan als nog niet aanwezig
  let reviewScreen = document.getElementById('review-screen');
  if (!reviewScreen) {
    reviewScreen = document.createElement('div');
    reviewScreen.id = 'review-screen';
    document.body.appendChild(reviewScreen);
  }
  reviewScreen.classList.remove('hidden');
  reviewScreen.innerHTML = `<h2>Fout beantwoorde vragen</h2>`;

  wrongQuestions.forEach((item, i) => {
    reviewScreen.innerHTML += `
      <div class="question-review">
        <h3>Vraag ${i + 1}</h3>
        <p><strong>Vraag:</strong> ${item.vraag}</p>
        <p><strong>Juiste antwoord:</strong> ${item.opties[item.correctIndex]}</p>
        <p><strong>Uitleg:</strong> ${item.uitleg}</p>
        <hr />
      </div>
    `;
  });

  // Voeg knop toe om terug naar resultaat te gaan
  const backBtn = document.createElement('button');
  backBtn.textContent = 'Terug naar resultaat';
  backBtn.style.marginTop = '20px';
  backBtn.addEventListener('click', () => {
    reviewScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
  });

  reviewScreen.appendChild(backBtn);
}
