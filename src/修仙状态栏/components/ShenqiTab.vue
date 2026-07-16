<template>
  <div class="page-root">
    <div v-if="allGods.length === 0" class="empty-msg">
      无古神记录
    </div>

    <div v-else class="skill-list">
      <div
        v-for="god in allGods"
        :key="god.name"
        class="skill-card group"
        :class="{ locked: !god.data.收服, equipped: store.data.主角.神契装备 === god.name }"
      >
        <div class="skill-header">
          <i :class="[godIcon(god.name), 'skill-god-icon']"></i>
          <span class="skill-god-name">{{ god.name }}</span>
          <span class="skill-god-title">{{ god.data.神格 }}</span>
          <span v-if="!god.data.收服" class="skill-lock"><i class="fa-solid fa-lock"></i></span>
          <span v-else-if="store.data.主角.神契装备 === god.name" class="skill-equipped"><i class="fa-solid fa-check-circle"></i> 已装备</span>
          <span v-else class="skill-check"><i class="fa-solid fa-check-circle"></i></span>
        </div>
        <div class="skill-body" :class="{ blurred: !god.data.收服 }">
          <div class="skill-name">{{ god.data.神契技能 || '???' }}</div>
          <p class="skill-desc">{{ god.data.神契描述 || '与此古神结契后解锁' }}</p>
        </div>
        <div v-if="!god.data.收服" class="skill-overlay">
          <i class="fa-solid fa-lock skill-overlay-icon"></i>
          <span>结契后解锁</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

const allGods = computed(() =>
  _(store.data.古神列表)
    .entries()
    .map(([name, data]) => ({ name, data }))
    .value()
);

const godIcons: Record<string, string> = {
  '莫尔迦': 'fa-solid fa-crown',
  '维拉': 'fa-solid fa-champagne-glasses',
  '斯芬克丝': 'fa-solid fa-ghost',
  '拉维妮亚': 'fa-solid fa-heart-circle-bolt',
  '克茜拉': 'fa-solid fa-water',
  '奈亚': 'fa-solid fa-mask',
  '胧': 'fa-solid fa-feather-pointed',
};
function godIcon(name: string): string { return godIcons[name] || 'fa-solid fa-star'; }

const PASSIVE_REGEX = /^被动(.+)$/;

function getPassiveLines(desc: string): string[] {
  if (!desc) return [];
  return desc.split(/\r?\n/).map(l => l.trim()).filter(l => PASSIVE_REGEX.test(l));
}
const passiveLinesByGod = computed(() => {
  const map: Record<string, string[]> = {};
  for (const g of allGods.value) {
    if (g.data.神契描述) map[g.name] = getPassiveLines(g.data.神契描述);
  }
  return map;
});
</script>

<style lang="scss" scoped>
.page-root {
  height: 100%;
  overflow-y: auto;
  padding: 18px 28px;
}

.empty-msg {
  text-align: center; padding: 36px;
  color: var(--c-text-dim); font-size: 0.92rem; margin-bottom: 12px;
  font-family: var(--font-ui); font-style: italic;
}

.skill-list {
  display: flex; flex-direction: column; gap: 12px;
}

.skill-card {
  position: relative;
  border: 1px solid rgba(180,180,190,0.15);
  border-left: 3px solid var(--c-gold);
  padding: 14px 16px;
  background: rgba(0,0,0,0.3);
  transition: border-left-color 0.2s;

  &:not(.locked):hover { border-left-color: var(--c-gold-light); }
  &.equipped {
    border-left-color: #34d399;
    background: rgba(4,120,87,0.08);
  }
  &.locked {
    border-left-color: rgba(180,180,190,0.12);
    border-color: rgba(180,180,190,0.08);
  }
}

.skill-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 8px;
}

.skill-god-icon {
  font-size: 1rem; color: var(--c-gold);
  width: 24px; text-align: center;
  .locked & { opacity: 0.4; }
}

.skill-god-name {
  font-size: 1rem; font-weight: 500;
  font-family: var(--font-serif); color: var(--c-text);
  letter-spacing: 0.08em;
  .locked & { color: var(--c-text-dim); }
}

.skill-god-title {
  font-size: 0.65rem; color: var(--c-gold-dim);
  border: 1px solid rgba(207, 200, 184,0.2);
  padding: 2px 8px; border-radius: 2px;
  margin-left: auto;
  .locked & { opacity: 0.5; }
}

.skill-lock, .skill-check {
  font-size: 0.68rem; margin-left: 2px;
}
.skill-lock { color: var(--c-text-dim); opacity: 0.5; }
.skill-check { color: #34d399; }
.skill-equipped { color: #34d399; font-size: 0.68rem; }

.skill-body {
  padding-left: 34px;
  transition: filter 0.2s;
  &.blurred {
    filter: blur(4px);
    user-select: none;
    opacity: 0.5;
  }
}

.skill-name {
  font-size: 0.95rem; color: var(--c-gold);
  font-family: var(--font-serif); letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.skill-desc {
  font-size: 0.82rem; color: var(--c-text-dim);
  line-height: 1.6; margin: 0;
  white-space: pre-line;
}

.skill-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px;
  pointer-events: none;
  color: var(--c-text-dim);
  font-size: 0.82rem;
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
}
.skill-overlay-icon {
  font-size: 1.4rem; opacity: 0.5;
}
</style>
