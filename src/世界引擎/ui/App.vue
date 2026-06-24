<template>
  <div class="we-root">
    <!-- 顶部 -->
    <header class="we-header">
      <div class="we-title">
        <span class="we-stamp">界</span>
        <div class="we-title-text">
          <span class="we-title-main">世界引擎</span>
          <span class="we-title-sub">活世界 · 独立推演</span>
        </div>
      </div>
      <div class="we-header-actions">
        <button class="we-btn-primary" :disabled="推进中" @click="on推进">
          <i class="fa-solid fa-forward"></i>
          <span>{{ 推进中 ? '推演中…' : '推进世界' }}</span>
        </button>
        <button class="we-btn-icon" title="关闭" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </header>

    <!-- 推进叙述弹层 -->
    <Transition name="we-fade">
      <div v-if="叙述展示" class="we-narrative" @click="叙述展示 = ''">
        <div class="we-narrative-inner we-corner">
          <div class="we-narrative-label"><i class="fa-solid fa-feather"></i> 本时段世界演变</div>
          <div class="we-divider" style="margin: 10px 0 14px;"></div>
          <p>{{ 叙述展示 }}</p>
          <span class="we-narrative-hint">点击关闭</span>
        </div>
      </div>
    </Transition>

    <!-- tab 栏 -->
    <nav class="we-tabs">
      <button
        v-for="t in tabs"
        :key="t.id"
        class="we-tab-btn"
        :class="{ active: tab === t.id }"
        @click="tab = t.id"
      >
        <i :class="t.icon"></i>
        <span>{{ t.label }}</span>
      </button>
    </nav>

    <!-- 内容 -->
    <div class="we-content">
      <Transition name="we-tab" mode="out-in">
        <div :key="tab" class="we-tab-pane">
          <FactionTab v-if="tab === 'faction'" />
          <NpcTab v-else-if="tab === 'npc'" />
          <RegionTab v-else-if="tab === 'region'" />
          <EventTab v-else-if="tab === 'event'" />
          <UndercurrentTab v-else-if="tab === 'undercurrent'" />
          <SettingsTab v-else-if="tab === 'settings'" />
        </div>
      </Transition>
    </div>

    <div class="we-footer">
      <span class="we-footer-line"></span>
      <span class="we-footer-text">活世界 · 独立推演 · 不围绕主角</span>
      <span class="we-footer-line"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useWorldEngineStore } from '../store';
import { 推进世界 } from '../推进';
import FactionTab from './FactionTab.vue';
import NpcTab from './NpcTab.vue';
import RegionTab from './RegionTab.vue';
import EventTab from './EventTab.vue';
import UndercurrentTab from './UndercurrentTab.vue';
import SettingsTab from './SettingsTab.vue';

defineEmits<{ (e: 'close'): void }>();

const store = useWorldEngineStore();
const tab = ref('faction');
const 推进中 = ref(false);
const 叙述展示 = ref('');

const tabs = [
  { id: 'faction', label: '势力', icon: 'fa-solid fa-flag' },
  { id: 'npc', label: '动向', icon: 'fa-solid fa-person-walking' },
  { id: 'region', label: '地区', icon: 'fa-solid fa-map' },
  { id: 'event', label: '事件', icon: 'fa-solid fa-book-journal-whills' },
  { id: 'undercurrent', label: '暗流', icon: 'fa-solid fa-water' },
  { id: 'settings', label: '设置', icon: 'fa-solid fa-gear' },
];

async function on推进() {
  推进中.value = true;
  try {
    const r = await 推进世界();
    if (r) {
      store.refresh();
      if (r.叙述) 叙述展示.value = r.叙述;
    }
  } finally {
    推进中.value = false;
  }
}
</script>

<style lang="scss" scoped>
.we-root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: var(--font-ui);
  color: var(--c-text);
}

/* ═══ Header ═══ */
.we-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--c-border-mid);
  background: linear-gradient(180deg, rgba(201, 160, 92, 0.05) 0%, transparent 70%);
  flex-shrink: 0;
  position: relative;
}
.we-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 5%;
  right: 5%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--c-border-strong), transparent);
}

.we-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.we-stamp {
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(circle at 35% 35%, rgba(212, 86, 80, 0.35), transparent 55%),
    linear-gradient(145deg, var(--c-stamp-bright), var(--c-stamp));
  border: 2px solid rgba(120, 20, 20, 0.9);
  border-radius: var(--radius-sm);
  font-size: 1.15rem;
  color: rgba(255, 235, 225, 0.95);
  font-family: var(--font-brush);
  box-shadow:
    0 0 18px rgba(196, 58, 58, 0.45),
    inset 0 0 8px rgba(255, 200, 180, 0.15);
  transform: rotate(-5deg);
  flex-shrink: 0;
  letter-spacing: 0.05em;
}
.we-title-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.we-title-main {
  font-family: var(--font-brush);
  font-size: 1.25rem;
  letter-spacing: 0.28em;
  color: var(--c-text);
  text-shadow: 0 0 14px rgba(201, 160, 92, 0.25);
  line-height: 1.2;
}
.we-title-sub {
  font-size: 0.58rem;
  letter-spacing: 0.2em;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
}

