import {
  GROUPS,
  GROUP_IDS,
  QUESTIONS,
  TOTAL,
  shuffle,
  matchesQuestion,
  answerLabels,
} from "./whoNeedsQuestions.js";

const TILE_PX = 56;
const QUESTION_MS = 10000;

const els = {
  overlay: document.getElementById("overlay"),
  overlayKicker: document.getElementById("overlay-kicker"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayBody: document.getElementById("overlay-body"),
  overlayScore: document.getElementById("overlay-score"),
  overlayAnswer: document.getElementById("overlay-answer"),
  overlayBtn: document.getElementById("overlay-btn"),
  playPanel: document.getElementById("play-panel"),
  kahoot: document.getElementById("kahoot"),
  qNum: document.getElementById("q-num"),
  stem: document.getElementById("stem"),
  why: document.getElementById("why"),
  form: document.getElementById("answer-form"),
  input: document.getElementById("answer-input"),
  progress: document.getElementById("progress-chip"),
  retry: document.getElementById("retry-chip"),
  timerChip: document.getElementById("timer-chip"),
  timerBar: document.getElementById("timer-bar"),
  skip: document.getElementById("btn-skip"),
  pause: document.getElementById("btn-pause"),
  groupsBar: document.getElementById("groups-bar"),
  track: document.getElementById("track"),
  car: document.getElementById("car"),
  carMotion: document.getElementById("car-motion"),
  world: document.getElementById("world"),
};

const state = {
  queue: [],
  index: 0,
  misses: 0,
  skipUsed: false,
  paused: false,
  remainingMs: QUESTION_MS,
  locked: false,
  mode: "start",
  deadline: 0,
  timerRaf: 0,
};

function fillGroupsBar() {
  els.groupsBar.innerHTML = "";
  GROUP_IDS.forEach((id) => {
    const chip = document.createElement("span");
    chip.className = "group-chip";
    chip.textContent = GROUPS[id].label;
    els.groupsBar.appendChild(chip);
  });
}

function buildTrack() {
  els.track.innerHTML = "";
  for (let i = 0; i < TOTAL; i += 1) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.n = String(i);
    els.track.appendChild(tile);
  }
  const finish = document.createElement("div");
  finish.className = "tile is-finish";
  finish.textContent = "FINISH";
  els.track.appendChild(finish);
}

function paintTrack() {
  const tiles = [...els.track.querySelectorAll(".tile:not(.is-finish)")];
  tiles.forEach((tile, i) => {
    tile.classList.toggle("is-passed", i < state.index);
    tile.classList.toggle("is-current", i === state.index);
  });
  els.track.style.setProperty("--scroll", `${state.index * TILE_PX}px`);
  els.progress.textContent = `${state.index} / ${TOTAL}`;
}

function setRetryChip() {
  if (state.misses === 0) {
    els.retry.textContent = "1 retry left";
    els.retry.classList.remove("hud-chip--warn");
  } else {
    els.retry.textContent = "Last chance";
    els.retry.classList.add("hud-chip--warn");
  }
}

function setSkipButton() {
  const canSkip =
    !state.skipUsed &&
    state.index < state.queue.length - 1 &&
    !state.locked &&
    !state.paused;
  els.skip.disabled = !canSkip;
  els.skip.textContent = state.skipUsed ? "Skip used" : "Skip";
}

function setPauseButton() {
  els.pause.disabled = state.locked && !state.paused;
  els.pause.textContent = state.paused ? "Resume" : "Pause";
  els.pause.classList.toggle("is-on", state.paused);
  els.world.classList.toggle("is-paused", state.paused);
}

function currentQuestion() {
  return state.queue[state.index];
}

function stopTimer() {
  if (state.timerRaf) cancelAnimationFrame(state.timerRaf);
  state.timerRaf = 0;
}

