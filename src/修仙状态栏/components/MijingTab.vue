<template>
  <div v-if="!在秘境中" class="mijing-tab">
    <MijingEmpty />
  </div>
  <div v-else class="mijing-tab in-mijing" :class="`tier-${品阶class}`">
    <header class="mt-header">
      <h2 class="mt-title">
        {{ store.data.当前秘境.名称 || '无名秘境' }}
        <span class="mt-tier">· {{ store.data.当前秘境.品阶 }}阶</span>
      </h2>
    </header>

    <section class="mt-scene">
      <div class="scene-name">当前场景: {{ store.data.当前秘境.当前场景 || '未知' }}</div>
      <div v-if="store.data.当前秘境.场景描述" class="scene-desc">
        {{ store.data.当前秘境.场景描述 }}
      </div>
    </section>

    <section class="mt-canvas-wrap">
      <div class="mt-canvas">
        <div class="canvas-grid">
          <div
            v-for="(cell, idx) in cells"
            :key="idx"
            class="grid-cell"
            :class="{ 'is-self': cell.isSelf, 'is-marker': cell.isMarker, 'is-wall': cell.isWall, 'is-active': activeCell === idx }"
            :title="cell.tooltip"
            @click="onCellClick(cell, idx)"
          >
            <img
              v-if="cell.isSelf && 主角头像"
              :src="主角头像"
              :alt="store.data.主角.名称"
              class="cell-avatar"
            />
            <span v-else-if="!cell.isWall" class="cell-emoji">{{ cell.emoji }}</span>
          </div>
        </div>
        <!-- 点击信息浮层(手机端无 hover,用点击触发) -->
        <div
          v-if="activeTooltip"
          class="cell-tip"
          :class="{ below: tipBelow }"
          :style="{ left: tipPos.x + '%', top: tipPos.y + '%' }"
          @click.stop="activeCell = -1"
        >
          <span class="cell-tip-emoji">{{ activeTooltip.emoji }}</span>
          <span class="cell-tip-text">{{ activeTooltip.text }}</span>
        </div>
      </div>
    </section>

    <section class="mt-time">
      <div class="time-label">
        <i class="fa-solid fa-hourglass-half"></i>
        剩余 {{ 刻数 }} / {{ 刻数上限 }} 刻
      </div>
      <div class="time-bar">
        <div class="time-bar-fill" :class="刻数color" :style="{ width: 刻数pct + '%' }"></div>
      </div>
    </section>

    <section class="mt-loot">
      <div class="loot-header">
        <i class="fa-solid fa-box"></i>
        已得宝物 ({{ 宝物列表.length }})
      </div>
      <div v-if="宝物列表.length === 0" class="loot-empty">尚无所得</div>
      <ul v-else class="loot-list">
        <li v-for="(item, idx) in 宝物列表" :key="idx" class="loot-item">{{ item }}</li>
      </ul>
    </section>

    <div v-if="store.data.当前秘境.已石化" class="mt-petrified">
      ⚠ 化为石像,永久封印于此秘境
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import { useAvatar } from '../avatarStore';
import MijingEmpty from './MijingEmpty.vue';

const store = useDataStore();

const 在秘境中 = computed(() => !!store.data.当前秘境.在秘境中);

const 品阶class = computed(() => {
  const t = store.data.当前秘境.品阶;
  return t === '天' ? 'sky' : t === '地' ? 'earth' : t === '玄' ? 'mystery' : t === '黄' ? 'yellow' : 'unknown';
});

const 主角头像 = useAvatar('主角');

const 刻数 = computed(() => Math.max(0, store.data.当前秘境.剩余刻数 ?? 0));
const 刻数上限 = computed(() => Math.max(1, store.data.当前秘境.刻数上限 ?? 1));
const 刻数pct = computed(() => Math.max(0, Math.min(100, (刻数.value / 刻数上限.value) * 100)));
const 刻数color = computed(() => {
  const p = 刻数pct.value;
  if (p < 15) return 'critical';
  if (p < 30) return 'warning';
  return 'normal';
});

