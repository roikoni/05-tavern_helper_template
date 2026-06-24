<template>
  <div class="we-page">
    <div v-if="list.length === 0" class="empty">
      <i class="fa-solid fa-person-walking-arrow-right empty-icon"></i>
      <p>暂无人物动向</p>
    </div>
    <div v-for="p in list" :key="p.name" class="npc-card">
      <div class="npc-head">
        <div class="npc-name-wrap">
          <span class="npc-name">{{ p.name }}</span>
          <span v-if="p.称号" class="npc-title">{{ p.称号 }}</span>
        </div>
        <div class="npc-head-right">
          <span class="npc-state" :class="{ warn: p.状态 !== '正常' }">{{ p.状态 }}</span>
          <button
            class="npc-del"
            :class="{ confirming: 待确认 === p.name }"
            :title="待确认 === p.name ? '再次点击确认删除' : '不再记录该角色'"
            @click="onDelete(p.name)"
          >
            <i class="fa-solid" :class="待确认 === p.name ? 'fa-check' : 'fa-user-slash'"></i>
            <span v-if="待确认 === p.name" class="npc-del-text">确认</span>
          </button>
        </div>
      </div>
      <div class="npc-meta">
        <span v-if="p.势力"><i class="fa-solid fa-flag"></i> {{ p.势力 }}</span>
        <span v-if="p.所在地"><i class="fa-solid fa-location-dot"></i> {{ p.所在地 }}</span>
      </div>
      <p v-if="p.当前动向" class="npc-move"><i class="fa-solid fa-person-walking"></i> {{ p.当前动向 }}</p>
      <p v-if="p.最近变化" class="npc-change">{{ p.最近变化 }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import { useWorldEngineStore } from '../store';
const store = useWorldEngineStore();
const list = computed(() => _(store.data.世界状态.人物动向 || {}).entries().map(([name, v]) => ({ name, ...v })).value());

// 两步确认删除：首次点击进入「待确认」，3 秒内再次点击才真正删除
const 待确认 = ref<string | null>(null);
let 还原定时器: ReturnType<typeof setTimeout> | null = null;

function 清除待确认() {
  待确认.value = null;
  if (还原定时器) { clearTimeout(还原定时器); 还原定时器 = null; }
}

function onDelete(name: string) {
  if (待确认.value === name) {
    清除待确认();
    delete store.data.世界状态.人物动向[name];
    store.persist();
    toastr.success(`已不再记录「${name}」`);
    return;
  }
  待确认.value = name;
  if (还原定时器) clearTimeout(还原定时器);
  还原定时器 = setTimeout(清除待确认, 3000);
}

onUnmounted(清除待确认);
</script>

<style lang="scss" scoped>
.we-page { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-content: start; }
.empty {
  grid-column: 1 / -1;
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 40px 0;
  color: var(--c-text-ghost);
}
.empty-icon { font-size: 2.2rem; opacity: 0.25; }
.empty p { font-size: 0.8rem; margin: 0; color: var(--c-text-faint); }

.npc-card {
  padding: 15px 17px;
  background: linear-gradient(165deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-left: 3px solid var(--c-accent-dim);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column; gap: 8px;
  transition: border-color 0.35s var(--ease-out-soft), box-shadow 0.35s var(--ease-out-soft), transform 0.3s var(--ease-out-soft);
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.02);
  &:hover {
    border-left-color: var(--c-accent-bright);
    border-color: var(--c-border-mid);
    box-shadow: 0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,160,92,0.04);
    transform: translateY(-2px);
  }
}
.npc-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.npc-name-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.npc-head-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.npc-del {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  width: 28px; height: 28px;
  padding: 0;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  color: var(--c-text-ghost);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s var(--ease-out-soft);
  i { font-size: 0.8rem; line-height: 1; }
  &:hover {
    color: var(--c-accent-bright);
    border-color: var(--c-border-blood);
    background: rgba(212,86,80,0.08);
  }
  &.confirming {
    width: auto;
    padding: 0 10px;
    color: var(--c-accent-bright);
    border-color: var(--c-border-blood);
    background: rgba(212,86,80,0.18);
    animation: npc-del-pulse 1s ease-in-out infinite;
  }
}
.npc-del-text { font-size: 0.72rem; letter-spacing: 0.08em; white-space: nowrap; }
@keyframes npc-del-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(212,86,80,0); }
  50% { box-shadow: 0 0 10px rgba(212,86,80,0.4); }
}
.npc-name { font-size: 1.04rem; color: var(--c-text); font-weight: 500; letter-spacing: 0.08em; }
.npc-title { font-size: 0.76rem; color: var(--c-bronze-light); letter-spacing: 0.06em; padding: 2px 8px; border: 1px solid var(--c-bronze-dim); border-radius: var(--radius-xs); }
.npc-state {
  font-size: 0.72rem; color: var(--c-text-faint);
  padding: 3px 10px; border: 1px solid var(--c-border); border-radius: var(--radius-pill);
  white-space: nowrap; flex-shrink: 0;
  transition: all 0.3s var(--ease-out-soft);
  &.warn {
    color: var(--c-accent-bright);
    border-color: var(--c-border-blood);
    background: rgba(212,86,80,0.1);
  }
}
.npc-meta {
  display: flex; gap: 16px;
  font-size: 0.8rem; color: var(--c-text-dim);
  padding-bottom: 6px;
  border-bottom: 1px solid var(--c-hairline);
  i { margin-right: 4px; opacity: 0.6; color: var(--c-bronze); font-size: 0.74rem; }
}
.npc-move { font-size: 0.88rem; color: var(--c-text-mid); line-height: 1.65; margin: 0;
  i { margin-right: 5px; color: var(--c-accent-bright); opacity: 0.8; font-size: 0.82rem; }
}
.npc-change { font-size: 0.8rem; color: var(--c-text-faint); line-height: 1.65; margin: 0; font-style: italic; }
</style>
