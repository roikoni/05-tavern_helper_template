<template>
  <section class="step">
    <h2>行装功法</h2>

    <div class="tabs">
      <button v-for="t in ['武器','法器','功法']" :key="t"
              :class="{ active: 当前tab === t }"
              @click="当前tab = t as any">{{ t }}</button>
    </div>

    <!-- 开挂模式：神级装备/功法 -->
    <template v-if="开挂">
      <!-- 神级武器 -->
      <div v-if="当前tab === '武器'" class="grid">
        <div class="group">
          <h4>神品武器</h4>
          <div class="cards">
            <button v-for="w in 神级武器列表" :key="w.名称"
                    :class="{ active: 装备武器 === w.名称 }"
                    @click="选神级武器(w.名称)">
              <div class="t">{{ w.名称 }}<span class="badge divine">神</span></div>
              <div class="d">{{ w.描述 }}</div>
              <div class="meta">
                <span v-if="w.适配流派.length" class="src">适配：{{ w.适配流派.join('/') }}</span>
                <span class="cost divine-cost">神品</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 神级法器 -->
      <div v-if="当前tab === '法器'" class="grid">
        <div class="group">
          <h4>神品法器</h4>
          <div class="cards">
            <button v-for="f in 神级法器列表" :key="f.名称"
                    :class="{ active: 装备法器 === f.名称 }"
                    @click="选神级法器(f.名称)">
              <div class="t">{{ f.名称 }}<span class="badge divine">神</span></div>
              <div class="d">{{ f.描述 }}</div>
              <div class="meta">
                <span v-if="f.适配流派.length" class="src">适配：{{ f.适配流派.join('/') }}</span>
                <span class="cost divine-cost">神品</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 神级功法 -->
      <div v-if="当前tab === '功法'" class="grid">
        <div class="group">
          <h4>神级功法</h4>
          <div class="cards">
            <button v-for="g in 神级功法列表" :key="g.名称"
                    :class="{ active: 已学功法集.has(g.名称) }"
                    @click="切换功法(g.名称)">
              <div class="t">{{ g.名称 }}<span class="badge divine">神</span></div>
              <div class="d">{{ g.效果 }}</div>
              <div class="meta">
                <span v-if="g.适配流派.length" class="src">适配：{{ g.适配流派.join('/') }}</span>
                <span class="cost divine-cost">{{ g.类型 }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <p class="hint">开挂模式：所有功法装备皆为神品，点数无限，随意搭配</p>
    </template>

    <!-- 普通/自由模式：原有品阶分组 -->
    <template v-else>
      <!-- 武器 -->
      <div v-if="当前tab === '武器'" class="grid">
        <div v-for="品 in (['凡品','良品','珍品'] as const)" :key="品" class="group">
          <h4>{{ 品 }}（{{ {凡品:1,良品:3,珍品:6}[品] }} 点）</h4>
          <div class="cards">
            <button v-for="w in 武器列表.filter(x => x.品阶 === 品)" :key="w.名称"
                    :class="{ active: 装备武器 === w.名称 }"
                    @click="选武器(w.名称)">
              <div class="t">{{ w.名称 }}</div>
              <div class="d">{{ w.描述 }}</div>
              <div class="meta">
                <span v-if="w.适配流派.length" class="src">适配：{{ w.适配流派.join('/') }}</span>
                <span class="cost" :class="{ 折扣: 装备折扣价(w) < w.消耗, free: 装备折扣价(w) === 0 }">
                  <s v-if="装备折扣价(w) < w.消耗">{{ w.消耗 }}</s>
                  {{ 装备折扣价(w) }} 点
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 法器 -->
      <div v-if="当前tab === '法器'" class="grid">
        <div v-for="品 in (['凡品','良品','珍品'] as const)" :key="品" class="group">
          <h4>{{ 品 }}（{{ {凡品:1,良品:3,珍品:6}[品] }} 点）</h4>
          <div class="cards">
            <button v-for="f in 法器列表.filter(x => x.品阶 === 品)" :key="f.名称"
                    :class="{ active: 装备法器 === f.名称 }"
                    @click="选法器(f.名称)">
              <div class="t">{{ f.名称 }}</div>
              <div class="d">{{ f.描述 }}</div>
              <div class="meta">
                <span v-if="f.适配流派.length" class="src">适配：{{ f.适配流派.join('/') }}</span>
                <span class="cost" :class="{ 折扣: 装备折扣价(f) < f.消耗, free: 装备折扣价(f) === 0 }">
                  <s v-if="装备折扣价(f) < f.消耗">{{ f.消耗 }}</s>
                  {{ 装备折扣价(f) }} 点
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 功法 -->
      <div v-if="当前tab === '功法'" class="grid">
        <div v-for="层 in (['黄阶下品','黄阶中品','黄阶上品','玄阶下品'] as const)" :key="层" class="group">
          <h4>{{ 层 }}（{{ {黄阶下品:1,黄阶中品:3,黄阶上品:5,玄阶下品:8}[层] }} 点）</h4>
          <div class="cards">
            <button v-for="g in 功法列表.filter(x => x.层级 === 层)" :key="g.名称"
                    :class="{ active: 已学功法集.has(g.名称) }"
                    @click="切换功法(g.名称)">
              <div class="t">{{ g.名称 }}<span class="badge">{{ g.类型 }}</span></div>
              <div class="d">{{ g.效果 }}</div>
              <div class="meta">
                <span v-if="g.适配流派.length" class="src">适配：{{ g.适配流派.join('/') }}</span>
                <span class="cost" :class="{ 折扣: 功法折扣价(g) < g.消耗, free: 功法折扣价(g) === 0 }">
                  <s v-if="功法折扣价(g) < g.消耗">{{ g.消耗 }}</s>
                  {{ 功法折扣价(g) }} 点
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <p class="hint">点击卡片选择/取消；武器与法器各只能装备 1 件，功法可学习多个</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 武器列表, type 武器候选 } from '../catalog/武器';
import { 法器列表, type 法器候选 } from '../catalog/法器';
import { 功法列表, type 功法候选 } from '../catalog/功法';
import { 神级武器列表 } from '../catalog/神级装备';
import { 神级法器列表 } from '../catalog/神级装备';
import { 神级功法列表 } from '../catalog/神级功法';
import { 计算装备消耗, 计算功法消耗 } from '../lib/点数';

