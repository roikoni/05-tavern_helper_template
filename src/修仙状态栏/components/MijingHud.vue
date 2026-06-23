<template>
  <div class="mijing-hud" :class="`tier-${品阶class}`">
    <div class="hud-title">
      <i class="fa-solid fa-dungeon hud-icon"></i>
      <span class="hud-name">{{ store.data.当前秘境.名称 || '未命名秘境' }}</span>
      <span class="hud-sep">·</span>
      <span class="hud-scene">{{ store.data.当前秘境.当前场景 || '未知之处' }}</span>
    </div>
    <div class="hud-stats">
      <div class="hud-stat" :title="`剩余 ${刻数} / ${刻数上限} 刻`">
        <i class="fa-solid fa-hourglass-half"></i>
        <span>{{ 刻数 }}</span>
        <div class="hud-bar">
          <div class="hud-bar-fill" :class="刻数color" :style="{ width: 刻数pct + '%' }"></div>
        </div>
      </div>
      <div class="hud-stat" :title="宝物hover">
        <i class="fa-solid fa-box"></i>
        <span>{{ 宝物数 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

const 品阶class = computed(() => {
  const t = store.data.当前秘境.品阶;
  return t === '天' ? 'sky' : t === '地' ? 'earth' : t === '玄' ? 'mystery' : t === '黄' ? 'yellow' : 'unknown';
});

const 刻数 = computed(() => store.data.当前秘境.剩余刻数 ?? 0);
const 刻数上限 = computed(() => Math.max(1, store.data.当前秘境.刻数上限 ?? 1));
const 刻数pct = computed(() => Math.max(0, Math.min(100, (刻数.value / 刻数上限.value) * 100)));
const 刻数color = computed(() => {
  const p = 刻数pct.value;
  if (p < 15) return 'critical';
  if (p < 30) return 'warning';
  return 'normal';
});

const 宝物数 = computed(() => store.data.当前秘境.已得宝物?.length ?? 0);
const 宝物hover = computed(() => {
  const list = store.data.当前秘境.已得宝物 ?? [];
  return list.length === 0 ? '尚无所得' : '已得: ' + list.join(' · ');
});
</script>

<style lang="scss" scoped>
.mijing-hud {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 14px;
  border-left: 3px solid var(--tier-color, rgba(168, 51, 51, 0.6));
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.45), rgba(20, 12, 12, 0.65));
  box-shadow:
    inset 0 0 0 1px rgba(207, 200, 184, 0.08),
    0 0 12px rgba(168, 51, 51, 0.18);
  min-width: 0;

  &.tier-sky    { --tier-color: #c64545; }
  &.tier-earth  { --tier-color: #c9a94e; }
  &.tier-mystery{ --tier-color: #8a55c6; }
  &.tier-yellow { --tier-color: #888888; }
  &.tier-unknown{ --tier-color: #555555; }
}

.hud-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-brush);
  font-size: 0.95rem;
  color: var(--c-text);
  letter-spacing: 0.12em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hud-icon {
  color: var(--tier-color);
  filter: drop-shadow(0 0 4px var(--tier-color));
}

.hud-sep {
  color: var(--c-text-dim);
  margin: 0 2px;
}

.hud-scene {
  color: var(--c-text-dim);
  font-size: 0.85rem;
}

.hud-stats {
  display: flex;
  gap: 14px;
  align-items: center;
}

.hud-stat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--c-text-dim);

  i {
    font-size: 0.7rem;
    opacity: 0.85;
  }

  span {
    color: var(--c-text);
    font-family: var(--font-ui);
    font-feature-settings: 'tnum';
  }
}

.hud-bar {
  width: 60px;
  height: 3px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.hud-bar-fill {
  height: 100%;
  transition: width 0.3s ease;

  &.normal   { background: linear-gradient(90deg, #c9a94e, #d4b860); }
  &.warning  { background: linear-gradient(90deg, #d68a3c, #e09a4c); }
  &.critical {
    background: linear-gradient(90deg, #c64545, #e05555);
    animation: pulse-critical 1.2s ease-in-out infinite;
  }
}

@keyframes pulse-critical {
  0%, 100% { opacity: 0.85; }
  50%      { opacity: 1; box-shadow: 0 0 8px rgba(198, 69, 69, 0.6); }
}

@media (max-width: 500px) {
  .mijing-hud {
    padding: 2px 6px;
    /* 手机端:改成单行精简,避免挤压右侧 sub-tabs */
    flex-direction: row;
    align-items: center;
    gap: 6px;
    flex: 0 1 auto;
    min-width: 0;
  }
  .hud-title  { font-size: 0.7rem; gap: 3px; flex: 0 1 auto; min-width: 0; }
  .hud-name   { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 7em; }
  .hud-scene  { display: none; } /* 手机端隐藏场景名,省空间 */
  .hud-sep    { display: none; }
  .hud-stats  { gap: 6px; flex: 0 0 auto; }
  .hud-stat   { font-size: 0.62rem; gap: 3px; }
  .hud-stat .hud-bar { display: none; } /* 手机端隐藏进度条,只留数字 */
  .hud-icon   { font-size: 0.7rem; }
}
</style>
