<template>
  <div class="thought-block">
    <div class="block-header">
      <span class="title">{{ title }}</span>
    </div>
    <div class="divider"></div>
    <div class="content-area" @click="handleClick">
      <p class="thought-text" :class="{ unlocked: isUnlocked }">{{ content }}</p>
      <div class="thought-mask" :class="{ fading: isUnlocked }">
        <div class="mask-blur"></div>
        <div class="mask-hint">
          <i class="fas fa-lock lock-icon"></i>
          <span>点击解锁心灵</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  content: string;
  isUnlocked: boolean;
}>();

const emit = defineEmits<{
  (e: 'unlock'): void;
}>();

function handleClick() {
  if (!props.isUnlocked) {
    emit('unlock');
  }
}
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.thought-block {
  @include glass.glass-card;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
  position: relative;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: var(--font-title);
  letter-spacing: 1px;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-purple), transparent);
  opacity: 0.4;
}

.content-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  cursor: pointer;
  min-height: 40px;
}

.thought-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--thought-text);
  font-family: var(--font-body);
  font-style: italic;
  white-space: pre-wrap;
  transition: filter 1.2s ease-out;

  &:not(.unlocked) {
    filter: blur(4px);
  }

  &.unlocked {
    filter: blur(0);
  }
}

.thought-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mask-overlay);
  backdrop-filter: blur(8px) contrast(120%);
  -webkit-backdrop-filter: blur(8px) contrast(120%);
  transition: opacity 1.2s ease-out, backdrop-filter 1.2s ease-out;

  &.fading {
    opacity: 0;
    backdrop-filter: blur(0) contrast(100%);
    -webkit-backdrop-filter: blur(0) contrast(100%);
    pointer-events: none;

    .lock-icon {
      transform: rotate(360deg) scale(0);
      opacity: 0;
    }
  }
}

.mask-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--accent-pink);
  font-size: 12px;
  font-family: var(--font-title);
  letter-spacing: 1px;
  pointer-events: none;

  .lock-icon {
    font-size: 16px;
    transition: transform 0.4s ease-in, opacity 0.4s ease-in;
  }
}

@media (max-width: 480px) {
  .thought-text {
    font-size: 12px;
  }
}
</style>