defineProps<{ 开挂: boolean }>();

const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const { 已选功法 } = storeToRefs(draft);
const 当前tab = ref<'武器' | '法器' | '功法'>('武器');

const 玩家流派 = computed(() => data.value.主角.修炼流派);

const 装备武器 = computed(() => data.value.主角.装备?.武器?.名称 ?? '空置');
const 装备法器 = computed(() => data.value.主角.装备?.法器?.名称 ?? '空置');
const 已学功法集 = computed(() => new Set(已选功法.value));

function 装备折扣价(w: 武器候选 | 法器候选) { return 计算装备消耗(w, 玩家流派.value); }
function 功法折扣价(g: 功法候选)            { return 计算功法消耗(g, 玩家流派.value); }

function 选武器(名: string) {
  const w = 武器列表.find(x => x.名称 === 名)!;
  if (装备武器.value === 名) {
    _.set(data.value, '主角.装备.武器', { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '' });
    return;
  }
  _.set(data.value, '主角.装备.武器', {
    名称: w.名称, 品阶: w.品阶, 描述: w.描述, 属性: w.适配流派.join('/'),
  });
  draft.标记花费();
}

function 选法器(名: string) {
  const f = 法器列表.find(x => x.名称 === 名)!;
  if (装备法器.value === 名) {
    _.set(data.value, '主角.装备.法器', { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '' });
    return;
  }
  _.set(data.value, '主角.装备.法器', {
    名称: f.名称, 品阶: f.品阶, 描述: f.描述, 属性: f.适配流派.join('/'),
  });
  draft.标记花费();
}

// 神级装备选择（开挂模式）
function 选神级武器(名: string) {
  const w = 神级武器列表.find(x => x.名称 === 名)!;
  if (装备武器.value === 名) {
    _.set(data.value, '主角.装备.武器', { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '' });
    return;
  }
  _.set(data.value, '主角.装备.武器', {
    名称: w.名称, 品阶: w.品阶, 描述: w.描述, 属性: w.适配流派.join('/'),
  });
}

