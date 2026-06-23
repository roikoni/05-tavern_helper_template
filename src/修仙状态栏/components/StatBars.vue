<template>
  <!-- StatBar -->
  <div v-if="type === 'stat'" class="stat-bar-group group">
    <div class="stat-header">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-num">{{ Math.round(displayValue) }} <span class="stat-max">/ {{ max }}</span></span>
    </div>
    <div class="stat-track-wrap">
      <span class="stat-deco" :class="'deco-' + color" aria-hidden="true">&#9672;</span>
      <div class="stat-track" :class="'track-bg-' + color">
        <div
          class="stat-fill"
          :class="'fill-' + color"
          :style="{ width: pct + '%' }"
        ></div>
      </div>
      <span class="stat-deco" :class="'deco-' + color" aria-hidden="true">&#9672;</span>
    </div>
  </div>

  <!-- KarmaBar -->
  <div v-else class="stat-bar-group group">
    <div class="stat-header">
      <span class="stat-label">善恶值</span>
      <span class="stat-num">{{ displayValue > 0 ? '+' : '' }}{{ Math.round(displayValue) }}</span>
    </div>
    <div class="stat-track-wrap">
      <span class="stat-deco deco-neutral" aria-hidden="true">&#9672;</span>
      <div class="stat-track track-bg-karma">
        <div class="karma-mid"></div>
        <div
          v-if="value >= 0"
          class="stat-fill fill-karma-good"
          :style="{ left: '50%', width: karmaPct + '%' }"
        ></div>
        <div
          v-else
          class="stat-fill fill-karma-evil"
          :style="{ right: '50%', width: karmaPct + '%' }"
        ></div>
      </div>
      <span class="stat-deco deco-neutral" aria-hidden="true">&#9672;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransition, TransitionPresets } from '@vueuse/core';
import { computed, toRef } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'stat' | 'karma';
  label?: string;
  value: number;
  max?: number;
  color?: 'hp' | 'mp' | 'san';
  unitLabel?: string;
}>(), {
  type: 'stat',
  max: 100,
  color: 'hp',
});

const pct = computed(() => Math.min((props.value / Math.max(props.max, 1)) * 100, 100));

const karmaPct = computed(() => {
  return Math.min((Math.abs(props.value) / 100) * 50, 50);
});

// 数字补间：value 变化时平滑过渡（ease-out-quart, 420ms）
const displayValue = useTransition(toRef(props, 'value'), {
  duration: 420,
  transition: TransitionPresets.easeOutQuart,
});
</script>

<style lang="scss" scoped>
.stat-bar-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  font-family: var(--font-ui);
}

.stat-label {
  color: var(--c-text-dim);
  transition: color 0.25s;
  font-weight: 300;
  .group:hover & { color: var(--c-text); }
}

.stat-num {
  color: var(--c-text);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.stat-max {
  color: var(--c-text-dim);
  font-size: 0.6rem;
  font-weight: 300;
}

.stat-track-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.stat-deco {
  font-size: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.25s, filter 0.25s;

  &.deco-hp  { color: var(--c-hp);  filter: drop-shadow(0 0 3px rgba(155,34,38,0.5)); }
  &.deco-mp  { color: var(--c-mp);  filter: drop-shadow(0 0 3px rgba(58,95,112,0.5)); }
  &.deco-san { color: var(--c-san); filter: drop-shadow(0 0 3px rgba(84,49,107,0.5)); }
  &.deco-neutral { color: var(--c-text-dim); opacity: 0.5; }

  .group:hover & { opacity: 1; }
}

.stat-track {
  flex: 1;
  height: 7px;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  /* 内嵌凹陷 */
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(255,255,255,0.03);

  &.track-bg-hp    { background: var(--c-hp-bg); }
  &.track-bg-mp    { background: var(--c-mp-bg); }
  &.track-bg-san   { background: var(--c-san-bg); }
  &.track-bg-karma { background: var(--c-border); }
}

.stat-fill {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(.22,.61,.36,1);
  /* 顶部高光 */
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent);
    border-radius: 999px 999px 0 0;
    pointer-events: none;
  }

  &.fill-hp  { background: linear-gradient(to right, #6b1418, var(--c-hp));  box-shadow: 0 0 10px rgba(155,34,38,0.7); }
  &.fill-mp  { background: linear-gradient(to right, #1f3d4a, var(--c-mp));  box-shadow: 0 0 10px rgba(58,95,112,0.7); }
  &.fill-san { background: linear-gradient(to right, #2d1840, var(--c-san)); box-shadow: 0 0 10px rgba(84,49,107,0.7); }

  &.fill-karma-good { background: linear-gradient(to right, #024d38, var(--c-karma-good)); box-shadow: 0 0 10px rgba(4,120,87,0.7); }
  &.fill-karma-evil { background: linear-gradient(to right, #6b1418, var(--c-karma-evil)); box-shadow: 0 0 10px rgba(155,34,38,0.7); }
}

.karma-mid {
  position: absolute;
  left: 50%;
  width: 1px;
  height: 13px;
  top: -3px;
  background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent);
  z-index: 10;
  margin-left: -0.5px;
}
</style>
