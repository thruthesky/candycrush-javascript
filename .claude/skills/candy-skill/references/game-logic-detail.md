# 게임 로직 상세 설명

game.js 파일의 모든 함수에 대한 상세 설명이다.

## 데이터 구조

### 상수

```javascript
const BOARD_SIZE = 8;  // 보드 크기 (8x8 그리드)
```

### 캔디 타입 배열

```javascript
const CANDY_TYPES = [
    { name: 'red', emoji: '🍎' },
    { name: 'blue', emoji: '💎' },
    { name: 'green', emoji: '🍀' },
    { name: 'yellow', emoji: '⭐' },
    { name: 'purple', emoji: '🍇' },
    { name: 'orange', emoji: '🍊' },
];
```

각 캔디는 객체로 정의되며 두 속성을 가진다:
- `name`: CSS 클래스명에 사용되는 색상 이름 (예: `candy-red`)
- `emoji`: 화면에 표시되는 이모지 문자

### 전역 상태 변수

```javascript
let board = [];           // 8x8 2차원 배열, 각 요소는 CANDY_TYPES의 객체 참조
let score = 0;            // 현재 점수
let selectedCandy = null; // 선택된 캔디 좌표 {row, col} 또는 null
let isProcessing = false; // 매칭 처리 중 여부 (true면 클릭 무시)
```

### DOM 참조

```javascript
const boardEl = document.getElementById('board');   // 게임 보드 컨테이너
const scoreEl = document.getElementById('score');   // 점수 표시 요소
const resetBtn = document.getElementById('reset-btn'); // 리셋 버튼
```

---

## 함수 상세 설명

### 1. initGame() -- 게임 초기화

게임을 처음 상태로 리셋한다.

```javascript
function initGame() {
    score = 0;
    scoreEl.textContent = '0';
    selectedCandy = null;
    isProcessing = false;
    board = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = getRandomCandyWithoutMatch(row, col);
        }
    }

    renderBoard();
}
```

**동작 순서:**
1. 점수를 0으로 리셋
2. DOM의 점수 표시를 '0'으로 갱신
3. 선택 상태와 처리 중 플래그 초기화
4. board 배열 초기화
5. 8x8 이중 루프로 각 셀에 캔디 배치 (3매치 방지)
6. renderBoard()로 DOM 렌더링

**호출 시점:** 페이지 로드 시 1회, 리셋 버튼 클릭 시

---

### 2. getRandomCandyWithoutMatch(row, col) -- 3매치 방지 캔디 선택

초기 보드 생성 시 3개 연속 매칭이 발생하지 않는 캔디를 랜덤 선택한다.

```javascript
function getRandomCandyWithoutMatch(row, col) {
    const available = CANDY_TYPES.filter(candy => {
        if (col >= 2 &&
            board[row][col - 1] === candy &&
            board[row][col - 2] === candy) {
            return false;
        }
        if (row >= 2 &&
            board[row - 1][col] === candy &&
            board[row - 2][col] === candy) {
            return false;
        }
        return true;
    });
    return available[Math.floor(Math.random() * available.length)];
}
```

**핵심 알고리즘:**
- CANDY_TYPES 배열에서 filter로 사용 가능한 캔디만 추린다
- 가로 체크: 현재 위치 왼쪽으로 2칸이 같은 캔디 객체인지 확인 (=== 참조 비교)
- 세로 체크: 현재 위치 위로 2칸이 같은 캔디 객체인지 확인
- 보드를 왼쪽 위에서 오른쪽 아래로 순서대로 채우므로, 왼쪽과 위쪽만 검사하면 충분
- 필터링된 배열에서 랜덤 선택

**중요 포인트:** 캔디 비교는 `===` (참조 비교)를 사용한다. CANDY_TYPES 배열의 같은 객체를 참조하므로 이 비교가 동작한다.

---

### 3. renderBoard() -- 보드 DOM 렌더링

board 배열 상태를 DOM에 반영한다. 매번 전체 재생성 방식이다.

```javascript
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
```

**동작:**
1. boardEl의 innerHTML을 비워서 기존 셀 모두 제거
2. 8x8 이중 루프로 각 셀의 div 생성
3. 각 div에 `candy` 클래스와 `candy-{색상}` 클래스 추가
4. 이모지를 textContent로 설정
5. data-row, data-col 속성 설정
6. click 이벤트 리스너 바인딩 (클로저로 row, col 캡처)
7. boardEl에 appendChild

**CSS Grid와의 관계:** boardEl은 `grid-template-columns: repeat(8, 60px)`로 설정되어 있어, appendChild 순서대로 8열 그리드에 자동 배치된다.

---

### 4. getCellElement(row, col) -- 셀 DOM 요소 접근

