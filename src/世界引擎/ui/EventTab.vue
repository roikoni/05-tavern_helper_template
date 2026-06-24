<template>
  <div class="we-page">
    <div v-if="events.length === 0" class="empty">
      <i class="fa-solid fa-book-journal-whills empty-icon"></i>
      <p>尚无世界大事</p>
    </div>
    <div v-else class="timeline">
      <div class="timeline-line"></div>
      <div v-for="(e, i) in events" :key="i" class="tl-entry" :class="{ left: i % 2 === 0, right: i % 2 !== 0 }">
        <div class="tl-node"><div class="tl-dot"></div></div>
        <div class="tl-card">
          <div class="tl-time"><i class="fa-solid fa-hourglass-half"></i> {{ e.时间 || '年代不详' }}</div>
          <h4 class="tl-title">{{ e.事件 || '未名之事' }}</h4>
          <p v-if="e.描述" class="tl-desc">{{ e.描述 }}</p>
          <div v-if="e.影响" class="tl-impact">
            <span class="ti-label">影响</span>
            <p>{{ e.影响 }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorldEngineStore } from '../store';
const store = useWorldEngineStore();
const events = computed(() => store.data.世界状态.世界事件 || []);
</script>

<style lang="scss" scoped>
.we-page { min-height: 100%; }
.empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 40px 0;
  color: var(--c-text-ghost);
}
.empty-icon { font-size: 2.2rem; opacity: 0.25; }
.empty p { font-size: 0.8rem; margin: 0; color: var(--c-text-faint); }

.timeline { position: relative; padding: 10px 0 20px; }
.timeline-line {
  position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
  background: linear-gradient(180deg, transparent, rgba(201,160,92,0.2) 8%, rgba(201,160,92,0.2) 92%, transparent);
  transform: translateX(-50%);
}
.tl-entry {
  position: relative; margin-bottom: 20px; display: flex; justify-content: center;
  &.left { padding-right: 55%; }
  &.right { padding-left: 55%; }
}
.tl-node {
  position: absolute; left: 50%; top: 16px;
  transform: translate(-50%, -50%);
  z-index: 5;
  width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
}
.tl-dot {
  width: 11px; height: 11px;
  border-radius: 50%;
  background: var(--c-accent-bright);
  box-shadow: 0 0 10px var(--c-accent-glow), 0 0 18px rgba(212,86,80,0.25);
  transition: transform 0.35s var(--ease-out-soft), box-shadow 0.35s var(--ease-out-soft);
}
.tl-entry:hover .tl-dot {
  transform: scale(1.3);
  box-shadow: 0 0 14px var(--c-accent-glow), 0 0 28px rgba(212,86,80,0.35);
}
.tl-card {
  width: 100%; padding: 14px 16px;
  background: linear-gradient(165deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.35s var(--ease-out-soft), box-shadow 0.35s var(--ease-out-soft), transform 0.3s var(--ease-out-soft);
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.02);
  &:hover {
    border-color: var(--c-border-mid);
    box-shadow: 0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,160,92,0.04);
    transform: translateY(-2px);
  }
}
.tl-time {
  font-size: 0.74rem; color: var(--c-bronze-light);
  letter-spacing: 0.1em; margin-bottom: 6px;
  i { margin-right: 4px; color: var(--c-accent-bright); opacity: 0.8; font-size: 0.72rem; }
}
.tl-title {
  font-size: 1rem; color: var(--c-text);
  font-weight: 500; letter-spacing: 0.1em;
  margin: 0 0 7px;
  line-height: 1.4;
}
.tl-desc { font-size: 0.86rem; color: var(--c-text-dim); line-height: 1.75; margin: 0; }
.tl-impact {
  margin-top: 10px; padding: 9px 11px;
  background: rgba(212, 86, 80, 0.08);
  border: 1px solid rgba(212, 86, 80, 0.15);
  border-radius: var(--radius-xs);
}
.ti-label { font-size: 0.68rem; color: var(--c-accent-bright); letter-spacing: 0.18em; }
.tl-impact p { font-size: 0.82rem; color: var(--c-text-mid); line-height: 1.7; margin: 4px 0 0; }
</style>
