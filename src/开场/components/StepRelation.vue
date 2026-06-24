<template>
  <section class="step">
    <h2>人脉羁绊</h2>
    <p class="hint">预设重要人物与古神 boss 的初始好感、关系与神契。所有数值均可自由改写。</p>

    <!-- 人类 NPC 组 -->
    <div class="group">
      <button class="group-head" @click="人类展开 = !人类展开">
        <span class="g-icon">{{ 人类展开 ? '▾' : '▸' }}</span>
        <span class="g-title">尘世之人</span>
        <span class="g-count">{{ 人类列表.length }}</span>
      </button>
      <Transition name="fold">
        <div v-show="人类展开" class="group-body">
          <div v-for="p in 人类列表" :key="p.名称" class="person">
            <div class="head">
              <div class="t">
                <span class="n">{{ p.名称 }}</span>
                <span class="badge">{{ p.称号 }}</span>
              </div>
              <div class="meta">{{ p.境界 }} · {{ p.势力 }} · {{ p.所在地 }}</div>
              <div class="desc">{{ p.描述 }}</div>
            </div>
            <div class="ctrls">
              <div class="line">
                <span class="lab">好感</span>
                <span class="rl">厌</span>
                <input type="range" min="-100" max="100" step="1" :value="好感态(p.名称)" @input="设好感(p.名称, Number(($event.target as HTMLInputElement).value))" class="slider" />
                <span class="rl">慕</span>
                <span class="num">{{ 好感态(p.名称) }}</span>
              </div>
              <label class="ck">
                <input type="checkbox" :checked="攻略态(p.名称)" @change="设攻略(p.名称, ($event.target as HTMLInputElement).checked)" />
                <span>已攻略</span>
              </label>
              <label class="rel">
                <span class="lab">关系</span>
                <input type="text" :value="关系态(p.名称, p.默认关系)" @input="设关系(p.名称, ($event.target as HTMLInputElement).value)" placeholder="如：陌路人 / 师徒 / 挚友" />
              </label>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 古神 / 外神组 -->
    <div class="group">
      <button class="group-head 古神" @click="古神展开 = !古神展开">
        <span class="g-icon">{{ 古神展开 ? '▾' : '▸' }}</span>
        <span class="g-title">诸神深渊</span>
        <span class="g-count">{{ 古神列表.length }}</span>
      </button>
      <Transition name="fold">
        <div v-show="古神展开" class="group-body">
          <div v-for="p in 古神列表" :key="p.名称" class="person 古神">
            <div class="head">
              <div class="t">
                <span class="n">{{ p.名称 }}</span>
                <span class="badge">{{ p.称号 }}</span>
              </div>
              <div class="meta">{{ p.境界 }} · {{ p.势力 }} · {{ p.所在地 }}</div>
              <div class="desc">{{ p.描述 }}</div>
            </div>
            <div class="ctrls">
              <template v-if="p.默认神契">
                <!-- 胧：神契 + 沉沦值 -->
                <label class="ck">
                  <input type="checkbox" :checked="神契态(p.名称)" @change="切神契(p.名称, ($event.target as HTMLInputElement).checked)" />
                  <span>神契同行</span>
                </label>
                <div class="line" v-if="神契态(p.名称)">
                  <span class="lab">沉沦值</span>
                  <input type="range" min="0" max="100" step="1" :value="沉沦态(p.名称)" @input="设沉沦(p.名称, Number(($event.target as HTMLInputElement).value))" class="slider" />
                  <span class="num">{{ 沉沦态(p.名称) }}</span>
                </div>
              </template>
              <template v-else>
                <!-- 其余古神 boss：好感 + 攻略 -->
                <div class="line">
                  <span class="lab">好感</span>
                  <span class="rl">厌</span>
                  <input type="range" min="-100" max="100" step="1" :value="好感态(p.名称)" @input="设好感(p.名称, Number(($event.target as HTMLInputElement).value))" class="slider" />
                  <span class="rl">慕</span>
                  <span class="num">{{ 好感态(p.名称) }}</span>
                </div>
                <label class="ck">
                  <input type="checkbox" :checked="攻略态(p.名称)" @change="设攻略(p.名称, ($event.target as HTMLInputElement).checked)" />
                  <span>已攻略</span>
                </label>
              </template>
              <label class="rel">
                <span class="lab">关系</span>
                <input type="text" :value="关系态(p.名称, p.默认关系)" @input="设关系(p.名称, ($event.target as HTMLInputElement).value)" placeholder="如：陌路人 / 共生 / 宿敌" />
              </label>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 人物列表 } from '../catalog/人物';

