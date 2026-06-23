<template>
  <section class="step">
    <h2>宗门归属</h2>

    <!-- 正道七宗 -->
    <h3>正道七宗</h3>
    <div class="grid">
      <button v-for="s in 正道宗门" :key="s.名称"
              :class="{ active: 宗门 === s.名称 }"
              @click="选宗门(s)">
        <div class="title">{{ s.名称 }}</div>
        <div class="region">{{ s.区域 }}</div>
        <div class="desc">{{ s.简介 }}</div>
        <div v-if="s.推荐流派.length" class="rec">
          推荐流派：{{ s.推荐流派.join('、') }}
        </div>
      </button>
    </div>

    <!-- 魔道四宗 -->
    <h3>魔道四宗</h3>
    <div class="grid">
      <button v-for="s in 魔道宗门" :key="s.名称"
              :class="{ active: 宗门 === s.名称 }"
              @click="选宗门(s)">
        <div class="title">{{ s.名称 }}</div>
        <div class="region">{{ s.区域 }}</div>
        <div class="desc">{{ s.简介 }}</div>
        <div v-if="s.推荐流派.length" class="rec">
          推荐流派：{{ s.推荐流派.join('、') }}
        </div>
      </button>
    </div>

    <!-- 散修 -->
    <h3>散修</h3>
    <div class="grid">
      <button v-for="s in 散修选项" :key="s.名称"
              :class="{ active: 宗门 === s.名称 }"
              @click="选宗门(s)">
        <div class="title">{{ s.名称 }}</div>
        <div class="region">{{ s.区域 }}</div>
        <div class="desc">{{ s.简介 }}</div>
        <div class="rec free">自由选择流派</div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 宗门列表, type 宗门候选 } from '../catalog/宗门';

const { data } = storeToRefs(useDataStore());

const 宗门 = computed({
  get: () => data.value.主角.宗门,
  set: v => data.value.主角.宗门 = v,
});

const 正道宗门 = computed(() => 宗门列表.filter(s => s.阵营 === '正道'));
const 魔道宗门 = computed(() => 宗门列表.filter(s => s.阵营 === '魔道'));
const 散修选项 = computed(() => 宗门列表.filter(s => s.阵营 === '散修'));

function 选宗门(候选: 宗门候选) {
  宗门.value = 候选.名称;

  // 关联推荐：若流派仍为空或默认值，自动填入该宗门推荐流派
  if (候选.推荐流派.length > 0) {
    const 当前流派 = data.value.主角.修炼流派;
    if (!当前流派 || 当前流派 === '待捏角' || 当前流派 === '散修') {
      data.value.主角.修炼流派 = 候选.推荐流派[0];
    }
  }

  // 选散修时推荐出身地
  if (候选.名称 === '散修') {
    const 当前出身地 = data.value.主角.出身地;
    if (!当前出身地 || 当前出身地 === '待捏角' || 当前出身地 === '未知之地') {
      data.value.主角.出身地 = '散修联盟分舵';
    }
  }
}
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
h3 {
  font-family: $font-serif;
  margin: 1.8rem 0 1rem;
  color: $paper-cold;
  letter-spacing: 0.15em;
  font-size: 1.2rem;
  @include mobile { font-size: 1rem; margin: 1.2rem 0 0.7rem; }
  &::before { content: "▸ "; color: $blood-glow; opacity: 0.7; }
  &.魔道::before { content: "▸ "; color: #8a4a8a; opacity: 0.7; }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  gap: 0.7rem;
  // 手机端：单列
  @include mobile { grid-template-columns: 1fr; }
}

.grid button {
  @include xianxia-card;
  text-align: left;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
  color: $paper-cold;
  font-size: 1rem;
  @include mobile { padding: 0.65rem; font-size: 0.9rem; }

  .title {
    font-weight: bold;
    color: $paper-cold;
    letter-spacing: 0.08em;
  }
  .region {
    font-size: 0.82rem;
    color: $paper-dim;
    letter-spacing: 0.05em;
  }
  .desc {
    font-size: 0.85rem;
    color: $paper-dim;
    flex: 1;
    line-height: 1.5;
    @include mobile { font-size: 0.78rem; }
  }
  .rec {
    font-size: 0.82rem;
    align-self: flex-end;
    color: $blood-glow;
    letter-spacing: 0.05em;
    padding: 0.15rem 0.5rem;
    background: rgba(80,15,15,0.25);
    border-radius: $r-xs;
    &.free {
      color: $jade;
      background: rgba(40,80,40,0.2);
      &::before { content: "✓ "; }
    }
  }
  &.active .title { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
}
</style>
