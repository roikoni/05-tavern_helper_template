<template>
  <section class="step">
    <h2>行装功法</h2>

    <div class="tabs">
      <button v-for="t in ['武器','法器','功法']" :key="t"
              :class="{ active: 当前tab === t }"
              @click="当前tab = t as any">{{ t }}</button>
    </div>

    <!-- 武器 -->
    <div v-if="当前tab === '武器'" class="grid">
      <div class="tier-panel">
        <div class="tier-row">
          <button v-for="品 in 武器品阶" :key="品"
                  :class="{ active: 当前品阶 === 品 }"
                  @click="当前品阶 = 品">{{ 品 }}</button>
        </div>
        <div class="cards">
          <template v-if="当前品阶 === '神品'">
            <button v-for="w in 神级武器列表" :key="'s'+w.名称"
                    :class="{ active: 装备武器 === w.名称 }"
                    @click="选神级武器(w.名称)">
              <div class="t">{{ w.名称 }}<span class="badge divine">神</span></div>
              <div class="d">{{ w.描述 }}</div>
              <div class="meta">
                <span v-if="w.适配流派.length" class="src">适配：{{ w.适配流派.join('/') }}</span>
              </div>
            </button>
          </template>
          <template v-else>
            <button v-for="w in 武器列表.filter(x => x.品阶 === 当前品阶)" :key="w.名称"
                    :class="{ active: 装备武器 === w.名称 }"
                    @click="选武器(w.名称)">
              <div class="t">{{ w.名称 }}</div>
              <div class="d">{{ w.描述 }}</div>
              <div class="meta">
                <span v-if="w.适配流派.length" class="src">适配：{{ w.适配流派.join('/') }}</span>
              </div>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 法器 -->
    <div v-if="当前tab === '法器'" class="grid">
      <div class="tier-panel">
        <div class="tier-row">
          <button v-for="品 in 法器品阶" :key="品"
                  :class="{ active: 当前品阶 === 品 }"
                  @click="当前品阶 = 品">{{ 品 }}</button>
        </div>
        <div class="cards">
          <template v-if="当前品阶 === '神品'">
            <button v-for="f in 神级法器列表" :key="'s'+f.名称"
                    :class="{ active: 装备法器 === f.名称 }"
                    @click="选神级法器(f.名称)">
              <div class="t">{{ f.名称 }}<span class="badge divine">神</span></div>
              <div class="d">{{ f.描述 }}</div>
              <div class="meta">
                <span v-if="f.适配流派.length" class="src">适配：{{ f.适配流派.join('/') }}</span>
              </div>
            </button>
          </template>
          <template v-else>
            <button v-for="f in 法器列表.filter(x => x.品阶 === 当前品阶)" :key="f.名称"
                    :class="{ active: 装备法器 === f.名称 }"
                    @click="选法器(f.名称)">
              <div class="t">{{ f.名称 }}</div>
              <div class="d">{{ f.描述 }}</div>
              <div class="meta">
                <span v-if="f.适配流派.length" class="src">适配：{{ f.适配流派.join('/') }}</span>
              </div>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 功法 -->
    <div v-if="当前tab === '功法'" class="grid">
      <div class="tier-panel">
        <div class="tier-row">
          <button v-for="层 in 功法品阶" :key="层"
                  :class="{ active: 当前品阶 === 层 }"
                  @click="当前品阶 = 层">{{ 层 }}</button>
        </div>
        <div class="cards">
          <template v-if="当前品阶 === '神级'">
            <button v-for="g in 神级功法列表" :key="'s'+g.名称"
                    :class="{ active: 已学功法集.has(g.名称) }"
                    @click="切换功法(g.名称)">
              <div class="t">{{ g.名称 }}<span class="badge divine">神</span></div>
              <div class="d">{{ g.效果 }}</div>
              <div class="meta">
                <span v-if="g.适配流派.length" class="src">适配：{{ g.适配流派.join('/') }}</span>
                <span class="badge">{{ g.类型 }}</span>
              </div>
            </button>
          </template>
          <template v-else>
            <button v-for="g in 功法列表.filter(x => x.层级 === 当前品阶)" :key="g.名称"
                    :class="{ active: 已学功法集.has(g.名称) }"
                    @click="切换功法(g.名称)">
              <div class="t">{{ g.名称 }}<span class="badge">{{ g.类型 }}</span></div>
              <div class="d">{{ g.效果 }}</div>
              <div class="meta">
                <span v-if="g.适配流派.length" class="src">适配：{{ g.适配流派.join('/') }}</span>
              </div>
            </button>
          </template>
        </div>
      </div>
    </div>

    <p class="hint">点击卡片选择/取消；武器与法器各只能装备 1 件，功法可学习多个。沙盒模式下所有品阶开放，无消耗限制。</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 武器列表 } from '../catalog/武器';
