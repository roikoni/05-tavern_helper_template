<template>
  <div class="we-page">
    <div v-if="list.length === 0" class="empty">
      <i class="fa-solid fa-map-location-dot empty-icon"></i>
      <p>暂无地区事件</p>
    </div>
    <div v-for="r in list" :key="r.name" class="region-card">
      <div class="region-head">
        <span class="region-name">{{ r.name }}</span>
        <span class="region-area">{{ r.区域 }}</span>
      </div>
      <div class="region-safety">
        <span class="rs-label">安全度</span>
        <div class="rs-bar"><div class="rs-fill" :style="{ width: r.安全度 + '%' }" :class="safetyClass(r.安全度)"></div></div>
        <span class="rs-val">{{ r.安全度 }}</span>
      </div>
      <p v-if="r.当前事件" class="region-event"><i class="fa-solid fa-bolt"></i> {{ r.当前事件 }}</p>
      <p v-if="r.氛围" class="region-mood">氛围：{{ r.氛围 }}</p>
      <div v-if="r.近期传闻 && r.近期传闻.length" class="region-rumors">
        <div class="rr-label"><i class="fa-solid fa-comment-dots"></i> 近期传闻</div>
        <ul>
          <li v-for="(rumor, i) in r.近期传闻" :key="i">{{ rumor }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorldEngineStore } from '../store';
const store = useWorldEngineStore();
const list = computed(() => _(store.data.世界状态.地区事件 || {}).entries().map(([name, v]) => ({ name, ...v })).value());
function safetyClass(v: number) {
  if (v >= 60) return 'safe';
  if (v >= 35) return 'mid';
  return 'danger';
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

.region-card {
  padding: 15px 17px;
  background: linear-gradient(165deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column; gap: 8px;
  transition: border-color 0.35s var(--ease-out-soft), box-shadow 0.35s var(--ease-out-soft), transform 0.3s var(--ease-out-soft);
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.02);
  &:hover {
    border-color: var(--c-border-mid);
    box-shadow: 0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,160,92,0.04);
    transform: translateY(-2px);
  }
}
.region-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.region-name { font-size: 1.04rem; color: var(--c-text); font-weight: 500; letter-spacing: 0.08em; }
.region-area { font-size: 0.72rem; color: var(--c-bronze-light); padding: 3px 10px; border: 1px solid var(--c-bronze-dim); border-radius: var(--radius-pill); background: rgba(201,160,92,0.05); }
.region-safety { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.rs-label { font-size: 0.74rem; color: var(--c-text-faint); width: 48px; letter-spacing: 0.05em; }
.rs-bar { flex: 1; height: 7px; background: rgba(0,0,0,0.4); border-radius: var(--radius-pill); overflow: hidden; }
.rs-fill { height: 100%; border-radius: var(--radius-pill); transition: width 0.6s var(--ease-out-soft); }
.rs-fill.safe { background: linear-gradient(90deg, #3a7a52, #6aba82); }
.rs-fill.mid { background: linear-gradient(90deg, #8a7a3a, var(--c-bronze-light)); }
.rs-fill.danger { background: linear-gradient(90deg, var(--c-accent), var(--c-accent-bright)); }
.rs-val { font-size: 0.74rem; color: var(--c-text-dim); width: 28px; text-align: right; }
.region-event { font-size: 0.88rem; color: var(--c-text-mid); line-height: 1.65; margin: 0;
  i { margin-right: 5px; color: var(--c-accent-bright); opacity: 0.8; font-size: 0.82rem; }
}
.region-mood { font-size: 0.8rem; color: var(--c-text-faint); margin: 0; }
.region-rumors { margin-top: 2px; padding-top: 8px; border-top: 1px solid var(--c-hairline); }
.rr-label { font-size: 0.74rem; color: var(--c-bronze-light); letter-spacing: 0.1em; margin-bottom: 5px;
  i { margin-right: 4px; font-size: 0.72rem; }
}
.region-rumors ul { margin: 0; padding-left: 18px; }
.region-rumors li { font-size: 0.8rem; color: var(--c-text-dim); line-height: 1.75; }
</style>