const 宝物列表 = computed(() => store.data.当前秘境.已得宝物 ?? []);

const 标记说明 = computed(() => store.data.当前秘境.标记说明 ?? {});

interface Cell {
  emoji: string;
  isSelf: boolean;
  isMarker: boolean;
  isWall: boolean;
  tooltip: string;
}

const ROWS = 10;
const COLS = 16;
const WALL_CHAR = '█'; // █ FULL BLOCK —— 墙体,前端渲染为水泥色块

const cells = computed<Cell[]>(() => {
  const 网格raw = store.data.当前秘境.网格 ?? [];
  const out: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    const lineStr = 网格raw[r] ?? '';
    const lineArr = [...lineStr];
    while (lineArr.length < COLS) lineArr.push(' ');
    if (lineArr.length > COLS) lineArr.length = COLS;
    for (let c = 0; c < COLS; c++) {
      const emoji = lineArr[c];
      const isWall = emoji === WALL_CHAR;
      const isSelf = !isWall && emoji === '🧍';
      const isMarker = !isWall && !isSelf && !!标记说明.value[emoji];
      let tooltip = '';
      if (isSelf) {
        tooltip = `${store.data.主角.名称} · ${store.data.主角.境界}`;
      } else if (isMarker) {
        tooltip = 标记说明.value[emoji] || '';
      }
      out.push({ emoji, isSelf, isMarker, isWall, tooltip });
    }
  }
  return out;
});

/* 点击 cell 显示信息浮层(手机端无 hover) */
const activeCell = ref(-1);

const activeTooltip = computed(() => {
  if (activeCell.value < 0) return null;
  const cell = cells.value[activeCell.value];
  if (!cell || cell.isWall || (!cell.isMarker && !cell.isSelf)) return null;
  return { emoji: cell.emoji, text: cell.tooltip };
});

const tipPos = computed(() => {
  if (activeCell.value < 0) return { x: 50, y: 50 };
  const r = Math.floor(activeCell.value / COLS);
  const c = activeCell.value % COLS;
  // 浮层定位到该格中心,百分比相对于画布
  return { x: (c + 0.5) * (100 / COLS), y: (r + 0.5) * (100 / ROWS) };
});

const tipBelow = computed(() => {
  if (activeCell.value < 0) return false;
  return Math.floor(activeCell.value / COLS) < 2; // 顶部两行翻到下方
});

function onCellClick(cell: { isWall: boolean; isMarker: boolean; isSelf: boolean }, idx: number) {
  if (cell.isWall || (!cell.isMarker && !cell.isSelf)) {
    activeCell.value = -1;
    return;
  }
  activeCell.value = activeCell.value === idx ? -1 : idx;
}
</script>

<style lang="scss" scoped>
$ease: cubic-bezier(.22, .61, .36, 1);

