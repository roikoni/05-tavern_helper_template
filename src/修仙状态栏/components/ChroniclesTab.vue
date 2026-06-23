<template>
  <div class="page-root">
    <!-- 势力概况 -->
    <div class="faction-overview">
      <!-- 正魔态势 -->
      <div class="fo-card tension-card">
        <div class="fo-card-header">
          <i class="fa-solid fa-scale-balanced"></i>
          <span>正魔态势</span>
        </div>
        <div class="tension-state">{{ store.data.正魔态势.状态 }}</div>
        <div class="tension-bar-wrap">
          <div class="tension-bar">
            <div
              class="tension-fill"
              :style="{ width: store.data.正魔态势.态势值 + '%' }"
            ></div>
            <div
              v-for="t in [25, 50, 75]"
              :key="t"
              class="tension-tick"
              :style="{ left: t + '%' }"
            ></div>
          </div>
          <div class="tension-labels">
            <span>和平</span>
            <span>摩擦</span>
            <span>冷战</span>
            <span>冲突</span>
            <span>战争</span>
          </div>
        </div>
        <div class="tension-value">态势值 {{ store.data.正魔态势.态势值 }}/100</div>
      </div>

      <!-- 散修联盟 -->
      <div class="fo-card alliance-card">
        <div class="fo-card-header">
          <i class="fa-solid fa-handshake-simple"></i>
          <span>散修联盟</span>
        </div>
        <div class="alliance-rank">{{ store.data.散修联盟.等级 }}</div>
        <div class="alliance-progress-wrap">
          <div class="alliance-progress">
            <div class="alliance-fill" :style="{ width: rankPercent + '%' }"></div>
          </div>
          <span class="alliance-value">{{ store.data.散修联盟.贡献值 }}/{{ nextRankMin }}</span>
        </div>
        <div class="alliance-next" v-if="nextRankName">{{ nextRankName }} {{ rankPercent }}%</div>
      </div>

      <!-- 势力声望 -->
      <div class="fo-card reputation-card">
        <div class="fo-card-header">
          <i class="fa-solid fa-flag"></i>
          <span>势力声望</span>
        </div>
        <div v-if="factionList.length === 0" class="rep-empty">暂无恩怨</div>
        <div v-else class="rep-list">
          <div v-for="f in factionList" :key="f.name" class="rep-row">
            <span class="rep-name">{{ f.name }}</span>
            <div class="rep-bar-wrap">
              <div
                class="rep-bar"
                :class="{ repPos: f.value > 0, repNeg: f.value < 0 }"
                :style="{ width: Math.abs(f.value) + '%' }"
              ></div>
            </div>
            <span class="rep-val" :class="{ pos: f.value > 0, neg: f.value < 0 }">{{ f.value > 0 ? '+' : '' }}{{ f.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="section-divider"><span>大事记</span></div>

    <!-- 空状态 -->
    <div v-if="events.length === 0" class="empty-state">
      <i class="fa-solid fa-book-journal-whills empty-icon"></i>
      <p class="empty-text">尚无大事记载</p>
      <p class="empty-hint">世间纷争，等待书写</p>
    </div>

    <!-- 时间线 -->
    <div v-else class="timeline">
      <div class="timeline-line"></div>
      <div
        v-for="(event, idx) in events"
        :key="idx"
        class="timeline-entry"
        :class="{ left: idx % 2 === 0, right: idx % 2 !== 0 }"
      >
        <div class="timeline-node">
          <div class="node-dot"></div>
          <div class="node-ring"></div>
        </div>

        <div class="event-card">
          <div class="card-time">
            <i class="fa-solid fa-hourglass-half time-icon"></i>
            {{ event.时间 || '年代不详' }}
          </div>
          <h3 class="card-title">{{ event.事件 || '未名之事' }}</h3>
          <p v-if="event.描述" class="card-desc">{{ event.描述 }}</p>
          <div v-if="event.影响" class="card-impact">
            <span class="impact-label">后世影响</span>
            <p class="impact-text">{{ event.影响 }}</p>
          </div>
          <span class="card-index">{{ idx + 1 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

const events = computed(() => store.data.世界.大事记 || []);

const RANK_TABLE: { name: string; min: number }[] = [
  { name: '散修', min: 0 },
  { name: '游侠', min: 100 },
  { name: '执事', min: 300 },
  { name: '堂主', min: 600 },
  { name: '长老', min: 1000 },
];

const rankIdx = computed(() => {
  const cur = store.data.散修联盟.等级;
  const i = RANK_TABLE.findIndex(r => r.name === cur);
  return i >= 0 ? i : 0;
});

const nextRankName = computed(() => {
  const i = rankIdx.value;
  return i + 1 < RANK_TABLE.length ? RANK_TABLE[i + 1].name : null;
});

const nextRankMin = computed(() => {
  const i = rankIdx.value;
  return i + 1 < RANK_TABLE.length ? RANK_TABLE[i + 1].min : RANK_TABLE[i].min;
});

const rankPercent = computed(() => {
  const cur = RANK_TABLE[rankIdx.value];
  const nxt = nextRankMin.value;
  if (nxt === cur.min) return 100;
  return Math.round(((store.data.散修联盟.贡献值 - cur.min) / (nxt - cur.min)) * 100);
});

const factionList = computed(() =>
  _(store.data.势力声望)
    .entries()
    .filter(([, v]) => v !== 0)
    .sortBy(([, v]) => -Math.abs(v))
    .map(([name, value]) => ({ name, value }))
    .value()
);
</script>

<style lang="scss" scoped>
.page-root {
  height: 100%;
  padding: 24px 28px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

/* ===== 势力概况 ===== */
.faction-overview {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.fo-card {
  padding: 14px 16px;
  background: linear-gradient(145deg, rgba(15, 13, 18, 0.85), rgba(5, 4, 7, 0.92));
  border: 1px solid rgba(207, 200, 184, 0.1);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fo-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  letter-spacing: 0.1em;

  i { font-size: 0.6rem; color: var(--c-accent-dim); }
}

/* 正魔态势 */
.tension-state {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: var(--font-ui);
  color: var(--c-accent);
  letter-spacing: 0.15em;
  text-align: center;
}

.tension-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tension-bar {
  height: 8px;
  background: rgba(207, 200, 184, 0.08);
  border-radius: var(--radius-pill);
  position: relative;
  overflow: hidden;
}

.tension-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a8a5e 0%, #8a8a4a 30%, #a88333 55%, #a84033 80%, #6b1a1a 100%);
  border-radius: var(--radius-pill);
  transition: width 0.5s var(--ease-out-soft);
}

.tension-tick {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(207, 200, 184, 0.35);
}

.tension-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.5rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.05em;
}

.tension-value {
  text-align: center;
  font-size: 0.6rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.08em;
}

/* 散修联盟 */
.alliance-rank {
  font-size: 1.1rem;
  font-weight: 600;
  font-family: var(--font-ui);
  color: var(--c-gold-light);
  letter-spacing: 0.15em;
  text-align: center;
}

.alliance-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alliance-progress {
  flex: 1;
  height: 6px;
  background: rgba(207, 200, 184, 0.08);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.alliance-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(207, 200, 184, 0.5), var(--c-gold));
  border-radius: var(--radius-pill);
  transition: width 0.5s var(--ease-out-soft);
}

.alliance-value {
  font-size: 0.55rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  white-space: nowrap;
}

.alliance-next {
  text-align: center;
  font-size: 0.58rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.06em;
}

/* 势力声望 */
.rep-empty {
  text-align: center;
  font-size: 0.7rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  padding: 8px 0;
}

.rep-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rep-row {
  display: grid;
  grid-template-columns: 55px 1fr 32px;
  align-items: center;
  gap: 6px;
}

.rep-name {
  font-size: 0.6rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  letter-spacing: 0.05em;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rep-bar-wrap {
  height: 4px;
  background: rgba(207, 200, 184, 0.06);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.rep-bar {
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width 0.5s var(--ease-out-soft);
  min-width: 2px;

  &.repPos { background: linear-gradient(90deg, var(--c-gold-dim), var(--c-gold)); }
  &.repNeg { background: linear-gradient(90deg, var(--c-accent), var(--c-accent-bright)); }
}

.rep-val {
  font-size: 0.58rem;
  font-family: var(--font-ui);
  letter-spacing: 0.04em;
  text-align: left;
  &.pos { color: #6a9a6e; }
  &.neg { color: var(--c-accent-bright); }
}

/* ===== 分隔线 ===== */
.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(207, 200, 184, 0.15), transparent);
  }

  span {
    font-size: 0.65rem;
    color: var(--c-text-faint);
    font-family: var(--font-ui);
    letter-spacing: 0.2em;
    white-space: nowrap;
  }
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding-top: 24px;
}
.empty-icon {
  font-size: 2.4rem;
  color: var(--c-gold-dim);
  opacity: 0.35;
  margin-bottom: 8px;
  animation: empty-float 4s ease-in-out infinite;
}
@keyframes empty-float {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-6px) rotate(3deg); }
}
.empty-text {
  font-size: 0.95rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  letter-spacing: 0.15em;
  margin: 0;
}
.empty-hint {
  font-size: 0.68rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  font-style: italic;
  letter-spacing: 0.2em;
  margin: 0;
}

/* ===== 时间线 ===== */
.timeline {
  position: relative;
  padding: 10px 0;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(207, 200, 184, 0.25) 10%,
    rgba(207, 200, 184, 0.35) 50%,
    rgba(207, 200, 184, 0.25) 90%,
    transparent
  );
  transform: translateX(-50%);
  pointer-events: none;

  &::before, &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--c-accent);
    box-shadow: 0 0 10px var(--c-accent-glow), 0 0 20px var(--c-accent-glow);
  }
  &::before { top: -2px; }
  &::after  { bottom: -2px; }
}