function paintTimer(leftMs) {
  const secs = Math.max(0, Math.ceil(leftMs / 1000));
  const frac = Math.max(0, leftMs / QUESTION_MS);
  els.timerChip.textContent = `${secs}s`;
  els.timerBar.style.transform = `scaleX(${frac})`;
  els.timerChip.classList.toggle("hud-chip--warn", secs <= 3);
  els.timerBar.classList.toggle("is-low", secs <= 3);
}

function tickTimer(now) {
  const left = state.deadline - now;
  state.remainingMs = left;
  paintTimer(left);
  if (left <= 0) {
    state.timerRaf = 0;
    onTimeout();
    return;
  }
  state.timerRaf = requestAnimationFrame(tickTimer);
}

function startTimer() {
  stopTimer();
  state.remainingMs = QUESTION_MS;
  resumeTimer();
}

function resumeTimer() {
  stopTimer();
  state.deadline = performance.now() + Math.max(0, state.remainingMs);
  paintTimer(state.remainingMs);
  state.timerRaf = requestAnimationFrame(tickTimer);
}

function playKahootIn() {
  els.kahoot.classList.remove("is-enter");
  void els.kahoot.offsetWidth;
  els.kahoot.classList.add("is-enter");
}

els.kahoot.addEventListener("animationend", (event) => {
  if (event.animationName === "kahoot-pop") els.kahoot.classList.remove("is-enter");
});

function renderQuestion() {
  const q = currentQuestion();
  if (!q) return;
  state.paused = false;
  els.qNum.textContent = `Q${state.index + 1}`;
  els.stem.textContent = q.stem;
  els.why.hidden = true;
  els.why.textContent = "";
  els.input.value = "";
  els.input.classList.remove("is-wrong");
  els.input.disabled = false;
  setRetryChip();
  setSkipButton();
  setPauseButton();
  paintTrack();
  playKahootIn();
  startTimer();
  els.input.focus();
}

function showOverlay({ mode, title, body, score, answer, kicker, btn }) {
  stopTimer();
  state.paused = false;
  els.world.classList.remove("is-paused");
  state.mode = mode;
  els.overlay.hidden = false;
  els.overlay.classList.toggle("is-over", mode === "over");
  els.overlay.classList.toggle("is-clear", mode === "clear");
  els.overlayKicker.textContent = kicker;
  els.overlayTitle.textContent = title;
  els.overlayBody.textContent = body;
  if (score) {
    els.overlayScore.hidden = false;
    els.overlayScore.textContent = score;
  } else {
    els.overlayScore.hidden = true;
    els.overlayScore.textContent = "";
  }
  if (answer) {
    els.overlayAnswer.hidden = false;
    els.overlayAnswer.textContent = answer;
  } else {
    els.overlayAnswer.hidden = true;
    els.overlayAnswer.textContent = "";
  }
  els.overlayBtn.textContent = btn;
  els.playPanel.hidden = true;
}

function hideOverlay() {
  els.overlay.hidden = true;
  els.playPanel.hidden = false;
}

function startRun() {
  state.queue = shuffle(QUESTIONS);
  state.index = 0;
  state.misses = 0;
  state.skipUsed = false;
  state.paused = false;
  state.locked = false;
  hideOverlay();
  renderQuestion();
}

function hopCar() {
  els.carMotion.classList.remove("is-hop");
  void els.carMotion.offsetWidth;
  els.carMotion.classList.add("is-hop");
}

els.carMotion.addEventListener("animationend", (event) => {
  if (event.animationName === "hop") els.carMotion.classList.remove("is-hop");
});
els.car.addEventListener("animationend", (event) => {
  if (event.animationName === "shake") els.car.classList.remove("is-shake");
});

function shakeWrong() {
  els.car.classList.remove("is-shake");
  els.world.classList.remove("is-wrong");
  void els.car.offsetWidth;
  els.car.classList.add("is-shake");
  els.world.classList.add("is-wrong");
  els.input.classList.add("is-wrong");
}

function revealAnswerLine(q) {
  const labels = answerLabels(q);
  const listed = labels.join(" or ");
  return `Answer: ${listed}. ${q.why}`;
}

