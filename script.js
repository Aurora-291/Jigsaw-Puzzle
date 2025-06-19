let pieces = [];
let gameStarted = false;
let timer;
let seconds = 0;
let moves = 0;

const puzzle = document.getElementById('puzzle');
const previewImage = document.getElementById('previewImage');
const progressBar = document.getElementById('progressBar');
const timeDisplay = document.getElementById('time');
const movesDisplay = document.getElementById('moves');

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('shuffleGame').addEventListener('click', shufflePieces);

function startGame() {
    const startButton = document.getElementById('startGame');
    if (!gameStarted) {
        gameStarted = true;
        initGame();
        startTimer();
        startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        document.getElementById('shuffleGame').disabled = false;
    } else {
        gameStarted = false;
        clearInterval(timer);
        startButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        document.getElementById('shuffleGame').disabled = true;
    }
}

function initGame() {
    const gridSize = Math.sqrt(parseInt(document.getElementById('difficulty').value));
    const totalWidth = puzzle.offsetWidth;
    const pieceWidth = totalWidth / gridSize;
    const pieceHeight = pieceWidth;
    
    pieces = [];
    puzzle.innerHTML = '';
    moves = 0;
    movesDisplay.textContent = '0';
    
    for (let i = 0; i < gridSize * gridSize; i++) {
        const piece = document.createElement('div');
        piece.className = 'puzzle-piece';
        piece.style.width = pieceWidth + 'px';
        piece.style.height = pieceHeight + 'px';
        
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        const bgWidth = puzzle.offsetWidth;
        const bgHeight = puzzle.offsetHeight;
        
        piece.style.backgroundImage = `url(${previewImage.src})`;
        piece.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
        piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
        
        piece.dataset.correctRow = row;
        piece.dataset.correctCol = col;
        
        pieces.push(piece);
        puzzle.appendChild(piece);
    }
    
    shufflePieces();
    updateProgress();
}

function shufflePieces() {
    if (!gameStarted) return;
    
    const gridSize = Math.sqrt(pieces.length);
    pieces.forEach((piece, index) => {
        const left = (index % gridSize) * (puzzle.offsetWidth / gridSize);
        const top = Math.floor(index / gridSize) * (puzzle.offsetHeight / gridSize);
        piece.style.left = left + 'px';
        piece.style.top = top + 'px';
    });
    
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tempLeft = pieces[i].style.left;
        const tempTop = pieces[i].style.top;
        pieces[i].style.left = pieces[j].style.left;
        pieces[i].style.top = pieces[j].style.top;
        pieces[j].style.left = tempLeft;
        pieces[j].style.top = tempTop;
    }
}

function updateProgress() {
    const correctPieces = document.querySelectorAll('.puzzle-piece.correct').length;
    const progress = (correctPieces / pieces.length) * 100;
    progressBar.style.width = progress + '%';
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

window.addEventListener('load', () => {
    const defaultImage = new Image();
    defaultImage.onload = function() {
        previewImage.src = defaultImage.src;
        initGame();
    };
    defaultImage.src = 'https://picsum.photos/400/400';
});