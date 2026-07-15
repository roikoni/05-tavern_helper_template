<template>
  <section class="step">
    <h2>出生点</h2>
    <p class="subtitle">于九州大地择一出身之所</p>

    <div class="map-wrap">
      <div class="map-frame">
        <div class="map-placeholder">
          <span class="map-icon">🗺</span>
          <span class="map-text">世界地图 · 待导入</span>
          <span class="map-hint">点击地图区域以选择出生地点</span>
        </div>
        <!-- 地图将由用户后续接入 -->
      </div>

      <div class="map-info">
        <div class="info-row">
          <span class="info-label">当前选择</span>
          <span class="info-value">{{ 出身地 }}</span>
        </div>
        <div v-if="当前地区简介" class="info-desc">{{ 当前地区简介 }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 出身地列表 } from '../catalog/出身地';

const { data } = storeToRefs(useDataStore());

const 出身地 = computed({
  get: () => data.value.主角.出身地,
  set: v => data.value.主角.出身地 = v,
});

const 当前地区简介 = computed(() => {
  const d = 出身地列表.find(x => x.名称 === 出身地.value);
  return d?.简介;
});
</script>

<style scoped lang="scss">
@use './theme' as *;

.step {
  padding: 1.4rem 1.4rem 1.8rem;
  color: $paper-cold;
  font-size: 1.05rem;
  animation: step-in 0.4s ease-out;

  @include mobile { padding: 0.8rem 0.7rem 1.2rem; font-size: 0.92rem; }
  @include tablet { padding: 1rem 1rem 1.4rem; }
}

@keyframes step-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

h2 { @include gold-heading; font-size: 1.7rem; margin: 0 0 0.4rem;
  @include mobile { font-size: 1.3rem; }
}

.subtitle {
  font-family: $font-serif;
  font-size: 0.95rem;
  color: $paper-dim;
  letter-spacing: 0.15em;
  margin: 0 0 1.6rem;
  @include mobile { font-size: 0.82rem; margin-bottom: 1rem; }
}

.map-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.map-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 240px;
  border: 1px solid rgba(207, 200, 184, 0.22);
  border-radius: $r-sm;
  background: linear-gradient(180deg,
    rgba(8, 7, 10, 0.95) 0%,
    rgba(12, 10, 15, 0.92) 100%);
  box-shadow:
    inset 0 0 24px rgba(0, 0, 0, 0.7),
    0 4px 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;

  @include mobile { aspect-ratio: 4 / 3; min-height: 180px; }

  // 四角墨饰
  &::before, &::after {
    content: "";
    position: absolute;
    width: 24px; height: 24px;
    border-color: rgba(207, 200, 184, 0.28);
    pointer-events: none;
    z-index: 2;
  }
  &::before {
    top: 8px; left: 8px;
    border-top: 1px solid;
    border-left: 1px solid;
  }
  &::after {
    bottom: 8px; right: 8px;
    border-bottom: 1px solid;
    border-right: 1px solid;
  }
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: $paper-faint;

  .map-icon {
    font-size: 2.4rem;
    opacity: 0.35;
    filter: grayscale(1);
    @include mobile { font-size: 1.8rem; }
  }
  .map-text {
    font-family: $font-serif;
    font-size: 1.1rem;
    letter-spacing: 0.2em;
    @include mobile { font-size: 0.95rem; }
  }
  .map-hint {
    font-size: 0.82rem;
    opacity: 0.5;
    @include mobile { font-size: 0.72rem; }
  }
}

.map-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  background: rgba(8, 7, 10, 0.6);
  border: 1px solid rgba(207, 200, 184, 0.12);
  border-radius: $r-sm;

  .info-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    .info-label {
      font-family: $font-serif;
      font-size: 0.9rem;
      color: $paper-dim;
      letter-spacing: 0.1em;
      &::before { content: "❖ "; color: $blood-glow; opacity: 0.7; }
    }
    .info-value {
      font-family: $font-serif;
      font-size: 1.05rem;
      color: $paper-cold;
      letter-spacing: 0.08em;
    }
  }

  .info-desc {
    font-size: 0.88rem;
    color: $paper-dim;
    line-height: 1.7;
    padding: 0.4rem 0;
    border-top: 1px solid rgba(207, 200, 184, 0.08);
    margin-top: 0.3rem;
    @include mobile { font-size: 0.78rem; }
  }
}
</style>
