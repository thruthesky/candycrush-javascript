# CSS 스타일 및 애니메이션 상세 설명

style.css 파일의 모든 스타일 규칙에 대한 상세 설명이다.

## 1. 글로벌 리셋

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
```

- 모든 요소의 기본 margin, padding 제거
- border-box로 패딩이 width에 포함되도록 설정

## 2. 페이지 배경 및 레이아웃

```css
body {
    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

- 배경: 135도 각도의 3색 그라데이션 (짙은 남색 계열)
  - #1a1a2e: 매우 어두운 남색
  - #16213e: 어두운 남색
  - #0f3460: 짙은 파란색
- 최소 높이 100vh로 전체 화면 채움
- Flexbox 중앙 정렬로 컨테이너를 화면 정중앙에 배치

## 3. 컨테이너

```css
.container {
    text-align: center;
}
```

내부 요소(제목, 점수판, 보드, 버튼)를 가로 중앙 정렬한다.

## 4. 제목 스타일

```css
h1 {
    color: #fff;
    font-size: 2.5rem;
    margin-bottom: 15px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
```

- 흰색 텍스트, 2.5rem 크기
- text-shadow로 그림자 효과 (깊이감)

## 5. 점수판

```css
.score-board {
    color: #fff;
    font-size: 1.4rem;
    margin-bottom: 15px;
}

.score-board strong {
    color: #ffd700;
    font-size: 1.6rem;
}
```

- 점수 레이블은 흰색 1.4rem
- 점수 숫자(strong)는 금색(#ffd700) 1.6rem으로 강조

## 6. 게임 보드 (CSS Grid)

```css
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
```

- CSS Grid로 8열 x 8행, 각 셀 60px 고정 크기
- gap 2px: 셀 간 간격
- 반투명 흰색 배경 (rgba 0.1)
- border-radius 12px: 둥근 모서리
- padding 8px: 보드 테두리와 셀 사이 여백
- margin 0 auto + width fit-content: 가로 중앙 정렬
- box-shadow: 큰 그림자로 부유 효과

## 7. 캔디 셀 기본 스타일

```css
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
```

- 60x60px 정사각형, 둥근 모서리 10px
- cursor: pointer로 클릭 가능 표시
- transition: 크기 변환(0.15s)과 투명도(0.3s) 부드러운 전환
- Flexbox 중앙 정렬로 이모지를 셀 중앙에 배치
- font-size 2rem: 이모지 크기
- user-select none: 텍스트 선택 방지

## 8. 호버 효과

```css
.candy:hover {
    transform: scale(1.1);
    z-index: 1;
}
```

마우스 오버 시 10% 확대, z-index로 이웃 셀 위에 표시한다.

## 9. 선택된 캔디

```css
.candy.selected {
    transform: scale(1.15);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
    z-index: 2;
}
```

- 15% 확대 (호버보다 살짝 더 큰)
- 흰색 글로우 효과 (box-shadow 15px 블러)
- z-index 2: 호버된 셀보다 위에 표시

## 10. 캔디 색상별 스타일 (6종)

각 캔디 타입은 고유한 그라데이션 배경과 그림자를 가진다.

```css
.candy-red {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    box-shadow: 0 3px 8px rgba(238, 90, 36, 0.4);
}
```

| CSS 클래스 | 캔디 | 그라데이션 시작 | 그라데이션 끝 | 그림자 색상 |
|-----------|------|---------------|-------------|-----------|
| candy-red | 🍎 | #ff6b6b (밝은 빨강) | #ee5a24 (진한 주황빨강) | rgba(238,90,36,0.4) |
| candy-blue | 💎 | #74b9ff (밝은 파랑) | #0984e3 (진한 파랑) | rgba(9,132,227,0.4) |
| candy-green | 🍀 | #55efc4 (민트) | #00b894 (진한 녹색) | rgba(0,184,148,0.4) |
| candy-yellow | ⭐ | #ffeaa7 (밝은 노랑) | #fdcb6e (진한 노랑) | rgba(253,203,110,0.4) |
| candy-purple | 🍇 | #a29bfe (밝은 보라) | #6c5ce7 (진한 보라) | rgba(108,92,231,0.4) |
| candy-orange | 🍊 | #fab1a0 (밝은 살구) | #e17055 (진한 주황) | rgba(225,112,85,0.4) |

모든 그라데이션은 135도 각도로, 왼쪽 위에서 오른쪽 아래로 흐른다.
box-shadow는 아래쪽으로 3px 오프셋, 8px 블러, 40% 투명도이다.

## 11. 매칭 애니메이션 (pop)

```css
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
```

**동작:**
- 0%: 원래 크기(1), 완전 불투명
- 50%: 1.3배로 확대되며 반투명 (팽창 효과)
- 100%: 크기 0으로 축소, 완전 투명 (사라짐)
- 지속시간: 0.3초
- forwards: 애니메이션 끝 상태(크기0, 투명) 유지
- JavaScript에서 `cell.classList.add('matched')`로 트리거

## 12. 드롭 애니메이션 (drop)

```css
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
```

**동작:**
- from: 60px 위에서 시작 (한 셀 높이), 반투명
- to: 원래 위치로 이동, 완전 불투명
- 지속시간: 0.3초
- 캔디가 위에서 아래로 떨어지는 효과
- JavaScript에서 `cell.classList.add('dropping')`으로 트리거

**주의:** 현재 구현에서는 processMatches() 내에서 모든 셀에 dropping 클래스를 추가한다. 실제로 이동하지 않은 셀에도 적용되지만, translateY(0)이 최종 상태이므로 시각적 영향은 미미하다.

## 13. 리셋 버튼

```css
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

- 금색 그라데이션 배경 (#ffd700 -> #f39c12)
- 어두운 남색 텍스트 (#1a1a2e, body 배경과 동일)
- 호버 시: 2px 위로 떠오름 + 그림자 강화 (부유 효과)
- 클릭 시: 원래 위치로 (눌림 효과)
- 0.2초 transition으로 부드러운 전환

## 전체 색상 팔레트 정리

| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| 배경 시작 | #1a1a2e | 매우 어두운 남색 |
| 배경 중간 | #16213e | 어두운 남색 |
| 배경 끝 | #0f3460 | 짙은 파란색 |
| 보드 배경 | rgba(255,255,255,0.1) | 10% 흰색 반투명 |
| 제목/텍스트 | #fff | 흰색 |
| 점수 숫자 | #ffd700 | 금색 |
| 선택 글로우 | rgba(255,255,255,0.8) | 80% 흰색 반투명 |
| 리셋 버튼 시작 | #ffd700 | 금색 |
| 리셋 버튼 끝 | #f39c12 | 진한 금색/주황 |
