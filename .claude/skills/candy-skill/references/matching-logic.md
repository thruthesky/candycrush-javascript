# 🔄 매칭 로직 확장 및 특수 캔디 구현 가이드

## 핵심 개념

기존 game.js의 매칭 로직을 확장하여 특수 캔디 시스템, 모바일 터치 지원,
레벨/게임오버 시스템을 추가한다. 기존 함수(`findMatches`, `processMatches`,
`swapAndCheck` 등)를 수정/확장하는 방식으로 구현한다.

## 특수 캔디 시스템

### 특수 캔디 정의

```javascript
// game.js 상단에 추가
const SPECIAL_CANDIES = {
  STRIPED: '💥',    // 4매치 → 한 줄 전체 제거
  BOMB: '💣',       // L/T매치 → 3×3 영역 제거
  COLOR_BOMB: '🌈'  // 5매치 → 같은 종류 캔디 모두 제거
};
```

### 특수 캔디 생성 판정

기존 `processMatches()` 함수 내에서 매치 제거 전에 호출한다.

```javascript
/**
 * 매치 패턴에 따라 특수 캔디 생성 여부 판정
 * @param {Array} matches - findMatches()가 반환한 매치 배열
 * @returns {Array<{row, col, type: string}>} 생성할 특수 캔디 목록
 *
 * 기존 findMatches() 반환 형식:
 *   [{cells: [{row, col}, ...], direction: 'horizontal'|'vertical', length: N}, ...]
 *
 * 주의: findMatches()가 현재 direction/length를 반환하지 않으면,
 *       findMatches()를 먼저 수정하여 이 정보를 포함하도록 해야 한다.
 */
function determineSpecialCandies(matches) {
  const specials = [];

  for (const match of matches) {
    if (match.length >= 5) {
      // 5매치 → 컬러 폭탄: 매치 중앙에 생성
      const mid = Math.floor(match.cells.length / 2);
      specials.push({
        row: match.cells[mid].row,
        col: match.cells[mid].col,
        type: 'COLOR_BOMB'
      });
    } else if (match.length === 4) {
      // 4매치 → 줄무늬 캔디
      const mid = Math.floor(match.cells.length / 2);
      specials.push({
        row: match.cells[mid].row,
        col: match.cells[mid].col,
        type: 'STRIPED'
      });
    }
  }

  // L/T 매치 탐지: 가로+세로 매치가 교차점을 공유하는 경우
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      if (matches[i].direction !== matches[j].direction) {
        const inter = findIntersection(matches[i].cells, matches[j].cells);
        if (inter) {
          specials.push({ row: inter.row, col: inter.col, type: 'BOMB' });
        }
      }
    }
  }

  return specials;
}

function findIntersection(cells1, cells2) {
  for (const c1 of cells1) {
    for (const c2 of cells2) {
      if (c1.row === c2.row && c1.col === c2.col) return c1;
    }
  }
  return null;
}
```

### 특수 캔디 활성화

매치에 특수 캔디가 포함되었을 때 추가 제거 영역을 결정한다.

```javascript
/**
 * 특수 캔디 활성화 시 추가로 제거할 셀 반환
 * @param {number} row
 * @param {number} col
 * @param {string} candyEmoji - 특수 캔디 이모지 (💥, 💣, 🌈)
 * @returns {Set<string>} 추가 제거할 셀 키 set ("row,col")
 */
function activateSpecialCandy(row, col, candyEmoji) {
  const extra = new Set();

  switch (candyEmoji) {
    case '💥': // 줄무늬 → 가로 또는 세로 한 줄 전체
      if (Math.random() > 0.5) {
        for (let c = 0; c < BOARD_SIZE; c++) extra.add(`${row},${c}`);
      } else {
        for (let r = 0; r < BOARD_SIZE; r++) extra.add(`${r},${col}`);
      }
      audioManager.play('explosion');
      break;

    case '💣': // 폭탄 → 3×3 영역
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            extra.add(`${r},${c}`);
          }
        }
      }
      audioManager.play('explosion');
      break;

    case '🌈': // 컬러 폭탄 → 보드에서 랜덤 캔디 종류 하나 전부 제거
      const target = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c] && board[r][c].emoji === target.emoji) {
            extra.add(`${r},${c}`);
          }
        }
      }
      audioManager.play('explosion');
      break;
  }

  return extra;
}
```

### processMatches() 수정

기존 `processMatches()` 함수를 확장하여 특수 캔디를 지원한다.

