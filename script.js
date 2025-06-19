let gameStarted = false;
let timer;
let seconds = 0;
let moves = 0;

const puzzle = document.getElementById('puzzle');
const previewImage = document.getElementById('previewImage');
const progressBar = document.getElementById('progressBar');
const timeDisplay = document.getElementById('time');
const movesDisplay = document.getElementById('moves');
const themeSwitch = document.getElementById('themeSwitch');

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('shuffleGame').addEventListener('click', shufflePieces);
document.getElementById('showNumbers').addEventListener('click', toggleNumbers);
document.getElementById('uploadImage').addEventListener('click', () => document.getElementById('imageUpload').click());
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
themeSwitch.addEventListener('change', toggleTheme);

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById('startGame').innerHTML = '<i class="fas fa-pause"></i> Pause';
        document.getElementById('shuffleGame').disabled = false;
        document.getElementById('showNumbers').disabled = false;
        document.getElementById('freezeTime').disabled = false;
        document.getElementById('autoSolve').disabled = false;
        document.getElementById('showHint').disabled = false;
        startTimer();
    } else {
        gameStarted = false;
        clearInterval(timer);
        document.getElementById('startGame').innerHTML = '<i class="fas fa-play"></i> Resume';
        document.getElementById('shuffleGame').disabled = true;
        document.getElementById('showNumbers').disabled = true;
        document.getElementById('freezeTime').disabled = true;
        document.getElementById('autoSolve').disabled = true;
        document.getElementById('showHint').disabled = true;
    }
}

function shufflePieces() {
    if (!gameStarted) return;
    moves++;
    movesDisplay.textContent = moves;
}

function toggleNumbers() {
    if (!gameStarted) return;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        seconds++;
        updateTimeDisplay();
    }, 1000);
}

function updateTimeDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            previewImage.src = img.src;
        };
        reader.readAsDataURL(file);
    }
}

window.addEventListener('load', () => {
    const defaultImage = new Image();
    defaultImage.src = 'https://picsum.photos/400/400';
    previewImage.src = defaultImage.src;
});