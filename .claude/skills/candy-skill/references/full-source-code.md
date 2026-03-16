# 전체 소스 코드 (완전 복원용)

이 문서는 캔디크러시 게임의 모든 소스 코드를 포함한다.
이 문서만으로 게임을 100% 동일하게 복원할 수 있다.

## 파일 1: index.html

게임의 진입점 HTML 파일이다. CSS와 JS를 로드하고, 게임 UI 구조를 정의한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>캔디 크러시</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>🍬 캔디 크러시 🍬</h1>
        <div class="score-board">
            <span>점수: <strong id="score">0</strong></span>
        </div>
        <div id="board"></div>
        <button id="reset-btn">다시 시작</button>
    </div>
    <script src="game.js"></script>
</body>
</html>
```

### HTML 구조 설명

- `lang="ko"`: 한국어 페이지
- `viewport` 메타: 모바일 대응 뷰포트 설정
- `style.css`: 루트에 위치한 CSS 파일 로드
- `.container`: 전체 게임을 감싸는 중앙 정렬 컨테이너
- `h1`: 게임 제목 (이모지 포함)
- `.score-board > #score`: 현재 점수를 표시하는 strong 요소
- `#board`: JavaScript가 8x8 캔디 셀을 동적으로 생성하는 빈 div
- `#reset-btn`: 게임 초기화 버튼
- `game.js`: 루트에 위치한 JS 파일 로드 (body 끝에 배치)

---

## 파일 2: style.css

게임의 전체 스타일링을 담당한다.

```css
/* 전체 페이지 스타일 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 컨테이너 */
.container {
    text-align: center;
}

h1 {
    color: #fff;
    font-size: 2.5rem;
    margin-bottom: 15px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* 점수판 */
.score-board {
    color: #fff;
    font-size: 1.4rem;
    margin-bottom: 15px;
}

.score-board strong {
    color: #ffd700;
    font-size: 1.6rem;
}

/* 게임 보드 */
#board {
    display: grid;
    grid-template-columns: repeat(8, 60px);
    grid-template-rows: repeat(8, 60px);
    gap: 2px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px;
    margin: 0 auto;
    width: fit-content;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 개별 캔디 셀 */
.candy {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.15s ease, opacity 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    user-select: none;
}

.candy:hover {
    transform: scale(1.1);
    z-index: 1;
}

/* 선택된 캔디 */
.candy.selected {
    transform: scale(1.15);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
    z-index: 2;
}

/* 캔디 색상별 스타일 */
.candy-red {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    box-shadow: 0 3px 8px rgba(238, 90, 36, 0.4);
}

.candy-blue {
    background: linear-gradient(135deg, #74b9ff, #0984e3);
    box-shadow: 0 3px 8px rgba(9, 132, 227, 0.4);
}

.candy-green {
    background: linear-gradient(135deg, #55efc4, #00b894);
    box-shadow: 0 3px 8px rgba(0, 184, 148, 0.4);
}

.candy-yellow {
    background: linear-gradient(135deg, #ffeaa7, #fdcb6e);
    box-shadow: 0 3px 8px rgba(253, 203, 110, 0.4);
}

.candy-purple {
    background: linear-gradient(135deg, #a29bfe, #6c5ce7);
    box-shadow: 0 3px 8px rgba(108, 92, 231, 0.4);
}

.candy-orange {
    background: linear-gradient(135deg, #fab1a0, #e17055);
    box-shadow: 0 3px 8px rgba(225, 112, 85, 0.4);
}

/* 매칭 시 사라지는 애니메이션 */
.candy.matched {
    animation: pop 0.3s ease forwards;
}

@keyframes pop {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.3);
        opacity: 0.5;
    }
    100% {
        transform: scale(0);
        opacity: 0;
    }
}

/* 떨어지는 애니메이션 */
.candy.dropping {
    animation: drop 0.3s ease;
}

@keyframes drop {
    from {
        transform: translateY(-60px);
        opacity: 0.5;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 리셋 버튼 */
#reset-btn {
    margin-top: 20px;
    padding: 12px 36px;
    font-size: 1.1rem;
    background: linear-gradient(135deg, #ffd700, #f39c12);
    color: #1a1a2e;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
}

#reset-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(243, 156, 18, 0.6);
}

#reset-btn:active {
    transform: translateY(0);
}
```

---

## 파일 3: game.js

게임의 전체 로직을 담당한다.

