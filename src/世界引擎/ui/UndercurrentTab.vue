<template>
  <div class="we-page">
    <div v-if="list.length === 0" class="empty">
      <i class="fa-solid fa-water empty-icon"></i>
      <p>暂无暗流</p>
    </div>
    <div v-for="u in list" :key="u.name" class="uc-card" :class="{ erupted: u.是否已爆发 }">
      <div class="uc-head">
        <span class="uc-name">{{ u.name }}</span>
        <span v-if="u.是否已爆发" class="uc-badge erupted">已爆发</span>
        <span v-else class="uc-badge" :class="maturityClass(u.成熟度)">{{ maturityLabel(u.成熟度) }}</span>
      </div>
      <div class="uc-maturity">
        <span class="um-label">成熟度</span>
        <div class="um-bar"><div class="um-fill" :style="{ width: u.成熟度 + '%' }" :class="maturityClass(u.成熟度)"></div></div>
        <span class="um-val">{{ u.成熟度 }}/100</span>
      </div>
      <p v-if="u.描述" class="uc-desc">{{ u.描述 }}</p>
      <div v-if="u.涉及势力 && u.涉及势力.length" class="uc-factions">
        <span class="uf-label">涉及：</span>
        <span v-for="f in u.涉及势力" :key="f" class="uf-tag">{{ f }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorldEngineStore } from '../store';
const store = useWorldEngineStore();
const list = computed(() => _(store.data.世界状态.暗流涌动 || {}).entries().map(([name, v]) => ({ name, ...v })).value());
function maturityClass(v: number) {
  if (v >= 80) return 'critical';
  if (v >= 50) return 'high';
  return 'low';
}
function maturityLabel(v: number) {
  if (v >= 80) return '临界';
  if (v >= 50) return '酝酿';
  return '潜伏';
}
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

.uc-card {
  padding: 15px 17px;
  background: linear-gradient(165deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column; gap: 9px;
  transition: border-color 0.35s var(--ease-out-soft), box-shadow 0.35s var(--ease-out-soft), transform 0.3s var(--ease-out-soft), opacity 0.3s var(--ease-out-soft);
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.02);
  &:hover {
    border-color: var(--c-border-mid);
    box-shadow: 0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,160,92,0.04);
    transform: translateY(-2px);
  }
  &.erupted {
    border-color: var(--c-border-blood);
    opacity: 0.7;
    &:hover { opacity: 0.85; }
  }
}
.uc-head { display: flex; align-items: center; gap: 10px; }
.uc-name { font-size: 1.02rem; color: var(--c-text); font-weight: 500; letter-spacing: 0.08em; }
.uc-badge {
  margin-left: auto; font-size: 0.72rem; padding: 3px 10px; border-radius: var(--radius-pill);
  border: 1px solid; letter-spacing: 0.1em; white-space: nowrap;
  &.low { color: var(--c-text-dim); border-color: var(--c-border); }
  &.high { color: var(--c-bronze-light); border-color: var(--c-bronze-dim); background: rgba(201,160,92,0.08); }
  &.critical { color: var(--c-accent-bright); border-color: var(--c-border-blood); background: rgba(212,86,80,0.1); }
  &.erupted { color: var(--c-text-faint); border-color: var(--c-border); }
}
.uc-maturity { display: flex; align-items: center; gap: 10px; }
.um-label { font-size: 0.74rem; color: var(--c-text-faint); width: 50px; letter-spacing: 0.05em; }
.um-bar { flex: 1; height: 7px; background: rgba(0,0,0,0.4); border-radius: var(--radius-pill); overflow: hidden; }
.um-fill { height: 100%; border-radius: var(--radius-pill); transition: width 0.6s var(--ease-out-soft); }
.um-fill.low { background: linear-gradient(90deg, #4a4a5a, #6a6a7a); }
.um-fill.high { background: linear-gradient(90deg, #8a7a3a, var(--c-bronze-light)); }
.um-fill.critical { background: linear-gradient(90deg, var(--c-accent), var(--c-accent-bright)); box-shadow: 0 0 10px var(--c-accent-glow); }
.um-val { font-size: 0.74rem; color: var(--c-text-dim); width: 50px; text-align: right; }
.uc-desc { font-size: 0.86rem; color: var(--c-text-mid); line-height: 1.75; margin: 0; }
.uc-factions { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding-top: 6px; border-top: 1px solid var(--c-hairline); }
.uf-label { font-size: 0.76rem; color: var(--c-text-faint); }
.uf-tag { font-size: 0.74rem; color: var(--c-text-dim); padding: 3px 9px; background: rgba(201,160,92,0.06); border: 1px solid var(--c-border); border-radius: var(--radius-xs); transition: all 0.3s var(--ease-out-soft); }
</style>