function gameOver() {
  state.locked = true;
  const q = currentQuestion();
  showOverlay({
    mode: "over",
    kicker: "Ch 5 · Nutrition race",
    title: "Game over",
    body: "Two misses on the same question (wrong answer or time out).",
    score: `${state.index} / ${TOTAL}`,
    answer: q ? revealAnswerLine(q) : "",
    btn: "Restart",
  });
}

function celebrate() {
  state.locked = true;
  paintTrack();
  showOverlay({
    mode: "clear",
    kicker: "Finish line",
    title: "Congratulations!",
    body: "You answered all 15 “who needs more” questions and reached the finish.",
    score: `${TOTAL} / ${TOTAL}`,
    btn: "Restart",
  });
}

function onCorrect() {
  stopTimer();
  const q = currentQuestion();
  els.why.hidden = false;
  els.why.textContent = q.why;
  els.input.disabled = true;
  els.skip.disabled = true;
  els.pause.disabled = true;
  hopCar();
  state.index += 1;
  state.misses = 0;
  paintTrack();
  if (state.index >= TOTAL) {
    window.setTimeout(celebrate, 650);
    return;
  }
  window.setTimeout(() => {
    state.locked = false;
    renderQuestion();
  }, 700);
}

function onWrong(reason) {
  stopTimer();
  shakeWrong();
  state.misses += 1;
  if (state.misses >= 2) {
    state.locked = true;
    window.setTimeout(gameOver, 400);
    return;
  }
  setRetryChip();
  els.why.hidden = false;
  els.why.textContent =
    reason === "time"
      ? "Time’s up — last chance. Type who needs more."
      : "Try again — type who needs more.";
  els.input.value = "";
  els.input.focus();
  state.locked = false;
  setSkipButton();
  setPauseButton();
  startTimer();
}

function onTimeout() {
  if (state.locked || state.paused || els.overlay.hidden === false) return;
  state.locked = true;
  onWrong("time");
}

function pauseGame() {
  if (state.paused || state.locked || els.overlay.hidden === false) return;
  state.remainingMs = Math.max(0, state.deadline - performance.now());
  stopTimer();
  state.paused = true;
  els.input.disabled = true;
  setSkipButton();
  setPauseButton();
}

function resumeGame() {
  if (!state.paused) return;
  state.paused = false;
  els.input.disabled = false;
  setSkipButton();
  setPauseButton();
  resumeTimer();
  els.input.focus();
}

function togglePause() {
  if (state.paused) resumeGame();
  else pauseGame();
}

function skipQuestion() {
  if (state.locked || state.paused || els.overlay.hidden === false) return;
  if (state.skipUsed) return;
  if (state.index >= state.queue.length - 1) return;
  const [q] = state.queue.splice(state.index, 1);
  state.queue.push(q);
  state.skipUsed = true;
  state.misses = 0;
  renderQuestion();
}

function submitAnswer(event) {
  event.preventDefault();
  if (state.locked || state.paused || els.overlay.hidden === false) return;
  const q = currentQuestion();
  if (!q) return;
  const raw = els.input.value;
  if (!raw.trim()) return;
  state.locked = true;
  if (matchesQuestion(raw, q)) {
    onCorrect();
  } else {
    onWrong("typed");
  }
}

els.form.addEventListener("submit", submitAnswer);
els.skip.addEventListener("click", skipQuestion);
els.pause.addEventListener("click", togglePause);
els.overlayBtn.addEventListener("click", startRun);

fillGroupsBar();
buildTrack();
paintTrack();
paintTimer(QUESTION_MS);
showOverlay({
  mode: "start",
  kicker: "Ch 5 · Nutrition race",
  title: "Who needs more?",
  body: "Type who needs more — no choices shown. You have 10 seconds each question. Capital or small letters both count. One free Skip (right of the question). One wrong answer gets a retry; a second miss or timeout is game over.",
  btn: "Start",
});
