<template>
  <section class="step">
    <h2>江湖出身</h2>

    <label class="field">
      <span>姓名</span>
      <input v-model="姓名" placeholder="请输入修士姓名" maxlength="20" />
    </label>

    <div class="field">
      <span>性别</span>
      <div class="seg">
        <button :class="{ active: 性别模式 === '男' }" @click="选性别('男')">男</button>
        <button :class="{ active: 性别模式 === '女' }" @click="选性别('女')">女</button>
        <button :class="{ active: 性别模式 === '其他' }" @click="选性别('其他')">其他</button>
      </div>
      <input
        v-if="性别模式 === '其他'"
        v-model="自定义性别"
        placeholder="请输入性别"
        maxlength="10"
        class="custom-gender"
      />
      <span v-if="性别模式 === '待定'" class="hint">请选择或自定义性别</span>
    </div>

    <label class="field">
      <span>人物设定</span>
      <textarea v-model="外貌" rows="3" placeholder="（可选）描述你的容貌、身形、装束"></textarea>
    </label>

    <label class="field">
      <span>出身地</span>
      <select v-model="出身地">
        <option value="待捏角" disabled>—— 请选择 ——</option>
        <option v-for="d in 出身地列表" :key="d.名称" :value="d.名称">
          {{ d.名称 }}（{{ d.区域 }}）
        </option>
      </select>
    </label>

    <div class="field">
      <span>开局灵石</span>
      <div class="灵石控件">
        <button type="button" class="灵石-btn" @click="减灵石" :disabled="灵石 <= 0">−</button>
        <input
          type="number"
          v-model.number="灵石"
          min="0"
          class="灵石-input"
        />
        <button type="button" class="灵石-btn" @click="加灵石">+</button>
        <span class="灵石单位">枚</span>
      </div>
      <p class="hint">每 1000 灵石消耗 1 开局点数，默认 0</p>
    </div>

    <p v-if="当前出身地简介" class="hint">{{ 当前出身地简介 }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 出身地列表 } from '../catalog/出身地';

const { data } = storeToRefs(useDataStore());

const 性别模式 = ref<'男' | '女' | '其他' | '待定'>(
  data.value.主角.性别 === '男' ? '男' :
  data.value.主角.性别 === '女' ? '女' :
  data.value.主角.性别 === '待捏角' ? '待定' : '其他'
);
const 自定义性别 = ref(
  data.value.主角.性别 !== '男' && data.value.主角.性别 !== '女' && data.value.主角.性别 !== '待捏角'
    ? data.value.主角.性别 : ''
);

const 姓名 = computed({
  get: () => data.value.主角.名称 === '待捏角' ? '' : data.value.主角.名称,
  set: v => data.value.主角.名称 = v || '待捏角',
});
const 外貌 = computed({
  get: () => data.value.主角.外貌,
  set: v => data.value.主角.外貌 = v,
});
const 出身地 = computed({
  get: () => data.value.主角.出身地,
  set: v => data.value.主角.出身地 = v,
});

const 灵石 = computed({
  get: () => data.value.主角.灵石,
  set: v => { data.value.主角.灵石 = Math.max(0, Number(v) || 0); },
});

function 减灵石() {
  if (灵石.value >= 1000) data.value.主角.灵石 = 灵石.value - 1000;
  else if (灵石.value > 0) data.value.主角.灵石 = 0;
}
function 加灵石() {
  data.value.主角.灵石 = 灵石.value + 1000;
}

function 选性别(g: string) {
  if (g === '其他') {
    性别模式.value = '其他';
    data.value.主角.性别 = 自定义性别.value || '';
  } else {
    性别模式.value = g as '男' | '女';
    自定义性别.value = '';
    data.value.主角.性别 = g;
  }
}

// 同步自定义性别输入到数据
watch(自定义性别, v => {
  if (性别模式.value === '其他') {
    data.value.主角.性别 = v;
  }
});

const 当前出身地简介 = computed(() => {
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

h2 { @include gold-heading; font-size: 1.7rem; margin: 0 0 1.6rem;
  @include mobile { font-size: 1.3rem; margin: 0 0 1rem; }
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
  input, textarea, select {
    @include xianxia-input;
    font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; }
  }
  select option { background: $bg-soft; color: $paper-cold; font-size: 1.05rem; }
  textarea { resize: vertical; min-height: 5rem; line-height: 1.7; border-radius: $r-sm; }
}

.seg {
  display: flex; gap: 0.4rem;
  @include mobile { flex-direction: column; }
  button {
    @include xianxia-btn;
    flex: 1; padding: 0.7rem;
    font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; padding: 0.55rem; }
    &.active {
      background: linear-gradient(180deg, $blood-glow 0%, $blood-mid 55%, $blood 100%);
      color: #f4e8d8;
      border-color: $blood-bright;
      font-weight: bold;
      box-shadow:
        inset 0 0 14px rgba(255,200,200,0.18),
        0 0 12px rgba(168,51,51,0.4);
    }
  }
}
.custom-gender { margin-top: 0.5rem; }

.灵石控件 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  .灵石-btn {
    @include xianxia-btn;
    width: 2.8rem;
    height: 2.8rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1;
    @include mobile { width: 2.4rem; height: 2.4rem; font-size: 1rem; }
  }
  .灵石-input {
    @include xianxia-input;
    width: 5rem;
    text-align: center;
    font-size: 1.3rem;
    font-weight: bold;
    font-family: $font-serif;
    color: $amber-bright;
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    @include mobile { width: 4rem; font-size: 1.1rem; }
  }
  .灵石单位 {
    color: $paper-dim;
    font-size: 0.95rem;
    font-family: $font-serif;
    letter-spacing: 0.1em;
    @include mobile { font-size: 0.82rem; }
  }
}

.hint {
  font-size: 0.95rem;
  color: $paper-dim;
  font-style: italic;
  margin-top: 0.7rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid $blood-mid;
  background: rgba(80,15,15,0.12);
  border-radius: 0 $r-sm $r-sm 0;
  line-height: 1.7;
  @include mobile { font-size: 0.82rem; padding: 0.4rem 0.55rem; }
}
</style>