const { data } = storeToRefs(useDataStore());

// 分组：人类 NPC / 古神与外神（含胧）
const 人类列表 = computed(() => 人物列表.filter(p => !p.古神));
const 古神列表 = computed(() => 人物列表.filter(p => p.古神));

const 人类展开 = ref(true);
const 古神展开 = ref(false);

// 重要人物读写（古神 boss 也写入 重要人物，便于统一呈现）
function 确保人物(名: string) {
  if (!data.value.重要人物[名]) data.value.重要人物[名] = {} as any;
  return data.value.重要人物[名];
}

function 好感态(名: string): number {
  return Number(data.value.重要人物[名]?.好感度 ?? 0);
}
function 设好感(名: string, v: number) {
  确保人物(名).好感度 = v;
}
function 攻略态(名: string): boolean {
  return Boolean(data.value.重要人物[名]?.攻略);
}
function 设攻略(名: string, v: boolean) {
  确保人物(名).攻略 = v;
}
function 关系态(名: string, 默认: string): string {
  const cur = data.value.重要人物[名]?.关系;
  return cur && cur !== '中立' ? cur : 默认;
}
function 设关系(名: string, v: string) {
  确保人物(名).关系 = v;
}

// 胧：神契 + 沉沦值，写往 古神列表 / 主角.神契装备
function 神契态(名: string): boolean {
  if (名 === '胧') return Boolean(data.value.古神列表?.胧?.收服);
  return Boolean(data.value.重要人物[名]?.攻略);
}
function 切神契(名: string, v: boolean) {
  if (名 === '胧') {
    if (!data.value.古神列表) data.value.古神列表 = {} as any;
    if (!data.value.古神列表.胧) data.value.古神列表.胧 = { 神格: '戏言', 领域: '谎言', 位阶: '下位神', 状态: '寄生', 收服: false, 沉沦值: 0 } as any;
    data.value.古神列表.胧.收服 = v;
    data.value.主角.神契装备 = v ? '胧（戏言之蝶）' : '';
    if (v) 确保人物('胧').关系 = '共生';
  }
}
function 沉沦态(名: string): number {
  if (名 === '胧') return Number(data.value.古神列表?.胧?.沉沦值 ?? 0);
  return 0;
}
function 设沉沦(名: string, v: number) {
  if (名 === '胧') {
    切神契('胧', true); // 调沉沦隐含神契
    data.value.古神列表.胧.沉沦值 = v;
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
.hint {
  font-size: 0.92rem;
  color: $paper-dim;
  font-style: italic;
  padding: 0.5rem 0.75rem;
  margin: 0 0 1.1rem;
  border-left: 2px solid $blood-mid;
  background: rgba(80,15,15,0.1);
  border-radius: 0 $r-sm $r-sm 0;
  line-height: 1.7;
  @include mobile { font-size: 0.8rem; padding: 0.4rem 0.55rem; }
}

// 分组折叠
.group {
  margin: 0.8rem 0;
}

.group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 0.9rem;
  background: linear-gradient(180deg, rgba(22,19,24,0.9) 0%, rgba(10,9,13,0.95) 100%);
  border: 1px solid rgba(207,200,184,0.2);
  border-radius: $r-md;
  color: $paper-cold;
  font-family: $font-serif;
  font-size: 1.1rem;
  letter-spacing: 0.2em;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.5);
  @include mobile { padding: 0.55rem 0.7rem; font-size: 0.95rem; gap: 0.4rem; }

  .g-icon {
    color: $blood-glow;
    font-size: 0.85em;
    width: 1em;
    text-align: center;
  }
  .g-title { flex: 1; text-align: left; }
  .g-count {
    font-size: 0.72rem;
    color: $paper-dim;
    border: 1px solid rgba(207,200,184,0.25);
    padding: 0.1em 0.6em;
    border-radius: $r-pill;
    background: rgba(0,0,0,0.3);
    letter-spacing: 0.05em;
  }

  &:hover {
    border-color: rgba(207,200,184,0.45);
    box-shadow: inset 0 0 14px rgba(0,0,0,0.55), 0 0 10px rgba(207,200,184,0.08);
  }
  &.古神 {
    border-color: rgba(138, 74, 138, 0.4);
    background: linear-gradient(180deg, rgba(28,20,32,0.9) 0%, rgba(12,9,15,0.95) 100%);
    .g-icon { color: #a86aa8; }
    &:hover { border-color: rgba(168,51,168,0.5); }
  }
}

.group-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.6rem 0 0.2rem;
}

