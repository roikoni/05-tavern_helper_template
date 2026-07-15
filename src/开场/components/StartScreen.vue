<template>
  <div class="start-screen" :class="{ 'ink-out': 离场中 }">
    <!-- 漫天飘雪 -->
    <div class="snow-field" aria-hidden="true">
      <span class="snow-veil veil-a"></span>
      <span class="snow-veil veil-b"></span>
      <span
        v-for="flake in snowParticles"
        :key="flake.id"
        class="snowflake"
        :style="flake.style"
      ></span>
    </div>

    <!-- 标题：带墨韵呼吸动态 -->
    <div class="title-wrap">
      <h1 class="cover-title">
        <span class="tchar" style="animation-delay:0.1s">黑</span>
        <span class="tchar" style="animation-delay:0.3s">色</span>
        <span class="tspacer"></span>
        <span class="tchar" style="animation-delay:0.55s">修</span>
        <span class="tchar" style="animation-delay:0.75s">士</span>
      </h1>
      <div class="title-line"></div>
    </div>

    <!-- 主内容 -->
    <div class="content">
      <button class="enter-btn" @click="踏入">
        <span class="text">
          <i class="icon">☯</i>
          <span class="label">踏 入 此 道</span>
          <i class="icon">☯</i>
        </span>
        <span class="btn-ink"></span>
      </button>
    </div>

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

const snowParticles = Array.from({ length: 72 }, (_, index) => {
  const band = index % 8;
  const size = 1.4 + ((index * 17) % 42) / 10;
  const startX = -8 + ((index * 37 + band * 9) % 118);
  const startY = -34 - ((index * 19) % 64);
  const drift = (index % 2 === 0 ? 1 : -1) * (8 + ((index * 23) % 30));
  const swayA = (index % 3 === 0 ? -1 : 1) * (4 + ((index * 11) % 14));
  const swayB = (index % 4 === 0 ? 1 : -1) * (6 + ((index * 7) % 18));
  const fall = 128 + ((index * 29) % 62);
  const fallA = fall * 0.28;
  const fallB = fall * 0.55;
  const duration = 8 + ((index * 31) % 110) / 10;
  const delay = -((index * 43) % 180) / 10;
  const opacity = 0.35 + ((index * 13) % 58) / 100;
  const blur = ((index * 7) % 12) / 10;

  return {
    id: index,
    style: {
      '--sx': `${startX}%`,
      '--sy': `${startY}%`,
      '--drift': `${drift}vw`,
      '--sway-a': `${swayA}vw`,
      '--sway-b': `${swayB}vw`,
      '--fall': `${fall}vh`,
      '--fall-a': `${fallA}vh`,
      '--fall-b': `${fallB}vh`,
      '--size': `${size}px`,
      '--dur': `${duration}s`,
      '--glimmer-dur': `${duration * 0.55}s`,
      '--delay': `${delay}s`,
      '--alpha': `${opacity}`,
      '--blur': `${blur}px`,
    } as Record<string, string>,
  };
});

function 踏入() {
  if (离场中.value) return;
  离场中.value = true;
  setTimeout(() => emit('enter', '普通'), 1100);
}
</script>

<style scoped lang="scss">
@use './theme' as *;

$paper-cold: #cfc8b8;
$paper-dim:  #a09888;
$blood:      #6b1a1a;
$blood-glow: #a83333;
$cover-desktop: "https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!5987F9BDBD0220CE0C78330E63D7C1DF.png";