```javascript
function getCellElement(row, col) {
    return boardEl.children[row * BOARD_SIZE + col];
}
```

boardEl.children은 렌더링 순서대로 정렬되어 있으므로, `row * 8 + col` 인덱스로 접근한다.

---

### 5. onCandyClick(row, col) -- 캔디 클릭 핸들러

```javascript
function onCandyClick(row, col) {
    if (isProcessing) return;

    if (selectedCandy === null) {
        selectedCandy = { row, col };
        getCellElement(row, col).classList.add('selected');
    } else {
        const prev = selectedCandy;
        getCellElement(prev.row, prev.col).classList.remove('selected');

        if (isAdjacent(prev.row, prev.col, row, col)) {
            swapAndCheck(prev.row, prev.col, row, col);
        }

        selectedCandy = null;
    }
}
```

**상태 머신:**
1. isProcessing이 true면 입력 무시 (매칭 처리 중)
2. selectedCandy가 null이면 (아무것도 선택 안 됨):
   - 클릭한 캔디를 selectedCandy에 저장
   - 해당 셀에 'selected' CSS 클래스 추가 (하이라이트)
3. selectedCandy가 이미 있으면 (첫 번째 캔디 선택된 상태):
   - 이전 선택 셀에서 'selected' 클래스 제거
   - 인접 여부 확인 -> 인접하면 swapAndCheck() 호출
   - selectedCandy를 null로 리셋

**주의:** 인접하지 않은 셀을 클릭하면 스왑 없이 선택만 해제된다.

---

### 6. isAdjacent(r1, c1, r2, c2) -- 인접 여부 확인

```javascript
function isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}
```

맨해튼 거리가 1인지 확인한다. 상하좌우만 인접으로 판단하고 대각선은 불가하다.

---

### 7. swapAndCheck(r1, c1, r2, c2) -- 교환 후 매칭 확인 (async)

```javascript
async function swapAndCheck(r1, c1, r2, c2) {
    isProcessing = true;

    swapCandies(r1, c1, r2, c2);
    renderBoard();

    await delay(200);

    const matches = findMatches();
    if (matches.length > 0) {
        await processMatches();
    } else {
        swapCandies(r1, c1, r2, c2);
        renderBoard();
    }

    isProcessing = false;
}
```

**실행 흐름:**
1. isProcessing = true로 입력 차단
2. board 배열에서 두 캔디 교환
3. DOM 재렌더링 (교환된 상태 표시)
4. 200ms 대기 (사용자가 교환을 볼 수 있도록)
5. 매칭 확인:
   - 매칭 있음: processMatches()로 연쇄 처리
   - 매칭 없음: 다시 교환하여 되돌리기 + 재렌더링
6. isProcessing = false로 입력 허용

---

### 8. swapCandies(r1, c1, r2, c2) -- 배열 내 캔디 교환

```javascript
function swapCandies(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}
```

표준 temp 변수 스왑 패턴이다. DOM이 아닌 board 배열만 변경한다.

---

### 9. findMatches() -- 매칭 탐지

```javascript
function findMatches() {
    const matched = new Set();

    // 가로 매칭
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

    // 세로 매칭
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
```

**알고리즘:**
1. Set을 사용하여 중복 좌표 자동 제거 (같은 캔디가 가로/세로 매칭에 동시 포함될 수 있음)
2. 가로 탐색: 각 행에서 연속 3칸이 같은 캔디 참조인지 확인 (col은 0부터 BOARD_SIZE-3까지)
3. 세로 탐색: 각 열에서 연속 3칸이 같은 캔디 참조인지 확인 (row은 0부터 BOARD_SIZE-3까지)
4. `candy &&` 조건: null 체크 (제거된 캔디 위치)
5. Set의 문자열 `"row,col"`을 다시 `{row, col}` 객체 배열로 변환하여 반환

**중요:** 3개 이상 매칭도 자동 탐지된다. 예를 들어 4개 연속이면, 슬라이딩 윈도우 방식으로 `[0,1,2]`와 `[1,2,3]` 두 번 매칭되지만, Set이 중복을 제거하므로 4개 모두 포함된다.

---

### 10. processMatches() -- 연쇄 매칭 처리 (async)

```javascript
async function processMatches() {
    let matches = findMatches();

    while (matches.length > 0) {
        // 매칭 애니메이션
        matches.forEach(({ row, col }) => {
            const cell = getCellElement(row, col);
            if (cell) cell.classList.add('matched');
        });

        // 점수 추가
        score += matches.length * 10;
        scoreEl.textContent = score;

        await delay(350);

        // 매칭 캔디 제거
        matches.forEach(({ row, col }) => {
            board[row][col] = null;
        });

        // 중력 낙하
        dropCandies();

        // 빈 자리 채우기
        fillEmptyCells();

        // 재렌더링
        renderBoard();

        // 드롭 애니메이션
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE; row++) {
                const cell = getCellElement(row, col);
                if (cell) cell.classList.add('dropping');
            }
        }

        await delay(350);

        // 다음 매칭 확인 (연쇄)
        matches = findMatches();
    }
}
```

