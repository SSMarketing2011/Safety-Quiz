const quizQuestions = [
  {
    prompt: "You pick up a handgun you have not handled in a while. What is the safest first handling process?",
    options: [
      "Handle it normally because you do not keep a round chambered",
      "Remove only the magazine",
      "Remove the magazine, then perform a press check to verify the chamber"
    ],
    correctIndex: 2,
    why: "Treat every firearm as loaded until you personally verify otherwise. Removing the magazine is only part of the process because a live round can still remain in the chamber. A press check means slightly pulling the slide back to visually confirm whether a round is in the chamber."
  },
  {
    prompt: "What do you do if a firearm is dropped or falls?",
    options: [
      "Let it fall, keep clear, then recover it safely after it stops moving",
      "Try to catch it before it hits the ground"
    ],
    correctIndex: 0,
    why: "Trying to catch a falling firearm can cause accidental trigger contact or unsafe muzzle movement. Let it fall and manage the scene safely once it is stationary."
  },
  {
    prompt: "You hear a click but no bang during a live-fire string. Which response is safest in most range settings?",
    options: [
      "Turn the gun sideways near your face and inspect immediately",
      "Keep muzzle downrange, wait briefly for a possible hang fire, then run your malfunction process",
      "Keep the muzzle downrange, safely set the firearm down, then notify a Range Safety Officer",
      "Look down the barrel to confirm if there is a blockage"
    ],
    correctIndices: [1, 2],
    why: "Both B. and C. can be safe when done correctly. If you are trained and confident in malfunction handling, running a proper downrange malfunction process is appropriate. If you are newer, uncertain, or uncomfortable, safely grounding the firearm and getting an RSO is the better choice."
  },
  {
    prompt: "After dry-fire practice at home, what is the safest way to transition out of training mode?",
    options: [
      "Insert a loaded magazine in the same room and continue a few more reps",
      "Rack once, point at the wall, and press the trigger one more time before holstering",
      "Verbally end training, secure the unloaded firearm, then move to a separate area before handling live ammo"
    ],
    correctIndex: 2,
    why: "Clear separation between dry-fire and live-ammo handling prevents training scars and negligent discharges. A deliberate room/phase change is a proven safety habit."
  },
  {
    prompt: "How should you determine a truly safe direction for a firearm?",
    options: [
      "The safest direction is always down",
      "Any direction is fine as long as it is not pointed directly at someone",
      "Choose the direction that would cause no injury to people and the least possible property damage if an unintentional discharge occurred"
    ],
    correctIndex: 2,
    why: "Safe direction is context-based, not a fixed angle. You must account for who is around you, what is behind your muzzle, and what would happen if the firearm discharged unexpectedly."
  }
];

let questionText = document.getElementById("questionText");
let answerList = document.getElementById("answerList");
const feedbackCard = document.getElementById("feedbackCard");
const feedbackStatus = document.getElementById("feedbackStatus");
const feedbackWhy = document.getElementById("feedbackWhy");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const progressLabel = document.getElementById("progressLabel");
const scoreLabel = document.getElementById("scoreLabel");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const questionArea = document.getElementById("questionArea");
const questionNav = document.getElementById("questionNav");

let currentQuestionIndex = 0;
const userAnswers = new Array(quizQuestions.length).fill(null);
let showingResults = false;

function isCorrectAnswer(question, selectedIndex) {
  if (Array.isArray(question.correctIndices)) {
    return question.correctIndices.includes(selectedIndex);
  }
  return selectedIndex === question.correctIndex;
}

function getCorrectIndices(question) {
  if (Array.isArray(question.correctIndices)) {
    return question.correctIndices;
  }
  return [question.correctIndex];
}

function restoreQuestionShell() {
  questionArea.innerHTML = `
    <h2 id="questionText"></h2>
    <div id="answerList" class="answer-list"></div>
  `;
  questionText = document.getElementById("questionText");
  answerList = document.getElementById("answerList");
}

function getScore() {
  return userAnswers.reduce((total, selectedIndex, qIndex) => {
    if (selectedIndex === null) {
      return total;
    }
    return total + (isCorrectAnswer(quizQuestions[qIndex], selectedIndex) ? 1 : 0);
  }, 0);
}

function getAnsweredCount() {
  return userAnswers.filter((answer) => answer !== null).length;
}

function isQuizComplete() {
  return getAnsweredCount() === quizQuestions.length;
}

function renderQuestionNav() {
  questionNav.innerHTML = "";

  quizQuestions.forEach((_, index) => {
    const jumpBtn = document.createElement("button");
    jumpBtn.type = "button";
    jumpBtn.className = "jump-btn";
    jumpBtn.textContent = String(index + 1);

    if (index === currentQuestionIndex) {
      jumpBtn.classList.add("current");
    }

    if (userAnswers[index] !== null) {
      jumpBtn.classList.add("answered");
    }

    jumpBtn.addEventListener("click", () => {
      currentQuestionIndex = index;
      renderQuestion();
    });

    questionNav.appendChild(jumpBtn);
  });
}