.timeline-entry {
  position: relative;
  margin-bottom: 28px;
  display: flex;
  justify-content: center;

  &.left  { padding-right: 52%; }
  &.right { padding-left: 52%; }
}

.timeline-node {
  position: absolute;
  left: 50%;
  top: 22px;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  z-index: 5;
}

.node-dot {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c-accent-bright);
  box-shadow:
    0 0 8px var(--c-accent-glow),
    0 0 16px var(--c-accent-glow),
    inset 0 0 3px rgba(255, 255, 255, 0.3);
  z-index: 2;
  animation: node-pulse 3.6s ease-in-out infinite;
}
@keyframes node-pulse {
  0%, 100% {
    box-shadow: 0 0 6px var(--c-accent-glow), 0 0 12px var(--c-accent-glow);
  }
  50% {
    box-shadow: 0 0 14px var(--c-accent-glow), 0 0 28px var(--c-accent-glow), 0 0 40px rgba(168, 51, 51, 0.35);
  }
}

.node-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(207, 200, 184, 0.2);
  border-radius: 50%;
  animation: ring-rotate 12s linear infinite;
}
@keyframes ring-rotate {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.event-card {
  position: relative;
  width: 100%;
  padding: 16px 20px;
  background:
    linear-gradient(145deg, rgba(15, 13, 18, 0.85), rgba(5, 4, 7, 0.92));
  border: 1px solid rgba(207, 200, 184, 0.1);
  border-radius: var(--radius-sm);
  transition: border-color 0.3s, box-shadow 0.35s, transform 0.25s;

  &:hover {
    border-color: rgba(207, 200, 184, 0.25);
    box-shadow:
      0 0 20px rgba(207, 200, 184, 0.06),
      0 0 40px rgba(168, 51, 51, 0.04),
      inset 0 0 20px rgba(207, 200, 184, 0.02);
    transform: translateY(-2px);
  }

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 10%; bottom: 10%;
    width: 2px;
    background: linear-gradient(
      180deg,
      transparent,
      rgba(168, 51, 51, 0.5),
      transparent
    );
    opacity: 0;
    transition: opacity 0.35s;
    border-radius: 1px;
  }
  &:hover::before { opacity: 1; }
}

