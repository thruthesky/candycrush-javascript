# ✨ 추가 애니메이션 효과 구현 가이드

## 핵심 개념

기존 style.css의 pop/drop 애니메이션 외에 추가할 풍부한 시각 효과 가이드이다.
모든 효과는 **CSS @keyframes를 우선** 사용하고, JavaScript는 CSS 클래스를 동적으로
추가/제거하여 애니메이션을 트리거하는 역할만 한다.

### 추가 애니메이션 목록

| 애니메이션 | 트리거 시점 | CSS 클래스 | 지속시간 |
|-----------|-----------|-----------|---------|
| 스왑 이동 | 캔디 교환 시 | `.swapping` | 300ms |
| 매치 폭발 강화 | 매치 제거 시 | `.matched` 확장 | 400ms |
| 낙하 바운스 | 중력 낙하 시 | `.dropping` 확장 | 400ms |
| 새 캔디 등장 | 빈 칸 채울 때 | `.appearing` | 300ms |
| 점수 팝업 | 점수 획득 시 | `.score-popup` | 800ms |
| 화면 흔들림 | 콤보 2+ 시 | `.screen-shake` | 300ms |
| 잘못된 스왑 | 유효하지 않은 스왑 | `.invalid-shake` | 300ms |
| 특수 캔디 빛남 | 특수 캔디 존재 | `.special-glow` | 1.5s 반복 |
| 파티클 효과 | 매치/특수 캔디 | JS 생성 | 600ms |

## style.css에 추가할 CSS

### 기존 matched 애니메이션 강화

기존 pop 애니메이션을 더 화려하게 확장한다. 기존 `@keyframes pop`을 유지하되,
추가 효과를 `.matched::after`로 구현한다.

```css
/* 매치 시 반짝임 추가 (기존 .matched에 덧붙임) */
.candy.matched::after {
  content: '✨';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.2rem;
  animation: sparkle-burst 0.4s ease-out forwards;
  pointer-events: none;
}

@keyframes sparkle-burst {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(2); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}
```

### 새 캔디 등장 애니메이션

`fillEmptyCells()` 후 `renderBoard()` 시 새로 생성된 셀에 적용한다.

```css
/* 새 캔디 위에서 튕기며 등장 */
.candy.appearing {
  animation: candy-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes candy-appear {
  0% { transform: translateY(-100%) scale(0); opacity: 0; }
  50% { transform: translateY(0) scale(1.2); opacity: 0.8; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
```

### 점수 팝업

```css
/* 점수 팝업 — JS에서 동적 생성하는 div */
.score-popup {
  position: absolute;
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 100;
  animation: score-float 0.8s ease-out forwards;
}

@keyframes score-float {
  0% { transform: translateY(0) scale(0.5); opacity: 1; }
  50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
  100% { transform: translateY(-60px) scale(1); opacity: 0; }
}
```

### 화면 흔들림 (콤보)

```css
/* 콤보 시 보드 전체 흔들림 */
#board.screen-shake {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px) rotate(-0.5deg); }
  40% { transform: translateX(5px) rotate(0.5deg); }
  60% { transform: translateX(-3px) rotate(-0.3deg); }
  80% { transform: translateX(3px) rotate(0.3deg); }
}
```

### 잘못된 스왑 흔들림

```css
/* 유효하지 않은 스왑 시 좌우 흔들림 */
.candy.invalid-shake {
  animation: invalid-shake 0.3s ease-in-out;
}

@keyframes invalid-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}
```

### 특수 캔디 빛남

```css
/* 특수 캔디 상시 반짝임 (candy-special 클래스와 함께 사용) */
.candy.special-glow {
  animation: glow 1.5s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
    filter: brightness(1);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);
    filter: brightness(1.3);
  }
}
```

### 콤보 텍스트 표시

```css
/* 콤보 텍스트 — .score-board 내부에 span으로 추가 */
.combo-display {
  font-size: 1.2rem;
  font-weight: bold;
  color: #FF6B6B;
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
```

### 기존 drop 애니메이션 바운스 추가

기존 `@keyframes drop`을 바운스 효과로 교체한다.

```css
/* 기존 drop 애니메이션을 바운스로 교체 */
@keyframes drop {
  0% {
    transform: translateY(calc(var(--drop-distance, -60px)));
    opacity: 0.7;
  }
  60% { transform: translateY(0); }
  75% { transform: translateY(-8px); }
  90% { transform: translateY(2px); }
  100% { transform: translateY(0); opacity: 1; }
}
```

주의: 기존 drop 애니메이션에서 CSS 변수 `--drop-distance`를 사용하도록 변경한다.
JavaScript에서 각 셀의 낙하 거리에 따라 이 변수를 설정해야 한다.

## JavaScript 애니메이션 트리거 코드

### 점수 팝업 생성

```javascript
/**
 * 점수 획득 시 보드 위에 플로팅 점수 텍스트 생성
 * processMatches() 내에서 점수 계산 후 호출
 */
function showScorePopup(points) {
  const popup = document.createElement('div');
  popup.classList.add('score-popup');
  popup.textContent = `+${points}`;
  popup.style.left = '50%';
  popup.style.top = '50%';
  popup.style.transform = 'translate(-50%, -50%)';

  boardEl.style.position = 'relative'; // 부모 기준 absolute 배치
  boardEl.appendChild(popup);

  popup.addEventListener('animationend', () => popup.remove());
}
```

### 화면 흔들림 트리거

