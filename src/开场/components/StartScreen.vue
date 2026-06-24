<template>
  <div class="start-screen" :class="{ 'ink-out': 离场中 }">
    <!-- 远景山水（水墨剪影） -->
    <svg class="mountains" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#08070a" stop-opacity="0"/>
          <stop offset="100%" stop-color="#050407" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a181c" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#050407" stop-opacity="0.98"/>
        </linearGradient>
        <!-- 飞白水墨笔触滤镜 -->
        <filter id="ink-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="7"/>
          <feDisplacementMap in="SourceGraphic" scale="6"/>
        </filter>
      </defs>
      <!-- 第三层 远山 -->
      <path d="M0,260 L120,180 L200,220 L320,140 L460,210 L600,150 L760,220 L900,170 L1050,230 L1200,180 L1200,400 L0,400 Z"
            fill="url(#ink)" opacity="0.5" filter="url(#ink-rough)"/>
      <!-- 第二层 中山 -->
      <path d="M0,310 L80,260 L180,290 L280,230 L400,290 L520,240 L680,300 L820,250 L960,310 L1100,260 L1200,290 L1200,400 L0,400 Z"
            fill="url(#ink)" opacity="0.78" filter="url(#ink-rough)"/>
      <!-- 前景山 -->
      <path d="M0,360 L100,320 L240,350 L380,310 L520,360 L680,320 L820,360 L980,330 L1120,360 L1200,340 L1200,400 L0,400 Z"
            fill="#050407" opacity="0.96"/>
      <!-- 一只墨色飞鸟 -->
      <path class="crow"
            d="M -40,90 Q -30,80 -20,90 Q -10,80 0,90 M 5,92 Q 15,82 25,92 Q 35,82 45,92"
            stroke="#1a181c" stroke-width="1.4" fill="none" opacity="0.65"/>
      <!-- 雾气覆盖 -->
      <rect x="0" y="180" width="1200" height="220" fill="url(#mist)"/>
    </svg>

    <!-- 墨点 / 飞白溅射粒子（深色＋少量血色） -->
    <div class="particles">
      <span v-for="i in 22" :key="i" class="p" :class="粒子类(i)" :style="粒子样式(i)"></span>
    </div>

    <!-- 顶部水墨飞溅笔触 -->
    <svg class="splatter top" viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,60 Q120,10 240,45 T480,30 T600,50 L600,0 L0,0 Z"
            fill="#0a090d" opacity="0.85"/>
      <circle cx="120" cy="78" r="2.5" fill="#1a181c" opacity="0.6"/>
      <circle cx="380" cy="88" r="1.6" fill="#1a181c" opacity="0.5"/>
      <circle cx="510" cy="72" r="3" fill="#1a181c" opacity="0.55"/>
    </svg>

    <!-- 主内容 -->
    <div class="content">
      <div class="brand-mark">
        <span class="bracket left">「</span>
        <span class="brand-text">玄 道 谶 言</span>
        <span class="bracket right">」</span>
      </div>

      <h1 class="title">
        <span class="ch shadow">黑</span>
        <span class="ch shadow">色</span>
        <span class="spacer"></span>
        <span class="ch shadow">修</span>
        <span class="ch shadow">士</span>
      </h1>

      <div class="ornament">
        <span class="line"></span>
        <span class="brush-stroke"></span>
        <span class="line"></span>
      </div>

      <p class="subtitle">墨染长夜 · 道在血中</p>

      <p class="lore">
        天地有大恶，藏于云雾之下；<br/>
        正道有玄机，匿于黑袍之中。<br/>
        墨影孤行——你，便是那执灯之人。
      </p>

      <!-- 模式三选：点击「踏入此道」后才显示 -->
      <Transition name="mode-in">
        <div v-if="已踏入" class="mode-pick">
          <button
            v-for="m in 模式选项"
            :key="m.值"
            class="mode-card"
            :class="{ active: 选中 === m.值, locked: m.锁定 }"
            :disabled="m.锁定"
            @click="选(m.值)"
          >
            <span class="m-name">{{ m.名 }}</span>
            <span v-if="m.锁定" class="m-lock">敬请期待</span>
          </button>
        </div>
      </Transition>

      <button v-if="!已踏入" class="enter-btn" @click="踏入">
        <span class="text">
          <i class="icon">☯</i>
          <span class="label">踏 入 此 道</span>
          <i class="icon">☯</i>
        </span>
        <span class="btn-ink"></span>
      </button>

      <button v-else class="enter-btn" :disabled="选中 === null" @click="开始">
        <span class="text">
          <i class="icon">☯</i>
          <span class="label">{{ 选中 ? '入 局' : '请择一道' }}</span>
          <i class="icon">☯</i>
        </span>
        <span class="btn-ink"></span>
      </button>

      <p class="footer">— 一念入魔 · 万古寂寥 —</p>
    </div>

    <!-- 角落水墨飞溅装饰 -->
    <svg class="corner tl" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M0,0 L60,0 Q40,10 20,30 Q10,50 0,60 Z" fill="#0a090d" opacity="0.7"/>
      <circle cx="48" cy="22" r="2" fill="#1a181c" opacity="0.6"/>
      <circle cx="30" cy="38" r="1.5" fill="#1a181c" opacity="0.5"/>
    </svg>
    <svg class="corner br" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M100,100 L40,100 Q60,90 80,70 Q90,50 100,40 Z" fill="#0a090d" opacity="0.7"/>
      <circle cx="52" cy="78" r="2" fill="#1a181c" opacity="0.6"/>
      <circle cx="70" cy="62" r="1.5" fill="#1a181c" opacity="0.5"/>
    </svg>

    <!-- 水墨晕开过渡层 -->
    <div v-if="离场中" class="ink-overlay">
      <span class="splash"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { 捏角模式 } from '../draft';

