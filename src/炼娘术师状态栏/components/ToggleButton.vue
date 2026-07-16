<template>
  <button class="toggle-button" @click="$emit('toggle')">
    <span class="ribbon-left">❦</span>
    <span class="toggle-text">{{ isExpanded ? '收起' : '展开' }}</span>
    <i class="fas fa-chevron-down chevron" :class="{ rotated: isExpanded }"></i>
    <span class="ribbon-right">❦</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isExpanded: boolean;
}>();

defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 6px 0;
  @include glass.glass-card;
  background: var(--glass-bg);
  border-top: 1px solid var(--glass-highlight);
  border-bottom: 1px solid var(--glass-highlight);
  color: var(--text-secondary);
  font-family: var(--font-title);
  font-size: 12px;
  letter-spacing: 3px;
  cursor: pointer;
  transition: var(--transition-theme);

  &:hover {
    color: var(--accent-pink);
    border-color: var(--accent-pink);
    box-shadow: 0 0 12px rgba(90, 130, 190, 0.15), var(--inner-shadow);
  }
}

.ribbon-left,
.ribbon-right {
  color: var(--accent-gold);
  font-size: 11px;
  opacity: 0.7;
}

.chevron {
  font-size: 9px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &.rotated {
    transform: rotate(180deg);
  }
}
</style>