.card-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.62rem;
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
  margin-bottom: 8px;
}
.time-icon {
  font-size: 0.52rem;
  color: var(--c-accent);
  opacity: 0.7;
}

.card-title {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--c-text);
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
  margin: 0 0 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.card-desc {
  font-size: 0.72rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  line-height: 1.65;
  margin: 0;
  letter-spacing: 0.06em;
}

.card-impact {
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(168, 51, 51, 0.05);
  border: 1px solid rgba(168, 51, 51, 0.12);
  border-radius: var(--radius-xs);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(168, 51, 51, 0.35),
      transparent
    );
  }
}
.impact-label {
  font-size: 0.56rem;
  color: var(--c-accent);
  font-family: var(--font-ui);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
.impact-text {
  font-size: 0.68rem;
  color: var(--c-text-mid);
  font-family: var(--font-ui);
  line-height: 1.55;
  margin: 4px 0 0;
  letter-spacing: 0.05em;
}

.card-index {
  position: absolute;
  top: -10px;
  right: -8px;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(135deg, rgba(168, 51, 51, 0.7), rgba(80, 10, 10, 0.7));
  border: 1px solid rgba(168, 51, 51, 0.3);
  border-radius: var(--radius-sm);
  font-size: 0.58rem;
  font-weight: 500;
  font-family: var(--font-ui);
  color: #e8e0d0;
  letter-spacing: 0.05em;
  box-shadow: 0 0 10px rgba(168, 51, 51, 0.3);
}

/* ===== 手机端 ===== */
@media (max-width: 500px) {
  .page-root { padding: 14px 10px; }

  .faction-overview {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .fo-card { padding: 10px 12px; gap: 6px; }

  .rep-row { grid-template-columns: 48px 1fr 28px; }

  .section-divider { margin-bottom: 14px; }

  .timeline-entry {
    &.left  { padding-right: 46%; }
    &.right { padding-left: 46%; }
  }
  .event-card { padding: 12px 14px; }
  .card-title { font-size: 0.8rem; }
  .card-desc { font-size: 0.65rem; }
  .card-time { font-size: 0.56rem; }
  .card-index { width: 18px; height: 18px; font-size: 0.5rem; }
}
</style>
