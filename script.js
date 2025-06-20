let pieces = [];
let gameStarted = false;
let timer;
let seconds = 0;
let moves = 0;
let showNumbers = false;
let powerUpsActive = {
    freezeTime: false,
    hint: false
};

const puzzle = document.getElementById('puzzle');
const previewImage = document.getElementById('previewImage');
const progressBar = document.getElementById('progressBar');
const timeDisplay = document.getElementById('time');
const movesDisplay = document.getElementById('moves');
const themeSwitch = document.getElementById('themeSwitch');

const powerButtons = {
    freezeTime: document.getElementById('freezeTime'),
    autoSolve: document.getElementById('autoSolve'),
    showHint: document.getElementById('showHint')
};

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('shuffleGame').addEventListener('click', shufflePieces);
document.getElementById('showNumbers').addEventListener('click', toggleNumbers);
document.getElementById('freezeTime').addEventListener('click', activateFreeze);
document.getElementById('autoSolve').addEventListener('click', activateAutoSolve);
document.getElementById('showHint').addEventListener('click', activateHint);
document.getElementById('uploadImage').addEventListener('click', () => document.getElementById('imageUpload').click());
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('playAgain').addEventListener('click', resetGame);
document.getElementById('shareScore').addEventListener('click', shareScore);
themeSwitch.addEventListener('change', toggleTheme);

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
}

function startGame() {
    const startButton = document.getElementById('startGame');
    if (!gameStarted) {
        gameStarted = true;
        initGame();
        startTimer();
        startButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        document.getElementById('shuffleGame').disabled = false;
        document.getElementById('showNumbers').disabled = false;
        enablePowerButtons();
    } else {
        gameStarted = false;
        clearInterval(timer);
        startButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        document.getElementById('shuffleGame').disabled = true;
        document.getElementById('showNumbers').disabled = true;
        disablePowerButtons();
    }
}

function enablePowerButtons() {
    Object.values(powerButtons).forEach(button => {
        if (parseInt(button.dataset.count) > 0) {
            button.disabled = false;
        }
    });
}

function disablePowerButtons() {
    Object.values(powerButtons).forEach(button => {
        button.disabled = true;
    });
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
        
        if (showNumbers) {
            piece.innerHTML = `<span>${i + 1}</span>`;
        }
        
        pieces.push(piece);
        piece.draggable = true;
        addDragListeners(piece);
        puzzle.appendChild(piece);
    }
    
    shufflePieces();
    updateProgress();
}

function addDragListeners(piece) {
    piece.addEventListener('dragstart', handleDragStart);
    piece.addEventListener('dragend', handleDragEnd);
    piece.addEventListener('dragover', handleDragOver);
    piece.addEventListener('drop', handleDrop);
    piece.addEventListener('touchstart', handleTouchStart);
    piece.addEventListener('touchmove', handleTouchMove);
    piece.addEventListener('touchend', handleTouchEnd);
}

function handleDragStart(e) {
    if (!gameStarted) return;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
    this.classList.remove('dragging');
    checkWin();
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    if (!gameStarted) return;
    
    const draggingPiece = document.querySelector('.dragging');
    if (draggingPiece && draggingPiece !== this) {
        swapPieces(draggingPiece, this);
        moves++;
        movesDisplay.textContent = moves;
        checkWin();
    }
}

let touchStartX, touchStartY, touchPiece;

function handleTouchStart(e) {
    if (!gameStarted) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchPiece = this;
    this.classList.add('dragging');
}

function handleTouchMove(e) {
    if (!touchPiece) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    touchPiece.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
}

function handleTouchEnd(e) {
    if (!touchPiece) return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    
    const targetElement = document.elementFromPoint(endX, endY);
    if (targetElement && targetElement.classList.contains('puzzle-piece') && targetElement !== touchPiece) {
        swapPieces(touchPiece, targetElement);
        moves++;
        movesDisplay.textContent = moves;
    }
    
    touchPiece.style.transform = '';
    touchPiece.classList.remove('dragging');
    touchPiece = null;
    checkWin();
}

function swapPieces(piece1, piece2) {
    const rect1 = piece1.getBoundingClientRect();
    const rect2 = piece2.getBoundingClientRect();
    
    const tempLeft = piece1.style.left;
    const tempTop = piece1.style.top;
    
    piece1.style.left = piece2.style.left;
    piece1.style.top = piece2.style.top;
    piece2.style.left = tempLeft;
    piece2.style.top = tempTop;
    
    const index1 = pieces.indexOf(piece1);
    const index2 = pieces.indexOf(piece2);
    [pieces[index1], pieces[index2]] = [pieces[index2], pieces[index1]];
    
    checkCorrectPositions();
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
        swapPieces(pieces[i], pieces[j]);
    }
}

