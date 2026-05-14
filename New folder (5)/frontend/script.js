// Game State
let currentCell = null;
let currentCategory = ['bible'];
let currentDifficulty = 'متنوع';
const BOARD_COLS = 5;
const BOARD_ROWS = 5;

// 0: empty, 1: red, 2: blue
const grid = Array.from({ length: BOARD_COLS }, () => Array(BOARD_ROWS).fill(0));

// UI Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const hexBoard = document.getElementById('hex-board');

const modal = document.getElementById('question-modal');
const modalInitialView = document.getElementById('modal-initial-view');
const modalQuestionView = document.getElementById('modal-question-view');
const initialLetterSpan = document.getElementById('initial-letter');
const questionLetterSpan = document.getElementById('question-letter');
const modalCategory = document.getElementById('modal-category');
const modalDifficulty = document.getElementById('modal-difficulty');
const modalQText = document.getElementById('modal-question-text');
const modalAText = document.getElementById('modal-answer-text');

// Setup Game
document.getElementById('start-game-btn').addEventListener('click', () => {
  const t1 = document.getElementById('team1-name').value || 'الفريق الأحمر';
  const t2 = document.getElementById('team2-name').value || 'الفريق الأزرق';
  
  // Get Categories
  const catCheckboxes = document.querySelectorAll('.category-checkbox:checked');
  if (catCheckboxes.length > 0) {
    currentCategory = Array.from(catCheckboxes).map(cb => cb.value);
  } else {
    currentCategory = ['general']; // Fallback if none checked
  }
  
  // Get Difficulty
  currentDifficulty = document.getElementById('difficulty-select').value;
  
  document.getElementById('display-team1').innerText = t1;
  document.getElementById('display-team2').innerText = t2;
  
  initBoard();
  
  setupScreen.classList.remove('active');
  gameScreen.classList.add('active');
});

function initBoard() {
  hexBoard.innerHTML = '';
  
  // All 28 Arabic letters
  let allLetters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];
  
  // Shuffle the letters to make every game completely unique
  for (let i = allLetters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
  }
  
  // Pick the first 25 random letters
  const gameLetters = allLetters.slice(0, 25);
  
  let index = 0;
  
  for (let c = 0; c < BOARD_COLS; c++) {
    const colDiv = document.createElement('div');
    colDiv.className = 'hex-col';
    
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (index >= gameLetters.length) break;
      
      const letter = gameLetters[index];
      
      const hex = document.createElement('div');
      hex.className = 'hex-cell';
      hex.dataset.col = c;
      hex.dataset.row = r;
      hex.dataset.letter = letter;
      
      const content = document.createElement('div');
      content.className = 'hex-content';
      content.innerText = letter;
      
      hex.appendChild(content);
      colDiv.appendChild(hex);
      
      // Event listener
      hex.addEventListener('click', () => openQuestion(c, r, letter));
      
      index++;
    }
    hexBoard.appendChild(colDiv);
  }
}

function openQuestion(c, r, letter) {
  currentCell = { c, r, letter };
  
  // Fetch question based on current settings
  const qData = getQuestion(letter, currentCategory, currentDifficulty);
  
  initialLetterSpan.innerText = letter;
  questionLetterSpan.innerText = letter;
  
  // Translate category mapping to Arabic
  const catNames = {
    "bible": "ديني ✝️", "general": "عام 🌍", "history": "تاريخ 🏛️",
    "science": "علوم 🔬", "sports": "رياضة ⚽", "tech": "تكنولوجيا 💻",
    "engineering": "هندسة 📐", "medicine": "طب 🩺", "puzzles": "ألغاز 🧩",
    "geography": "جغرافيا 🗺️", "arabic": "لغة عربية 📖"
  };
  
  modalCategory.innerText = catNames[qData.category] || "متنوع 📁";
  modalDifficulty.innerText = qData.difficulty + (qData.difficulty === 'سهل' ? ' 🟢' : qData.difficulty === 'متوسط' ? ' 🟡' : ' 🔴');
  
  modalQText.innerText = qData.question;
  modalAText.innerText = qData.answer;
  
  // Show initial view, hide question view
  modalInitialView.classList.remove('hidden');
  modalQuestionView.classList.add('hidden');
  
  modal.classList.add('active');
}

// Modal Event Listeners
document.getElementById('reveal-question-btn').addEventListener('click', () => {
  modalInitialView.classList.add('hidden');
  modalQuestionView.classList.remove('hidden');
});

document.getElementById('close-initial-btn').addEventListener('click', () => {
  modal.classList.remove('active');
});

