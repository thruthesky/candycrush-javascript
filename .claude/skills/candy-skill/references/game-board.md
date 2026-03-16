# 🎮 게임 보드 및 캔디 시스템

## 핵심 개념

캔디크러시 게임 보드는 8×8 그리드로 구성된다. 각 셀에는 6종 이모지 캔디 중 하나가 배치된다.
게임 상태는 JavaScript 2차원 배열로 관리하고, DOM은 CSS Grid로 렌더링한다.
보드 상태 변경 시 DOM을 동기화하는 단방향 데이터 흐름을 따른다.

## 상수 및 설정

```javascript
// 게임 상수
const BOARD_SIZE = 8;           // 8×8 그리드
const CANDIES = ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'];
const SPECIAL_CANDIES = {
  STRIPED: '💥',    // 4매치 → 줄무늬 캔디 (한 줄 제거)
  BOMB: '💣',       // L/T매치 → 폭탄 캔디 (3×3 제거)
  COLOR_BOMB: '🌈'  // 5매치 → 컬러 폭탄 (같은 종류 모두 제거)
};
```

## HTML 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🍬 캔디크러시</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="game-container">
    <!-- 헤더: 점수 및 게임 정보 -->
    <header class="game-header">
      <div class="score-board">
        <div class="score-label">점수</div>
        <div class="score-value" id="score">0</div>
      </div>
      <div class="combo-display" id="combo-display"></div>
      <div class="level-info">
        <div class="level-label">레벨</div>
        <div class="level-value" id="level">1</div>
      </div>
    </header>

    <!-- 게임 보드 -->
    <div class="board" id="board"></div>

    <!-- 게임오버 오버레이 -->
    <div class="game-over-overlay" id="game-over" style="display:none;">
      <div class="game-over-content">
        <h2>🎉 게임 오버!</h2>
        <p>최종 점수: <span id="final-score">0</span></p>
        <button id="restart-btn" class="restart-btn">🔄 다시 시작</button>
      </div>
    </div>

    <!-- 음소거 버튼 -->
    <button class="mute-btn" id="mute-btn">🔊</button>
  </div>

  <script src="js/audio.js"></script>
  <script src="js/game.js"></script>
</body>
</html>
```

## CSS Grid 보드 레이아웃

```css
/* 게임 컨테이너 */
.game-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif;
  position: relative;
}

/* 게임 보드 - CSS Grid */
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  aspect-ratio: 1;
  user-select: none;
}

/* 캔디 셀 */
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease;
  position: relative;
  aspect-ratio: 1;
}

.cell:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.3);
}

/* 선택된 셀 */
.cell.selected {
  transform: scale(1.15);
  background: rgba(255, 255, 200, 0.5);
  box-shadow: 0 0 12px rgba(255, 255, 0, 0.6);
  animation: pulse 0.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 255, 0, 0.6); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 0, 0.9); }
}
```

## 헤더 스타일

```css
/* 게임 헤더 */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.score-board, .level-info {
  text-align: center;
}

.score-label, .level-label {
  font-size: 0.8rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-value, .level-value {
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* 콤보 표시 */
.combo-display {
  font-size: 1.2rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.combo-display.active {
  opacity: 1;
  animation: combo-bounce 0.5s ease;
}

@keyframes combo-bounce {
  0% { transform: scale(0.5); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* 음소거 버튼 */
.mute-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 100;
  transition: transform 0.2s ease;
}

.mute-btn:hover {
  transform: scale(1.1);
}
```

## 게임 보드 초기화 로직

### 핵심 로직: 초기 보드 생성 시 3매치 방지

보드를 랜덤으로 채울 때, 이미 가로/세로로 2개 같은 캔디가 연속된 위치에는
같은 캔디를 배치하지 않는다.

```javascript
/**
 * 게임 상태 객체
 * board: 2차원 배열 (8×8), 각 요소는 캔디 이모지 문자열
 * selectedCell: 현재 선택된 셀 {row, col} 또는 null
 * score: 현재 점수
 * combo: 현재 연쇄 횟수
 * level: 현재 레벨
 * isProcessing: 매치 처리 중 여부 (입력 차단용)
 * moveCount: 남은 이동 횟수
 */
const gameState = {
  board: [],
  selectedCell: null,
  score: 0,
  combo: 0,
  level: 1,
  isProcessing: false,
  moveCount: 30
};

/**
 * 게임 보드 초기화
 * - 8×8 2차원 배열 생성
 * - 각 셀에 랜덤 캔디 배치 (3매치 방지)
 */
function createBoard() {
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let candy;
      do {
        candy = CANDIES[Math.floor(Math.random() * CANDIES.length)];
      } while (wouldCreateMatch(board, row, col, candy));
      board[row][col] = candy;
    }
  }
  return board;
}

/**
 * 3매치 방지 체크
 * 해당 위치에 캔디를 놓으면 가로/세로 3매치가 되는지 검사
 */
function wouldCreateMatch(board, row, col, candy) {
  // 가로 체크: 왼쪽으로 2개 같은 캔디가 있는지
  if (col >= 2 &&
      board[row][col - 1] === candy &&
      board[row][col - 2] === candy) {
    return true;
  }
  // 세로 체크: 위로 2개 같은 캔디가 있는지
  if (row >= 2 &&
      board[row - 1][col] === candy &&
      board[row - 2][col] === candy) {
    return true;
  }
  return false;
}
```

## DOM 렌더링

```javascript
/**
 * 보드를 DOM에 렌더링
 * - 기존 셀 제거 후 새로 생성
 * - 각 셀에 클릭/터치 이벤트 바인딩
 */
function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.textContent = gameState.board[row][col];

      // 클릭 이벤트
      cell.addEventListener('click', () => onCellClick(row, col));

      // 터치 이벤트 (모바일)
      cell.addEventListener('touchstart', handleTouchStart, { passive: true });
      cell.addEventListener('touchend', handleTouchEnd, { passive: true });

      boardEl.appendChild(cell);
    }
  }
}

