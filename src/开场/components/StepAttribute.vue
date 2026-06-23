<template>
  <section class="step">
    <h2>资质分配</h2>
    <p class="hint">每 3 点属性消耗 1 开局点；减点回收点数。单项范围 0-30，基线 10。</p>

    <div v-for="key in 六维键" :key="key" class="row">
      <span class="name">{{ key }}</span>
      <div class="ctrl">
        <button @click="调整(key, -3)" :disabled="data.主角.六维[key] - 3 < 0">-3</button>
        <button @click="调整(key, -1)" :disabled="data.主角.六维[key] - 1 < 0">-1</button>
        <span class="value">{{ data.主角.六维[key] }}</span>
        <button @click="调整(key, +1)" :disabled="data.主角.六维[key] + 1 > 30">+1</button>
        <button @click="调整(key, +3)" :disabled="data.主角.六维[key] + 3 > 30">+3</button>
      </div>
    </div>

    <p class="summary">净变化合计：{{ 净变化 }} 属性点 ≈ 消耗 {{ 等价点数 }} 开局点</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 默认六维基线, 计算属性点数 } from '../lib/点数';

const { data } = storeToRefs(useDataStore());
const 六维键 = ['力道','体魄','身法','灵力','神识','根骨'] as const;

function 调整(key: typeof 六维键[number], 增量: number) {
  const 新值 = data.value.主角.六维[key] + 增量;
  if (新值 < 0 || 新值 > 30) return;
  data.value.主角.六维[key] = 新值;
}

const 净变化 = computed(() =>
  Object.values(data.value.主角.六维).reduce((acc, v) => acc + (v - 默认六维基线), 0)
);
const 等价点数 = computed(() => 计算属性点数(data.value.主角.六维 as any));
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

h2 { @include gold-heading; font-size: 1.7rem; margin: 0 0 1.2rem;
  @include mobile { font-size: 1.3rem; }
}
.hint {
  font-size: 0.95rem;
  color: $paper-dim;
  font-style: italic;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 0 1.1rem;
  border-left: 2px solid $blood-mid;
  background: rgba(80,15,15,0.1);
  border-radius: 0 $r-sm $r-sm 0;
  line-height: 1.7;
  @include mobile { font-size: 0.82rem; padding: 0.4rem 0.55rem; }
}

.row {
  @include xianxia-card;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.1rem;
  margin: 0.55rem 0;
  @include mobile { padding: 0.55rem 0.6rem; margin: 0.35rem 0; }

  .name {
    font-family: $font-serif;
    font-size: 1.3rem;
    min-width: 5rem;
    color: $paper-cold;
    letter-spacing: 0.2em;
    @include mobile { font-size: 1.1rem; min-width: 3.5rem; }
    @include tablet { font-size: 1.15rem; min-width: 4rem; }
  }
  .ctrl {
    display: flex; align-items: center; gap: 0.35rem;
    @include mobile { gap: 0.15rem; }
    button {
      @include xianxia-btn;
      padding: 0.4rem 0.7rem;
      min-width: 3rem;
      font-size: 0.95rem;
      @include mobile { padding: 0.3rem 0.45rem; min-width: 2.2rem; font-size: 0.8rem; }
    }
    .value {
      min-width: 3rem;
      text-align: center;
      font-size: 1.6rem;
      font-weight: bold;
      color: $blood-glow;
      padding: 0 0.5rem;
      text-shadow: 0 0 8px rgba(168,51,51,0.4);
      @include mobile { font-size: 1.2rem; min-width: 2.2rem; padding: 0 0.25rem; }
    }
  }
}

.summary {
  margin-top: 1.3rem;
  padding: 0.7rem 0.9rem;
  background: rgba(30,18,18,0.45);
  border-left: 3px solid $blood-mid;
  border-radius: 0 $r-sm $r-sm 0;
  color: $paper-soft;
  font-family: $font-serif;
  font-size: 1.05rem;
  letter-spacing: 0.05em;
  @include mobile { font-size: 0.9rem; padding: 0.5rem 0.6rem; margin-top: 0.9rem; }
}
</style>