document.getElementById('change-question-btn').addEventListener('click', () => {
  if (!currentCell) return;
  const currentQText = modalQText.innerText;
  const qData = getQuestion(currentCell.letter, currentCategory, currentDifficulty, currentQText);
  
  const catNames = {
    "bible": "ديني ✝️", "general": "عام 🌍", "history": "تاريخ 🏛️",
    "science": "علوم 🔬", "sports": "رياضة ⚽", "tech": "تكنولوجيا 💻",
    "engineering": "هندسة 📐", "medicine": "طب 🩺", "puzzles": "ألغاز 🧩",
    "geography": "جغرافيا 🗺️", "arabic": "لغة عربية 📖"
  };
  
  modalCategory.innerText = catNames[qData.category] || "متنوع 📁";
  modalDifficulty.innerText = qData.difficulty + (qData.difficulty === 'سهل' ? ' 🟢' : qData.difficulty === 'متوسط' ? ' 🟡' : ' 🔴');
  modalQText.innerText = qData.question;
  modalAText.innerText = qData.answer;
});

// Old event listeners removed.
// Award Points
document.getElementById('award-red-btn').addEventListener('click', () => setCellColor(1));
document.getElementById('award-blue-btn').addEventListener('click', () => setCellColor(2));
document.getElementById('clear-cell-btn').addEventListener('click', () => setCellColor(0));

function setCellColor(teamId) {
  if (!currentCell) return;
  const { c, r } = currentCell;
  
  grid[c][r] = teamId;
  
  // Update DOM
  const hex = document.querySelector(`.hex-cell[data-col="${c}"][data-row="${r}"]`);
  hex.classList.remove('owned-red', 'owned-blue');
  
  if (teamId === 1) hex.classList.add('owned-red');
  if (teamId === 2) hex.classList.add('owned-blue');
  
  modal.classList.remove('active');
  
  checkWin();
}

// Win Logic
function checkWin() {
  if (checkPath(1)) {
    showWinner('الفريق الأحمر');
  } else if (checkPath(2)) {
    showWinner('الفريق الأزرق');
  }
}

function getNeighbors(c, r) {
  const neighbors = [
    { c: c, r: r - 1 }, // Top
    { c: c, r: r + 1 }  // Bottom
  ];
  
  const isOddCol = (c % 2 !== 0); // Note: visually columns 1, 3 are odd indices (shifted down)
  
  if (isOddCol) {
    neighbors.push(
      { c: c - 1, r: r },     // Top-Left
      { c: c - 1, r: r + 1 }, // Bottom-Left
      { c: c + 1, r: r },     // Top-Right
      { c: c + 1, r: r + 1 }  // Bottom-Right
    );
  } else {
    neighbors.push(
      { c: c - 1, r: r - 1 }, // Top-Left
      { c: c - 1, r: r },     // Bottom-Left
      { c: c + 1, r: r - 1 }, // Top-Right
      { c: c + 1, r: r }      // Bottom-Right
    );
  }
  
  return neighbors.filter(n => n.c >= 0 && n.c < BOARD_COLS && n.r >= 0 && n.r < BOARD_ROWS);
}

function checkPath(teamId) {
  const visited = Array.from({ length: BOARD_COLS }, () => Array(BOARD_ROWS).fill(false));
  const queue = [];
  
  // Find starting nodes
  if (teamId === 1) {
    // Red starts at Col 0, wants to reach Col 4
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (grid[0][r] === teamId) {
        queue.push({ c: 0, r: r });
        visited[0][r] = true;
      }
    }
  } else if (teamId === 2) {
    // Blue starts at Row 0, wants to reach Row 4
    for (let c = 0; c < BOARD_COLS; c++) {
      if (grid[c][0] === teamId) {
        queue.push({ c: c, r: 0 });
        visited[c][0] = true;
      }
    }
  }
  
  // BFS
  while (queue.length > 0) {
    const curr = queue.shift();
    
    // Check win condition
    if (teamId === 1 && curr.c === BOARD_COLS - 1) return true;
    if (teamId === 2 && curr.r === BOARD_ROWS - 1) return true;
    
    const neighbors = getNeighbors(curr.c, curr.r);
    for (const n of neighbors) {
      if (!visited[n.c][n.r] && grid[n.c][n.r] === teamId) {
        visited[n.c][n.r] = true;
        queue.push(n);
      }
    }
  }
  
  return false;
}

function showWinner(teamName) {
  const winnerModal = document.getElementById('winner-modal');
  document.getElementById('winner-text').innerText = teamName;
  
  if (teamName.includes('الأحمر')) {
    document.getElementById('winner-text').style.color = 'var(--team-red)';
  } else {
    document.getElementById('winner-text').style.color = 'var(--team-blue)';
  }

  winnerModal.classList.add('active');
  
  // Confetti Animation
  if (typeof confetti === 'function') {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1001 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }
}

document.getElementById('restart-game-btn').addEventListener('click', () => {
  document.getElementById('winner-modal').classList.remove('active');
  // Reset grid
  for (let c = 0; c < BOARD_COLS; c++) {
    for (let r = 0; r < BOARD_ROWS; r++) {
      grid[c][r] = 0;
    }
  }
  // Remove classes
  document.querySelectorAll('.hex-cell').forEach(cell => {
    cell.classList.remove('owned-red', 'owned-blue');
  });
});