**연쇄(cascade) 루프:**
1. findMatches()로 매칭 찾기
2. while 루프: 매칭이 있는 동안 반복
3. 매칭된 셀에 'matched' CSS 클래스 추가 (pop 애니메이션 트리거)
4. 점수 계산: 매칭된 캔디 수 x 10
5. 350ms 대기 (pop 애니메이션 재생 시간)
6. board 배열에서 매칭된 캔디를 null로 설정
7. dropCandies()로 빈 칸 위의 캔디를 아래로 이동
8. fillEmptyCells()로 null인 칸에 새 랜덤 캔디 배치
9. renderBoard()로 DOM 갱신
10. 모든 셀에 'dropping' 클래스 추가 (drop 애니메이션)
11. 350ms 대기 (drop 애니메이션 재생 시간)
12. 다시 findMatches() -> 매칭 있으면 while 루프 반복 (연쇄)

---

### 11. dropCandies() -- 중력 낙하

```javascript
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
```

**알고리즘 (열 단위 처리):**
1. 각 열을 독립적으로 처리
2. emptyRow 포인터를 맨 아래(7)에서 시작
3. 아래에서 위로 스캔하며 null이 아닌 캔디를 만나면:
   - emptyRow 위치로 캔디 이동
   - 원래 위치가 다르면 null로 설정
   - emptyRow를 한 칸 위로 이동
4. 결과적으로 null이 아닌 캔디들이 열 아래쪽으로 압축되고, 위쪽은 null

**예시:**
```
열 처리 전:  [A, null, B, null, C]
emptyRow:    4 -> A를 [4]에 -> emptyRow=3 -> B를 [3]에 -> emptyRow=2 -> C를 [2]에
열 처리 후:  [null, null, C, B, A]
```

---

### 12. fillEmptyCells() -- 빈 칸 채우기

```javascript
function fillEmptyCells() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === null) {
                board[row][col] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
            }
        }
    }
}
```

dropCandies() 이후 상단에 남은 null 칸에 랜덤 캔디를 배치한다.
이 함수는 3매치 방지 로직을 적용하지 않으므로, 새로 채워진 캔디가 매칭을 형성할 수 있다.
이는 의도된 동작으로, processMatches()의 while 루프에서 연쇄 매칭으로 처리된다.

---

### 13. delay(ms) -- 비동기 딜레이 유틸리티

```javascript
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

async/await에서 사용할 수 있는 Promise 기반 딜레이 함수이다.
애니메이션 재생 시간만큼 대기하는 데 사용한다.

---

### 14. 이벤트 바인딩 및 게임 시작

```javascript
resetBtn.addEventListener('click', initGame);
initGame();
```

- 리셋 버튼 클릭 시 initGame() 호출
- 스크립트 로드 시 즉시 initGame() 호출하여 게임 시작

---

## 실행 흐름 다이어그램

```
[페이지 로드]
    |
    v
initGame()
    |-> board 배열 생성 (getRandomCandyWithoutMatch)
    |-> renderBoard() -> DOM 생성
    |
[사용자 클릭]
    |
    v
onCandyClick(row, col)
    |-> isProcessing 체크
    |-> selectedCandy === null?
        |-> 예: 캔디 선택 (selected 클래스)
        |-> 아니오: 이전 선택 해제
            |-> isAdjacent() 체크
                |-> 인접: swapAndCheck() 호출
                |-> 비인접: 무시
    |
    v
swapAndCheck(r1, c1, r2, c2)
    |-> isProcessing = true
    |-> swapCandies() + renderBoard()
    |-> 200ms 대기
    |-> findMatches()
        |-> 매칭 있음: processMatches()
        |-> 매칭 없음: swapCandies() 되돌리기 + renderBoard()
    |-> isProcessing = false
    |
    v
processMatches()
    |-> while (findMatches().length > 0)
        |-> matched 클래스 추가 (pop 애니메이션)
        |-> score += matches.length * 10
        |-> 350ms 대기
        |-> board에서 null로 설정
        |-> dropCandies()
        |-> fillEmptyCells()
        |-> renderBoard()
        |-> dropping 클래스 추가 (drop 애니메이션)
        |-> 350ms 대기
        |-> findMatches() -> 연쇄 루프
```