import { 法器列表 } from '../catalog/法器';
import { 功法列表 } from '../catalog/功法';
import { 神级武器列表 } from '../catalog/神级装备';
import { 神级法器列表 } from '../catalog/神级装备';
import { 神级功法列表 } from '../catalog/神级功法';

const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const { 已选功法 } = storeToRefs(draft);
const 当前tab = ref<'武器' | '法器' | '功法'>('武器');
const 武器品阶 = ['神品', '珍品', '良品', '凡品'] as const;
const 法器品阶 = ['神品', '珍品', '良品', '凡品'] as const;
const 功法品阶 = ['神级', '玄阶下品', '黄阶上品', '黄阶中品', '黄阶下品'] as const;

const 当前品阶 = ref<string>('神品');
watch(当前tab, () => {
  当前品阶.value = 当前tab.value === '功法' ? '神级' : '神品';
});

const 装备武器 = computed(() => data.value.主角.装备?.武器?.名称 ?? '空置');
const 装备法器 = computed(() => data.value.主角.装备?.法器?.名称 ?? '空置');
const 已学功法集 = computed(() => new Set(已选功法.value));

function 选武器(名: string) {
  const w = 武器列表.find(x => x.名称 === 名)!;
  if (装备武器.value === 名) {
    _.set(data.value, '主角.装备.武器', { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '' });
    return;
  }
  _.set(data.value, '主角.装备.武器', {
    名称: w.名称, 品阶: w.品阶, 描述: w.描述, 属性: w.适配流派.join('/'),
  });
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
}

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
.tier-panel {
  border: 1px solid rgba(200,200,210,0.12);
  border-radius: $r-md;
  overflow: hidden;
  background: rgba(6,6,8,0.55);
}

.tier-row {
  display: flex;
  border-bottom: 1px solid rgba(200,200,210,0.08);
  background: rgba(8,8,10,0.6);

  button {
    flex: 1;
    padding: 0.6rem 0.4rem;
    background: transparent;
    border: none;
    color: $paper-dim;
    font-family: $font-serif;
    font-size: 0.92rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    @include mobile { font-size: 0.78rem; padding: 0.5rem 0.2rem; }

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0; top: 20%; bottom: 20%;
      width: 1px;
      background: rgba(200,200,210,0.10);
    }

    &:hover {
      color: $paper-cold;
      background: rgba(200,200,210,0.04);
    }

    &.active {
      color: $blood-glow;
      background: rgba(80,15,15,0.15);
      font-weight: 600;
      box-shadow: inset 0 -2px 0 $blood-glow;
    }
  }
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
  padding: 0.8rem;
  @include mobile { grid-template-columns: 1fr; padding: 0.6rem; }

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
      font-weight: 500;
      color: $paper-dim;
      flex: 1;
      line-height: 1.55;
      @include mobile { font-size: 0.8rem; }
    }
    .meta {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.82rem;
      font-weight: 500;
      @include mobile { flex-wrap: wrap; gap: 0.3rem; }
      .src { color: $paper-dim;
        @include mobile { font-size: 0.75rem; }
      }
    }
    &.active .t { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
  }
}

.hint {
  font-size: 0.92rem;
  font-weight: 500;
  color: $paper-soft;
  margin-top: 1.3rem;
  font-style: italic;
  text-align: center;
  letter-spacing: 0.15em;
  padding: 0.6rem;
  border-top: 1px dashed rgba(200,200,210,0.12);
  @include mobile { font-size: 0.8rem; padding: 0.45rem; margin-top: 0.9rem; }
}
</style>