.start-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  @include mobile { aspect-ratio: 3 / 4; }
  min-height: 0;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(2,1,3,0.28) 0%, rgba(5,4,7,0.12) 42%, rgba(2,1,3,0.58) 100%),
    radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,0.58) 100%),
    url("#{$cover-desktop}") center / cover no-repeat,
    $bg-ink;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: $font-serif;
  color: $paper-cold;
  isolation: isolate;
  transition: filter 0.6s ease;

  // 暗角压暗 + 中心提亮 + 微噪点
  &::before {
    content: "";
    position: absolute; inset: 0;
    background:
      linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.02) 22%, rgba(0,0,0,0.02) 78%, rgba(0,0,0,0.55) 100%),
      radial-gradient(ellipse at 50% 35%, rgba(30,28,34,0.35) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 75%, rgba(30,28,34,0.25) 0%, transparent 50%),
      radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0 1px, transparent 1px 3px);
    pointer-events: none;
    z-index: 3;
  }

  &.ink-out { filter: blur(2px) brightness(0.5); }
}

// ═══════════════════════════════════════════════
// 漫天飘雪
// ═══════════════════════════════════════════════
.snow-field {
  position: absolute;
  inset: -12%;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
  mix-blend-mode: screen;
  opacity: 1;
  mask-image: radial-gradient(ellipse at center, #000 0%, #000 62%, transparent 100%);

  .snow-veil {
    position: absolute;
    inset: 0;
    background-repeat: repeat;
    transform: translate3d(0, 0, 0);
    will-change: transform, opacity;
  }

  .veil-a {
    opacity: 0.28;
    filter: blur(1px) contrast(1.08);
    background-image:
      radial-gradient(circle, rgba(238,238,234,0.42) 0 0.9px, transparent 2px),
      radial-gradient(circle, rgba(207,200,184,0.28) 0 1.4px, transparent 3px);
    background-size: 56px 82px, 124px 96px;
    background-position: 12px 18px, 64px 31px;
    animation:
      snow-veil-drift-a 12s linear infinite,
      snow-pulse-a 6.5s ease-in-out infinite;
  }

  .veil-b {
    opacity: 0.2;
    filter: blur(2.4px);
    background-image:
      linear-gradient(105deg, transparent 0 18%, rgba(230,230,224,0.16) 19%, transparent 23%),
      linear-gradient(73deg, transparent 0 44%, rgba(207,200,184,0.12) 45%, transparent 49%);
    background-size: 160px 90px, 230px 140px;
    background-position: 34px 70px, 110px 42px;
    animation:
      snow-veil-drift-b 16s linear infinite,
      snow-pulse-b 8.4s ease-in-out infinite;
  }

  .snowflake {
    position: absolute;
    left: var(--sx);
    top: var(--sy);
    width: var(--size);
    height: var(--size);
    border-radius: 999px;
    opacity: var(--alpha);
    background:
      radial-gradient(circle, rgba(255,255,252,0.98) 0 24%, rgba(226,224,216,0.72) 42%, rgba(207,200,184,0.22) 70%, transparent 100%);
    box-shadow:
      0 0 7px rgba(240,238,230,0.38),
      -1px 1px 4px rgba(207,200,184,0.26);
    filter: blur(var(--blur));
    transform: translate3d(0, 0, 0);
    will-change: transform, opacity;
    animation:
      snow-fall var(--dur) linear var(--delay) infinite,
      snow-glimmer var(--glimmer-dur) ease-in-out var(--delay) infinite;
  }
}

@keyframes snow-veil-drift-a {
  0%   { transform: translate3d(-4%, -8%, 0); }
  100% { transform: translate3d(8%, 12%, 0); }
}
@keyframes snow-veil-drift-b {
  0%   { transform: translate3d(7%, -10%, 0) skewX(-6deg); }
  100% { transform: translate3d(-10%, 14%, 0) skewX(-6deg); }
}
@keyframes snow-pulse-a {
  0%, 100% { opacity: 0.22; }
  45%      { opacity: 0.34; }
  72%      { opacity: 0.2; }
}
@keyframes snow-pulse-b {
  0%, 100% { opacity: 0.15; }
  38%      { opacity: 0.27; }
  81%      { opacity: 0.18; }
}
@keyframes snow-fall {
  0%   { opacity: 0; transform: translate3d(0, 0, 0); }
  8%   { opacity: var(--alpha); }
  28%  { transform: translate3d(var(--sway-a), var(--fall-a), 0); }
  55%  { transform: translate3d(var(--sway-b), var(--fall-b), 0); }
  82%  { opacity: var(--alpha); }
  100% { opacity: 0; transform: translate3d(var(--drift), var(--fall), 0); }
}
@keyframes snow-glimmer {
  0%, 100% { filter: blur(var(--blur)); }
  36%      { filter: blur(var(--blur)) brightness(1.35); }
  64%      { filter: blur(var(--blur)) brightness(0.82); }
}

// ═══════════════════════════════════════════════
// 标题包装：带墨韵呼吸动态
// ═══════════════════════════════════════════════
.title-wrap {
  position: absolute;
  top: clamp(3rem, 9vw, 5.8rem);
  left: 50%;
  z-index: 6;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: title-rise 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  @include mobile {
    top: clamp(2.5rem, 13vw, 4rem);
  }
}

@keyframes title-rise {
  0%   { opacity: 0; transform: translateX(-50%) translateY(20px); filter: blur(6px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0);   filter: blur(0); }
}

.cover-title {
  margin: 0;
  padding: 0;
  font-family: $font-brush;
  font-size: clamp(2.8rem, 10vw, 5.8rem);
  font-weight: normal;
  line-height: 1;
  letter-spacing: 0.12em;
  white-space: nowrap;
  color: transparent;
  display: flex;
  align-items: center;

  .tchar {
    display: inline-block;
    color: transparent;
    background: linear-gradient(180deg,
      #fffaf0 0%,
      #d9d3c4 24%,
      #f3eee0 48%,
      #aaa394 68%,
      #ded7c6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: clamp(0.35px, 0.08vw, 0.75px) rgba(4, 3, 5, 0.72);
    paint-order: stroke fill;
    text-shadow:
      0 0 2px rgba(255,255,255,0.35),
      0 0 8px rgba(236,231,218,0.25),
      0 0 24px rgba(207,200,184,0.20),
      0 0 48px rgba(207,200,184,0.12),
      0 2px 0 rgba(0,0,0,0.9),
      0 4px 12px rgba(0,0,0,0.85),
      0 8px 28px rgba(0,0,0,0.70);
    // 墨韵呼吸：轻微上下浮动 + 墨晕扩散
    animation:
      char-float 3.5s ease-in-out infinite,
      char-ink-breathe 4s ease-in-out infinite;
    @include mobile { font-size: clamp(2.2rem, 15vw, 4rem); }
  }

  // 逐字错开动画
  .tchar:nth-child(1) { animation-delay: 0.1s, 0.2s; }
  .tchar:nth-child(2) { animation-delay: 0.3s, 0.5s; }
  .tchar:nth-child(4) { animation-delay: 0.55s, 0.8s; }
  .tchar:nth-child(5) { animation-delay: 0.75s, 1.1s; }

  .tspacer {
    display: inline-block;
    width: 0.45em;
    position: relative;
    &::after {
      content: "·";
      position: absolute;
      left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      color: $paper-dim;
      opacity: 0.45;
      font-size: 0.55em;
      font-family: $font-serif;
    }
  }

  @include mobile { font-size: clamp(2.2rem, 15vw, 4rem); }
}

// 标题下方淡墨横线（带微光呼吸）
.title-line {
  width: 70%;
  max-width: 260px;
  height: 1px;
  margin-top: 0.45em;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(207,200,184,0.15) 20%,
    rgba(207,200,184,0.40) 50%,
    rgba(207,200,184,0.15) 80%,
    transparent 100%);
  animation: line-breathe 4s ease-in-out infinite;
}

// 单字轻微上下浮动（呼吸感）
@keyframes char-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}

