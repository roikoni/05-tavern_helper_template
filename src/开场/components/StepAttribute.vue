<template>
  <section class="step">
    <h2>属性</h2>
    <p class="hint">
      每 3 点属性消耗 1 开局点；减点回收点数。
      单项范围 {{ 下限 }}-{{ 上限 }}，基线 10。
      <span v-if="自由">自由模式下境界抬升的属性免费，仅超出境界下限的加点消耗点数。</span>
    </p>

    <div v-for="key in 六维键" :key="key" class="row">
      <span class="name">{{ key }}</span>
      <div class="ctrl">
        <button @click="调整(key, -3)" :disabled="data.主角.六维[key] - 3 < 下限">-3</button>
        <button @click="调整(key, -1)" :disabled="data.主角.六维[key] - 1 < 下限">-1</button>
        <span class="value">{{ data.主角.六维[key] }}</span>
        <button @click="调整(key, +1)" :disabled="data.主角.六维[key] + 1 > 上限">+1</button>
        <button @click="调整(key, +3)" :disabled="data.主角.六维[key] + 3 > 上限">+3</button>
      </div>
    </div>

    <p class="summary">净变化合计：{{ 净变化 }} 属性点 ≈ 消耗 {{ 等价点数 }} 开局点</p>

    <!-- 自由模式：善恶 / san -->
    <template v-if="自由">
      <h3 class="sub">心性</h3>
      <div class="slider-row">
        <span class="name">善恶值</span>
        <div class="slider-ctrl">
          <span class="range-label">邪</span>
          <input type="range" min="-100" max="100" step="1" v-model.number="善恶值" class="slider" />
          <span class="range-label">善</span>
          <span class="value small">{{ 善恶值 }}</span>
        </div>
      </div>
      <div class="slider-row">
        <span class="name">san 值</span>
        <div class="slider-ctrl">
          <span class="range-label">狂</span>
          <input type="range" min="0" max="100" step="1" v-model.number="san值" class="slider" />
          <span class="range-label">稳</span>
          <span class="value small">{{ san值 }}</span>
        </div>
      </div>
      <p class="hint">克苏鲁修玩家可调低 san 开局，拥抱疯狂</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 默认六维基线, 计算属性点数, 境界六维下限, 普通六维上限, 自由六维上限 } from '../lib/点数';

const props = defineProps<{ 自由: boolean }>();
const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const 六维键 = ['力道','体魄','身法','灵力','神识','根骨'] as const;

const 上限 = computed(() => props.自由 ? 自由六维上限 : 普通六维上限);
// 自由模式：境界抬升的六维免费，减点不得低于境界下限（否则会把免费保底回收成点数）
// 普通模式：地板仍是 0
const 下限 = computed(() => props.自由 ? 境界六维下限(data.value.主角.境界) : 0);

function 调整(key: typeof 六维键[number], 增量: number) {
  const 新值 = data.value.主角.六维[key] + 增量;
  if (新值 < 下限.value || 新值 > 上限.value) return;
  data.value.主角.六维[key] = 新值;
  // 净加点超出基线才算消耗；减点不消耗（只回收）
  if (新值 > 默认六维基线) draft.标记花费();
}

const 净变化 = computed(() =>
  Object.values(data.value.主角.六维).reduce((acc, v) => acc + (v - 默认六维基线), 0)
);
// 等价点数：用境界下限作为免费基线，与实际计费一致
const 等价点数 = computed(() => 计算属性点数(data.value.主角.六维 as any, 下限.value));

const 善恶值 = computed({
  get: () => data.value.主角.善恶值,
  set: v => { data.value.主角.善恶值 = Number(v) || 0; },
});
const san值 = computed({
  get: () => data.value.主角.san值,
  set: v => { data.value.主角.san值 = Number(v) || 0; },
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

h2 { @include gold-heading; font-size: 1.7rem; margin: 0 0 1.2rem;
  @include mobile { font-size: 1.3rem; }
}
.sub {
  font-family: $font-serif;
  margin: 1.8rem 0 1rem;
  color: $paper-cold;
  letter-spacing: 0.15em;
  font-size: 1.2rem;
  @include mobile { font-size: 1rem; margin: 1.2rem 0 0.7rem; }
  &::before { content: "▸ "; color: $blood-glow; opacity: 0.7; }
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
      &.small { font-size: 1.1rem; min-width: 2.5rem; color: $paper-cold; text-shadow: none; }
    }
  }
}

// 滑块行
.slider-row {
  @include xianxia-card;
  display: flex; align-items: center;
  padding: 0.8rem 1.1rem;
  margin: 0.55rem 0;
  gap: 0.8rem;
  @include mobile { padding: 0.55rem 0.6rem; gap: 0.4rem; flex-wrap: wrap; }

  .name {
    font-family: $font-serif;
    font-size: 1.1rem;
    min-width: 4.5rem;
    color: $paper-cold;
    letter-spacing: 0.15em;
    @include mobile { font-size: 0.95rem; min-width: 3rem; }
  }
  .slider-ctrl {
    display: flex; align-items: center;
    gap: 0.5rem;
    flex: 1;
    @include mobile { width: 100%; gap: 0.35rem; }

    .range-label {
      font-size: 0.85rem;
      color: $paper-dim;
      letter-spacing: 0.1em;
      @include mobile { font-size: 0.75rem; }
    }
    .slider {
      flex: 1;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      background: linear-gradient(90deg, $blood 0%, $bg-soft 50%, $jade 100%);
      border-radius: $r-pill;
      outline: none;
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 1.1rem; height: 1.1rem;
        border-radius: 50%;
        background: $blood-glow;
        border: 1px solid $blood-bright;
        box-shadow: 0 0 8px rgba(168,51,51,0.5);
        cursor: pointer;
      }
      &::-moz-range-thumb {
        width: 1.1rem; height: 1.1rem;
        border-radius: 50%;
        background: $blood-glow;
        border: 1px solid $blood-bright;
        cursor: pointer;
      }
    }
    .value {
      min-width: 2.5rem;
      text-align: center;
      font-size: 1.1rem;
      font-weight: bold;
      color: $paper-cold;
      font-family: $font-serif;
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