.mijing-tab {
  height: 100%;
  overflow-y: auto;
  padding: 18px 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &.tier-sky    { --tier-color: #c64545; }
  &.tier-earth  { --tier-color: #c9a94e; }
  &.tier-mystery{ --tier-color: #8a55c6; }
  &.tier-yellow { --tier-color: #888888; }
  &.tier-unknown{ --tier-color: #555555; }
}

.mt-header {
  border-bottom: 1px solid rgba(207, 200, 184, 0.12);
  padding-bottom: 8px;
}

.mt-title {
  font-family: var(--font-brush);
  font-size: 1.4rem;
  letter-spacing: 0.18em;
  color: var(--c-text);
  text-shadow: 0 0 10px var(--tier-color, rgba(168, 51, 51, 0.4));
  margin: 0;
}

.mt-tier {
  font-size: 0.88rem;
  color: var(--tier-color);
  margin-left: 8px;
  letter-spacing: 0.3em;
}

.mt-scene {
  .scene-name {
    font-family: var(--font-ui);
    font-size: 0.92rem;
    color: var(--c-text);
    letter-spacing: 0.1em;
  }
  .scene-desc {
    margin-top: 4px;
    font-size: 0.82rem;
    line-height: 1.7;
    color: var(--c-text-dim);
    font-style: italic;
  }
}

/* ===== 画布 ===== */
.mt-canvas-wrap {
  display: flex;
  justify-content: center;
}

.mt-canvas {
  position: relative;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #0e0c0a;
  box-shadow:
    inset 0 0 0 1px rgba(120, 100, 80, 0.18),
    0 0 24px rgba(0, 0, 0, 0.6);
  isolation: isolate;
}

/* 16×10 石板地砖网格 —— 无间隙,地砖边缘靠 cell 自身描边区分 */
.canvas-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 0;
}

.grid-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  line-height: 1;
  cursor: default;
  /* 石板地砖:纯渐变 + 静态路径,无 feTurbulence 噪点(性能) */
  background:
    url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='t' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%233a342c'/%3E%3Cstop offset='0.45' stop-color='%2329241d'/%3E%3Cstop offset='1' stop-color='%231a1611'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='40' height='40' fill='url(%23t)'/%3E%3Cpath d='M14 3 L16 16 L13 24 L15 37' stroke='%23120f0b' stroke-width='0.5' fill='none' opacity='0.45'/%3E%3Cpath d='M3 9 Q7 7 11 9' stroke='rgba(255,245,220,0.12)' stroke-width='0.5' fill='none'/%3E%3Cpath d='M24 7 Q29 5 33 7' stroke='rgba(255,245,220,0.1)' stroke-width='0.4' fill='none'/%3E%3Crect width='40' height='40' fill='none' stroke='rgba(0,0,0,0.55)' stroke-width='1'/%3E%3C/svg%3E") center / 100% 100% no-repeat,
    #0e0c0a;

  &.is-marker {
    cursor: help;
    transition: transform 0.18s $ease, filter 0.18s;
    &:hover {
      transform: scale(1.45);
      z-index: 5;
      filter: drop-shadow(0 0 6px rgba(207, 200, 184, 0.7));
    }
  }

  &.is-self {
    z-index: 4;
    background:
      linear-gradient(135deg, rgba(198, 69, 69, 0.14), transparent 55%),
      rgba(30, 22, 20, 0.6);
  }

  &.is-wall {
    /* 石头质感:SVG 石块纹理(不规则面 + 高光 + 阴影 + 裂纹)+ 深石灰基色 */
    background:
      url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='s' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23686460'/%3E%3Cstop offset='0.5' stop-color='%234a4642'/%3E%3Cstop offset='1' stop-color='%2333302c'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='40' height='40' fill='url(%23s)'/%3E%3Cpath d='M2 8 Q10 4 18 7 T34 6 L38 10 L36 20 Q30 22 22 19 T8 21 L3 18 Z' fill='%235a564f' opacity='0.55'/%3E%3Cpath d='M0 28 Q8 26 16 29 T34 28 L40 30 L40 40 L0 40 Z' fill='%232a2622' opacity='0.6'/%3E%3Cpath d='M12 4 L14 14 L11 22' stroke='%2322201e' stroke-width='0.8' fill='none' opacity='0.6'/%3E%3Cpath d='M26 18 L24 28 L27 36' stroke='%2322201e' stroke-width='0.7' fill='none' opacity='0.55'/%3E%3Cpath d='M6 10 Q9 8 12 9' stroke='rgba(255,250,235,0.18)' stroke-width='0.6' fill='none'/%3E%3Cpath d='M20 6 Q24 4 28 6' stroke='rgba(255,250,235,0.14)' stroke-width='0.5' fill='none'/%3E%3C/svg%3E") center / 100% 100% no-repeat,
      #3a3631;
    cursor: default;
  }
}

.cell-emoji {
  user-select: none;
  font-size: clamp(12px, 1.8vw, 22px);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.7));
}

.cell-avatar {
  width: 100%;
  height: 100%;
  border-radius: 0;
  object-fit: cover;
  border: 1.5px solid var(--tier-color, rgba(198, 69, 69, 0.6));
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 0 10px rgba(168, 51, 51, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.7);
  z-index: 4;
}

/* 点击信息浮层 */
.cell-tip {
  position: absolute;
  transform: translate(-50%, -120%); /* 定位到格子上方 */
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 80%;
  padding: 5px 10px;
  background: linear-gradient(135deg, rgba(10, 8, 12, 0.95), rgba(20, 12, 12, 0.95));
  border: 1px solid rgba(168, 51, 51, 0.45);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.7), 0 0 8px rgba(168, 51, 51, 0.25);
  font-size: 0.76rem;
  color: var(--c-text);
  font-family: var(--font-ui);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: auto;
  cursor: pointer;
  animation: tip-in 0.15s $ease;

  /* 靠近顶部边缘时翻到下方 */
  &.below {
    transform: translate(-50%, 20%);
  }
}