// 墨晕扩散收缩（text-shadow 外层光晕脉动）
@keyframes char-ink-breathe {
  0%, 100% {
    text-shadow:
      0 0 2px rgba(255,255,255,0.35),
      0 0 8px rgba(236,231,218,0.25),
      0 0 24px rgba(207,200,184,0.20),
      0 0 48px rgba(207,200,184,0.12),
      0 2px 0 rgba(0,0,0,0.9),
      0 4px 12px rgba(0,0,0,0.85),
      0 8px 28px rgba(0,0,0,0.70);
  }
  50% {
    text-shadow:
      0 0 2px rgba(255,255,255,0.45),
      0 0 12px rgba(236,231,218,0.38),
      0 0 32px rgba(207,200,184,0.32),
      0 0 64px rgba(207,200,184,0.20),
      0 2px 0 rgba(0,0,0,0.9),
      0 4px 12px rgba(0,0,0,0.85),
      0 8px 28px rgba(0,0,0,0.70);
  }
}

@keyframes line-breathe {
  0%, 100% { opacity: 0.5;  transform: scaleX(0.85); }
  50%      { opacity: 1;    transform: scaleX(1); }
}

// ═══════════════════════════════════════════════
// 主内容区
// ═══════════════════════════════════════════════
.content {
  position: absolute;
  left: 0; right: 0;
  bottom: clamp(2.4rem, 8vw, 5.6rem);
  z-index: 5;
  text-align: center;
  padding: 0 1.2rem;
  animation: rise 1.4s ease-out 0.4s both;
  @include mobile {
    bottom: clamp(2rem, 13vw, 4rem);
    padding: 0 0.6rem;
  }
}