/**
 * 특정 셀의 DOM 요소를 가져오기
 */
function getCellElement(row, col) {
  return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

/**
 * 보드 상태를 DOM에 동기화 (전체 리렌더 없이 개별 셀 업데이트)
 */
function syncBoardToDOM() {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = getCellElement(row, col);
      if (cell) {
        cell.textContent = gameState.board[row][col];
      }
    }
  }
}
```

## 셀 클릭 처리

```javascript
/**
 * 셀 클릭 핸들러
 * - 첫 번째 클릭: 셀 선택 (하이라이트)
 * - 두 번째 클릭: 인접 셀이면 스왑 시도, 아니면 선택 변경
 */
function onCellClick(row, col) {
  // 처리 중이면 무시
  if (gameState.isProcessing) return;

  const { selectedCell } = gameState;

  if (!selectedCell) {
    // 첫 번째 선택
    selectCell(row, col);
  } else if (selectedCell.row === row && selectedCell.col === col) {
    // 같은 셀 다시 클릭 → 선택 해제
    deselectCell();
  } else if (isAdjacent(selectedCell, { row, col })) {
    // 인접 셀 → 스왑 시도
    attemptSwap(selectedCell, { row, col });
  } else {
    // 인접하지 않은 셀 → 선택 변경
    deselectCell();
    selectCell(row, col);
  }
}

/**
 * 셀 선택 (하이라이트 표시)
 */
function selectCell(row, col) {
  gameState.selectedCell = { row, col };
  const cell = getCellElement(row, col);
  if (cell) cell.classList.add('selected');
  audioManager.play('select');
}

/**
 * 셀 선택 해제
 */
function deselectCell() {
  if (gameState.selectedCell) {
    const { row, col } = gameState.selectedCell;
    const cell = getCellElement(row, col);
    if (cell) cell.classList.remove('selected');
    gameState.selectedCell = null;
  }
}

/**
 * 두 셀이 인접한지 확인 (상하좌우만, 대각선 불가)
 */
function isAdjacent(cell1, cell2) {
  const rowDiff = Math.abs(cell1.row - cell2.row);
  const colDiff = Math.abs(cell1.col - cell2.col);
  return (rowDiff + colDiff) === 1;
}
```

## 터치 이벤트 처리 (모바일)

```javascript
let touchStartPos = null;

function handleTouchStart(e) {
  const touch = e.touches[0];
  touchStartPos = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd(e) {
  if (!touchStartPos) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartPos.x;
  const dy = touch.clientY - touchStartPos.y;

  // 스와이프 감지 (최소 30px 이동)
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
    touchStartPos = null;
    return; // 탭으로 처리 (click 이벤트가 처리)
  }

  const cell = e.target.closest('.cell');
  if (!cell) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  let targetRow = row;
  let targetCol = col;

  // 스와이프 방향 결정
  if (Math.abs(dx) > Math.abs(dy)) {
    targetCol += dx > 0 ? 1 : -1;
  } else {
    targetRow += dy > 0 ? 1 : -1;
  }

  // 범위 체크
  if (targetRow >= 0 && targetRow < BOARD_SIZE &&
      targetCol >= 0 && targetCol < BOARD_SIZE) {
    attemptSwap({ row, col }, { row: targetRow, col: targetCol });
  }

  touchStartPos = null;
}
```

## 게임 초기화 (진입점)

```javascript
/**
 * 게임 시작
 */
function initGame() {
  gameState.board = createBoard();
  gameState.score = 0;
  gameState.combo = 0;
  gameState.level = 1;
  gameState.moveCount = 30;
  gameState.selectedCell = null;
  gameState.isProcessing = false;

  renderBoard();
  updateScoreDisplay();

  // 게임오버 오버레이 숨기기
  document.getElementById('game-over').style.display = 'none';

  // 재시작 버튼 이벤트
  document.getElementById('restart-btn').addEventListener('click', initGame);

  // 음소거 버튼 이벤트
  document.getElementById('mute-btn').addEventListener('click', () => {
    audioManager.toggleMute();
    document.getElementById('mute-btn').textContent =
      audioManager.isMuted ? '🔇' : '🔊';
  });
}

/**
 * 점수 표시 업데이트
 */
function updateScoreDisplay() {
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('level').textContent = gameState.level;
}

// 페이지 로드 시 게임 시작
document.addEventListener('DOMContentLoaded', initGame);
```

## 게임오버 처리

```css
/* 게임오버 오버레이 */
.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 50;
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.game-over-content {
  text-align: center;
  color: white;
  animation: slide-up 0.5s ease;
}

@keyframes slide-up {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.restart-btn {
  margin-top: 16px;
  padding: 12px 32px;
  font-size: 1.2rem;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.restart-btn:hover {
  transform: scale(1.05);
}
```

```javascript
/**
 * 게임오버 체크 및 표시
 */
function checkGameOver() {
  if (gameState.moveCount <= 0) {
    gameState.isProcessing = true;
    document.getElementById('game-over').style.display = 'flex';
    document.getElementById('final-score').textContent = gameState.score;
    audioManager.play('gameOver');
  }
}
```
