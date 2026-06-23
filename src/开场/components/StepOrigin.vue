<template>
  <section class="step">
    <h2>道途取向</h2>

    <h3>本源（道之根本，自悟）</h3>
    <label class="field">
      <input v-model="本源" placeholder="一字到数字均可，如：剑、心、红尘、杀戮即道…" maxlength="10" />
      <p class="hint-本源">
        本源是你修行的根本理念，由你自悟。AI 会根据你的本源 + 流派，为你独家定制一门自悟功法。
      </p>
    </label>

    <h3>修炼流派</h3>
    <div class="grid">
      <button v-for="s in 流派列表" :key="s.名称"
              :class="{ active: 流派 === s.名称 }"
              @click="选流派(s.名称)">
        <div class="title">{{ s.名称 }}</div>
        <div class="desc">{{ s.简介 }}</div>
        <div class="cost" :class="{ free: s.消耗 === 0 }">
          {{ s.消耗 === 0 ? '免费' : `+${s.消耗} 点` }}
        </div>
      </button>
    </div>

    <h3>灵根</h3>
    <div class="grid grid-灵根">
      <button v-for="g in 灵根列表" :key="g.名称"
              :class="{ active: 灵根 === g.名称 }"
              @click="灵根 = g.名称">
        <div class="title">{{ g.名称 }}</div>
        <div class="desc">{{ g.类型 }}</div>
        <div class="cost" :class="{ free: g.消耗 === 0 }">
          {{ g.消耗 === 0 ? '免费' : `+${g.消耗} 点` }}
        </div>
      </button>
    </div>

    <h3>称号</h3>
    <label class="field">
      <input v-model="称号" placeholder="（默认从修炼流派生成，可改）" />
    </label>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 流派列表 } from '../catalog/流派';
import { 灵根列表 } from '../catalog/灵根';

const { data } = storeToRefs(useDataStore());

const 本源 = computed({
  get: () => data.value.主角.本源 === '待捏角' ? '' : data.value.主角.本源,
  set: v => data.value.主角.本源 = v || '待捏角',
});
const 流派 = computed({
  get: () => data.value.主角.修炼流派,
  set: v => data.value.主角.修炼流派 = v,
});
const 灵根 = computed({
  get: () => data.value.主角.灵根,
  set: v => data.value.主角.灵根 = v,
});
const 称号 = computed({
  get: () => data.value.主角.称号 === '待捏角' ? '' : data.value.主角.称号,
  set: v => data.value.主角.称号 = v || '待捏角',
});

function 选流派(名: string) {
  const 旧流派 = 流派.value;
  // 默认称号 = 流派名本身（如"剑修"、"克苏鲁修"）
  const 旧默认称号 = 旧流派 && 旧流派 !== '待捏角' ? 旧流派 : '待捏角';
  流派.value = 名;
  // 如果当前称号是上一个流派的默认值或仍是"待捏角"，则自动更新；否则尊重玩家自定义
  if (data.value.主角.称号 === 旧默认称号 || data.value.主角.称号 === '待捏角') {
    data.value.主角.称号 = 名;
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
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 0.7rem;
  // 手机端：单列
  @include mobile { grid-template-columns: 1fr; }
  &.grid-灵根 {
    grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
    // 手机端灵根用 2 列
    @include mobile { grid-template-columns: repeat(2, 1fr); }
  }
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
  .desc {
    font-size: 0.85rem;
    color: $paper-dim;
    flex: 1;
    line-height: 1.5;
    @include mobile { font-size: 0.78rem; }
  }
  .cost {
    font-size: 0.85rem;
    align-self: flex-end;
    color: $blood-glow;
    letter-spacing: 0.05em;
    padding: 0.15rem 0.5rem;
    background: rgba(80,15,15,0.25);
    border-radius: $r-xs;
    @include mobile { font-size: 0.78rem; }
    &.free {
      color: $jade;
      background: rgba(40,80,40,0.2);
      &::before { content: "✓ "; }
    }
  }
  &.active .title { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
}

.field {
  display: flex; flex-direction: column; margin: 0.5rem 0;
  input { @include xianxia-input; font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; }
  }
  .hint-本源 {
    font-size: 0.92rem;
    color: $paper-dim;
    margin: 0.4rem 0 0 0;
    font-style: italic;
    padding: 0.5rem 0.75rem;
    border-left: 2px solid $blood-mid;
    background: rgba(80,15,15,0.12);
    border-radius: 0 $r-sm $r-sm 0;
    line-height: 1.7;
    @include mobile { font-size: 0.8rem; padding: 0.4rem 0.55rem; }
  }
}
</style>