@keyframes rise {
  from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0); filter: blur(0); }
}

// ═══════════════════════════════════════════════
// 进入按钮
// ═══════════════════════════════════════════════
.enter-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: $font-serif;
  isolation: isolate;
  @include mobile { margin: 0.5rem auto; }

  .text {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 2.4rem;
    @include mobile {
      padding: 0.65rem 1.4rem;
      gap: 0.5rem;
    }
    background: rgba(12,10,16,0.72);
    border: 1px solid rgba(207,200,184,0.40);
    border-radius: 1px;
    color: $paper-cold;
    font-size: clamp(0.95rem, 3vw, 1.15rem);
    letter-spacing: 0.6em;
    text-indent: 0.6em;
    box-shadow:
      inset 0 0 18px rgba(0,0,0,0.55),
      0 4px 24px rgba(0,0,0,0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    @include mobile { font-size: clamp(0.85rem, 4vw, 1rem); }

    .label {
      letter-spacing: 0.6em;
      text-indent: 0.6em;
    }
    .icon {
      font-style: normal;
      font-size: 1em;
      color: $paper-cold;
      opacity: 0.75;
      letter-spacing: 0;
      transition: all 0.4s ease;
    }
  }

  .btn-ink {
    position: absolute;
    inset: -10px;
    z-index: -1;
    border-radius: 4px;
    background:
      radial-gradient(ellipse at 30% 40%, rgba(168,51,51,0.35) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(26,24,28,0.6) 0%, transparent 55%);
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    filter: blur(8px);
  }

  &:hover {
    .text {
      color: #fff;
      border-color: rgba(207,200,184,0.65);
      background: rgba(20,16,24,0.88);
      box-shadow:
        inset 0 0 22px rgba(168,51,51,0.18),
        0 0 0 1px rgba(207,200,184,0.45),
        0 4px 32px rgba(120,20,20,0.40),
        0 0 24px rgba(168,51,51,0.15);
      .icon {
        color: $blood-glow;
        opacity: 1;
        text-shadow: 0 0 12px rgba(168,51,51,0.6);
      }
    }
    .btn-ink {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  &:active .text { transform: translateY(1px); }

  &:disabled {
    cursor: not-allowed;
    .text {
      opacity: 0.4;
      filter: grayscale(0.6);
    }
    .btn-ink { display: none; }
  }
}

// ═══════════════════════════════════════════════
// 退场动画
// ═══════════════════════════════════════════════
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
