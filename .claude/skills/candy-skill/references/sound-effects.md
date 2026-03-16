# 🔊 효과음 시스템 구현 가이드

## 핵심 개념

Web Audio API의 `OscillatorNode`와 `GainNode`를 사용하여 외부 오디오 파일 없이
프로그래매틱하게 효과음을 합성한다. `audio.js` 파일로 분리하여 구현하며,
`index.html`에서 `game.js`보다 먼저 로드해야 한다.

### HTML 로드 순서

```html
<!-- index.html의 body 끝에 추가 -->
<button id="mute-btn" class="mute-btn">🔊</button>
<script src="audio.js"></script>  <!-- game.js보다 먼저 로드 -->
<script src="game.js"></script>
```

## 사운드 목록

| 이벤트 | 파형 | 주파수 | 지속시간 | 설명 |
|--------|------|--------|---------|------|
| select | sine | 600Hz | 80ms | 셀 선택 시 짧은 "띵" |
| swap | triangle | 400→600Hz | 150ms | 캔디 교환 시 "슉" |
| match | sine | 523→784Hz | 200ms | 매치 성공 시 상승음 |
| combo | sine | 계단식 상승 | 300ms | 연쇄 시 음계 상승 |
| comboEnd | sine | 1047→523Hz | 400ms | 콤보 종료 시 하강음 |
| invalid | sawtooth | 200Hz | 200ms | 잘못된 스왑 시 "뿌" |
| special | sine | 화음 | 300ms | 특수 캔디 생성 시 화음 |
| explosion | noise | 화이트노이즈 | 300ms | 특수 캔디 폭발 시 |
| gameOver | sine | 하강 멜로디 | 800ms | 게임 종료 시 |
| shuffle | triangle | 300→500→300Hz | 400ms | 보드 섞기 시 |
| levelUp | sine | 상승 팡파르 | 600ms | 레벨업 시 |

## audio.js 전체 소스코드

