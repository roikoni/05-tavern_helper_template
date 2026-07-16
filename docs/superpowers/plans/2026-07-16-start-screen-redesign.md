# StartScreen 水墨封面改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重写 `src/开场/components/StartScreen.vue` 的样式，用墨雾流动替代飘雪粒子、去掉标题厚重背景框、简化按钮为透明细边框风格。

**Architecture:** 单文件样式重写，模板结构几乎不变（只去掉 `snowParticles` 相关渲染），`<script>` 逻辑不变。所有改动集中在 `<style>` 区域。

**Tech Stack:** Vue 3 (Composition API), SCSS, CSS animations, 项目 theme.scss 变量系统

## Global Constraints

- 继续使用 `<style scoped lang="scss">`
- 继续使用 `@use './theme' as *;` 引入主题变量
- 保持 `aspect-ratio: 4 / 3`（桌面）和 `3 / 4`（移动端）
- 保持现有事件发射逻辑（`emit('enter', '普通')`）不变
- 暗角遮罩必须保证文字可读性
- 墨雾动画只使用纯 CSS，不引入 JS 动画库

---

### Task 1: 重写 StartScreen.vue 封面样式

**Files:**
- Modify: `src/开场/components/StartScreen.vue`

**Interfaces:**
- Consumes: `theme.scss` 变量（`$font-brush`, `$font-serif`, `$paper-cold`, `$paper-dim`, `$blood-glow`, `$blood-bright`, `$bg-ink`, `$bg-soft`, `$r-sm`, `$r-md`）
- Produces: 无外部接口，纯视觉组件

---

**当前问题诊断：**

打开 `src/开场/components/StartScreen.vue`，当前代码有以下问题：
1. 模板里渲染了 `snowParticles`（96 个 `.snowflake` div + 2 个 `.snow-veil`）
2. `.cover-title` 有厚重的 `::before` 伪元素（backdrop-filter blur + 多层 box-shadow 边框）和 `::after` 底部斜线阴影
3. `.enter-btn .text` 有四角墨点 radial-gradient、厚重渐变背景、多层 inset box-shadow
4. 暗角遮罩（`::before`）径向渐变强度可能不足

---

- [ ] **Step 1: 修改模板——去掉飘雪粒子，保留墨雾层**

```vue
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
```

关键变更：
- 删除 `.snow-field` 及其内部所有雪粒和 veil
- 新增 `.ink-mist` 层，包含 5 个 `.mist` 元素
- 其余结构（标题、按钮、退场层）保持原标签层级不变

---

- [ ] **Step 2: 重写 `<style>`——墨雾动画、标题去框、按钮简化**

```scss
<style scoped lang="scss">
@use './theme' as *;

// 局部变量
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

  // 强暗角 + 微噪点
  &::before {
    content: "";
    position: absolute; inset: 0;
    background:
      linear-gradient(90deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 20%, rgba(0,0,0,0.08) 80%, rgba(0,0,0,0.62) 100%),
      radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%),
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
    filter: blur(60px);
    opacity: 0.08;
    background: radial-gradient(ellipse at center, rgba(15,14,18,0.9) 0%, rgba(5,4,7,0.6) 40%, transparent 70%);
    will-change: transform;
  }

  .m1 {
    width: 45%; height: 18%;
    top: 12%; left: -20%;
    animation: mist-drift 28s linear -4s infinite;
    opacity: 0.06;
  }
  .m2 {
    width: 38%; height: 14%;
    top: 32%; left: -15%;
    animation: mist-drift 22s linear -8s infinite;
    opacity: 0.1;
  }
  .m3 {
    width: 52%; height: 22%;
    top: 48%; left: -25%;
    animation: mist-drift 32s linear -2s infinite;
    opacity: 0.07;
  }
  .m4 {
    width: 30%; height: 12%;
    top: 68%; left: -10%;
    animation: mist-drift 26s linear -12s infinite;
    opacity: 0.09;
  }
  .m5 {
    width: 40%; height: 16%;
    top: 22%; left: -18%;
    animation: mist-drift 30s linear -16s infinite;
    opacity: 0.05;
  }
}

@keyframes mist-drift {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(120vw, -2vh, 0) scale(1.15); }
  100% { transform: translate3d(240vw, 1vh, 0) scale(1); }
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
    0 0 1px rgba(255,255,255,0.12),
    0 0 18px rgba(236,231,218,0.15),
    0 0 34px rgba(0,0,0,0.85),
    0 4px 20px rgba(0,0,0,0.95);
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
    background: rgba(5,4,7,0.35);
    border: 1px solid rgba(207,200,184,0.22);
    border-radius: 1px;
    color: $paper-cold;
    font-size: clamp(0.95rem, 3vw, 1.15rem);
    letter-spacing: 0.6em;
    text-indent: 0.6em;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
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
      opacity: 0.55;
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
      border-color: rgba(207,200,184,0.5);
      background: rgba(10,8,13,0.55);
      box-shadow:
        0 0 0 1px rgba(207,200,184,0.35),
        0 4px 32px rgba(120,20,20,0.35);
      .icon {
        color: $blood-glow;
        opacity: 0.9;
        text-shadow: 0 0 10px rgba(168,51,51,0.5);
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
```