```javascript
/**
 * processMatches() 확장 버전
 * 기존 연쇄 루프에 특수 캔디 생성/활성화 + 콤보 배율 추가
 */
async function processMatches() {
  let matches = findMatches();
  let comboCount = 0;

  while (matches.length > 0) {
    comboCount++;

    // 1. 특수 캔디 생성 판정
    const specials = determineSpecialCandies(matches);

    // 2. 매치된 셀 + 특수 캔디 활성화 영역 수집
    const toRemove = new Set();
    for (const match of matches) {
      for (const cell of match.cells) {
        toRemove.add(`${cell.row},${cell.col}`);

        // 특수 캔디가 매치에 포함되면 활성화
        const candy = board[cell.row][cell.col];
        if (candy && Object.values(SPECIAL_CANDIES).includes(candy.emoji || candy)) {
          const extra = activateSpecialCandy(cell.row, cell.col, candy.emoji || candy);
          extra.forEach(k => toRemove.add(k));
        }
      }
    }

    // 3. 점수 계산 (콤보 배율 적용)
    const basePoints = toRemove.size * 10;
    const comboMultiplier = comboCount > 1 ? comboCount * 1.5 : 1;
    score += Math.floor(basePoints * comboMultiplier);
    scoreEl.textContent = score;

    // 4. 효과음
    if (comboCount === 1) {
      audioManager.play('match');
    } else {
      audioManager.play('combo', comboCount);
    }

    // 5. 매치 애니메이션 (기존 matched 클래스 사용)
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (cell) cell.classList.add('matched');
    }
    await delay(400);

    // 6. 특수 캔디 배치
    for (const sp of specials) {
      board[sp.row][sp.col] = { name: 'special', emoji: SPECIAL_CANDIES[sp.type] };
      audioManager.play('special');
    }

    // 7. 매치된 셀 제거 (특수 캔디 위치 제외)
    for (const key of toRemove) {
      const [r, c] = key.split(',').map(Number);
      const isSpecialPos = specials.some(s => s.row === r && s.col === c);
      if (!isSpecialPos) board[r][c] = null;
    }

    // 8. 낙하 + 새 캔디 채우기 + 재렌더링
    dropCandies();
    fillEmptyCells();
    renderBoard();

    await delay(300);

    // 9. 재매치 탐지
    matches = findMatches();
  }

  if (comboCount > 1) {
    audioManager.play('comboEnd');
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### findMatches() 수정

기존 `findMatches()`가 direction과 length 정보를 반환하도록 수정한다.

```javascript
/**
 * findMatches() 확장 버전
 * 기존 반환값에 direction, length 속성 추가
 * @returns {Array<{cells: Array<{row, col}>, direction: string, length: number}>}
 */
function findMatches() {
  const matches = [];

  // 가로 스캔
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const candy = board[row][col];
      if (!candy) continue;

      let len = 1;
      while (col + len < BOARD_SIZE &&
             board[row][col + len] &&
             board[row][col + len].name === candy.name) {
        len++;
      }

      if (len >= 3) {
        const cells = [];
        for (let i = 0; i < len; i++) {
          cells.push({ row, col: col + i });
        }
        matches.push({ cells, direction: 'horizontal', length: len });
        col += len - 1;
      }
    }
  }

  // 세로 스캔
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      const candy = board[row][col];
      if (!candy) continue;

      let len = 1;
      while (row + len < BOARD_SIZE &&
             board[row + len][col] &&
             board[row + len][col].name === candy.name) {
        len++;
      }

      if (len >= 3) {
        const cells = [];
        for (let i = 0; i < len; i++) {
          cells.push({ row: row + i, col });
        }
        matches.push({ cells, direction: 'vertical', length: len });
        row += len - 1;
      }
    }
  }

  return matches;
}
```

## 모바일 터치 지원

### 핵심 로직: 스와이프 감지

기존 클릭 이벤트에 터치 이벤트를 추가한다. `renderBoard()` 에서 셀 생성 시
터치 이벤트를 바인딩한다.

```javascript
// 전역 변수
let touchStartPos = null;
let touchStartCell = null;

/**
 * renderBoard() 내 셀 생성 시 터치 이벤트 추가
 * 기존 cell.addEventListener('click', ...) 아래에 추가
 */
cell.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartPos = { x: touch.clientX, y: touch.clientY };
  touchStartCell = { row, col };
}, { passive: true });

