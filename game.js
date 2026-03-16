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