const emit = defineEmits<{ enter: [mode: 捏角模式] }>();
const 离场中 = ref(false);
const 已踏入 = ref(false);
const 选中 = ref<捏角模式 | null>(null);

const 模式选项: { 值: 捏角模式; 名: string; 锁定?: boolean }[] = [
  { 值: '普通', 名: '普通模式' },
  { 值: '自由', 名: '自由模式' },
  { 值: '开挂', 名: '开挂模式' },
];

function 踏入() {
  已踏入.value = true;
}

function 选(m: 捏角模式) {
  选中.value = m;
}

function 开始() {
  if (选中.value === null || 离场中.value) return;
  离场中.value = true;
  setTimeout(() => emit('enter', 选中.value as 捏角模式), 1100);
}

// 给每个粒子生成不同的位置/延时/速度
function 粒子样式(i: number) {
  const seed = (i * 1664525 + 1013904223) % 1000 / 1000;
  const seed2 = (i * 22695477 + 1) % 997 / 997;
  return {
    left: `${(seed * 100).toFixed(2)}%`,
    animationDelay: `${(seed2 * 14).toFixed(2)}s`,
    animationDuration: `${(10 + seed * 12).toFixed(2)}s`,
    opacity: 0.25 + seed2 * 0.55,
    transform: `scale(${0.5 + seed * 1.4})`,
  };
}

// 偶尔几颗血色墨点
function 粒子类(i: number) {
  return (i % 7 === 0) ? 'blood' : 'ink';
}
</script>

<style scoped lang="scss">
@use './theme' as *;

// 本组件局部覆盖：以墨黑为主，金色仅作微弱点缀
$bg-ink:     #050407;
$bg-soft:    #0a090d;
$ink-line:   #1a181c;
$paper-cold: #cfc8b8;     // 偏冷的宣纸白
$paper-dim:  #a09888;     // 提亮，原 #8a8378
$blood:      #6b1a1a;     // 暗血红
$blood-glow: #a83333;

.start-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  // 手机窄屏（< 520px）改为纵向卡片比例
  @include mobile { aspect-ratio: 3 / 4; }
  min-height: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 35%, #14111a 0%, $bg-ink 60%, #020103 100%),
    $bg-ink;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-serif;
  color: $paper-cold;
  isolation: isolate;
  transition: filter 0.6s ease;

  // 暗角 + 微噪点纸感
  &::before {
    content: "";
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%),
      repeating-linear-gradient(
        45deg,
        rgba(255,255,255,0.012) 0 1px,
        transparent 1px 3px
      );
    pointer-events: none;
    z-index: 4;
  }

  &.ink-out { filter: blur(2px) brightness(0.5); }
}

