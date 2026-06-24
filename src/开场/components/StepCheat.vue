<template>
  <section class="step">
    <h2>自定义外挂</h2>
    <p class="hint">开挂模式专属——想要什么挂，自己写。AI 会将这些能力视作主角既有的、不证自明的天赋予以呈现。</p>

    <label class="field">
      <span>自定义能力</span>
      <textarea
        v-model="能力"
        rows="6"
        placeholder="如：&#10;- 不死之身，魂飞魄散亦可重聚&#10;- 一念之间跨越万里，无视阵法禁制&#10;- 可读取他人识海记忆，无距无界&#10;- 天道眷顾，逢凶化吉、机缘自来"
      ></textarea>
    </label>

    <p class="hint">每行一条，自由描述。留空则仅依靠前面的捏角设定。</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDraftStore } from '../draft';

const draft = useDraftStore();
const { 自定义能力 } = storeToRefs(draft);

const 能力 = computed({
  get: () => 自定义能力.value,
  set: v => { 自定义能力.value = v; },
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
  textarea {
    @include xianxia-input;
    font-size: 1.05rem;
    resize: vertical;
    min-height: 8rem;
    line-height: 1.8;
    border-radius: $r-sm;
    @include mobile { font-size: 0.92rem; min-height: 6rem; }
  }
}

.hint {
  font-size: 0.92rem;
  color: $paper-dim;
  font-style: italic;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 0 0;
  border-left: 2px solid $blood-mid;
  background: rgba(80,15,15,0.1);
  border-radius: 0 $r-sm $r-sm 0;
  line-height: 1.7;
  @include mobile { font-size: 0.8rem; padding: 0.4rem 0.55rem; }
}
</style>
