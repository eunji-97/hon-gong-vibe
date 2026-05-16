// 점수 계산 로직
class ScoreManager {
    calculateScore(isCorrect, timeSpent, consecutiveCorrect, hintUsed) {
        let score = 0;
        if (isCorrect) {
            score += 10; // 기본 점수
            if (timeSpent < 10) score += 3; // 시간 보너스
            if (!hintUsed) score += 2; // 노힌트 보너스
            score += this.getConsecutiveBonus(consecutiveCorrect);
        }
        return score;
    }

    getConsecutiveBonus(consecutive) {
        if (consecutive >= 10) return 5;
        if (consecutive >= 5) return 3;
        if (consecutive >= 3) return 1;
        return 0;
    }
}

// 게임 모드 설정
const gameModes = {
    full: { questions: 40, timeLimit: null },
    category: { questions: 10, timeLimit: null },
    speed: { questions: 20, timeLimit: 15 } // 문제당 15초
};

// 게임 상태 관리
let gameState = {
    currentMode: 'full',
    selectedCategory: null,
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    consecutiveCorrect: 0,
    maxStreak: 0,
    hintsRemaining: 3,
    hintUsedForCurrent: false,
    timer: 0,
    timerInterval: null,
    isPaused: false,
    startTime: null,
    totalResponseTime: 0,
    questions: [],
    answers: [],
    categoryStats: {},
    isAnswered: false
};

const scoreManager = new ScoreManager();

// DOM 요소들
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const feedbackModal = document.getElementById('feedbackModal');
const pauseModal = document.getElementById('pauseModal');

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const hintBtn = document.getElementById('hintBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

const modeButtons = document.querySelectorAll('.mode-btn');
const categorySelection = document.getElementById('categorySelection');
const catButtons = document.querySelectorAll('.cat-btn');

// 모드 선택 이벤트
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.currentMode = btn.dataset.mode;

        if (gameState.currentMode === 'category') {
            categorySelection.classList.remove('hidden');
        } else {
            categorySelection.classList.add('hidden');
            gameState.selectedCategory = null;
            catButtons.forEach(b => b.classList.remove('active'));
        }
    });
});

// 카테고리 선택 이벤트
catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.selectedCategory = btn.dataset.category;
    });
});

// 게임 초기화
function initGame() {
    const mode = gameModes[gameState.currentMode];
    let selectedQuestions = [];

    if (gameState.currentMode === 'category') {
        if (!gameState.selectedCategory) {
            alert('카테고리를 선택해주세요!');
            return;
        }
        selectedQuestions = quizQuestions
            .filter(q => q.category === gameState.selectedCategory)
            .sort(() => 0.5 - Math.random())
            .slice(0, mode.questions);
    } else {
        selectedQuestions = quizQuestions
            .sort(() => 0.5 - Math.random())
            .slice(0, mode.questions);
    }

    gameState = {
        ...gameState,
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        consecutiveCorrect: 0,
        maxStreak: 0,
        hintsRemaining: 3,
        hintUsedForCurrent: false,
        totalResponseTime: 0,
        questions: selectedQuestions,
        answers: [],
        categoryStats: {},
        isAnswered: false,
        isPaused: false
    };

    // UI 초기화
    document.getElementById('hintCount').textContent = gameState.hintsRemaining;
    hintBtn.disabled = false;
    document.getElementById('comboContainer').classList.add('hidden');

    // 화면 전환
    startScreen.classList.remove('active');
    quizScreen.classList.add('active');
    resultScreen.classList.remove('active');
    feedbackModal.classList.remove('show');
    pauseModal.classList.remove('show');

    loadQuestion();
}

// 문제 로드
function loadQuestion() {
    const question = gameState.questions[gameState.currentQuestionIndex];
    gameState.hintUsedForCurrent = false;
    gameState.isAnswered = false;

    // 진행률 및 UI 업데이트
    updateProgress();
    document.getElementById('categoryBadge').textContent = question.category;
    document.getElementById('questionText').textContent = question.question;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => handleAnswer(index);
        optionsContainer.appendChild(button);
    });

    // 타이머 시작
    startTimer();
}

// 타이머 로직
function startTimer() {
    clearInterval(gameState.timerInterval);
    const modeConfig = gameModes[gameState.currentMode];
    
    if (gameState.currentMode === 'speed') {
        gameState.timer = modeConfig.timeLimit;
    } else {
        gameState.timer = 0;
    }

    gameState.startTime = Date.now();
    updateTimerUI();

    gameState.timerInterval = setInterval(() => {
        if (gameState.isPaused) return;

        if (gameState.currentMode === 'speed') {
            gameState.timer--;
            if (gameState.timer <= 0) {
                clearInterval(gameState.timerInterval);
                handleAnswer(-1); // 시간 초과
            }
        } else {
            gameState.timer++;
        }
        updateTimerUI();
    }, 1000);
}

function updateTimerUI() {
    const timerEl = document.getElementById('timer');
    timerEl.textContent = gameState.timer.toString().padStart(2, '0');
    
    if (gameState.currentMode === 'speed' && gameState.timer <= 5) {
        timerEl.parentElement.style.color = '#e53e3e';
        timerEl.parentElement.style.animation = 'bounce 0.5s infinite';
    } else {
        timerEl.parentElement.style.color = '';
        timerEl.parentElement.style.animation = '';
    }
}

