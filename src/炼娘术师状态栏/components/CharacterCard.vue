<template>
  <div class="character-card">
    <AvatarFlipper
      :character-name="character"
      :front-image="frontImage"
      :back-image="backImage"
    />
    <div class="info-panel">
      <InfoBlock title="✦ 外貌身材" :content="characterData?.外貌身材 || '—'" />
      <ThoughtBlock
        title="✦ 内心想法"
        :content="characterData?.内心想法 || '—'"
        :is-unlocked="isUnlocked"
        @unlock="$emit('unlock')"
      />
      <InfoBlock
        title="✦ 改造状态"
        :content="characterData?.改造状态 || '—'"
        :status="transformationStatus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Schema } from '../../schema';
import AvatarFlipper from './AvatarFlipper.vue';
import InfoBlock from './InfoBlock.vue';
import ThoughtBlock from './ThoughtBlock.vue';

const props = defineProps<{
  character: string;
  characterData?: Schema[string];
  frontImage?: string;
  backImage?: string;
  isUnlocked: boolean;
}>();

defineEmits<{
  (e: 'unlock'): void;
}>();

const transformationStatus = computed(() => {
  const status = props.characterData?.改造状态 || '';
  if (status.includes('已完成')) return 'completed';
  if (status.includes('未开始')) return 'not-started';
  return 'in-progress';
});
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.character-card {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 4px 8px 8px;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

@media (max-width: 480px) {
  .character-card {
    flex-direction: column;
    padding: 4px;
  }
}
</style>
