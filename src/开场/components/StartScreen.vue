<template>
  <div class="start-screen" :class="{ 'ink-out': 离场中 }">
    <!-- 墨雾流动层 -->
    <div class="ink-mist" aria-hidden="true">
      <span class="mist m1"></span>
      <span class="mist m2"></span>
      <span class="mist m3"></span>
      <span class="mist m4"></span>
      <span class="mist m5"></span>
    </div>

    <h1 class="cover-title">黑色修士</h1>

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

function 踏入() {
  if (离场中.value) return;
  离场中.value = true;
  setTimeout(() => emit('enter', '普通'), 1100);
}
</script>

<style scoped lang="scss">
@use './theme' as *;

// 本组件局部覆盖
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

  // 暗角压暗 + 中心提亮文字可读性 + 微噪点
  &::before {
    content: "";
    position: absolute; inset: 0;
    background:
      // 左右压暗
      linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.02) 22%, rgba(0,0,0,0.02) 78%, rgba(0,0,0,0.55) 100%),
      // 中心提亮：让文字在黑色底图上更突出
      radial-gradient(ellipse at 50% 35%, rgba(30,28,34,0.35) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 75%, rgba(30,28,34,0.25) 0%, transparent 50%),
      // 边缘暗化
      radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0 1px, transparent 1px 3px);
    pointer-events: none;
    z-index: 3;
  }

  &.ink-out { filter: blur(2px) brightness(0.5); }
}

// ═══════════════════════════════════════════════
// 墨雾流动
// ═══════════════════════════════════════════════
.ink-mist {
  position: absolute;
  inset: -5%;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;

  .mist {
    position: absolute;
    border-radius: 50%;
    filter: blur(55px);
    // 灰墨色（非纯黑），在黑色底图上可见
    background: radial-gradient(ellipse at center, rgba(55,52,62,0.9) 0%, rgba(30,28,36,0.7) 45%, transparent 75%);
    will-change: transform;
    --target-opacity: 0.25;
  }

  .m1 {
    width: 50%; height: 22%;
    top: 8%; left: -25%;
    animation: mist-drift 24s linear -4s infinite;
    --target-opacity: 0.28;
  }
  .m2 {
    width: 42%; height: 16%;
    top: 30%; left: -18%;
    animation: mist-drift 20s linear -8s infinite;
    --target-opacity: 0.35;
  }
  .m3 {
    width: 58%; height: 26%;
    top: 45%; left: -30%;
    animation: mist-drift 28s linear -2s infinite;
    --target-opacity: 0.22;
  }
  .m4 {
    width: 35%; height: 14%;
    top: 65%; left: -12%;
    animation: mist-drift 22s linear -12s infinite;
    --target-opacity: 0.30;
  }
  .m5 {
    width: 45%; height: 18%;
    top: 18%; left: -22%;
    animation: mist-drift 26s linear -16s infinite;
    --target-opacity: 0.25;
  }
}

@keyframes mist-drift {
  0%   { transform: translate3d(0, 0, 0) scale(1); opacity: 0.15; }
  15%  { opacity: var(--target-opacity); }
  50%  { transform: translate3d(120vw, -3vh, 0) scale(1.2); }
  85%  { opacity: var(--target-opacity); }
  100% { transform: translate3d(240vw, 2vh, 0) scale(1); opacity: 0.15; }
}

// ═══════════════════════════════════════════════
// 标题：去框，仅靠文字渐变和 shadow 浮现
// ═══════════════════════════════════════════════
.cover-title {
  position: absolute;
  top: clamp(3rem, 9vw, 5.8rem);
  left: 50%;
  z-index: 6;
  transform: translateX(-50%);
  margin: 0;
  padding: 0;
  font-family: $font-brush;
  font-size: clamp(2.8rem, 10vw, 5.8rem);
  font-weight: normal;
  line-height: 1;
  letter-spacing: 0.12em;
  white-space: nowrap;
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
    // 内层冷白高光：让字在黑色底图上"亮"起来
    0 0 2px rgba(255,255,255,0.35),
    0 0 8px rgba(236,231,218,0.25),
    0 0 24px rgba(207,200,184,0.20),
    0 0 48px rgba(207,200,184,0.12),
    // 外层墨影：压暗背景突出字形
    0 2px 0 rgba(0,0,0,0.9),
    0 4px 12px rgba(0,0,0,0.85),
    0 8px 28px rgba(0,0,0,0.70);
  pointer-events: none;
  isolation: isolate;

  // 标题下方淡墨横线
  &::after {
    content: "";
    position: absolute;
    left: 10%; right: 10%;
    bottom: -0.35em;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(207,200,184,0.25) 30%,
      rgba(207,200,184,0.45) 50%,
      rgba(207,200,184,0.25) 70%,
      transparent 100%);
  }

  @include mobile {
    top: clamp(2.5rem, 13vw, 4rem);
    font-size: clamp(2.2rem, 15vw, 4rem);
  }
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
  animation: rise 1.4s ease-out;
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
// 进入按钮：透明底 + 细边框
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

  // 悬浮时的极淡墨晕染层
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