// 山水
.mountains {
  position: absolute;
  inset: auto 0 0 0;
  width: 100%;
  height: 68%;
  z-index: 1;
  pointer-events: none;

  .crow {
    animation: fly 18s linear infinite;
    transform-origin: center;
  }
}
@keyframes fly {
  0%   { transform: translate(20%, 35%);  opacity: 0; }
  10%  { opacity: 0.7; }
  50%  { transform: translate(60%, 28%);  opacity: 0.7; }
  90%  { opacity: 0; }
  100% { transform: translate(110%, 40%); opacity: 0; }
}

// 顶部 / 角落水墨飞溅
.splatter.top {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 80px;
  z-index: 2;
  pointer-events: none;
}
.corner {
  position: absolute;
  width: clamp(60px, 14vw, 140px);
  height: clamp(60px, 14vw, 140px);
  z-index: 2;
  pointer-events: none;

  &.tl { top: 0; left: 0; }
  &.br { bottom: 0; right: 0; }
}

// 粒子
.particles {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;

  .p {
    position: absolute;
    top: -10px;
    width: 4px; height: 4px;
    border-radius: 50%;
    animation: drift linear infinite;
    filter: blur(0.4px);
  }
  .p.ink {
    background: radial-gradient(circle, $ink-line 0%, rgba(26,24,28,0.4) 60%, transparent 100%);
  }
  .p.blood {
    width: 3px; height: 3px;
    background: radial-gradient(circle, $blood-glow 0%, $blood 50%, transparent 100%);
    box-shadow: 0 0 6px rgba(168,51,51,0.35);
  }
}

@keyframes drift {
  0%   { transform: translate3d(0, -10px, 0); opacity: 0; }
  10%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translate3d(20px, 720px, 0); opacity: 0; }
}

// 主内容
.content {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 1.2rem;
  animation: rise 1.4s ease-out;
  @include mobile { padding: 0.6rem; }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
}

// 上方小品牌标
.brand-mark {
  display: inline-flex; align-items: baseline;
  color: $paper-dim;
  font-size: clamp(0.7rem, 2vw, 0.85rem);
  letter-spacing: 0.5em;
  text-indent: 0.5em;
  margin-bottom: 1.4rem;
  @include mobile { margin-bottom: 0.8rem; }

  .bracket {
    color: $paper-dim;
    font-size: 1.4em;
    letter-spacing: 0;
    text-indent: 0;
    opacity: 0.7;
  }
  .brand-text {
    padding: 0 0.6em;
    color: $paper-dim;
    opacity: 0.85;
  }
}

// 主标题（毛笔字）
.title {
  display: flex; justify-content: center; align-items: center;
  flex-wrap: nowrap;
  margin: 0.4rem 0 1.2rem;
  font-size: clamp(3.4rem, 14vw, 6.2rem);
  @include mobile {
    font-size: clamp(2.6rem, 18vw, 4rem);
    margin: 0.3rem 0 0.9rem;
  }
  font-weight: normal;
  letter-spacing: 0;
  line-height: 1.05;
  font-family: $font-brush;

  .ch {
    display: inline-block;
    color: $paper-cold;
    font-family: $font-brush;
    text-shadow:
      0 0 1px rgba(255,255,255,0.4),
      0 0 18px rgba(255,255,255,0.18),
      0 2px 0 #000,
      0 4px 14px rgba(0,0,0,0.95);
    animation: char-in 1s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
    position: relative;
    // 让毛笔字看起来更"湿润"，加点墨迹滤镜
    filter: contrast(1.1);
  }
  .ch:nth-child(1) { animation-delay: 0.1s; }
  .ch:nth-child(2) { animation-delay: 0.3s; }
  .ch:nth-child(4) { animation-delay: 0.55s; }
  .ch:nth-child(5) { animation-delay: 0.75s; }

  // "黑色" 两字偏暗调
  .ch:nth-child(1), .ch:nth-child(2) {
    color: #b8b0a4;
    background: linear-gradient(180deg, #d8d0c0 0%, #7a7268 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  // "修士" 两字：暖色金属渐变（去除红光晕，改为细腻发光）
  .ch:nth-child(4), .ch:nth-child(5) {
    background: linear-gradient(180deg, #f2e6c0 0%, #c9b48a 55%, #6e5d3a 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .spacer {
    display: inline-block;
    width: 0.5em;
    position: relative;
    &::after {
      content: "·";
      position: absolute;
      left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      color: $paper-dim;
      opacity: 0.55;
      font-size: 0.6em;
      font-family: $font-serif;
    }
  }
}

@keyframes char-in {
  0%   { opacity: 0; transform: translateY(20px) scale(0.85); filter: blur(8px); }
  100% { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0); }
}

// 装饰横线 + 中间笔触
.ornament {
  display: flex; align-items: center; justify-content: center;
  gap: 0.8rem; margin: 0.6rem 0 1rem;

  .line {
    display: inline-block;
    width: clamp(50px, 14vw, 110px);
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(207,200,184,0.5) 40%,
      rgba(207,200,184,0.7) 50%,
      rgba(207,200,184,0.5) 60%,
      transparent);
  }
  .brush-stroke {
    display: inline-block;
    width: 28px; height: 6px;
    background: radial-gradient(ellipse at center,
      $ink-line 0%, rgba(26,24,28,0.7) 50%, transparent 100%);
    transform: rotate(-12deg);
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0,0,0,0.6);
  }
}