function 选神级法器(名: string) {
  const f = 神级法器列表.find(x => x.名称 === 名)!;
  if (装备法器.value === 名) {
    _.set(data.value, '主角.装备.法器', { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '' });
    return;
  }
  _.set(data.value, '主角.装备.法器', {
    名称: f.名称, 品阶: f.品阶, 描述: f.描述, 属性: f.适配流派.join('/'),
  });
}

function 切换功法(名: string) {
  draft.切换功法(名);
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
h4 {
  font-family: $font-serif;
  color: $paper-cold;
  margin: 1.4rem 0 0.7rem;
  font-size: 1.1rem;
  letter-spacing: 0.15em;
  @include mobile { font-size: 0.95rem; margin: 1rem 0 0.5rem; }
  &::before { content: "◇ "; color: $blood-glow; opacity: 0.7; }
}

.tabs {
  display: flex; gap: 0.4rem; margin-bottom: 1rem;
  padding: 0.35rem;
  background: rgba(5,4,7,0.6);
  border: 1px solid rgba(207,200,184,0.12);
  border-radius: $r-md;

  button {
    @include xianxia-btn;
    flex: 1; padding: 0.7rem;
    font-size: 1.1rem;
    border-radius: $r-sm;
    @include mobile { font-size: 0.88rem; padding: 0.55rem; }
    &.active {
      background: linear-gradient(180deg, $blood-glow 0%, $blood-mid 55%, $blood 100%);
      color: #f4e8d8;
      border-color: $blood-bright;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.55);
      box-shadow:
        inset 0 0 14px rgba(255,200,200,0.18),
        0 0 14px rgba(168,51,51,0.4);
    }
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.7rem;
  @include mobile { grid-template-columns: 1fr; }

  button {
    @include xianxia-card;
    text-align: left;
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    cursor: pointer;
    color: $paper-cold;
    font-size: 1rem;
    @include mobile { padding: 0.65rem; font-size: 0.9rem; }

    .t {
      font-family: $font-serif;
      font-weight: bold;
      color: $paper-cold;
      display: flex; justify-content: space-between; align-items: center;
      letter-spacing: 0.05em;
      font-size: 1.05rem;
      @include mobile { font-size: 0.95rem; }
    }
    .badge {
      font-size: 0.78em;
      color: $paper-soft;
      border: 1px solid rgba(207,200,184,0.3);
      padding: 0.1em 0.5em;
      border-radius: $r-pill;
      background: rgba(0,0,0,0.3);
      &.divine {
        color: #ffd8a8;
        border-color: rgba(212,154,90,0.6);
        background: rgba(80,50,20,0.35);
        text-shadow: 0 0 6px rgba(212,154,90,0.5);
      }
    }
    .d {
      font-size: 0.88rem;
      color: $paper-dim;
      flex: 1;
      line-height: 1.55;
      @include mobile { font-size: 0.8rem; }
    }
    .meta {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.82rem;
      @include mobile { flex-wrap: wrap; gap: 0.3rem; }
      .src { color: $paper-faint;
        @include mobile { font-size: 0.75rem; }
      }
      .cost {
        color: $blood-glow;
        letter-spacing: 0.05em;
        padding: 0.15rem 0.5rem;
        background: rgba(80,15,15,0.25);
        border-radius: $r-xs;
        &.divine-cost {
          color: $amber-bright;
          background: rgba(80,50,20,0.35);
          text-shadow: 0 0 6px rgba(212,154,90,0.4);
          letter-spacing: 0.15em;
        }
        &.折扣 {
          color: $amber-bright;
          background: rgba(80,50,20,0.3);
          text-shadow: 0 0 6px rgba(212,154,90,0.4);
        }
        &.free {
          color: $jade;
          background: rgba(40,80,40,0.2);
          &::before { content: "✓ "; }
        }
        s { opacity: 0.4; margin-right: 0.3rem; }
      }
    }
    &.active .t { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
  }
}

.hint {
  font-size: 0.92rem;
  color: $paper-dim;
  margin-top: 1.3rem;
  font-style: italic;
  text-align: center;
  letter-spacing: 0.15em;
  padding: 0.6rem;
  border-top: 1px dashed rgba(207,200,184,0.15);
  @include mobile { font-size: 0.8rem; padding: 0.45rem; margin-top: 0.9rem; }
}
</style>