cell.addEventListener('touchend', (e) => {
  if (!touchStartPos || !touchStartCell) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartPos.x;
  const dy = touch.clientY - touchStartPos.y;

  // 최소 30px 이동해야 스와이프로 인식
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
    touchStartPos = null;
    touchStartCell = null;
    return; // 탭 → click 이벤트가 처리
  }

  const { row: r, col: c } = touchStartCell;
  let targetRow = r, targetCol = c;

  // 스와이프 방향 결정 (가로/세로 중 더 큰 쪽)
  if (Math.abs(dx) > Math.abs(dy)) {
    targetCol += dx > 0 ? 1 : -1;
  } else {
    targetRow += dy > 0 ? 1 : -1;
  }

  // 범위 체크 후 스왑 실행
  if (targetRow >= 0 && targetRow < BOARD_SIZE &&
      targetCol >= 0 && targetCol < BOARD_SIZE) {
    swapAndCheck(r, c, targetRow, targetCol);
  }

  touchStartPos = null;
  touchStartCell = null;
}, { passive: true });
```

## 게임오버 및 레벨 시스템

### 이동 횟수 제한

```javascript
// 전역 변수 추가
let moveCount = 30;       // 남은 이동 횟수
let level = 1;            // 현재 레벨
const TARGET_SCORE = 1000; // 레벨당 목표 점수

/**
 * swapAndCheck() 내에서 유효한 스왑 후 호출
 */
function onValidMove() {
  moveCount--;
  updateMoveDisplay();

  // 레벨 클리어 체크
  if (score >= TARGET_SCORE * level) {
    level++;
    moveCount = 30;
    audioManager.play('levelUp');
    updateLevelDisplay();
  }

  // 게임오버 체크
  if (moveCount <= 0) {
    audioManager.play('gameOver');
    showGameOver();
  }
}
```

### HTML 추가 (index.html 수정)

```html
<!-- .score-board 내부에 추가 -->
<span>이동: <strong id="moves">30</strong></span>
<span>레벨: <strong id="level">1</strong></span>
```

### 게임오버 오버레이

```html
<!-- .container 내부 끝에 추가 -->
<div id="game-over" class="game-over-overlay" style="display:none;">
  <div class="game-over-content">
    <h2>🎉 게임 오버!</h2>
    <p>최종 점수: <span id="final-score">0</span></p>
    <button onclick="initGame()" class="restart-btn">🔄 다시 시작</button>
  </div>
</div>
```

```css
/* style.css에 추가 */
.game-over-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 50;
  animation: fade-in 0.5s ease;
}
@keyframes fade-in {
  from { opacity: 0; } to { opacity: 1; }
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
```

## 유효 이동 체크 및 보드 셔플

가능한 이동이 없으면 보드를 자동으로 섞는다.

```javascript
/**
 * 보드에 가능한 이동이 있는지 확인
 */
function hasValidMoves() {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      // 오른쪽과 스왑
      if (c < BOARD_SIZE - 1) {
        swap(r, c, r, c + 1);
        if (findMatches().length > 0) { swap(r, c, r, c + 1); return true; }
        swap(r, c, r, c + 1);
      }
      // 아래와 스왑
      if (r < BOARD_SIZE - 1) {
        swap(r, c, r + 1, c);
        if (findMatches().length > 0) { swap(r, c, r + 1, c); return true; }
        swap(r, c, r + 1, c);
      }
    }
  }
  return false;
}

/** 배열에서 두 셀의 캔디만 교환 (DOM 무관) */
function swap(r1, c1, r2, c2) {
  const temp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = temp;
}

/**
 * processMatches() 루프 종료 후 호출
 * 유효 이동 없으면 보드 셔플
 */
function checkAndShuffle() {
  if (!hasValidMoves()) {
    shuffleBoard();
    audioManager.play('shuffle');
    renderBoard();
  }
}

function shuffleBoard() {
  const all = [];
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      all.push(board[r][c]);

  // Fisher-Yates 셔플
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  let idx = 0;
  for (let r = 0; r < BOARD_SIZE; r++)
    for (let c = 0; c < BOARD_SIZE; c++)
      board[r][c] = all[idx++];
}
```

## 특수 캔디 CSS 스타일

```css
/* style.css에 추가 — 특수 캔디 배경 */
.candy-special {
  background: linear-gradient(135deg, #FFD700, #FFA500) !important;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); }
  50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.9); }
}
```
