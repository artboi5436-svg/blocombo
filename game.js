/**
 * БЛОК ПАЗЛ: КОМБО ТЕТРИС
 * Полная реализация механики Block Blast с комбо, частицами, звуками и Yandex Games SDK
 */

(function () {
  'use strict';

  // --- 1. АУДИО СИНТЕЗАТОР (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playPickup() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    playPlace() {
      if (!this.enabled || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    playClear(combo) {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const baseIdx = Math.min(combo, this.pentatonic.length - 3);
      
      // Играем красивый аккорд из 2-3 гармоник
      [0, 2, 4].forEach((offset, i) => {
        const noteIdx = (baseIdx + offset) % this.pentatonic.length;
        const freq = this.pentatonic[noteIdx] * (combo > 4 ? 1.5 : 1);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.18, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.36);
      });
    }

    playGameOver() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      [350, 310, 260, 200].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.22);
      });
    }

    playSwoosh() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }

    playHammer() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    playMagic() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.26);
      });
    }

    playFanfare() {
      if (!this.enabled || !this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.42);
      });
    }
  }

  // --- 2. ЦВЕТОВАЯ ПАЛИТРА И ФИГУРЫ ---
  const COLORS = [
    { main: '#00e5ff', light: '#80f2ff', dark: '#009bb3' }, // Cyan
    { main: '#ff3d71', light: '#ff85a1', dark: '#c2185b' }, // Ruby
    { main: '#ffc400', light: '#ffe082', dark: '#ff8f00' }, // Gold
    { main: '#00e676', light: '#69f0ae', dark: '#00a152' }, // Lime Green
    { main: '#7c4dff', light: '#b388ff', dark: '#512da8' }, // Purple
    { main: '#ff9100', light: '#ffb74d', dark: '#e65100' }, // Orange
    { main: '#00b0ff', light: '#80d8ff', dark: '#007bb2' }, // Ocean Blue
    { main: '#e040fb', light: '#ea80fc', dark: '#aa00ff' }  // Magenta
  ];

  // Каталог фигур (матрицы 1/0)
  const SHAPE_DEFINITIONS = [
    // Точка 1x1
    { matrix: [[1]] },
    // Линии 2x1, 3x1, 4x1, 5x1
    { matrix: [[1, 1]] },
    { matrix: [[1], [1]] },
    { matrix: [[1, 1, 1]] },
    { matrix: [[1], [1], [1]] },
    { matrix: [[1, 1, 1, 1]] },
    { matrix: [[1], [1], [1], [1]] },
    { matrix: [[1, 1, 1, 1, 1]] },
    // Квадраты 2x2, 3x3
    { matrix: [[1, 1], [1, 1]] },
    { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
    // Уголки 2x2
    { matrix: [[1, 0], [1, 1]] },
    { matrix: [[0, 1], [1, 1]] },
    { matrix: [[1, 1], [1, 0]] },
    { matrix: [[1, 1], [0, 1]] },
    // Большие уголки 3x3
    { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
    { matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]] },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]] },
    { matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]] },
    // T-образные
    { matrix: [[1, 1, 1], [0, 1, 0]] },
    { matrix: [[0, 1, 0], [1, 1, 1]] },
    { matrix: [[1, 0], [1, 1], [1, 0]] },
    { matrix: [[0, 1], [1, 1], [0, 1]] },
    // L-образные 3x2
    { matrix: [[1, 0], [1, 0], [1, 1]] },
    { matrix: [[0, 1], [0, 1], [1, 1]] },
    { matrix: [[1, 1, 1], [1, 0, 0]] },
    { matrix: [[1, 1, 1], [0, 0, 1]] },
    // Z и S
    { matrix: [[1, 1, 0], [0, 1, 1]] },
    { matrix: [[0, 1, 1], [1, 1, 0]] }
  ];

  // --- 3. ЧАСТИЦЫ И ЭФФЕКТЫ ---
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 250 + 100;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 60; // Легкий подброс вверх
      this.size = Math.random() * 8 + 4;
      this.color = color;
      this.alpha = 1;
      this.decay = Math.random() * 1.5 + 1.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.vRot = (Math.random() - 0.5) * 8;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += 300 * dt; // Гравитация
      this.alpha -= this.decay * dt;
      this.size *= (1 - 0.5 * dt);
      this.rotation += this.vRot * dt;
      return this.alpha > 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.fillStyle = this.color.main;
      ctx.shadowColor = this.color.light;
      ctx.shadowBlur = 8;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Всплывающие очки в стиле Block Blast (+10, +240, COMBO x3)
  class FloatingText {
    constructor(x, y, text, color = '#ffea00', size = 22) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.size = size;
      this.alpha = 1;
      this.vy = -60; // Движение вверх
      this.scale = 1.35;
      this.life = 0.85;
    }

    update(dt) {
      this.y += this.vy * dt;
      this.life -= dt;
      this.alpha = Math.max(0, this.life / 0.85);
      if (this.scale > 1) {
        this.scale = Math.max(1, this.scale - 2.5 * dt);
      }
      return this.life > 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.font = `900 ${Math.round(this.size * this.scale)}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0d111a';
      ctx.strokeText(this.text, this.x, this.y);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillText(this.text, this.x, this.y);
      ctx.restore();
    }
  }

  // Вспышка лазера вдоль очищаемой линии
  class LineFlash {
    constructor(x, y, w, h, color = '#ffffff') {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.color = color;
      this.alpha = 0.95;
      this.life = 0.22;
    }

    update(dt) {
      this.life -= dt;
      this.alpha = Math.max(0, this.life / 0.22);
      return this.life > 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 16;
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.restore();
    }
  }

  // --- 4. ОСНОВНОЙ КЛАСС ИГРЫ ---
  class BlockBlastGame {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.sound = new SoundFX();

      // Размеры сетки
      this.GRID_SIZE = 8;
      this.grid = Array(this.GRID_SIZE).fill(null).map(() => Array(this.GRID_SIZE).fill(null));

      // Состояние
      this.score = 0;
      this.bestScore = 0;
      this.comboCount = 0;
      this.isGameOver = false;
      this.canRevive = true;

      // Бустеры
      this.rotateCharges = 1;
      this.hammerCharges = 1;
      this.activeMode = null; // 'rotate' | 'hammer' | null

      // Слоты под 3 доступные фигуры внизу
      this.hand = [null, null, null];

      // Перетаскивание
      this.draggedPiece = null;
      this.dragSlotIndex = -1;
      this.dragX = 0;
      this.dragY = 0;
      this.touchOffsetY = 75; // Смещение для пальца на мобилке

      // Анимации и визуальные эффекты
      this.particles = [];
      this.floatingTexts = [];
      this.lineFlashes = [];
      this.shakeDuration = 0;
      this.shakeIntensity = 0;

      // Геометрия поля
      this.boardRect = { x: 0, y: 0, size: 0, cellSize: 0, gap: 5 };
      this.handRect = { x: 0, y: 0, width: 0, height: 0 };

      // DOM элементы
      this.scoreEl = document.getElementById('current-score');
      this.bestScoreEl = document.getElementById('best-score');
      this.comboPopup = document.getElementById('combo-popup');
      this.comboTitle = document.getElementById('combo-title');
      this.comboSubtitle = document.getElementById('combo-subtitle');
      this.gameOverModal = document.getElementById('game-over-modal');
      this.finalScoreEl = document.getElementById('final-score');
      this.newRecordBadge = document.getElementById('new-record-badge');
      this.btnRestart = document.getElementById('btn-restart');
      this.btnRevive = document.getElementById('btn-revive');
      this.btnSound = document.getElementById('btn-sound');
      this.soundIconOn = document.getElementById('sound-icon-on');
      this.soundIconOff = document.getElementById('sound-icon-off');

      // Бустеры DOM
      this.btnBoosterRotate = document.getElementById('btn-booster-rotate');
      this.btnBoosterHammer = document.getElementById('btn-booster-hammer');
      this.btnBoosterReroll = document.getElementById('btn-booster-reroll');
      this.badgeRotate = document.getElementById('badge-rotate');
      this.badgeHammer = document.getElementById('badge-hammer');
      this.badgeReroll = document.getElementById('badge-reroll');
      this.boosterHint = document.getElementById('booster-hint');
      this.boosterHintText = document.getElementById('booster-hint-text');
      this.btnCancelBooster = document.getElementById('btn-cancel-booster');
      this.boostersBar = document.getElementById('boosters-bar');

      this.init();
    }

    async init() {
      // Инициализация Yandex SDK
      await window.yaSdk.init();
      this.bestScore = await window.yaSdk.loadBestScore();
      this.bestScoreEl.textContent = this.bestScore.toLocaleString();

      this.setupBoosters();
      this.setupEvents();
      this.resize();
      this.spawnHand();
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    setupBoosters() {
      this.updateBoosterBadges();

      this.btnCancelBooster.addEventListener('click', () => {
        this.setMode(null);
      });

      // Бустер: Поворот
      this.btnBoosterRotate.addEventListener('click', () => {
        if (this.isGameOver) return;
        this.sound.init();
        if (this.rotateCharges <= 0) {
          // Смотрим рекламу за +3 поворота
          window.yaSdk.showRewardedVideo(() => {
            this.rotateCharges += 3;
            this.updateBoosterBadges();
            this.setMode('rotate');
          });
        } else {
          this.setMode(this.activeMode === 'rotate' ? null : 'rotate');
        }
      });

      // Бустер: Молот
      this.btnBoosterHammer.addEventListener('click', () => {
        if (this.isGameOver) return;
        this.sound.init();
        if (this.hammerCharges <= 0) {
          // Смотрим рекламу за +2 молота
          window.yaSdk.showRewardedVideo(() => {
            this.hammerCharges += 2;
            this.updateBoosterBadges();
            this.setMode('hammer');
          });
        } else {
          this.setMode(this.activeMode === 'hammer' ? null : 'hammer');
        }
      });

      // Бустер: Замена фигур
      this.btnBoosterReroll.addEventListener('click', () => {
        if (this.isGameOver) return;
        this.sound.init();
        window.yaSdk.showRewardedVideo(() => {
          this.setMode(null);
          this.sound.playMagic();
          this.spawnHand();
          for (let i = 0; i < 3; i++) {
            const slot = this.getSlotRect(i);
            for (let k = 0; k < 8; k++) {
              this.particles.push(new Particle(slot.x + slot.w / 2, slot.y + slot.h / 2, COLORS[i % COLORS.length]));
            }
          }
        });
      });
    }

    setMode(mode) {
      this.activeMode = mode;
      this.btnBoosterRotate.classList.toggle('active', mode === 'rotate');
      this.btnBoosterHammer.classList.toggle('active', mode === 'hammer');

      if (mode === 'rotate') {
        this.boosterHintText.textContent = 'Нажмите на фигуру внизу для поворота';
        this.boosterHint.classList.remove('hidden');
      } else if (mode === 'hammer') {
        this.boosterHintText.textContent = 'Нажмите на любую заполненную клетку поля';
        this.boosterHint.classList.remove('hidden');
      } else {
        this.boosterHint.classList.add('hidden');
      }
    }

    updateBoosterBadges() {
      // Поворот
      if (this.rotateCharges > 0) {
        this.badgeRotate.textContent = this.rotateCharges;
        this.badgeRotate.classList.remove('ad-badge');
      } else {
        this.badgeRotate.textContent = '+3 📺';
        this.badgeRotate.classList.add('ad-badge');
      }

      // Молот
      if (this.hammerCharges > 0) {
        this.badgeHammer.textContent = this.hammerCharges;
        this.badgeHammer.classList.remove('ad-badge');
      } else {
        this.badgeHammer.textContent = '+2 📺';
        this.badgeHammer.classList.add('ad-badge');
      }
    }

    rotateMatrix(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;
      const res = Array(cols).fill(null).map(() => Array(rows).fill(0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          res[c][rows - 1 - r] = matrix[r][c];
        }
      }
      return res;
    }

    setupEvents() {
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 100));

      // Звук кнопка
      this.btnSound.addEventListener('click', () => {
        this.sound.init();
        this.sound.enabled = !this.sound.enabled;
        this.soundIconOn.style.display = this.sound.enabled ? 'block' : 'none';
        this.soundIconOff.style.display = this.sound.enabled ? 'none' : 'block';
      });

      // Перезапуск
      this.btnRestart.addEventListener('click', () => {
        window.yaSdk.showInterstitial(() => {
          this.restartGame();
        });
      });

      // Возрождение (Rewarded Video)
      this.btnRevive.addEventListener('click', () => {
        window.yaSdk.showRewardedVideo(() => {
          this.reviveGame();
        });
      });

      // Управление мышью и тачем
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - rect.left) * (this.canvas.width / rect.width),
          y: (clientY - rect.top) * (this.canvas.height / rect.height)
        };
      };

      const startDrag = (pos, isTouch) => {
        if (this.isGameOver) return;
        this.sound.init();

        // 1. Режим бустера: Поворот фигуры
        if (this.activeMode === 'rotate') {
          for (let i = 0; i < 3; i++) {
            const piece = this.hand[i];
            if (!piece) continue;
            const slot = this.getSlotRect(i);
            if (pos.x >= slot.x && pos.x <= slot.x + slot.w && pos.y >= slot.y && pos.y <= slot.y + slot.h) {
              piece.matrix = this.rotateMatrix(piece.matrix);
              piece.rows = piece.matrix.length;
              piece.cols = piece.matrix[0].length;
              this.sound.playSwoosh();
              for (let k = 0; k < 10; k++) {
                this.particles.push(new Particle(pos.x, pos.y, piece.color));
              }
              this.rotateCharges--;
              this.updateBoosterBadges();
              this.setMode(null);
              this.checkGameOver();
              return;
            }
          }
          return;
        }

        // 2. Режим бустера: Молот (разбить одну клетку)
        if (this.activeMode === 'hammer') {
          const fullCell = this.boardRect.cellSize + this.boardRect.gap;
          const relX = pos.x - (this.boardRect.x + this.boardRect.gap);
          const relY = pos.y - (this.boardRect.y + this.boardRect.gap);
          const col = Math.floor(relX / fullCell);
          const row = Math.floor(relY / fullCell);

          if (row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE) {
            if (this.grid[row][col] !== null) {
              const color = this.grid[row][col];
              this.grid[row][col] = null;
              const cellPos = this.getCellCanvasPos(row, col);
              for (let k = 0; k < 16; k++) {
                this.particles.push(new Particle(cellPos.x + this.boardRect.cellSize / 2, cellPos.y + this.boardRect.cellSize / 2, color));
              }
              this.sound.playHammer();
              this.shakeDuration = 0.25;
              this.shakeIntensity = 12 * this.dpr;
              this.hammerCharges--;
              this.updateBoosterBadges();
              this.setMode(null);
              this.checkLines();
              this.checkGameOver();
              return;
            }
          }
          return;
        }

        // 3. Обычное перетаскивание фигуры
        for (let i = 0; i < 3; i++) {
          const piece = this.hand[i];
          if (!piece) continue;
          const slot = this.getSlotRect(i);
          if (pos.x >= slot.x && pos.x <= slot.x + slot.w && pos.y >= slot.y && pos.y <= slot.y + slot.h) {
            this.draggedPiece = piece;
            this.dragSlotIndex = i;
            this.dragX = pos.x;
            this.dragY = pos.y - (isTouch ? this.touchOffsetY : 0);
            this.sound.playPickup();
            break;
          }
        }
      };

      const moveDrag = (pos, isTouch) => {
        if (!this.draggedPiece) return;
        this.dragX = pos.x;
        this.dragY = pos.y - (isTouch ? this.touchOffsetY : 0);
      };

      const endDrag = () => {
        if (!this.draggedPiece) return;
        this.handleDrop();
        this.draggedPiece = null;
        this.dragSlotIndex = -1;
      };

      // Mouse
      this.canvas.addEventListener('mousedown', (e) => startDrag(getPos(e), false));
      window.addEventListener('mousemove', (e) => moveDrag(getPos(e), false));
      window.addEventListener('mouseup', () => endDrag());

      // Touch
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag(getPos(e), true);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (this.draggedPiece) e.preventDefault();
        moveDrag(getPos(e), true);
      }, { passive: false });

      window.addEventListener('touchend', () => endDrag());
      window.addEventListener('touchcancel', () => endDrag());
    }

    resize() {
      const wrapper = document.getElementById('canvas-wrapper');
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.dpr = dpr;

      // Высота панели бустеров (DOM) ~50px
      const boosterH = 50;
      const maxBoardW = w - 20;
      // Оставляем пространство под бустеры и руку внизу
      const availableH = h - boosterH - 120;
      const boardSize = Math.floor(Math.min(maxBoardW, availableH, w * 0.94));

      const boardMarginTop = 6;
      this.boardRect = {
        x: (w - boardSize) / 2 * dpr,
        y: boardMarginTop * dpr,
        size: boardSize * dpr,
        gap: 4 * dpr,
        cellSize: ((boardSize * dpr) - (9 * 4 * dpr)) / this.GRID_SIZE
      };

      // Позиционируем DOM-панель бустеров прямо под доской
      const boardBottomCss = boardMarginTop + boardSize;
      if (this.boostersBar) {
        this.boostersBar.style.top = (boardBottomCss + 8) + 'px';
      }

      // Зона под 3 фигуры внизу (начинается под бустерами)
      const handTopCss = boardBottomCss + 8 + boosterH + 6;
      this.handRect = {
        x: 8 * dpr,
        y: handTopCss * dpr,
        width: (w - 16) * dpr,
        height: Math.max((h - handTopCss) * dpr, 90 * dpr)
      };

      this.touchOffsetY = 70 * dpr;
    }

    getSlotRect(index) {
      const slotW = this.handRect.width / 3;
      return {
        x: this.handRect.x + index * slotW,
        y: this.handRect.y,
        w: slotW,
        h: this.handRect.height
      };
    }

    addFloatingText(x, y, text, color = '#ffea00', size = 22) {
      this.floatingTexts.push(new FloatingText(x, y, text, color, size * this.dpr));
    }

    canFitAnywhere(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;
      for (let r = 0; r <= this.GRID_SIZE - rows; r++) {
        for (let c = 0; c <= this.GRID_SIZE - cols; c++) {
          if (this.canPlace(matrix, r, c)) return true;
        }
      }
      return false;
    }

    // --- УМНАЯ ГЕНЕРАЦИЯ ФИГУР (BLOCK BLAST STYLE) ---
    spawnHand() {
      // 1. Подсчитываем заполненность поля
      let occupiedCount = 0;
      for (let r = 0; r < this.GRID_SIZE; r++) {
        for (let c = 0; c < this.GRID_SIZE; c++) {
          if (this.grid[r][c] !== null) occupiedCount++;
        }
      }
      const isCrowded = occupiedCount >= 34; // >53% поля занято

      // Легкие компактные фигуры для предотвращения тупиков
      const smallShapes = SHAPE_DEFINITIONS.filter(d => {
        const area = d.matrix.flat().reduce((a, b) => a + b, 0);
        return area <= 3;
      });

      for (let i = 0; i < 3; i++) {
        let pool = SHAPE_DEFINITIONS;
        // Если поле сильно заполнено, повышаем шанс выдачи небольших фигур
        if (isCrowded && (i === 0 || Math.random() < 0.65)) {
          pool = smallShapes;
        }

        const def = pool[Math.floor(Math.random() * pool.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.hand[i] = {
          matrix: def.matrix,
          color: color,
          scale: 0.75, // Масштаб в нижнем слоте
          cols: def.matrix[0].length,
          rows: def.matrix.length
        };
      }

      // Фирменная гарантия Block Blast: гарантируем, что хотя бы 1 фигура влезает на доску
      let hasValidMove = false;
      for (let i = 0; i < 3; i++) {
        if (this.canFitAnywhere(this.hand[i].matrix)) {
          hasValidMove = true;
          break;
        }
      }

      // Если ни одна не влезает, заменяем последнюю на гарантированно подходящую
      if (!hasValidMove) {
        for (const candidate of smallShapes) {
          if (this.canFitAnywhere(candidate.matrix)) {
            this.hand[2] = {
              matrix: candidate.matrix,
              color: COLORS[Math.floor(Math.random() * COLORS.length)],
              scale: 0.75,
              cols: candidate.matrix[0].length,
              rows: candidate.matrix.length
            };
            break;
          }
        }
      }

      this.checkGameOver();
    }

    // --- ПРОВЕРКА ВОЗМОЖНОСТИ РАЗМЕЩЕНИЯ ---
    canPlace(matrix, startRow, startCol) {
      const rows = matrix.length;
      const cols = matrix[0].length;

      if (startRow < 0 || startCol < 0 || startRow + rows > this.GRID_SIZE || startCol + cols > this.GRID_SIZE) {
        return false;
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c] === 1) {
            if (this.grid[startRow + r][startCol + c] !== null) {
              return false;
            }
          }
        }
      }
      return true;
    }

    // Найти координаты клетки сетки под перетаскиваемой фигурой
    getHoveredGridCell(piece, dragX, dragY) {
      const cellSize = this.boardRect.cellSize;
      const gap = this.boardRect.gap;
      const fullCell = cellSize + gap;

      // Центрируем фигуру относительно курсора/пальца
      const piecePixelW = piece.cols * fullCell;
      const piecePixelH = piece.rows * fullCell;
      const originX = dragX - piecePixelW / 2;
      const originY = dragY - piecePixelH / 2;

      // Смещение относительно левого верхнего угла доски с учетом отступа gap
      const relX = originX - (this.boardRect.x + this.boardRect.gap);
      const relY = originY - (this.boardRect.y + this.boardRect.gap);

      const col = Math.round(relX / fullCell);
      const row = Math.round(relY / fullCell);

      return { row, col };
    }

    // --- ДРОП ФИГУРЫ И ОБРАБОТКА ХОДА ---
    handleDrop() {
      const piece = this.draggedPiece;
      const { row, col } = this.getHoveredGridCell(piece, this.dragX, this.dragY);

      if (this.canPlace(piece.matrix, row, col)) {
        // Устанавливаем блоки на сетку
        let placedCount = 0;
        for (let r = 0; r < piece.rows; r++) {
          for (let c = 0; c < piece.cols; c++) {
            if (piece.matrix[r][c] === 1) {
              this.grid[row + r][col + c] = piece.color;
              placedCount++;
            }
          }
        }

        this.sound.playPlace();
        this.addScore(placedCount);
        this.hand[this.dragSlotIndex] = null;

        // Всплывающее число очков за размещение (Block Blast floatie)
        const dropCenter = this.getCellCanvasPos(
          Math.min(row + Math.floor(piece.rows / 2), this.GRID_SIZE - 1),
          Math.min(col + Math.floor(piece.cols / 2), this.GRID_SIZE - 1)
        );
        this.addFloatingText(dropCenter.x + this.boardRect.cellSize / 2, dropCenter.y, `+${placedCount}`, '#00e5ff', 18);

        // Проверяем заполненные линии (по горизонтали и вертикали)
        this.checkLines();

        // Если в руке не осталось фигур — выдаем 3 новые
        if (this.hand.every(p => p === null)) {
          this.spawnHand();
        } else {
          this.checkGameOver();
        }
      }
    }

    // --- ПРОВЕРКА ЛИНИЙ И КОМБО ---
    checkLines() {
      const rowsToClear = [];
      const colsToClear = [];

      // Проверка строк
      for (let r = 0; r < this.GRID_SIZE; r++) {
        if (this.grid[r].every(cell => cell !== null)) {
          rowsToClear.push(r);
        }
      }

      // Проверка колонок
      for (let c = 0; c < this.GRID_SIZE; c++) {
        let full = true;
        for (let r = 0; r < this.GRID_SIZE; r++) {
          if (this.grid[r][c] === null) {
            full = false;
            break;
          }
        }
        if (full) colsToClear.push(c);
      }

      const totalLines = rowsToClear.length + colsToClear.length;

      if (totalLines > 0) {
        this.comboCount++;

        const b = this.boardRect;
        const fullCell = b.cellSize + b.gap;

        // Вспышки лазеров вдоль сгорающих строк и столбцов
        rowsToClear.forEach(r => {
          this.lineFlashes.push(new LineFlash(b.x, b.y + r * fullCell + b.gap, b.size, b.cellSize, '#00e5ff'));
        });
        colsToClear.forEach(c => {
          this.lineFlashes.push(new LineFlash(b.x + c * fullCell + b.gap, b.y, b.cellSize, b.size, '#ff3d71'));
        });

        // Очищаем клетки и создаем частицы
        const clearedCells = new Set();
        rowsToClear.forEach(r => {
          for (let c = 0; c < this.GRID_SIZE; c++) clearedCells.add(`${r},${c}`);
        });
        colsToClear.forEach(c => {
          for (let r = 0; r < this.GRID_SIZE; r++) clearedCells.add(`${r},${c}`);
        });

        clearedCells.forEach(coord => {
          const [r, c] = coord.split(',').map(Number);
          const color = this.grid[r][c] || COLORS[0];
          this.grid[r][c] = null;

          // Спавн частиц
          const cellPos = this.getCellCanvasPos(r, c);
          for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(
              cellPos.x + this.boardRect.cellSize / 2,
              cellPos.y + this.boardRect.cellSize / 2,
              color
            ));
          }
        });

        // Начисление комбо-очков
        const linePoints = totalLines * 100 * this.comboCount;
        this.addScore(linePoints);

        // Всплывающий комбо-текст над полем
        const comboFloatText = this.comboCount > 1 ? `+${linePoints} COMBO x${this.comboCount}!` : `+${linePoints}!`;
        this.addFloatingText(b.x + b.size / 2, b.y + b.size / 2 - 10, comboFloatText, '#ffea00', 28);

        // Звуки и тряска экрана
        this.sound.playClear(this.comboCount);
        this.shakeDuration = 0.28;
        this.shakeIntensity = Math.min(8 * this.dpr + this.comboCount * 3, 22 * this.dpr);

        // Показ комбо-текста в оверлее
        this.showComboUI(this.comboCount, totalLines);

        // Фирменная механика Block Blast: ЧИСТОЕ ПОЛЕ (All Clear bonus)
        const isCleanBoard = this.grid.every(row => row.every(cell => cell === null));
        if (isCleanBoard) {
          const cleanBonus = 500;
          this.addScore(cleanBonus);
          this.sound.playFanfare();
          this.shakeDuration = 0.55;
          this.shakeIntensity = 20 * this.dpr;
          this.addFloatingText(b.x + b.size / 2, b.y + b.size / 2 + 40, 'ЧИСТОЕ ПОЛЕ! +500', '#00e5ff', 32);
          this.showComboUI(99, 0, 'ЧИСТОЕ ПОЛЕ!');
          for (let k = 0; k < 50; k++) {
            this.particles.push(new Particle(
              b.x + Math.random() * b.size,
              b.y + Math.random() * b.size,
              COLORS[k % COLORS.length]
            ));
          }
        }
      } else {
        // Сброс комбо, если ход не сжег ни одной линии
        this.comboCount = 0;
      }
    }

    showComboUI(combo, lines) {
      if (combo <= 1 && lines === 1) return; // Для одиночной линии не спамим

      const praiseWords = ['ОТЛИЧНО!', 'КРУТО!', 'ВЕЛИКОЛЕПНО!', 'НЕВЕРОЯТНО!', 'БЕЗУМИЕ!', 'БОЖЕСТВЕННО!'];
      const word = praiseWords[Math.min(combo - 1, praiseWords.length - 1)];

      this.comboTitle.textContent = combo > 1 ? `COMBO x${combo}!` : `${lines} ЛИНИИ!`;
      this.comboSubtitle.textContent = word;
      this.comboPopup.classList.remove('hidden');

      clearTimeout(this.comboTimer);
      this.comboTimer = setTimeout(() => {
        this.comboPopup.classList.add('hidden');
      }, 1000);
    }

    // --- ПРОВЕРКА GAME OVER ---
    checkGameOver() {
      // Ищем, есть ли хоть одна фигура в руке, которую можно разместить хоть куда-то
      let canMove = false;

      for (let i = 0; i < 3; i++) {
        const piece = this.hand[i];
        if (!piece) continue;

        for (let r = 0; r <= this.GRID_SIZE - piece.rows; r++) {
          for (let c = 0; c <= this.GRID_SIZE - piece.cols; c++) {
            if (this.canPlace(piece.matrix, r, c)) {
              canMove = true;
              break;
            }
          }
          if (canMove) break;
        }
        if (canMove) break;
      }

      if (!canMove && this.hand.some(p => p !== null)) {
        this.triggerGameOver();
      }
    }

    triggerGameOver() {
      this.isGameOver = true;
      this.sound.playGameOver();

      const isNewRecord = this.score > this.bestScore;
      if (isNewRecord) {
        this.bestScore = this.score;
        this.bestScoreEl.textContent = this.bestScore.toLocaleString();
        window.yaSdk.saveBestScore(this.bestScore);
        this.newRecordBadge.classList.remove('hidden');
      } else {
        this.newRecordBadge.classList.add('hidden');
      }

      this.finalScoreEl.textContent = this.score.toLocaleString();

      // Возможность возродиться через Rewarded Video (1 раз за игру)
      if (this.canRevive) {
        this.btnRevive.classList.remove('hidden');
      } else {
        this.btnRevive.classList.add('hidden');
      }

      setTimeout(() => {
        this.gameOverModal.classList.remove('hidden');
      }, 500);
    }

    restartGame() {
      this.grid = Array(this.GRID_SIZE).fill(null).map(() => Array(this.GRID_SIZE).fill(null));
      this.score = 0;
      this.comboCount = 0;
      this.isGameOver = false;
      this.canRevive = true;
      this.setMode(null);
      this.scoreEl.textContent = '0';
      this.gameOverModal.classList.add('hidden');
      this.spawnHand();
    }

    reviveGame() {
      // Бонус за рекламу: освобождаем центральную область 4x4
      for (let r = 2; r < 6; r++) {
        for (let c = 2; c < 6; c++) {
          if (this.grid[r][c] !== null) {
            const color = this.grid[r][c];
            this.grid[r][c] = null;
            const pos = this.getCellCanvasPos(r, c);
            for (let i = 0; i < 5; i++) {
              this.particles.push(new Particle(pos.x + 20, pos.y + 20, color));
            }
          }
        }
      }
      this.canRevive = false;
      this.isGameOver = false;
      this.gameOverModal.classList.add('hidden');
      this.checkGameOver();
    }

    addScore(points) {
      this.score += points;
      this.scoreEl.textContent = this.score.toLocaleString();
    }

    getCellCanvasPos(r, c) {
      const fullCell = this.boardRect.cellSize + this.boardRect.gap;
      return {
        x: this.boardRect.x + c * fullCell + this.boardRect.gap,
        y: this.boardRect.y + r * fullCell + this.boardRect.gap
      };
    }

    // --- РЕНДЕРИНГ БЛОКА СО СТИЛЬНЫМ 3D ЭФФЕКТОМ ---
    drawTile(x, y, size, color, alpha = 1) {
      const ctx = this.ctx;
      const radius = Math.max(4 * this.dpr, 4);

      ctx.save();
      ctx.globalAlpha = alpha;

      // Основное тело блока
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, size, size, radius);
      } else {
        ctx.rect(x, y, size, size);
      }
      ctx.fillStyle = color.main;
      ctx.fill();

      // Верхний блик (свет)
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x + 2, y + 2, size - 4, size * 0.45, [radius, radius, 0, 0]);
      } else {
        ctx.rect(x + 2, y + 2, size - 4, size * 0.45);
      }
      const grad = ctx.createLinearGradient(x, y, x, y + size * 0.45);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Тонкая внутренняя обводка для четкости
      ctx.lineWidth = 1 * this.dpr;
      ctx.strokeStyle = color.light;
      ctx.stroke();

      ctx.restore();
    }

    // --- ИГРОВОЙ ЦИКЛ ---
    loop(time) {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      this.update(dt);
      this.render();

      requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
      // Обновление тряски экрана
      if (this.shakeDuration > 0) {
        this.shakeDuration -= dt;
      }

      // Обновление частиц и эффектов
      this.particles = this.particles.filter(p => p.update(dt));
      this.lineFlashes = this.lineFlashes.filter(f => f.update(dt));
      this.floatingTexts = this.floatingTexts.filter(t => t.update(dt));
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.save();

      // Применяем тряску экрана
      if (this.shakeDuration > 0) {
        const ox = (Math.random() - 0.5) * this.shakeIntensity;
        const oy = (Math.random() - 0.5) * this.shakeIntensity;
        ctx.translate(ox, oy);
      }

      // 1. Рисуем сетку 8х8
      this.renderBoard();

      // 1.5 Вспышки лазеров при сгорании линий
      this.lineFlashes.forEach(f => f.draw(ctx));

      // 2. Рисуем частицы
      this.particles.forEach(p => p.draw(ctx));

      // 2.5 Всплывающий текст с очками (+10, +240, COMBO x3)
      this.floatingTexts.forEach(t => t.draw(ctx));

      // 3. Рисуем 3 слота внизу
      this.renderHand();

      // 4. Рисуем перетаскиваемую фигуру поверх всего
      if (this.draggedPiece) {
        this.renderDraggedPiece();
      }

      ctx.restore();
    }

    renderBoard() {
      const ctx = this.ctx;
      const b = this.boardRect;
      const fullCell = b.cellSize + b.gap;

      // Полупрозрачная подложка всей доски
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.size, b.size, 16 * this.dpr);
      ctx.fillStyle = 'rgba(18, 24, 38, 0.75)';
      ctx.fill();
      ctx.lineWidth = 2 * this.dpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();
      ctx.restore();

      // Отрисовка ячеек
      for (let r = 0; r < this.GRID_SIZE; r++) {
        for (let c = 0; c < this.GRID_SIZE; c++) {
          const x = b.x + c * fullCell + b.gap;
          const y = b.y + r * fullCell + b.gap;
          const cell = this.grid[r][c];

          if (cell !== null) {
            this.drawTile(x, y, b.cellSize, cell);
          } else {
            // Пустая темная ячейка со скруглением
            ctx.beginPath();
            ctx.roundRect(x, y, b.cellSize, b.cellSize, 6 * this.dpr);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fill();
          }
        }
      }

      // 1.1 Превью размещения (Ghost block) при перетаскивании
      if (this.draggedPiece) {
        const { row, col } = this.getHoveredGridCell(this.draggedPiece, this.dragX, this.dragY);
        if (this.canPlace(this.draggedPiece.matrix, row, col)) {
          for (let r = 0; r < this.draggedPiece.rows; r++) {
            for (let c = 0; c < this.draggedPiece.cols; c++) {
              if (this.draggedPiece.matrix[r][c] === 1) {
                const x = b.x + (col + c) * fullCell + b.gap;
                const y = b.y + (row + r) * fullCell + b.gap;
                this.drawTile(x, y, b.cellSize, this.draggedPiece.color, 0.45);
              }
            }
          }
        }
      }
    }

    renderHand() {
      for (let i = 0; i < 3; i++) {
        // Если фигура перетаскивается прямо сейчас, не рисуем её в нижнем слоте
        if (this.dragSlotIndex === i) continue;

        const piece = this.hand[i];
        if (!piece) continue;

        const slot = this.getSlotRect(i);
        const miniCell = this.boardRect.cellSize * 0.65;
        const pieceW = piece.cols * miniCell;
        const pieceH = piece.rows * miniCell;
        const startX = slot.x + (slot.w - pieceW) / 2;
        const startY = slot.y + (slot.h - pieceH) / 2;

        for (let r = 0; r < piece.rows; r++) {
          for (let c = 0; c < piece.cols; c++) {
            if (piece.matrix[r][c] === 1) {
              this.drawTile(startX + c * miniCell, startY + r * miniCell, miniCell - 2 * this.dpr, piece.color);
            }
          }
        }
      }
    }

    renderDraggedPiece() {
      const piece = this.draggedPiece;
      const cellSize = this.boardRect.cellSize;
      const gap = this.boardRect.gap;
      const fullCell = cellSize + gap;

      const piecePixelW = piece.cols * fullCell;
      const piecePixelH = piece.rows * fullCell;
      const startX = this.dragX - piecePixelW / 2;
      const startY = this.dragY - piecePixelH / 2;

      for (let r = 0; r < piece.rows; r++) {
        for (let c = 0; c < piece.cols; c++) {
          if (piece.matrix[r][c] === 1) {
            this.drawTile(startX + c * fullCell, startY + r * fullCell, cellSize, piece.color, 0.95);
          }
        }
      }
    }
  }

  // Запуск игры после загрузки DOM
  window.addEventListener('DOMContentLoaded', () => {
    new BlockBlastGame();
  });
})();
