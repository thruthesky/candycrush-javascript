---
name: candy-skill
description: |
  VanillaScript(순수 JavaScript), HTML, CSS로 캔디크러시 게임을 만드는 스킬.
  풍부한 이모지 캔디, Web Audio API 효과음, CSS 애니메이션을 활용한 완성도 높은 매치3 퍼즐 게임 구현.
  캔디크러시, 매치3 퍼즐, 이모지 게임, 브라우저 게임 개발 시 사용.
  TRIGGER: 캔디크러시 개발, 매치3 게임, 이모지 퍼즐, 효과음 추가, 애니메이션 추가 요청 시.
---

# 캔디크러시 게임 스킬

## 개요

VanillaScript(순수 JavaScript)와 HTML, CSS만으로 캔디크러시(매치3 퍼즐) 게임을 구현하는 스킬이다.
외부 라이브러리 없이 브라우저 기본 API만 사용한다.

### 핵심 지향점

- **풍부한 이모지** — 6종 기본 캔디 + 3종 특수 캔디(💥💣🌈)로 시각적 다양성 극대화
- **풍부한 효과음** — Web Audio API로 매치/스왑/콤보/폭발 등 11종 사운드 합성 (외부 파일 불필요)
- **풍부한 애니메이션** — 스왑 이동, 매치 폭발, 낙하 바운스, 파티클, 화면 흔들림 등 10종+ CSS 애니메이션

### 현재 구현 상태

| 항목 | 상태 | 설명 |
|------|------|------|
| 이모지 캔디 | 구현 완료 | 6종 이모지+색상 배경을 캔디로 사용 |
| CSS 애니메이션 | 구현 완료 | 매칭 시 pop, 드롭 시 drop 애니메이션 |
| 매치3 로직 | 구현 완료 | 가로/세로 3개 이상 연속 매칭 탐지 |
| 연쇄 매칭 | 구현 완료 | 매칭 후 자동으로 연쇄 매칭 처리 |
| 점수 시스템 | 구현 완료 | 매칭된 캔디 수 x 10점 |
| 효과음 | 미구현 | Web Audio API 효과음 → [sound-effects.md](references/sound-effects.md) 가이드 참조 |
| 특수 캔디 | 미구현 | 4매치/5매치 특수 캔디 → [matching-logic.md](references/matching-logic.md) 가이드 참조 |
| 모바일 터치 | 미구현 | 터치/스와이프 → [matching-logic.md](references/matching-logic.md) 가이드 참조 |
| 레벨/게임오버 | 미구현 | 레벨 시스템, 게임오버 → [matching-logic.md](references/matching-logic.md) 가이드 참조 |
| 추가 애니메이션 | 미구현 | 파티클, 흔들림, 빛남 등 → [animations.md](references/animations.md) 가이드 참조 |

## 실제 프로젝트 파일 구조

```
index.html    # 메인 HTML (게임 진입점, CSS/JS 로드)
style.css     # 게임 스타일링 (그리드, 캔디 색상, 애니메이션)
game.js       # 게임 핵심 로직 (보드, 매칭, 스왑, 점수, 연쇄 처리)
audio.js      # 효과음 시스템 (Web Audio API, 구현 시 추가)
```

주의: CSS, JS 파일은 하위 디렉토리 없이 루트에 위치한다.

## 참조 문서

### 기존 구현 소스

#### 전체 소스 코드 (HTML/CSS/JS) → [full-source-code.md](references/full-source-code.md)

index.html, style.css, game.js 세 파일의 완전한 소스 코드를 포함한다.
이 문서만으로 게임을 100% 복원할 수 있다. 각 파일의 전체 코드와
한 줄 한 줄에 대한 상세 설명을 제공한다.

#### 게임 로직 상세 설명 → [game-logic-detail.md](references/game-logic-detail.md)

game.js의 모든 함수에 대한 상세 설명을 다룬다. 보드 초기화 알고리즘
(3매치 방지 포함), 캔디 클릭/스왑 메커니즘, 매칭 탐지 알고리즘,
캐스케이드(연쇄) 처리 로직, 점수 계산 방식을 각 함수의 소스코드와
실행 흐름 다이어그램과 함께 상세히 기술한다. `initGame()`,
`getRandomCandyWithoutMatch()`, `renderBoard()`, `onCandyClick()`,
`swapAndCheck()`, `findMatches()`, `processMatches()`,
`dropCandies()`, `fillEmptyCells()` 등 모든 함수를 포함한다.

#### CSS 스타일 및 애니메이션 상세 설명 → [css-detail.md](references/css-detail.md)

style.css의 모든 스타일 규칙에 대한 상세 설명을 다룬다. 페이지
레이아웃(그라데이션 배경, 중앙 정렬), CSS Grid 기반 8x8 보드,
6종 캔디별 그라데이션 색상 및 그림자, 선택/호버 효과, 매칭 시
pop 애니메이션(확대 후 축소+투명), 드롭 시 drop 애니메이션
(위에서 아래로 이동), 리셋 버튼 스타일을 소스코드와 함께 설명한다.