// 답변 처리
function handleAnswer(selectedIndex) {
    if (gameState.isAnswered) return;
    gameState.isAnswered = true;
    clearInterval(gameState.timerInterval);

    const timeSpent = Math.floor((Date.now() - gameState.startTime) / 1000);
    gameState.totalResponseTime += timeSpent;

    const question = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswer;

    // 점수 계산
    if (isCorrect) {
        gameState.correctAnswers++;
        gameState.consecutiveCorrect++;
        gameState.maxStreak = Math.max(gameState.maxStreak, gameState.consecutiveCorrect);
        
        const gainedScore = scoreManager.calculateScore(
            true, 
            timeSpent, 
            gameState.consecutiveCorrect, 
            gameState.hintUsedForCurrent
        );
        gameState.score += gainedScore;
        
        // 콤보 UI
        if (gameState.consecutiveCorrect >= 3) {
            const comboContainer = document.getElementById('comboContainer');
            comboContainer.classList.remove('hidden');
            document.getElementById('comboCount').textContent = gameState.consecutiveCorrect;
        }
    } else {
        gameState.consecutiveCorrect = 0;
        document.getElementById('comboContainer').classList.add('hidden');
    }

    // 카테고리 통계
    if (!gameState.categoryStats[question.category]) {
        gameState.categoryStats[question.category] = { correct: 0, total: 0 };
    }
    gameState.categoryStats[question.category].total++;
    if (isCorrect) gameState.categoryStats[question.category].correct++;

    // UI 피드백
    showAnswerFeedback(selectedIndex, question.correctAnswer, isCorrect);

    setTimeout(() => {
        showFeedback(isCorrect, question.explanation, selectedIndex === -1);
    }, 1000);
}

function showAnswerFeedback(selectedIndex, correctIndex, isCorrect) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.add('disabled'));

    if (selectedIndex !== -1) {
        if (isCorrect) {
            buttons[selectedIndex].classList.add('correct');
        } else {
            buttons[selectedIndex].classList.add('incorrect');
            buttons[correctIndex].classList.add('correct');
        }
    } else {
        // 시간 초과
        buttons[correctIndex].classList.add('correct');
    }
}

function showFeedback(isCorrect, explanation, isTimeout) {
    const feedbackIcon = document.getElementById('feedbackIcon');
    const feedbackTitle = document.getElementById('feedbackTitle');
    const feedbackExplanation = document.getElementById('feedbackExplanation');

    feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
    
    if (isTimeout) {
        feedbackTitle.textContent = '시간 초과!';
    } else {
        feedbackTitle.textContent = isCorrect ? '정답입니다!' : '틀렸습니다';
    }
    
    feedbackExplanation.textContent = explanation;
    feedbackModal.classList.add('show');
}

// 힌트 시스템
function useHint() {
    if (gameState.hintsRemaining <= 0 || gameState.isAnswered || gameState.hintUsedForCurrent) return;

    gameState.hintsRemaining--;
    gameState.hintUsedForCurrent = true;
    document.getElementById('hintCount').textContent = gameState.hintsRemaining;
    
    if (gameState.hintsRemaining === 0) {
        hintBtn.disabled = true;
    }

    const question = gameState.questions[gameState.currentQuestionIndex];
    const buttons = document.querySelectorAll('.option-btn');
    
    // 오답 중 2개 제거
    let wrongIndices = [];
    question.options.forEach((_, index) => {
        if (index !== question.correctAnswer) wrongIndices.push(index);
    });

    // 무작위로 2개 섞어서 제거
    wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2).forEach(idx => {
        buttons[idx].style.opacity = '0.3';
        buttons[idx].disabled = true;
        buttons[idx].classList.add('disabled');
    });
}

// 일시정지 기능
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
        pauseModal.classList.add('show');
    } else {
        pauseModal.classList.remove('show');
    }
}

// 다음 문제 이동
function nextQuestion() {
    feedbackModal.classList.remove('show');
    gameState.currentQuestionIndex++;

    if (gameState.currentQuestionIndex < gameState.questions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// 게임 종료 및 결과
function endGame() {
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');
    displayResults();
}

function displayResults() {
    const totalQuestions = gameState.questions.length;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('correctCount').textContent = `${gameState.correctAnswers} / ${totalQuestions}`;
    
    const accuracy = Math.round((gameState.correctAnswers / totalQuestions) * 100) || 0;
    document.getElementById('accuracyRate').textContent = `${accuracy}%`;

    const avgTime = (gameState.totalResponseTime / totalQuestions).toFixed(1);
    document.getElementById('avgTime').textContent = `${avgTime}초`;
    document.getElementById('maxStreak').textContent = `${gameState.maxStreak}회`;

    const categoryResults = document.getElementById('categoryResults');
    categoryResults.innerHTML = '';

    for (const [category, stats] of Object.entries(gameState.categoryStats)) {
        const div = document.createElement('div');
        div.className = 'category-result';
        div.innerHTML = `
            <span class="category-name">${category}</span>
            <span class="category-score">${stats.correct} / ${stats.total}</span>
        `;
        categoryResults.appendChild(div);
    }
}

// 진행률 업데이트
function updateProgress() {
    const current = gameState.currentQuestionIndex + 1;
    const total = gameState.questions.length;

    document.getElementById('currentQuestion').textContent = current;
    document.getElementById('totalQuestions').textContent = total;
    document.getElementById('currentScore').textContent = gameState.score;

    const progressPercent = (current / total) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
}

// 이벤트 리스너
startBtn.addEventListener('click', initGame);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
});

hintBtn.addEventListener('click', useHint);
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (quizScreen.classList.contains('active') && !gameState.isAnswered && !gameState.isPaused) {
        if (e.key >= '1' && e.key <= '4') {
            handleAnswer(parseInt(e.key) - 1);
        } else if (e.key === 'h' || e.key === 'H') {
            useHint();
        } else if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
    } else if (feedbackModal.classList.contains('show') && e.key === 'Enter') {
        nextQuestion();
    } else if (pauseModal.classList.contains('show') && e.key === 'Escape') {
        togglePause();
    }
});