关键样式变更说明：

| 元素 | 变更前 | 变更后 |
|---|---|---|
| 动态元素 | 96 个雪粒 + 2 层 veil（复杂、DOM 重） | 5 个墨团（轻量、纯 CSS） |
| 标题背景 | `::before` 伪元素：backdrop-filter blur + 多层 border/shadow | **完全去掉**，仅靠 text-shadow 浮现 |
| 标题底部 | `::after` 斜线阴影 | 淡墨横线（中央略深） |
| 按钮背景 | 渐变 + inset box-shadow + 四角墨点 | 透明底 `rgba(5,4,7,0.35)` + 1px 细边框 |
| 按钮文字间距 | `letter-spacing: 0.05em` | `letter-spacing: 0.6em`（更舒展） |
| 按钮悬浮 | 背景变深 + 四角墨点变亮 | 边框提亮 + 极淡墨晕 + 太极符变血色 |
| 暗角 | `rgba(0,0,0,0.52)` 左右 + `0.58` 径向 | `0.62` 左右 + `0.72` 径向（更强） |

---

- [ ] **Step 3: 验证——在浏览器中检查封面**

打开酒馆网页（确保「酒馆助手-实时监听-允许监听」已启用），检查：
1. 封面显示水墨画底图，无飘雪粒子
2. 有淡淡墨雾从左向右缓慢飘过（可能需要等待几秒才能看到第一团）
3. 标题「黑色修士」无背景框，仅靠文字效果浮现
4. 标题下方有一条淡墨横线
5. 按钮透明底 + 细边框，文字间距较大
6. 悬浮按钮时边框变亮，两侧 ☯ 符变暗红色
7. 点击按钮后触发水墨晕开退场动画
8. 移动端比例正常（竖向），字号适配

如有问题，回到 Step 2 调整对应样式。

---

- [ ] **Step 4: Commit**

```bash
git add src/开场/components/StartScreen.vue
git commit -m "refactor(开场): 重写封面——墨雾流动替代飘雪，标题去框，按钮透明化"
```

---

## Spec Coverage Check

| Spec 要求 | 覆盖任务 |
|---|---|
| 墨雾流动替代飘雪 | Task 1 Step 2 — `.ink-mist` + `@keyframes mist-drift` |
| 标题去背景框 | Task 1 Step 2 — `.cover-title` 去掉 `::before`，弱化 `::after` |
| 标题下方淡墨横线 | Task 1 Step 2 — `.cover-title::after` 渐变横线 |
| 按钮透明底 + 细边框 | Task 1 Step 2 — `.enter-btn .text` 简化 |
| 按钮悬浮血色微光 | Task 1 Step 2 — `:hover .icon` 变色 + `.btn-ink` 淡晕 |
| 增强暗角 | Task 1 Step 2 — `.start-screen::before` 径向加深 |
| 保留退场动画 | Task 1 Step 2 — `.ink-overlay` + `@keyframes ink-bloom` 不变 |

无遗漏。

## Placeholder Scan

无 TBD、TODO、"implement later" 等占位符。所有代码均为完整可执行的 SCSS。

## Type Consistency

纯样式文件，无类型接口。所有 theme.scss 变量引用均与现有代码一致。
