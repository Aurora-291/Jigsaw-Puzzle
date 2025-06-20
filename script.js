let pieces = [];
let gameStarted = false;
let timer;
let seconds = 0;
let moves = 0;
let showNumbers = false;
let draggedPiece = null;
let powerUps = {
    freezeTime: 3,
    autoSolve: 1,
    showHint: 3
};
document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('shuffleGame').addEventListener('click', shufflePieces);
document.getElementById('showNumbers').addEventListener('click', toggleNumbers);
document.getElementById('uploadImage').addEventListener('click', () => document.getElementById('imageUpload').click());
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('freezeTime').addEventListener('click', useFreezeTime);
document.getElementById('autoSolve').addEventListener('click', useAutoSolve);
document.getElementById('showHint').addEventListener('click', useShowHint);
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
        document.getElementById('freezeTime').disabled = false;
        document.getElementById('autoSolve').disabled = false;
        document.getElementById('showHint').disabled = false;
    } else {
        gameStarted = false;
        clearInterval(timer);
        startButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        document.getElementById('shuffleGame').disabled = true;
        document.getElementById('showNumbers').disabled = true;
        document.getElementById('freezeTime').disabled = true;
        document.getElementById('autoSolve').disabled = true;
        document.getElementById('showHint').disabled = true;
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
    piece.addEventListener('dragenter', handleDragEnter);
    piece.addEventListener('dragleave', handleDragLeave);
    
    piece.addEventListener('touchstart', handleTouchStart, { passive: false });
    piece.addEventListener('touchmove', handleTouchMove, { passive: false });
    piece.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleDragStart(e) {
    if (!gameStarted) return;
    this.classList.add('dragging');
    draggedPiece = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedPiece = null;
    document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('drop-zone'));
    checkWin();
}
function handleDragEnter(e) {
    if (draggedPiece && draggedPiece !== this) {
        this.classList.add('drop-zone');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drop-zone');
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
    
    this.classList.remove('drop-zone');
    
    if (draggedPiece && draggedPiece !== this) {
        swapPieces(draggedPiece, this);
        moves++;
        movesDisplay.textContent = moves;
        
        this.classList.add('celebration');
        setTimeout(() => this.classList.remove('celebration'), 600);
        
        checkWin();
    }
}


let touchStartPos = { x: 0, y: 0 };
let touchPiece = null;

function handleTouchStart(e) {
    if (!gameStarted) return;
    e.preventDefault();
    
    touchPiece = this;
    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    
    this.classList.add('dragging');
    this.style.zIndex = '1000';
}

function handleTouchMove(e) {
    if (!touchPiece || !gameStarted) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    
    touchPiece.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1)`;
    
    
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll('.hover-effect').forEach(el => el.classList.remove('hover-effect'));
    
    if (elementBelow && elementBelow.classList.contains('puzzle-piece') && elementBelow !== touchPiece) {
        elementBelow.classList.add('hover-effect');
    }
}

function handleTouchEnd(e) {
    if (!touchPiece || !gameStarted) return;
    e.preventDefault();
    
    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    touchPiece.style.transform = '';
    touchPiece.style.zIndex = '';
    touchPiece.classList.remove('dragging');
    
    document.querySelectorAll('.hover-effect').forEach(el => el.classList.remove('hover-effect'));
    
    if (elementBelow && elementBelow.classList.contains('puzzle-piece') && elementBelow !== touchPiece) {
        swapPieces(touchPiece, elementBelow);
        moves++;
        movesDisplay.textContent = moves;
        
        elementBelow.classList.add('celebration');
        setTimeout(() => elementBelow.classList.remove('celebration'), 600);
        
        checkWin();
    }
    
    touchPiece = null;
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
        document.querySelectorAll('.puzzle-piece').forEach(piece => {
            piece.classList.add('pulse');
        });
        setTimeout(() => {
            alert(`Congratulations! You solved it in ${moves} moves and ${timeDisplay.textContent}!`);
        }, 1000);
    }
}

function toggleNumbers() {
    if (!gameStarted) return;
    showNumbers = !showNumbers;
    pieces.forEach((piece, index) => {
        piece.innerHTML = showNumbers ? `<span>${index + 1}</span>` : '';
    });
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

window.addEventListener('load', () => {
    const defaultImage = new Image();
    defaultImage.onload = function() {
        previewImage.src = defaultImage.src;
        initGame();
    };
    defaultImage.src = 'https://picsum.photos/400/400';
});


function useFreezeTime() {
    if (powerUps.freezeTime <= 0 || !gameStarted) return;
    
    powerUps.freezeTime--;
    document.getElementById('freezeTime').setAttribute('data-count', powerUps.freezeTime);
    
    clearInterval(timer);
    setTimeout(() => {
        if (gameStarted) startTimer();
    }, 10000);
    
    
    document.getElementById('freezeTime').classList.add('celebration');
    setTimeout(() => document.getElementById('freezeTime').classList.remove('celebration'), 600);
}

function useAutoSolve() {
    if (powerUps.autoSolve <= 0 || !gameStarted) return;
    
    powerUps.autoSolve--;
    document.getElementById('autoSolve').setAttribute('data-count', powerUps.autoSolve);
    
    
    const incorrectPieces = pieces.filter(piece => !piece.classList.contains('correct'));
    if (incorrectPieces.length > 0) {
        const randomPiece = incorrectPieces[Math.floor(Math.random() * incorrectPieces.length)];
        const correctPosition = findCorrectPosition(randomPiece);
        if (correctPosition) {
            swapPieces(randomPiece, correctPosition);
            moves++;
            movesDisplay.textContent = moves;
            checkWin();
        }
    }
    
    document.getElementById('autoSolve').classList.add('celebration');
    setTimeout(() => document.getElementById('autoSolve').classList.remove('celebration'), 600);
}

function useShowHint() {
    if (powerUps.showHint <= 0 || !gameStarted) return;
    
    powerUps.showHint--;
    document.getElementById('showHint').setAttribute('data-count', powerUps.showHint);
    
    
    pieces.forEach(piece => {
        if (!piece.classList.contains('correct')) {
            piece.style.border = '3px solid #ff6b6b';
            piece.style.boxShadow = '0 0 20px #ff6b6b';
        }
    });
    
    setTimeout(() => {
        pieces.forEach(piece => {
            piece.style.border = '';
            piece.style.boxShadow = '';
        });
    }, 3000);
    
    document.getElementById('showHint').classList.add('celebration');
    setTimeout(() => document.getElementById('showHint').classList.remove('celebration'), 600);
}

function findCorrectPosition(piece) {
    const correctRow = parseInt(piece.dataset.correctRow);
    const correctCol = parseInt(piece.dataset.correctCol);
    const gridSize = Math.sqrt(pieces.length);
    
    return pieces.find(p => {
        const currentCol = Math.round(p.offsetLeft / (puzzle.offsetWidth / gridSize));
        const currentRow = Math.round(p.offsetTop / (puzzle.offsetHeight / gridSize));
        return currentRow === correctRow && currentCol === correctCol && p !== piece;
    });
}