### 신규 기능 구현 가이드

#### 효과음 시스템 (Web Audio API) → [sound-effects.md](references/sound-effects.md)

Web Audio API의 OscillatorNode와 GainNode를 사용하여 외부 오디오 파일 없이
프로그래매틱하게 효과음을 합성하는 시스템이다. 매치 시 "띵" 소리, 스왑 시
"슉" 소리, 콤보 시 상승 음계, 특수 캔디 폭발 시 화이트노이즈, 게임오버 시
하강 멜로디 등 11종 사운드를 각각의 주파수/파형/지속시간 파라미터와 함께
소스코드로 기술한다. `AudioManager` 클래스의 전체 구현, 브라우저 자동재생
정책 대응, 음소거 토글 기능을 포함한다. audio.js 파일로 분리하여 구현한다.

#### 매칭 로직 확장 및 특수 캔디 → [matching-logic.md](references/matching-logic.md)

기존 매칭 로직을 확장하여 특수 캔디 시스템, 모바일 터치 지원, 레벨/게임오버
시스템을 추가하는 가이드이다. 4매치→줄무늬(💥), 5매치→컬러폭탄(🌈),
L/T매치→폭탄(💣) 생성 로직과 각 특수 캔디의 활성화 효과(한 줄 제거, 3×3 제거,
같은 종류 전부 제거)를 소스코드와 함께 설명한다. 터치 이벤트 핸들링(스와이프
감지), 이동 횟수 기반 게임오버, 점수 콤보 배율 시스템, 유효 이동 체크 및
보드 셔플 로직도 포함한다.

#### 추가 애니메이션 효과 → [animations.md](references/animations.md)

기존 pop/drop 애니메이션 외에 추가할 풍부한 시각 효과 가이드이다. 스왑 시
부드러운 이동(CSS 변수 기반), 매치 시 폭발+반짝임+파티클 방출, 낙하 시
바운스(cubic-bezier), 새 캔디 등장 시 위에서 튕김, 점수 팝업 플로팅,
콤보 시 화면 흔들림(screen-shake), 잘못된 스왑 시 좌우 흔들림, 특수 캔디
상시 빛남(glow) 효과를 CSS @keyframes와 JavaScript 트리거 코드로 상세히
기술한다. DOM 파티클 시스템(✨⭐💫 이모지 파편 방사) 구현도 포함한다.

## 핵심 구현 규칙

1. **프레임워크 금지** — React, Vue 등 사용하지 않는다. 순수 VanillaScript만 사용
2. **단일 HTML 진입점** — `index.html`이 CSS/JS를 직접 로드하는 구조
3. **이모지+색상 배경** — 캔디는 이모지로 표현하되, CSS 클래스로 색상 배경 부여
4. **사운드 합성** — 오디오 파일 없이 Web Audio API로 효과음 합성
5. **애니메이션 CSS 우선** — CSS keyframes와 transitions으로 애니메이션 구현. JS는 클래스 토글만
6. **이벤트 기반 처리** — requestAnimationFrame 대신 이벤트+async/await 기반 턴제 처리
7. **단방향 데이터 흐름** — board 배열 변경 후 renderBoard()로 DOM 전체 재렌더링

## 캔디 타입 정의

```javascript
// 기본 캔디 6종
const CANDY_TYPES = [
    { name: 'red', emoji: '🍎' },
    { name: 'blue', emoji: '💎' },
    { name: 'green', emoji: '🍀' },
    { name: 'yellow', emoji: '⭐' },
    { name: 'purple', emoji: '🍇' },
    { name: 'orange', emoji: '🍊' },
];

// 특수 캔디 (구현 시 추가)
const SPECIAL_CANDIES = {
    STRIPED: '💥',    // 4매치 → 한 줄 제거
    BOMB: '💣',       // L/T매치 → 3×3 제거
    COLOR_BOMB: '🌈'  // 5매치 → 같은 종류 모두 제거
};
```

각 캔디는 `candy-{name}` CSS 클래스로 고유한 그라데이션 배경과 그림자를 가진다.

## 점수 시스템

```
기본 점수: 매치된 캔디 수 x 10점
콤보 배율: 연쇄 횟수 × 1.5배 (구현 시 추가)
특수 캔디 보너스 (구현 시 추가):
  - 줄무늬(💥): +50점
  - 폭탄(💣): +100점
  - 컬러폭탄(🌈): +200점
```

## 게임 흐름

```
1. initGame() 호출 → 8x8 보드 생성 (3매치 방지) → renderBoard()
2. 사용자가 캔디 클릭 → selectedCandy에 저장 → 두 번째 캔디 클릭
3. 인접 여부 확인 → swapAndCheck() 호출
4. 캔디 교환 → findMatches() 호출
   - 매칭 있음 → processMatches() (연쇄 루프)
     - 매칭 애니메이션 (matched 클래스) → 점수 추가
     - 매칭 캔디 null 처리 → dropCandies() → fillEmptyCells()
     - renderBoard() → 다시 findMatches() (연쇄)
   - 매칭 없음 → 캔디 되돌리기
5. isProcessing = false (입력 다시 허용)
```