.we-header-actions { display: flex; align-items: center; gap: 10px; }

.we-btn-primary {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 18px;
  background: linear-gradient(145deg, rgba(212, 86, 80, 0.22), rgba(100, 24, 24, 0.4));
  border: 1px solid var(--c-border-blood);
  border-radius: var(--radius-sm);
  color: var(--c-text);
  font-family: var(--font-ui);
  font-size: 0.92rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.3s var(--ease-out-soft);
  i { font-size: 0.75rem; }
  &:hover:not(:disabled) {
    box-shadow: 0 0 16px var(--c-accent-glow), inset 0 0 12px rgba(212, 86, 80, 0.08);
    border-color: var(--c-accent-bright);
    background: linear-gradient(145deg, rgba(212, 86, 80, 0.35), rgba(130, 30, 30, 0.5));
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.45; cursor: wait; }
}
.we-btn-icon {
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.35);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  color: var(--c-text-dim);
  cursor: pointer;
  transition: all 0.3s var(--ease-out-soft);
  &:hover { color: var(--c-accent-bright); border-color: var(--c-border-blood); background: rgba(212,86,80,0.08); }
}

/* ═══ Tabs ═══ */
.we-tabs {
  display: flex;
  gap: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--c-border-mid);
  background: rgba(0,0,0,0.25);
  flex-shrink: 0;
  overflow-x: auto;
  position: relative;
}
.we-tabs::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--c-border-strong) 30%, var(--c-border-strong) 70%, transparent 100%);
}

.we-tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 11px 18px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  transition: color 0.3s var(--ease-out-soft);
  margin-bottom: -1px;
  i { font-size: 0.92rem; transition: transform 0.3s var(--ease-out-soft); }
  &:hover {
    color: var(--c-text-dim);
    i { transform: translateY(-1px); }
  }
  &.active {
    color: var(--c-bronze-light);
    border-bottom-color: var(--c-accent-bright);
    i { color: var(--c-accent-bright); }
    &::after {
      content: '';
      position: absolute; bottom: -2px; left: 25%; right: 25%;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--c-accent-bright), transparent);
      box-shadow: 0 0 10px var(--c-accent-glow);
    }
  }
}

/* ═══ Content ═══ */
.we-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

/* ═══ Footer ═══ */
.we-footer {
  padding: 8px 20px;
  border-top: 1px solid var(--c-border);
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-shrink: 0;
}
.we-footer-line {
  flex: 1;
  max-width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--c-border-mid), transparent);
}
.we-footer-text {
  font-size: 0.58rem;
  color: var(--c-text-ghost);
  letter-spacing: 0.2em;
  white-space: nowrap;
  font-family: var(--font-ui);
}

/* ═══ 叙述弹层 ═══ */
.we-narrative {
  position: absolute;
  inset: 0;
  background: rgba(4, 5, 6, 0.82);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
  padding: 28px;
}
.we-narrative-inner {
  max-width: 520px;
  padding: 26px;
  background: linear-gradient(160deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border-mid);
  border-radius: var(--radius-md);
  box-shadow:
    0 4px 32px rgba(0,0,0,0.5),
    0 0 40px rgba(212, 86, 80, 0.12);
  position: relative;
}
.we-narrative-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.76rem; color: var(--c-accent-bright);
  letter-spacing: 0.18em;
  font-family: var(--font-brush);
}
.we-narrative-inner p {
  font-size: 0.86rem; line-height: 1.85; color: var(--c-text-dim);
  letter-spacing: 0.03em; margin: 0;
}
.we-narrative-hint {
  display: block; margin-top: 16px; text-align: right;
  font-size: 0.6rem; color: var(--c-text-ghost);
  letter-spacing: 0.1em;
}

.we-fade-enter-active, .we-fade-leave-active { transition: opacity 0.25s; }
.we-fade-enter-from, .we-fade-leave-to { opacity: 0; }

/* tab 切换顺滑过渡 */
.we-tab-pane { will-change: transform, opacity; }
.we-tab-enter-active { transition: opacity 0.28s var(--ease-out-soft), transform 0.28s var(--ease-out-soft); }
.we-tab-leave-active { transition: opacity 0.18s var(--ease-out-soft), transform 0.18s var(--ease-out-soft); }
.we-tab-enter-from { opacity: 0; transform: translateY(8px); }
.we-tab-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