function checkCorrectPositions() {
    const gridSize = Math.sqrt(pieces.length);
    pieces.forEach(piece => {
        const currentCol = Math.round(piece.offsetLeft / (puzzle.offsetWidth / gridSize));
        const currentRow = Math.round(piece.offsetTop / (puzzle.offsetHeight / gridSize));
        
        if (currentRow === parseInt(piece.dataset.correctRow) && 
            currentCol === parseInt(piece.dataset.correctCol)) {
            piece.classList.add('correct');
        } else {
            piece.classList.remove('correct');
        }
    });
}

function updateProgress() {
    const correctPieces = document.querySelectorAll('.puzzle-piece.correct').length;
    const progress = (correctPieces / pieces.length) * 100;
    progressBar.style.width = progress + '%';
}

function checkWin() {
    const allCorrect = pieces.every(piece => piece.classList.contains('correct'));
    if (allCorrect) {
        clearInterval(timer);
        showVictoryModal();
    }
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if (!powerUpsActive.freezeTime) {
            seconds++;
            updateTimeDisplay();
        }
    }, 1000);
}

function updateTimeDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function toggleNumbers() {
    if (!gameStarted) return;
    showNumbers = !showNumbers;
    pieces.forEach((piece, index) => {
        piece.innerHTML = showNumbers ? `<span>${index + 1}</span>` : '';
    });
}

function activateFreeze() {
    if (!gameStarted) return;
    const button = powerButtons.freezeTime;
    const count = parseInt(button.dataset.count);
    if (count > 0) {
        powerUpsActive.freezeTime = true;
        button.dataset.count = count - 1;
        button.disabled = count === 1;
        
        setTimeout(() => {
            powerUpsActive.freezeTime = false;
        }, 5000);
    }
}

function activateAutoSolve() {
    if (!gameStarted) return;
    const button = powerButtons.autoSolve;
    const count = parseInt(button.dataset.count);
    if (count > 0) {
        button.dataset.count = count - 1;
        button.disabled = true;
        
        const gridSize = Math.sqrt(pieces.length);
        pieces.forEach((piece, index) => {
            const correctCol = parseInt(piece.dataset.correctCol);
            const correctRow = parseInt(piece.dataset.correctRow);
            piece.style.left = (correctCol * puzzle.offsetWidth / gridSize) + 'px';
            piece.style.top = (correctRow * puzzle.offsetHeight / gridSize) + 'px';
        });
        
        checkCorrectPositions();
        updateProgress();
        checkWin();
    }
}

function activateHint() {
    if (!gameStarted) return;
    const button = powerButtons.showHint;
    const count = parseInt(button.dataset.count);
    if (count > 0) {
        button.dataset.count = count - 1;
        button.disabled = count === 1;
        powerUpsActive.hint = true;
        
        const incorrect = pieces.find(piece => !piece.classList.contains('correct'));
        if (incorrect) {
            incorrect.style.boxShadow = '0 0 20px var(--accent)';
            setTimeout(() => {
                incorrect.style.boxShadow = '';
                powerUpsActive.hint = false;
            }, 2000);
        }
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                previewImage.src = img.src;
                if (gameStarted) {
                    initGame();
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function showVictoryModal() {
    document.getElementById('finalTime').textContent = timeDisplay.textContent;
    document.getElementById('finalMoves').textContent = moves;
    document.getElementById('victoryModal').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('victoryModal').classList.add('hidden');
    gameStarted = false;
    seconds = 0;
    updateTimeDisplay();
    document.getElementById('startGame').innerHTML = '<i class="fas fa-rocket"></i> Launch';
    Object.values(powerButtons).forEach(button => {
        button.dataset.count = button.dataset.count || 3;
        button.disabled = true;
    });
    powerButtons.autoSolve.dataset.count = 1;
    initGame();
}

function shareScore() {
    const text = `I completed the Cosmic Puzzle in ${timeDisplay.textContent} with ${moves} moves!`;
    if (navigator.share) {
        navigator.share({
            title: 'Cosmic Puzzle Score',
            text: text,
        });
    } else {
        navigator.clipboard.writeText(text);
    }
}

window.addEventListener('load', () => {
    const defaultImage = new Image();
    defaultImage.onload = function() {
        previewImage.src = defaultImage.src;
        initGame();
    };
    defaultImage.src = 'https://picsum.photos/400/400';
});