// 折叠动画
.fold-enter-active, .fold-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
}
.fold-enter-from, .fold-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.person {
  @include xianxia-card;
  padding: 0.9rem 1rem;
  margin: 0.6rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  @include mobile { padding: 0.65rem 0.7rem; }

  &.古神 {
    border-color: rgba(138, 74, 138, 0.45);
    background:
      linear-gradient(180deg, rgba(28,20,32,0.85) 0%, rgba(12,9,15,0.95) 100%);
    &.active, &:hover { border-color: rgba(168,51,168,0.5); }
  }

  .head {
    .t {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      .n {
        font-family: $font-serif;
        font-weight: bold;
        font-size: 1.15rem;
        color: $paper-cold;
        letter-spacing: 0.08em;
        @include mobile { font-size: 1rem; }
      }
      .badge {
        font-size: 0.72rem;
        color: $paper-soft;
        border: 1px solid rgba(207,200,184,0.3);
        padding: 0.1em 0.5em;
        border-radius: $r-pill;
        background: rgba(0,0,0,0.3);
        @include mobile { font-size: 0.66rem; }
      }
    }
    .meta {
      font-size: 0.78rem;
      color: $paper-dim;
      letter-spacing: 0.03em;
      margin-top: 0.2rem;
      @include mobile { font-size: 0.72rem; }
    }
    .desc {
      font-size: 0.82rem;
      color: $paper-faint;
      line-height: 1.55;
      margin-top: 0.3rem;
      @include mobile { font-size: 0.76rem; }
    }
  }

  .ctrls {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-top: 0.4rem;
    border-top: 1px dashed rgba(207,200,184,0.12);
  }

  .line {
    display: flex; align-items: center; gap: 0.4rem;
    @include mobile { flex-wrap: wrap; }
    .lab {
      font-family: $font-serif;
      font-size: 0.9rem;
      color: $paper-cold;
      min-width: 3rem;
      letter-spacing: 0.1em;
      @include mobile { min-width: 2.5rem; font-size: 0.82rem; }
    }
    .rl {
      font-size: 0.78rem;
      color: $paper-dim;
      @include mobile { font-size: 0.7rem; }
    }
    .num {
      min-width: 2.2rem;
      text-align: center;
      font-weight: bold;
      color: $blood-glow;
      font-family: $font-serif;
      @include mobile { min-width: 1.8rem; }
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
        width: 1rem; height: 1rem;
        border-radius: 50%;
        background: $blood-glow;
        border: 1px solid $blood-bright;
        box-shadow: 0 0 8px rgba(168,51,51,0.5);
        cursor: pointer;
      }
      &::-moz-range-thumb {
        width: 1rem; height: 1rem;
        border-radius: 50%;
        background: $blood-glow;
        border: 1px solid $blood-bright;
        cursor: pointer;
      }
    }
  }

  .ck {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.9rem;
    color: $paper-cold;
    cursor: pointer;
    font-family: $font-serif;
    letter-spacing: 0.1em;
    @include mobile { font-size: 0.82rem; }
    input { width: 1rem; height: 1rem; accent-color: $blood-glow; cursor: pointer; }
  }

  .rel {
    display: flex; align-items: center; gap: 0.4rem;
    .lab {
      font-family: $font-serif;
      font-size: 0.9rem;
      color: $paper-cold;
      min-width: 3rem;
      letter-spacing: 0.1em;
      @include mobile { min-width: 2.5rem; font-size: 0.82rem; }
    }
    input {
      @include xianxia-input;
      flex: 1;
      font-size: 0.9rem;
      padding: 0.4rem 0.6rem;
      @include mobile { font-size: 0.82rem; }
    }
  }
}
</style>
