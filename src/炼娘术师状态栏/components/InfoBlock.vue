<template>
  <div class="info-block">
    <div class="block-header">
      <span class="title">{{ title }}</span>
      <span v-if="status" class="status-light" :class="status"></span>
    </div>
    <div class="divider"></div>
    <div class="content-scroll">
      <p class="content-text">{{ content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  content: string;
  status?: 'not-started' | 'in-progress' | 'completed';
}>();
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.info-block {
  @include glass.glass-card;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
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

.status-light {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.not-started {
    background: #4a5a70;
  }

  &.in-progress {
    background: var(--accent-pink);
    animation: breathe-light 2s ease-in-out infinite;
  }

  &.completed {
    background: var(--accent-gold);
    box-shadow: 0 0 6px var(--accent-gold);
  }
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-purple), transparent);
  opacity: 0.4;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 120px;
}

.content-scroll::-webkit-scrollbar {
  width: 4px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 2px;
}

.content-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  font-family: var(--font-body);
  white-space: pre-wrap;
}

@media (max-width: 480px) {
  .content-scroll {
    max-height: 160px;
  }
}
</style>
