<template>
  <section class="step">
    <h2>世界设定</h2>
    <p class="hint">设定开局的世界时间与纪元，留给剧情一个时间锚点。</p>

    <label class="field">
      <span>当前年号</span>
      <input v-model="年号" placeholder="如：太初、永宁、混沌历" maxlength="10" />
    </label>

    <label class="field">
      <span>当前时间</span>
      <input v-model="时间" placeholder="如：太初三年·春·卯时 / 混沌历元年" maxlength="30" />
    </label>

    <p class="hint">留空则沿用世界书默认（太初 / 混沌历元年）。</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';

const { data } = storeToRefs(useDataStore());

const 年号 = computed({
  get: () => data.value.世界.当前年号,
  set: v => { data.value.世界.当前年号 = v; },
});
const 时间 = computed({
  get: () => data.value.世界.当前时间,
  set: v => { data.value.世界.当前时间 = v; },
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

.field {
  display: flex; flex-direction: column; gap: 0.5rem;
  margin: 1.3rem 0;
  @include mobile { margin: 0.9rem 0; }
  > span {
    font-family: $font-serif;
    font-size: 1.05rem;
    color: $paper-cold;
    letter-spacing: 0.15em;
    @include mobile { font-size: 0.92rem; }
    &::before { content: "❖ "; color: $blood-glow; opacity: 0.7; }
  }
  input {
    @include xianxia-input;
    font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; }
  }
}

.hint {
  font-size: 0.92rem;
  color: $paper-dim;
  font-style: italic;
  margin-top: 0.7rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid $blood-mid;
  background: rgba(80,15,15,0.12);
  border-radius: 0 $r-sm $r-sm 0;
  line-height: 1.7;
  @include mobile { font-size: 0.8rem; padding: 0.4rem 0.55rem; }
}
</style>
