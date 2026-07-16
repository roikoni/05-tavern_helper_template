<template>
  <div class="character-detail">
    <div class="detail-container">
      <TransitionGroup name="slide" tag="div" class="slider-wrapper">
        <CharacterCard
          :key="activeCharacter"
          :character="activeCharacter"
          :character-data="characterData"
          :front-image="avatarImages?.[activeCharacter]"
          :back-image="backImages?.[activeCharacter]"
          :is-unlocked="unlockedThoughts.has(activeCharacter)"
          @unlock="$emit('unlock', activeCharacter)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Schema } from '../../schema';
import CharacterCard from './CharacterCard.vue';

defineProps<{
  activeCharacter: string;
  characterData?: Schema[string];
  avatarImages?: Record<string, string>;
  backImages?: Record<string, string>;
  unlockedThoughts: Set<string>;
}>();

defineEmits<{
  (e: 'unlock', character: string): void;
}>();
</script>

<style lang="scss" scoped>
.character-detail {
  position: relative;
}

.detail-container {
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.slider-wrapper {
  position: relative;
  display: flex;
}
</style>