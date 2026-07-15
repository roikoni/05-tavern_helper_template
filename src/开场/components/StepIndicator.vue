<template>
  <div class="step-indicator">
    <template v-for="(标题, i) in 步骤标题" :key="i">
      <div
        class="dot"
        :class="{ active: i + 1 === modelValue, done: i + 1 < modelValue }"
        @click="emit('update:modelValue', i + 1)"
      >
        <span class="num">
          <span class="inner">{{ i + 1 }}</span>
        </span>
        <span class="title">{{ 标题 }}</span>
      </div>
      <div v-if="i < 步骤标题.length - 1" class="line" :class="{ done: i + 1 < modelValue }"></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { 捏角模式 } from '../draft';

const props = defineProps<{ modelValue: number; 模式: 捏角模式 }>();
const emit = defineEmits<{ 'update:modelValue': [n: number] }>();

const 普通标题 = ['出身', '道途取向', '宗门归属', '行装功法', '资质分配', '总览确认'];
const 自由标题 = ['出身', '道途取向', '宗门归属', '行装功法', '资质分配', '人脉羁绊', '世界设定', '总览确认'];
const 开挂标题 = ['出身', '道途取向', '宗门归属', '行装功法', '资质分配', '人脉羁绊', '世界设定', '自定义外挂', '总览确认'];

const 步骤标题 = computed(() => props.模式 === '开挂' ? 开挂标题 : props.模式 === '自由' ? 自由标题 : 普通标题);
const 总步数 = computed(() => 步骤标题.value.length);
</script>

<style scoped lang="scss">
@use './theme' as *;

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-evenly;
  padding: 1.8rem 0.8rem;
  height: 100%;
  position: relative;

  @include mobile { padding: 1.2rem 0.2rem; align-items: center; }
  @include tablet { padding: 1.5rem 0.6rem; }

  // 右侧装饰竖线
  &::after {
    content: "";
    position: absolute;
    right: 0; top: 5%; bottom: 5%;
    width: 1px;
    background: linear-gradient(180deg,
      transparent 0%,
      rgba(207,200,184,0.18) 20%,
      rgba(207,200,184,0.35) 50%,
      rgba(207,200,184,0.18) 80%,
      transparent 100%);
    @include mobile { display: none; }
  }
}

.dot {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  color: $paper-faint;
  transition: all 0.3s ease;
  padding: 0.35rem 0;
  position: relative;

  @include mobile {
    gap: 0;
    padding: 0.2rem 0;
    justify-content: center;
  }

  .num {
    width: 2.8rem; height: 2.8rem;
    display: flex; align-items: center; justify-content: center;
    position: relative;
    background: $bg-soft;
    border: 1px solid rgba(207,200,184,0.25);
    border-radius: 50%;
    box-shadow:
      inset 0 0 8px rgba(0,0,0,0.8),
      0 1px 2px rgba(0,0,0,0.6);
    transition: all 0.35s ease;
    flex-shrink: 0;

    @include mobile {
      width: 2rem; height: 2rem;
    }
    @include tablet {
      width: 2.4rem; height: 2.4rem;
    }

    .inner {
      font-family: $font-serif;
      font-size: 1.1rem;
      font-weight: bold;
      color: $paper-dim;
      @include mobile { font-size: 0.85rem; }
      @include tablet { font-size: 1rem; }
    }

    // 外围装饰圈（激活时旋转）
    &::before {
      content: "";
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      border: 1px dashed rgba(168,51,51,0.4);
      opacity: 0;
      transition: opacity 0.3s ease;
      @include mobile { inset: -3px; }
    }
  }

  .title {
    font-family: $font-serif;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    white-space: nowrap;
    color: $paper-soft;
    transition: all 0.3s ease;

    @include mobile { display: none; }
    @include tablet { font-size: 0.82rem; letter-spacing: 0.06em; }
  }

  &.active {
    color: $paper-cold;
    .num {
      background: linear-gradient(180deg, $blood-glow 0%, $blood-mid 55%, $blood 100%);
      border-color: $blood-bright;
      box-shadow:
        0 0 14px rgba(168,51,51,0.55),
        inset 0 0 8px rgba(255,200,200,0.18),
        0 2px 4px rgba(0,0,0,0.6);
      .inner {
        color: #f4e8d8;
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
      }
      &::before { opacity: 1; animation: rotate 6s linear infinite; }
    }
    .title {
      color: $paper-cold;
      text-shadow: 0 0 8px rgba(168,51,51,0.4);
    }
  }

  &.done {
    color: $paper-soft;
    .num {
      background: rgba(35,18,18,0.7);
      border-color: rgba(168,51,51,0.6);
      .inner { color: $blood-glow; }
    }
  }

  &:hover:not(.active) .num {
    border-color: rgba(207,200,184,0.5);
    box-shadow:
      inset 0 0 8px rgba(0,0,0,0.8),
      0 0 8px rgba(207,200,184,0.15);
  }
}

@keyframes rotate {
  to { transform: rotate(360deg); }
}

.line {
  width: 1px;
  min-height: 0.5rem;
  flex: 1;
  margin-left: 1.4rem;
  background: linear-gradient(180deg,
    rgba(207,200,184,0.12),
    rgba(207,200,184,0.22),
    rgba(207,200,184,0.12));
  transition: background 0.4s ease;
  border-radius: $r-pill;
  flex-shrink: 0;

  @include mobile {
    margin-left: 0;
    min-height: 0.35rem;
  }

  &.done {
    background: linear-gradient(180deg,
      rgba(107,26,26,0.6),
      $blood-glow,
      rgba(107,26,26,0.6));
    box-shadow: 0 0 6px rgba(168,51,51,0.35);
  }
}
</style>
