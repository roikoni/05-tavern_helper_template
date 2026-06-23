<template>
  <div class="radar-wrapper">
    <svg :viewBox="`0 0 ${viewSize} ${viewSize}`" class="radar-svg">
      <!-- 背景网格 -->
      <polygon
        v-for="level in levels"
        :key="level"
        :points="getGridPoints(level)"
        class="radar-grid"
      />

      <!-- 轴线 -->
      <line
        v-for="(_, i) in dimensions"
        :key="'axis-' + i"
        :x1="cx" :y1="cy"
        :x2="cx + Math.cos(angleStep * i - Math.PI / 2) * radius"
        :y2="cy + Math.sin(angleStep * i - Math.PI / 2) * radius"
        class="radar-axis"
      />

      <!-- 数据填充 -->
      <polygon :points="dataPoints" class="radar-fill" />

      <!-- 数据边线 -->
      <polygon :points="dataPoints" class="radar-stroke" />

      <!-- 数据点 + 悬停热区 -->
      <circle
        v-for="(_, i) in dimensions"
        :key="'dot-' + i"
        :cx="getPoint(i).x"
        :cy="getPoint(i).y"
        r="2.5"
        class="radar-dot"
        :class="{ hovered: hovered === i }"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      />
      <!-- 悬停热区（不可见，增大触发面积） -->
      <circle
        v-for="(_, i) in dimensions"
        :key="'hit-' + i"
        :cx="getPoint(i).x"
        :cy="getPoint(i).y"
        r="14"
        fill="transparent"
        style="cursor: default;"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      />

      <!-- 悬停提示 -->
      <g v-if="hovered !== null" class="radar-tooltip">
        <rect
          :x="tooltipPos.x - 28"
          :y="tooltipPos.y - 24"
          width="56"
          height="18"
          rx="2"
          class="tooltip-bg"
        />
        <text
          :x="tooltipPos.x"
          :y="tooltipPos.y - 12"
          text-anchor="middle"
          dominant-baseline="middle"
          class="tooltip-text"
        >{{ dimensions[hovered].label }} {{ values[hovered] }}</text>
      </g>

      <!-- 维度标签 -->
      <text
        v-for="(dim, i) in dimensions"
        :key="'label-' + i"
        :x="getLabelPos(i).x"
        :y="getLabelPos(i).y"
        class="radar-label"
        text-anchor="middle"
        dominant-baseline="middle"
      >{{ dim.label }}</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Dimension { key: string; label: string; }

const props = withDefaults(defineProps<{
  dimensions?: Dimension[];
  values?: number[];
  maxValue?: number;
}>(), {
  dimensions: () => [
    { key: '力道', label: '力道' },
    { key: '体魄', label: '体魄' },
    { key: '身法', label: '身法' },
    { key: '灵力', label: '灵力' },
    { key: '神识', label: '神识' },
    { key: '根骨', label: '根骨' },
  ],
  values: () => [10, 10, 10, 10, 10, 10],
  maxValue: 100,
});

const viewSize = 240;
const cx = viewSize / 2;
const cy = viewSize / 2;
const radius = 78;
const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
const angleStep = (2 * Math.PI) / Math.max(props.dimensions.length, 1);

function getGridPoints(level: number): string {
  return props.dimensions.map((_, i) => {
    const r = radius * level;
    const x = cx + Math.cos(angleStep * i - Math.PI / 2) * r;
    const y = cy + Math.sin(angleStep * i - Math.PI / 2) * r;
    return `${x},${y}`;
  }).join(' ');
}

function getPoint(index: number): { x: number; y: number } {
  const value = (props.values[index] ?? 0) / props.maxValue;
  const r = radius * Math.min(value, 1);
  return {
    x: cx + Math.cos(angleStep * index - Math.PI / 2) * r,
    y: cy + Math.sin(angleStep * index - Math.PI / 2) * r,
  };
}

const hovered = ref<number | null>(null);
const tooltipPos = computed(() => {
  if (hovered.value === null) return { x: 0, y: 0 };
  return getPoint(hovered.value);
});

const dataPoints = computed(() =>
  props.dimensions.map((_, i) => getPoint(i)).map(p => `${p.x},${p.y}`).join(' ')
);

function getLabelPos(index: number): { x: number; y: number } {
  const r = radius + 22;
  return {
    x: cx + Math.cos(angleStep * index - Math.PI / 2) * r,
    y: cy + Math.sin(angleStep * index - Math.PI / 2) * r,
  };
}
</script>

<style lang="scss" scoped>
.radar-wrapper {
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1;
  margin: 0 auto;
  animation: radar-in 0.6s cubic-bezier(.22,.61,.36,1) both;
}
@keyframes radar-in {
  from { opacity: 0; transform: scale(0.92) rotate(-3deg); }
  to   { opacity: 1; transform: scale(1)    rotate(0);    }
}

.radar-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.radar-grid {
  fill: none;
  stroke: rgba(207, 200, 184,0.12);
  stroke-width: 0.8;
}

.radar-axis {
  stroke: rgba(207, 200, 184,0.18);
  stroke-width: 0.5;
}

.radar-fill {
  fill: rgba(207, 200, 184, 0.18);
  stroke: none;
  filter: drop-shadow(0 0 6px rgba(207, 200, 184,0.25));
  animation: radar-fill-in 0.8s cubic-bezier(.22,.61,.36,1) 0.15s both;
}
@keyframes radar-fill-in {
  from { opacity: 0; transform: scale(0.5); transform-origin: center; transform-box: fill-box; }
  to   { opacity: 1; transform: scale(1);   }
}

.radar-stroke {
  fill: none;
  stroke: var(--c-gold);
  stroke-width: 1.5;
  filter: drop-shadow(0 0 4px rgba(207, 200, 184,0.5));
}

.radar-dot {
  fill: var(--c-gold-light);
  filter: drop-shadow(0 0 4px rgba(207, 200, 184, 0.8));
  animation: radar-dot-in 0.4s ease-out both;
  transition: r 0.2s ease;

  &.hovered {
    r: 5;
    fill: #fff;
    filter: drop-shadow(0 0 8px rgba(207, 200, 184, 1));
  }
}
@keyframes radar-dot-in {
  from { opacity: 0; r: 0; }
  to   { opacity: 1; }
}

.radar-label {
  fill: var(--c-text-mid);
  font-size: 15px;
  font-family: var(--font-serif);
  font-weight: 300;
  letter-spacing: 0.1em;
}

.tooltip-bg {
  fill: rgba(0, 0, 0, 0.85);
  stroke: rgba(207, 200, 184, 0.4);
  stroke-width: 0.8;
}

.tooltip-text {
  fill: var(--c-gold-light);
  font-size: 11px;
  font-family: var(--font-ui);
  font-weight: 400;
  letter-spacing: 0.06em;
}
</style>