.subtitle {
  margin: 0.4rem 0;
  color: $paper-cold;
  opacity: 0.78;
  font-size: clamp(0.9rem, 3vw, 1.1rem);
  letter-spacing: 0.45em;
  text-indent: 0.45em;
  @include mobile { font-size: clamp(0.75rem, 3.5vw, 0.9rem); }
}

.lore {
  margin: 1.2rem auto 1.6rem;
  max-width: 28em;
  color: $paper-dim;
  line-height: 2;
  font-size: clamp(0.78rem, 2.3vw, 0.92rem);
  letter-spacing: 0.1em;
  @include mobile {
    margin: 0.9rem auto 1.2rem;
    font-size: clamp(0.7rem, 3vw, 0.82rem);
    line-height: 1.8;
  }
}

// 模式三选
.mode-pick {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin: 0.4rem auto 1rem;
  flex-wrap: wrap;
  @include mobile { gap: 0.4rem; }

  .mode-card {
    @include xianxia-btn;
    flex: 1;
    min-width: 7rem;
    max-width: 11rem;
    padding: 0.7rem 0.7rem;
    text-align: center;
    position: relative;
    @include mobile { min-width: 5.5rem; padding: 0.55rem 0.4rem; }

    .m-name {
      font-size: 1rem;
      letter-spacing: 0.15em;
      color: $paper-cold;
      @include mobile { font-size: 0.85rem; }
    }
    .m-lock {
      position: absolute;
      top: 4px; right: 6px;
      font-size: 0.55rem;
      color: $blood-glow;
      opacity: 0.7;
      letter-spacing: 0.1em;
    }

    &.active {
      background: linear-gradient(180deg, $blood-glow 0%, $blood-mid 55%, $blood 100%);
      color: #f4e8d8;
      border-color: $blood-bright;
      box-shadow:
        inset 0 0 14px rgba(255,200,200,0.18),
        0 0 14px rgba(168,51,51,0.4);
      .m-name { color: #f4e8d8; }
    }
    &.locked {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(0.6);
    }
  }
}

// 进入按钮：水墨签文风
.enter-btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  margin: 0.8rem auto;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: $font-serif;
  isolation: isolate;
  @include mobile { margin: 0.5rem auto; }

  .text {
    position: relative;
    display: inline-flex; align-items: center; gap: 1rem;
    padding: 0.85rem 2.4rem;
    @include mobile {
      padding: 0.65rem 1.4rem;
      gap: 0.5rem;
    }
    background:
      linear-gradient(180deg,
        rgba(20,17,26,0.85) 0%,
        rgba(10,9,13,0.95) 100%);
    border: 1px solid rgba(207,200,184,0.35);
    border-radius: 1px;
    color: $paper-cold;
    font-size: clamp(0.95rem, 3vw, 1.15rem);
    letter-spacing: 0.05em;
    box-shadow:
      inset 0 0 18px rgba(0,0,0,0.7),
      0 0 0 6px rgba(0,0,0,0),    // 用 outer ring 模拟水墨外圈
      0 4px 24px rgba(0,0,0,0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    @include mobile { font-size: clamp(0.85rem, 4vw, 1rem); }

    // 四角小墨点
    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      background-image:
        radial-gradient(circle 2px, $paper-cold 100%, transparent 0),
        radial-gradient(circle 2px, $paper-cold 100%, transparent 0),
        radial-gradient(circle 2px, $paper-cold 100%, transparent 0),
        radial-gradient(circle 2px, $paper-cold 100%, transparent 0);
      background-position:
        2px 2px,
        calc(100% - 2px) 2px,
        2px calc(100% - 2px),
        calc(100% - 2px) calc(100% - 2px);
      background-size: 4px 4px;
      background-repeat: no-repeat;
      opacity: 0.6;
      pointer-events: none;
    }

    .label {
      letter-spacing: 0.5em;
      text-indent: 0.5em;
    }
    .icon {
      font-style: normal;
      font-size: 1em;
      color: $paper-cold;
      opacity: 0.7;
      letter-spacing: 0;
    }
  }

  // 悬浮时的水墨晕染层
  .btn-ink {
    position: absolute;
    inset: -8px;
    z-index: -1;
    border-radius: 4px;
    background:
      radial-gradient(ellipse at 30% 40%, rgba(168,51,51,0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(26,24,28,0.7) 0%, transparent 55%);
    opacity: 0;
    transform: scale(0.85);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(6px);
  }

  &:hover {
    .text {
      color: #fff;
      border-color: $paper-cold;
      background:
        linear-gradient(180deg,
          rgba(40,30,30,0.95) 0%,
          rgba(15,8,8,0.98) 100%);
      box-shadow:
        inset 0 0 30px rgba(168,51,51,0.25),
        0 0 0 1px rgba(207,200,184,0.4),
        0 4px 32px rgba(120,20,20,0.4);
      .icon { color: $blood-glow; opacity: 1; text-shadow: 0 0 8px rgba(168,51,51,0.6); }
    }
    .btn-ink { opacity: 1; transform: scale(1.1); }
  }
  &:active .text { transform: translateY(1px); }

  &:disabled {
    cursor: not-allowed;
    .text {
      opacity: 0.45;
      filter: grayscale(0.6);
    }
    .btn-ink { display: none; }
    &:hover .text {
      color: $paper-cold;
      border-color: rgba(207,200,184,0.35);
      background:
        linear-gradient(180deg,
          rgba(20,17,26,0.85) 0%,
          rgba(10,9,13,0.95) 100%);
      box-shadow:
        inset 0 0 18px rgba(0,0,0,0.7),
        0 4px 24px rgba(0,0,0,0.6);
      .icon { color: $paper-cold; opacity: 0.7; text-shadow: none; }
    }
  }
}

// 模式选择淡入
.mode-in-enter-active { transition: opacity 0.5s ease, transform 0.5s ease; }
.mode-in-leave-active { transition: opacity 0.3s ease; }
.mode-in-enter-from { opacity: 0; transform: translateY(12px); }
.mode-in-leave-to { opacity: 0; }

.footer {
  margin-top: 1.4rem;
  color: rgba(207,200,184,0.4);
  font-size: clamp(0.7rem, 2vw, 0.82rem);
  letter-spacing: 0.5em;
  text-indent: 0.5em;
}

// === 水墨晕开过渡 ===
.ink-overlay {
  position: absolute;
  inset: 0;
  z-index: 99;
  pointer-events: none;

  .splash {
    position: absolute;
    top: 50%; left: 50%;
    width: 12px; height: 12px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 30%, rgba(168,51,51,0.4) 0%, transparent 25%),
      radial-gradient(circle, #050407 30%, #0a090d 60%, rgba(5,4,7,0) 100%);
    transform: translate(-50%, -50%) scale(0);
    animation: ink-bloom 1.1s cubic-bezier(0.6, 0, 0.4, 1) forwards;
    filter: blur(0);
  }
}

@keyframes ink-bloom {
  0%   { transform: translate(-50%, -50%) scale(0);    opacity: 0;   filter: blur(0); }
  20%  { opacity: 1; filter: blur(2px); }
  100% { transform: translate(-50%, -50%) scale(70);   opacity: 1;   filter: blur(8px); }
}
</style>