```javascript
/**
 * 콤보 시 보드 전체 흔들림
 * processMatches()에서 comboCount > 1일 때 호출
 */
function shakeScreen() {
  boardEl.classList.add('screen-shake');
  boardEl.addEventListener('animationend', () => {
    boardEl.classList.remove('screen-shake');
  }, { once: true });
}
```

### 잘못된 스왑 흔들림

```javascript
/**
 * swapAndCheck()에서 매치 없을 때 되돌리기 전에 호출
 */
function shakeInvalidSwap(row1, col1, row2, col2) {
  const cell1 = boardEl.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
  const cell2 = boardEl.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
  if (cell1) cell1.classList.add('invalid-shake');
  if (cell2) cell2.classList.add('invalid-shake');

  setTimeout(() => {
    if (cell1) cell1.classList.remove('invalid-shake');
    if (cell2) cell2.classList.remove('invalid-shake');
  }, 300);
}
```

### 콤보 텍스트 표시

```javascript
/**
 * 콤보 텍스트 표시
 * processMatches()에서 comboCount > 1일 때 호출
 */
function showCombo(combo) {
  const comboEl = document.getElementById('combo-display');
  if (!comboEl) return;

  const texts = ['', '', '🔥 x2!', '💥 x3!', '⚡ x4!', '🌟 x5!', '🎆 MEGA!'];
  comboEl.textContent = texts[Math.min(combo, texts.length - 1)] || `🎆 x${combo}!`;
  comboEl.classList.add('active');

  setTimeout(() => comboEl.classList.remove('active'), 1500);
}
```

### 새 캔디 등장 애니메이션

```javascript
/**
 * renderBoard() 내에서 새로 생성된 셀에 appearing 클래스 추가
 * 300ms 후 자동 제거
 */
function markAsAppearing(cellElement) {
  cellElement.classList.add('appearing');
  cellElement.addEventListener('animationend', () => {
    cellElement.classList.remove('appearing');
  }, { once: true });
}
```

## 파티클 효과 (DOM 기반)

매치 폭발 시 셀 위치에서 이모지 파편이 방사형으로 흩어지는 효과.

### CSS

```css
.particle {
  position: absolute;
  pointer-events: none;
  z-index: 200;
  animation: particle-fly 0.6s ease-out forwards;
}

@keyframes particle-fly {
  0% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--px), var(--py)) scale(0) rotate(var(--pr));
    opacity: 0;
  }
}
```

### JavaScript

```javascript
/**
 * 셀 위치에 파티클 효과 생성
 * 매치 애니메이션 시작 시 각 매치된 셀에 대해 호출
 * @param {HTMLElement} cellElement - 매치된 셀 DOM 요소
 */
function createParticles(cellElement) {
  const rect = cellElement.getBoundingClientRect();
  const boardRect = boardEl.getBoundingClientRect();
  const emojis = ['✨', '⭐', '💫', '🌟', '✴️'];
  const count = 6 + Math.floor(Math.random() * 3);

  boardEl.style.position = 'relative';
  boardEl.style.overflow = 'visible'; // 파티클이 보드 밖으로 나갈 수 있도록

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.fontSize = `${0.6 + Math.random() * 0.6}rem`;

    // 셀 중앙 기준 위치
    p.style.left = `${rect.left - boardRect.left + rect.width / 2}px`;
    p.style.top = `${rect.top - boardRect.top + rect.height / 2}px`;

    // 랜덤 방향으로 흩어짐
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
    const dist = 30 + Math.random() * 50;
    p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--pr', `${Math.random() * 360}deg`);

    boardEl.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}
```

### processMatches()에서 파티클 호출

```javascript
// 매치 애니메이션 단계에서 각 매치된 셀에 파티클 생성
for (const key of toRemove) {
  const [r, c] = key.split(',').map(Number);
  const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  if (cell) {
    cell.classList.add('matched');
    createParticles(cell); // 파티클 생성
  }
}
```

## 특수 캔디 활성화 시각 효과

### 줄무늬 캔디: 라인 이펙트

```css
.line-effect {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(255,255,0,0.8), transparent);
  height: 4px;
  width: 100%;
  left: 0;
  z-index: 150;
  animation: line-sweep 0.3s ease-out forwards;
}
@keyframes line-sweep {
  0% { opacity: 0; transform: scaleX(0); }
  50% { opacity: 1; transform: scaleX(1); }
  100% { opacity: 0; transform: scaleX(1.5); }
}
```

### 폭탄 캔디: 원형 파동

```css
.bomb-wave {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255, 100, 0, 0.8);
  z-index: 150;
  animation: bomb-expand 0.4s ease-out forwards;
}
@keyframes bomb-expand {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 200px; height: 200px; margin-left: -100px; margin-top: -100px; opacity: 0; }
}
```

### 컬러폭탄: 무지개 파동

```css
.rainbow-wave {
  position: absolute;
  border-radius: 50%;
  z-index: 150;
  background: conic-gradient(red, orange, yellow, green, blue, purple, red);
  mask: radial-gradient(transparent 60%, black 65%);
  -webkit-mask: radial-gradient(transparent 60%, black 65%);
  animation: rainbow-expand 0.6s ease-out forwards;
}
@keyframes rainbow-expand {
  0% { width: 0; height: 0; opacity: 1; }
  100% { width: 400px; height: 400px; margin-left: -200px; margin-top: -200px; opacity: 0; }
}
```