```javascript
// 캔디 크러시 게임 메인 로직

const BOARD_SIZE = 8;
const CANDY_TYPES = [
    { name: 'red', emoji: '🍎' },
    { name: 'blue', emoji: '💎' },
    { name: 'green', emoji: '🍀' },
    { name: 'yellow', emoji: '⭐' },
    { name: 'purple', emoji: '🍇' },
    { name: 'orange', emoji: '🍊' },
];

let board = [];
let score = 0;
let selectedCandy = null;
let isProcessing = false;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const resetBtn = document.getElementById('reset-btn');

// 게임 초기화
function initGame() {
    score = 0;
    scoreEl.textContent = '0';
    selectedCandy = null;
    isProcessing = false;
    board = [];

    // 보드 생성 (초기 매칭이 없도록)
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = getRandomCandyWithoutMatch(row, col);
        }
    }

    renderBoard();
}

// 초기 배치 시 3개 연속 매칭이 생기지 않는 캔디 선택
function getRandomCandyWithoutMatch(row, col) {
    const available = CANDY_TYPES.filter(candy => {
        // 가로 방향 확인
        if (col >= 2 &&
            board[row][col - 1] === candy &&
            board[row][col - 2] === candy) {
            return false;
        }
        // 세로 방향 확인
        if (row >= 2 &&
            board[row - 1][col] === candy &&
            board[row - 2][col] === candy) {
            return false;
        }
        return true;
    });
    return available[Math.floor(Math.random() * available.length)];
}

// 보드 렌더링
function renderBoard() {
    boardEl.innerHTML = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const candy = board[row][col];
            const cell = document.createElement('div');
            cell.classList.add('candy', `candy-${candy.name}`);
            cell.textContent = candy.emoji;
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => onCandyClick(row, col));
            boardEl.appendChild(cell);
        }
    }
}

// 특정 셀의 DOM 요소 가져오기
function getCellElement(row, col) {
    return boardEl.children[row * BOARD_SIZE + col];
}

// 캔디 클릭 처리
function onCandyClick(row, col) {
    if (isProcessing) return;

    if (selectedCandy === null) {
        // 첫 번째 캔디 선택
        selectedCandy = { row, col };
        getCellElement(row, col).classList.add('selected');
    } else {
        const prev = selectedCandy;
        getCellElement(prev.row, prev.col).classList.remove('selected');

        // 인접한 캔디인지 확인
        if (isAdjacent(prev.row, prev.col, row, col)) {
            swapAndCheck(prev.row, prev.col, row, col);
        }

        selectedCandy = null;
    }
}

// 인접 여부 확인 (상하좌우만)
function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

// 캔디 교환 후 매칭 확인
async function swapAndCheck(r1, c1, r2, c2) {
    isProcessing = true;

    // 교환
    swapCandies(r1, c1, r2, c2);
    renderBoard();

    await delay(200);

    // 매칭 확인
    const matches = findMatches();
    if (matches.length > 0) {
        // 매칭이 있으면 연쇄 처리
        await processMatches();
    } else {
        // 매칭이 없으면 되돌리기
        swapCandies(r1, c1, r2, c2);
        renderBoard();
    }

    isProcessing = false;
}

// 배열에서 캔디 교환
function swapCandies(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// 모든 매칭 찾기
function findMatches() {
    const matched = new Set();

    // 가로 매칭 확인
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE - 2; col++) {
            const candy = board[row][col];
            if (candy &&
                board[row][col + 1] === candy &&
                board[row][col + 2] === candy) {
                matched.add(`${row},${col}`);
                matched.add(`${row},${col + 1}`);
                matched.add(`${row},${col + 2}`);
            }
        }
    }

    // 세로 매칭 확인
    for (let col = 0; col < BOARD_SIZE; col++) {
        for (let row = 0; row < BOARD_SIZE - 2; row++) {
            const candy = board[row][col];
            if (candy &&
                board[row + 1][col] === candy &&
                board[row + 2][col] === candy) {
                matched.add(`${row},${col}`);
                matched.add(`${row + 1},${col}`);
                matched.add(`${row + 2},${col}`);
            }
        }
    }

    return Array.from(matched).map(pos => {
        const [r, c] = pos.split(',').map(Number);
        return { row: r, col: c };
    });
}

// 매칭 연쇄 처리
async function processMatches() {
    let matches = findMatches();

    while (matches.length > 0) {
        // 매칭된 캔디에 애니메이션 적용
        matches.forEach(({ row, col }) => {
            const cell = getCellElement(row, col);
            if (cell) cell.classList.add('matched');
        });

        // 점수 추가
        score += matches.length * 10;
        scoreEl.textContent = score;

        await delay(350);

        // 매칭된 캔디 제거
        matches.forEach(({ row, col }) => {
            board[row][col] = null;
        });

        // 캔디 떨어뜨리기
        dropCandies();

        // 빈 자리에 새 캔디 채우기
        fillEmptyCells();

        renderBoard();

        // 떨어지는 애니메이션 표시
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE; row++) {
                const cell = getCellElement(row, col);
                if (cell) cell.classList.add('dropping');
            }
        }

        await delay(350);

        // 다음 매칭 확인
        matches = findMatches();
    }
}

// 캔디 아래로 떨어뜨리기
function dropCandies() {
    for (let col = 0; col < BOARD_SIZE; col++) {
        let emptyRow = BOARD_SIZE - 1;

        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
            if (board[row][col] !== null) {
                board[emptyRow][col] = board[row][col];
                if (emptyRow !== row) {
                    board[row][col] = null;
                }
                emptyRow--;
            }
        }
    }
}

// 빈 셀에 새 캔디 채우기
function fillEmptyCells() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === null) {
                board[row][col] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
            }
        }
    }
}

// 딜레이 유틸리티
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 리셋 버튼 이벤트
resetBtn.addEventListener('click', initGame);

// 게임 시작
initGame();
```
