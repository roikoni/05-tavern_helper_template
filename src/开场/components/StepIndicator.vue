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
defineProps<{ modelValue: number }>();
const emit = defineEmits<{ 'update:modelValue': [n: number] }>();

const 步骤标题 = ['江湖出身', '道途取向', '宗门归属', '行装功法', '资质分配', '总览确认'];
</script>

<style scoped lang="scss">
@use './theme' as *;

.step-indicator {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 1.2rem 1rem 1rem;
  background:
    linear-gradient(180deg,
      rgba(5,4,7,0.95) 0%,
      rgba(15,13,18,0.85) 100%);
  border-bottom: 1px solid rgba(207,200,184,0.15);
  position: relative;

  // 手机端：压缩内边距
  @include mobile {
    padding: 0.7rem 0.4rem 0.6rem;
    gap: 0.1rem;
  }
  @include tablet {
    padding: 1rem 0.7rem 0.85rem;
  }

  &::after {
    content: "";
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent, rgba(207,200,184,0.45) 50%, transparent);
    opacity: 0.6;
  }

  .dot {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    color: $paper-faint;
    transition: all 0.3s ease;
    min-width: 3rem;

    // 手机端缩小
    @include mobile {
      min-width: 1.8rem;
    }

    .num {
      width: 2.5rem; height: 2.5rem;
      display: flex; align-items: center; justify-content: center;
      position: relative;
      background: $bg-soft;
      border: 1px solid rgba(207,200,184,0.25);
      border-radius: 50%;
      box-shadow:
        inset 0 0 8px rgba(0,0,0,0.8),
        0 1px 2px rgba(0,0,0,0.6);
      transition: all 0.35s ease;

      // 手机端缩小圆圈
      @include mobile {
        width: 1.75rem; height: 1.75rem;
      }
      @include tablet {
        width: 2.2rem; height: 2.2rem;
      }

      .inner {
        font-family: $font-serif;
        font-size: 1.05rem;
        font-weight: bold;
        color: $paper-dim;
        @include mobile { font-size: 0.8rem; }
        @include tablet { font-size: 0.95rem; }
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
      font-size: 0.9rem;
      font-weight: 600;
      margin-top: 0.5rem;
      letter-spacing: 0.15em;
      white-space: nowrap;
      color: $paper-soft;
      // 手机端缩小字号
      @include mobile {
        font-size: 0.62rem;
        margin-top: 0.3rem;
        letter-spacing: 0.05em;
      }
      @include tablet {
        font-size: 0.72rem;
      }
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
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg,
      rgba(207,200,184,0.12),
      rgba(207,200,184,0.22),
      rgba(207,200,184,0.12));
    margin: 1.1rem 0.25rem 0;
    transition: background 0.4s ease;
    border-radius: $r-pill;

    &.done {
      background: linear-gradient(90deg,
        rgba(107,26,26,0.6),
        $blood-glow,
        rgba(107,26,26,0.6));
      box-shadow: 0 0 6px rgba(168,51,51,0.35);
    }
  }
}
</style>