.cell-tip-emoji {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.cell-tip-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes tip-in {
  from { opacity: 0; transform: translate(-50%, -110%); }
  to   { opacity: 1; transform: translate(-50%, -120%); }
}

/* 手机端浮层放宽可点击区,允许换行 */
@media (max-width: 500px) {
  .cell-tip {
    white-space: normal;
    text-align: center;
    font-size: 0.72rem;
    padding: 6px 12px;
  }
}

/* ===== 倒计时 ===== */
.mt-time {
  .time-label {
    font-size: 0.85rem;
    color: var(--c-text-dim);
    margin-bottom: 4px;
    i { margin-right: 6px; }
  }
  .time-bar {
    height: 6px;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 3px;
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(207, 200, 184, 0.08);
  }
  .time-bar-fill {
    height: 100%;
    transition: width 0.3s ease;
    &.normal   { background: linear-gradient(90deg, #c9a94e, #d4b860); }
    &.warning  { background: linear-gradient(90deg, #d68a3c, #e09a4c); }
    &.critical {
      background: linear-gradient(90deg, #c64545, #e05555);
      animation: bar-pulse 1.2s ease-in-out infinite;
    }
  }
}

@keyframes bar-pulse {
  0%, 100% { opacity: 0.85; }
  50%      { opacity: 1; box-shadow: 0 0 10px rgba(198, 69, 69, 0.7); }
}

.mt-loot {
  .loot-header {
    font-size: 0.85rem;
    color: var(--c-text-dim);
    margin-bottom: 6px;
    i { margin-right: 6px; }
  }
  .loot-empty {
    font-size: 0.78rem;
    color: var(--c-text-dim);
    opacity: 0.6;
    font-style: italic;
  }
  .loot-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .loot-item {
    padding: 3px 10px;
    background: rgba(168, 51, 51, 0.12);
    border: 1px solid rgba(207, 200, 184, 0.18);
    border-radius: var(--radius-pill);
    font-size: 0.78rem;
    color: var(--c-text);
    letter-spacing: 0.08em;
  }
}

.mt-petrified {
  margin-top: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(60, 60, 60, 0.6), rgba(40, 30, 30, 0.7));
  border: 1px solid rgba(168, 51, 51, 0.4);
  border-radius: var(--radius-md);
  text-align: center;
  font-family: var(--font-brush);
  font-size: 0.95rem;
  letter-spacing: 0.2em;
  color: #c64545;
  text-shadow: 0 0 8px rgba(168, 51, 51, 0.5);
}

@media (max-width: 500px) {
  .mijing-tab { padding: 12px; gap: 10px; }
  .mt-title { font-size: 1.1rem; }
  .mt-canvas { max-width: 100%; aspect-ratio: 14 / 10; }
  .cell-emoji { font-size: clamp(10px, 3vw, 16px); }
  .cell-avatar { width: 100%; height: 100%; }
}
</style>