function updateProgressUi() {
  const total = quizQuestions.length;
  const current = currentQuestionIndex + 1;
  const answered = getAnsweredCount();
  const score = getScore();

  progressLabel.textContent = `Question ${Math.min(current, total)} of ${total}`;
  scoreLabel.textContent = `Score: ${score}`;
  const widthPct = (answered / total) * 100;
  progressFill.style.width = `${widthPct}%`;
  progressBar.setAttribute("aria-valuenow", String(answered));
}

function renderQuestion() {
  if (!questionText || !answerList || showingResults) {
    restoreQuestionShell();
    showingResults = false;
  }

  const active = quizQuestions[currentQuestionIndex];
  const existingAnswer = userAnswers[currentQuestionIndex];

  questionText.textContent = active.prompt;
  answerList.innerHTML = "";

  active.options.forEach((optionText, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-btn";
    const letter = String.fromCharCode(65 + optionIndex);
    button.textContent = `${letter}. ${optionText}`;
    button.addEventListener("click", () => handleAnswer(optionIndex));

    if (existingAnswer !== null) {
      const existingIsCorrect = isCorrectAnswer(active, existingAnswer);
      button.disabled = true;
      if (existingIsCorrect && optionIndex === existingAnswer) {
        button.classList.add("correct");
      }
      if (!existingIsCorrect && getCorrectIndices(active).includes(optionIndex)) {
        button.classList.add("correct");
      }
      if (optionIndex === existingAnswer && !existingIsCorrect) {
        button.classList.add("wrong");
      }
    }

    answerList.appendChild(button);
  });

  if (existingAnswer !== null) {
    const isCorrect = isCorrectAnswer(active, existingAnswer);
    feedbackStatus.textContent = isCorrect ? "Correct" : "Not quite";
    feedbackStatus.className = isCorrect ? "feedback-status correct" : "feedback-status wrong";
    feedbackWhy.textContent = active.why;
    feedbackCard.hidden = false;
    nextBtn.hidden = false;
    nextBtn.textContent = isQuizComplete() ? "View Results" : "Next Question";
  } else {
    feedbackCard.hidden = true;
    nextBtn.hidden = false;
    nextBtn.textContent = "Next Question";
  }

  updateProgressUi();
  renderQuestionNav();
}

function handleAnswer(selectedIndex) {
  if (userAnswers[currentQuestionIndex] !== null) {
    return;
  }

  const active = quizQuestions[currentQuestionIndex];
  const isCorrect = isCorrectAnswer(active, selectedIndex);
  userAnswers[currentQuestionIndex] = selectedIndex;

  const allButtons = answerList.querySelectorAll(".answer-btn");
  const correctIndices = getCorrectIndices(active);

  allButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (isCorrect && idx === selectedIndex) {
      btn.classList.add("correct");
    }
    if (!isCorrect && correctIndices.includes(idx)) {
      btn.classList.add("correct");
    }
    if (idx === selectedIndex && !isCorrect) {
      btn.classList.add("wrong");
    }
  });

  if (isCorrect) {
    feedbackStatus.textContent = "Correct";
    feedbackStatus.className = "feedback-status correct";
  } else {
    feedbackStatus.textContent = "Not quite";
    feedbackStatus.className = "feedback-status wrong";
  }

  feedbackWhy.textContent = active.why;
  feedbackCard.hidden = false;

  scoreLabel.textContent = `Score: ${getScore()}`;
  nextBtn.hidden = false;
  nextBtn.textContent = isQuizComplete() ? "View Results" : "Next Question";

  updateProgressUi();
  renderQuestionNav();
}

function showResults() {
  showingResults = true;
  progressLabel.textContent = "Quiz Complete";
  progressFill.style.width = "100%";
  progressBar.setAttribute("aria-valuenow", String(quizQuestions.length));
  renderQuestionNav();

  const score = getScore();

  questionArea.innerHTML = `
    <div class="results">
      <h2>Safety Quiz Complete</h2>
      <p>Your final score is <span class="score-highlight">${score} out of ${quizQuestions.length}</span>.</p>
      <p>Strong shooters still revisit fundamentals. Repetition is what turns safe habits into automatic habits.</p>
    </div>
  `;

  feedbackCard.hidden = true;
  nextBtn.hidden = false;
  nextBtn.textContent = "Retake Quiz";
}

function resetQuiz() {
  currentQuestionIndex = 0;
  userAnswers.fill(null);
  showingResults = false;
  restoreQuestionShell();

  renderQuestion();
}

function handleNext() {
  if (isQuizComplete()) {
    showResults();
    return;
  }

  const nextUnansweredIndex = userAnswers.findIndex((answer) => answer === null);
  if (nextUnansweredIndex !== -1) {
    currentQuestionIndex = nextUnansweredIndex;
  } else if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex += 1;
  }

  renderQuestion();
}

function handleNextButtonClick() {
  if (showingResults) {
    resetQuiz();
    return;
  }

  handleNext();
}

nextBtn.addEventListener("click", handleNextButtonClick);
restartBtn.addEventListener("click", resetQuiz);
renderQuestion();
