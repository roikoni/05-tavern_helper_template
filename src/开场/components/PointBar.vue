<template>
  <div class="point-bar" :class="{ '超支': 模式 !== '开挂' && 剩余 < 0 }">
    <span class="orn left">❖</span>
    <span class="label">灵悟点数</span>
    <span class="value">
      <span v-if="模式 === '开挂'" class="num infinite">∞</span>
      <span v-else class="num">{{ 剩余 }}</span>
      <span class="slash">/</span>
      <span class="total">{{ 模式 === '开挂' ? '∞' : 点数池 }}</span>
    </span>

    <!-- 自由模式掷骰 -->
    <button
      v-if="模式 === '自由'"
      class="roll-btn"
      :class="{ locked: 锁定 }"
      :disabled="锁定"
      :title="锁定 ? '已花费点数，无法重新掷骰' : '掷 0~100 决定点数预算'"
      @click="onRoll"
    >
      <span class="dice">🎲</span>
      <span class="roll-label">{{ 锁定 ? '已锁定' : '掷骰' }}</span>
    </button>

    <span v-if="模式 !== '开挂' && 剩余 < 0" class="warn">⚠ 超支 {{ -剩余 }} 点</span>
    <span class="orn right">❖</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 计算剩余点数, type 玩家选择 } from '../lib/点数';

const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const { 模式, 点数池, 锁定 } = storeToRefs(draft);

// 本地聚合当前选择——直接读 data.value.主角，确保各步写入能即时反映到剩余点数
const 当前选择 = computed<玩家选择>(() => {
  const 主角 = data.value.主角;
  const 已购武器 = 主角.装备?.武器?.名称 && 主角.装备.武器.名称 !== '空置'
    ? [主角.装备.武器.名称]
    : [];
  const 已购法器 = 主角.装备?.法器?.名称 && 主角.装备.法器.名称 !== '空置'
    ? [主角.装备.法器.名称]
    : [];
  return {
    本源: 主角.本源,
    流派: 主角.修炼流派,
    灵根: 主角.灵根,
    宗门: 主角.宗门,
    境界: 主角.境界,
    已购武器,
    已购法器,
    已选功法: draft.已选功法,
    六维: 主角.六维 as any,
    灵石: 主角.灵石,
  };
});

const 剩余 = computed(() => 计算剩余点数(当前选择.value, 点数池.value));

function onRoll() {
  if (锁定.value) return;
  draft.roll();
}
</script>

<style scoped lang="scss">
@use './theme' as *;

.point-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1.4rem;
  background: linear-gradient(180deg,
    rgba(10,9,13,0.98) 0%,
    rgba(5,4,7,0.98) 100%);
  border-bottom: 1px solid rgba(207,200,184,0.18);
  color: $paper-cold;
  font-family: $font-serif;
  font-size: 1.05rem;
  z-index: 10;
  letter-spacing: 0.1em;
  box-shadow: 0 2px 14px rgba(0,0,0,0.6);
  transition: background 0.4s ease, border-color 0.4s ease;

  @include mobile {
    padding: 0.55rem 0.6rem;
    gap: 0.35rem;
    font-size: 0.85rem;
    flex-wrap: wrap;
  }
  @include tablet {
    padding: 0.7rem 1rem;
    font-size: 0.95rem;
  }

  .orn {
    color: $paper-soft;
    opacity: 0.55;
    font-size: 1rem;
    text-shadow: 0 0 6px rgba(207,200,184,0.3);
    @include mobile { font-size: 0.8rem; }
  }
  .label {
    color: $paper-dim;
    font-size: 1rem;
    @include mobile { font-size: 0.8rem; }
  }
  .value {
    display: inline-flex; align-items: baseline; gap: 0.25rem;
    .num {
      @include gold-text;
      font-size: 1.5em;
      font-weight: bold;
      &.infinite {
        @include blood-text;
        font-size: 1.8em;
      }
    }
    .slash { color: $paper-faint; margin: 0 0.25em; }
    .total { color: $paper-soft; font-size: 1em; }
  }
  .warn {
    color: $blood-bright;
    font-size: 0.95rem;
    margin-left: auto;
    margin-right: 0.5rem;
    padding: 0.25rem 0.7rem;
    background: rgba(80,15,15,0.4);
    border: 1px solid rgba(198,69,69,0.5);
    border-radius: $r-sm;
    text-shadow: 0 0 8px rgba(198,69,69,0.5);
    animation: warn-pulse 1.4s ease-in-out infinite;
    @include mobile {
      font-size: 0.78rem;
      padding: 0.2rem 0.5rem;
      margin: 0;
      width: 100%;
      text-align: center;
    }
  }

  &.超支 {
    background: linear-gradient(180deg,
      rgba(50,10,10,0.98) 0%,
      rgba(25,5,5,0.98) 100%);
    border-bottom-color: $blood-mid;
    .value .num {
      @include blood-text;
    }
  }
}

// 掷骰按钮
.roll-btn {
  @include xianxia-btn;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  @include mobile { padding: 0.3rem 0.6rem; font-size: 0.75rem; }

  .dice {
    display: inline-block;
    font-size: 1.1rem;
    line-height: 1;
    transition: transform 0.18s ease;
  }
  .roll-label { color: $paper-cold; }

  &:not(:disabled):hover .dice {
    transform: rotate(20deg) scale(1.15);
  }
  &:not(:disabled):active .dice {
    transform: rotate(-30deg) scale(0.9);
  }
  &.locked {
    opacity: 0.45;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }
}

@keyframes warn-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
}
</style>