```javascript
/**
 * audio.js - 효과음 관리 클래스
 * Web Audio API로 프로그래매틱 사운드 합성
 * index.html에서 game.js보다 먼저 로드해야 함
 */
class AudioManager {
  constructor() {
    this.ctx = null;       // AudioContext (사용자 인터랙션 후 초기화)
    this.isMuted = false;  // 음소거 상태
  }

  /**
   * AudioContext 초기화
   * 브라우저 자동재생 정책으로 첫 클릭/터치 후에만 생성 가능
   */
  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** 음소거 토글 */
  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  /**
   * 효과음 재생
   * @param {string} type - 사운드 종류
   * @param {number} [param] - 추가 파라미터 (콤보 횟수 등)
   */
  play(type, param) {
    if (this.isMuted) return;
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      switch (type) {
        case 'select':   this._playSelect(ctx, now); break;
        case 'swap':     this._playSwap(ctx, now); break;
        case 'match':    this._playMatch(ctx, now); break;
        case 'combo':    this._playCombo(ctx, now, param || 2); break;
        case 'comboEnd': this._playComboEnd(ctx, now); break;
        case 'invalid':  this._playInvalid(ctx, now); break;
        case 'special':  this._playSpecial(ctx, now); break;
        case 'explosion':this._playExplosion(ctx, now); break;
        case 'gameOver': this._playGameOver(ctx, now); break;
        case 'shuffle':  this._playShuffle(ctx, now); break;
        case 'levelUp':  this._playLevelUp(ctx, now); break;
      }
    } catch (e) {
      console.warn('오디오 재생 실패:', e);
    }
  }

  /** 오실레이터 + 게인 노드 헬퍼 */
  _createOscGain(ctx, waveform = 'sine', volume = 0.3) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = waveform;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    return { osc, gain };
  }

  /** 셀 선택: 짧은 "띵" (sine 600Hz, 80ms) */
  _playSelect(ctx, now) {
    const { osc, gain } = this._createOscGain(ctx, 'sine', 0.15);
    osc.frequency.setValueAtTime(600, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** 캔디 스왑: "슉" (triangle 400→600Hz, 150ms) */
  _playSwap(ctx, now) {
    const { osc, gain } = this._createOscGain(ctx, 'triangle', 0.2);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /** 매치 성공: 상승음 C5→G5 (sine 523→784Hz, 200ms) */
  _playMatch(ctx, now) {
    const { osc, gain } = this._createOscGain(ctx, 'sine', 0.25);
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.linearRampToValueAtTime(784, now + 0.1);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** 콤보: 계단식 상승 음계 (콤보 횟수에 따라 음높이 상승) */
  _playCombo(ctx, now, comboCount) {
    const notes = [523, 659, 784, 988, 1047]; // C, E, G, B, C6
    const noteCount = Math.min(comboCount, notes.length);
    for (let i = 0; i < noteCount; i++) {
      const { osc, gain } = this._createOscGain(ctx, 'sine', 0.2);
      const t = now + i * 0.08;
      osc.frequency.setValueAtTime(notes[i], t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  /** 콤보 종료: 하강음 (sine 1047→523Hz, 400ms) */
  _playComboEnd(ctx, now) {
    const { osc, gain } = this._createOscGain(ctx, 'sine', 0.2);
    osc.frequency.setValueAtTime(1047, now);
    osc.frequency.exponentialRampToValueAtTime(523, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** 잘못된 스왑: "뿌" (sawtooth 200→150Hz, 200ms) */
  _playInvalid(ctx, now) {
    const { osc, gain } = this._createOscGain(ctx, 'sawtooth', 0.15);
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** 특수 캔디 생성: C+E+G 화음 (300ms) */
  _playSpecial(ctx, now) {
    for (const freq of [523, 659, 784]) {
      const { osc, gain } = this._createOscGain(ctx, 'sine', 0.12);
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  /** 특수 캔디 폭발: 화이트 노이즈 + 로우패스 필터 (300ms) */
  _playExplosion(ctx, now) {
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.3);
  }

  /** 게임 오버: 하강 멜로디 G5→E5→C5→A4 (800ms) */
  _playGameOver(ctx, now) {
    [784, 659, 523, 440].forEach((freq, i) => {
      const { osc, gain } = this._createOscGain(ctx, 'sine', 0.2);
      const t = now + i * 0.2;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  /** 보드 섞기: 워블 사운드 (triangle 300→500→300Hz, 400ms) */
  _playShuffle(ctx, now) {
    const { osc, gain } = this._createOscGain(ctx, 'triangle', 0.15);
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.2);
    osc.frequency.linearRampToValueAtTime(300, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  /** 레벨업: 상승 팡파르 C5→E5→G5→C6 (600ms) */
  _playLevelUp(ctx, now) {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const { osc, gain } = this._createOscGain(ctx, 'sine', 0.2);
      const t = now + i * 0.15;
      osc.frequency.setValueAtTime(freq, t);
      const dur = i === 3 ? 0.3 : 0.12;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  }
}

// 전역 인스턴스 생성
const audioManager = new AudioManager();
```

## game.js에서의 사용법

기존 game.js 함수들에 효과음 호출을 추가한다:

```javascript
// onCandyClick()에서 캔디 선택 시
audioManager.play('select');

// swapAndCheck()에서 스왑 성공 시
audioManager.play('swap');

// swapAndCheck()에서 스왑 실패(매치 없음) 시
audioManager.play('invalid');

// processMatches()에서 매치 발견 시
audioManager.play('match');

// processMatches()에서 연쇄 매칭 시 (combo 카운터 전달)
audioManager.play('combo', comboCount);

// processMatches() 연쇄 루프 종료 시
audioManager.play('comboEnd');
```

## 음소거 버튼 CSS

```css
/* style.css에 추가 */
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
.mute-btn:hover { transform: scale(1.1); }
```

## 음소거 토글 이벤트 (game.js initGame()에 추가)

```javascript
document.getElementById('mute-btn').addEventListener('click', () => {
  audioManager.toggleMute();
  document.getElementById('mute-btn').textContent =
    audioManager.isMuted ? '🔇' : '🔊';
});
```

## 주의사항

1. **AudioContext 생성 제한**: 반드시 사용자 인터랙션(클릭/터치) 후 생성. `ensureContext()`가 자동 처리
2. **iOS Safari 대응**: `webkitAudioContext` 폴백 (생성자에서 처리)
3. **볼륨**: 각 사운드의 gain 값을 0.1~0.3 범위로 유지
4. **로드 순서**: `audio.js`를 `game.js`보다 먼저 로드해야 `audioManager` 전역 변수 사용 가능