## 완전 복원 가이드

이 스킬 문서만으로 프로젝트를 100% 복원하려면 다음 절차를 따른다.

### 복원 절차

1. 프로젝트 루트에 3개 파일을 생성한다: `index.html`, `style.css`, `game.js`
2. [full-source-code.md](references/full-source-code.md) 문서의 각 파일 소스 코드를 그대로 복사한다
3. 브라우저에서 `index.html`을 열면 게임이 즉시 동작한다

### 복원 시 주의사항

- `audio.js`는 아직 미구현이므로 복원 시 생성하지 않는다
- 모든 파일은 프로젝트 루트에 위치해야 한다 (하위 디렉토리 없음)
- `index.html`에서 `style.css`와 `game.js`를 상대 경로로 로드한다
- `game.js`는 `body` 끝에 위치하여 DOM이 로드된 후 실행된다

### 현재 구현된 함수 목록 (game.js)

| 함수명 | 타입 | 역할 |
|--------|------|------|
| `initGame()` | 일반 | 게임 초기화, 보드 생성, 렌더링 |
| `getRandomCandyWithoutMatch(row, col)` | 일반 | 3매치 방지 랜덤 캔디 선택 |
| `renderBoard()` | 일반 | board 배열을 DOM에 전체 재렌더링 |
| `getCellElement(row, col)` | 일반 | 특정 좌표의 DOM 요소 반환 |
| `onCandyClick(row, col)` | 일반 | 캔디 클릭 이벤트 핸들러 |
| `isAdjacent(r1, c1, r2, c2)` | 일반 | 맨해튼 거리 1 인접 여부 판단 |
| `swapAndCheck(r1, c1, r2, c2)` | async | 캔디 교환 후 매칭 확인/되돌리기 |
| `swapCandies(r1, c1, r2, c2)` | 일반 | board 배열에서 두 캔디 참조 교환 |
| `findMatches()` | 일반 | 가로/세로 3+ 연속 매칭 탐지, Set으로 중복 제거 |
| `processMatches()` | async | 연쇄 매칭 while 루프 (애니메이션-제거-낙하-채우기-재매칭) |
| `dropCandies()` | 일반 | 열 단위 중력 낙하 (null 위의 캔디를 아래로 압축) |
| `fillEmptyCells()` | 일반 | null 칸에 랜덤 캔디 배치 (3매치 방지 없음, 의도적) |
| `delay(ms)` | 일반 | Promise 기반 비동기 딜레이 유틸리티 |

### 전역 상태 변수

| 변수명 | 타입 | 초기값 | 역할 |
|--------|------|--------|------|
| `board` | Array (8x8 2D) | `[]` | 보드 상태, 각 요소는 CANDY_TYPES 객체 참조 또는 null |
| `score` | Number | `0` | 현재 점수 |
| `selectedCandy` | Object/null | `null` | 선택된 캔디 좌표 `{row, col}` |
| `isProcessing` | Boolean | `false` | 매칭 처리 중 플래그 (true면 클릭 무시) |

### DOM 참조 상수

| 상수명 | 선택자 | 용도 |
|--------|--------|------|
| `boardEl` | `#board` | 게임 보드 컨테이너 (CSS Grid) |
| `scoreEl` | `#score` | 점수 표시 `<strong>` 요소 |
| `resetBtn` | `#reset-btn` | 다시 시작 버튼 |

### CSS 애니메이션 (현재 구현)

| 애니메이션 | @keyframes | 트리거 클래스 | 지속시간 | 설명 |
|-----------|-----------|-------------|---------|------|
| pop | `pop` | `.matched` | 0.3s | 매치 시 확대(1.3배) 후 축소(0배)+투명 |
| drop | `drop` | `.dropping` | 0.3s | 위에서 아래로 60px 이동+불투명 |

### CSS 색상 팔레트 (현재 구현)

| 캔디 | 클래스 | 그라데이션 | box-shadow |
|------|--------|-----------|------------|
| 🍎 | `candy-red` | `#ff6b6b -> #ee5a24` | `rgba(238,90,36,0.4)` |
| 💎 | `candy-blue` | `#74b9ff -> #0984e3` | `rgba(9,132,227,0.4)` |
| 🍀 | `candy-green` | `#55efc4 -> #00b894` | `rgba(0,184,148,0.4)` |
| ⭐ | `candy-yellow` | `#ffeaa7 -> #fdcb6e` | `rgba(253,203,110,0.4)` |
| 🍇 | `candy-purple` | `#a29bfe -> #6c5ce7` | `rgba(108,92,231,0.4)` |
| 🍊 | `candy-orange` | `#fab1a0 -> #e17055` | `rgba(225,112,85,0.4)` |
