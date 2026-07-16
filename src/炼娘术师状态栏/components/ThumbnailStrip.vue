<template>
  <div class="thumbnail-strip">
    <div
      v-for="char in characters"
      :key="char"
      class="thumbnail-wrapper"
      :class="{ active: char === activeCharacter }"
      @click="$emit('select', char)"
    >
      <div class="thumbnail-avatar" :class="{ active: char === activeCharacter }">
        <div class="avatar-inner" :style="getAvatarStyle(char)">
          <span v-if="!hasImage(char)" class="avatar-initial">{{ char[0] }}</span>
        </div>
        <div v-if="char === activeCharacter" class="magic-ring"></div>
      </div>
      <span class="avatar-label" :class="{ active: char === activeCharacter }">
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  characters: string[];
  activeCharacter: string;
  avatarImages?: Record<string, string>;
}>();

defineEmits<{
  (e: 'select', character: string): void;
}>();

function hasImage(char: string): boolean {
  return !!props.avatarImages?.[char];
}

function getAvatarStyle(char: string): Record<string, string> {
  const img = props.avatarImages?.[char];
  if (img) {
    return { backgroundImage: `url(${img})` };
  }
  return {};
}
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.thumbnail-strip {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 26px;
  padding: 8px 12px 6px;
  flex-wrap: wrap;
}

.thumbnail-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  min-width: 72px;
  padding: 4px;
  border-radius: 12px;
  transition: var(--transition-theme);

  &:hover .thumbnail-avatar:not(.active) {
    border-color: var(--accent-pink);
    transform: translateY(-3px);
  }
}

.thumbnail-avatar {
  position: relative;
  width: 68px;
  height: 68px;
  border: 2px solid var(--text-muted);
  @include glass.glass-card;
  border-radius: 50%;
  padding: 0;
  transition: width 0.32s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.32s cubic-bezier(0.34, 1.56, 0.64, 1),
    border 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;

  &.active {
    width: 80px;
    height: 80px;
    border: 3px solid var(--accent-pink);
    box-shadow: 0 0 10px 3px var(--shadow-glow), var(--inner-shadow);
    animation: pulse-glow 3s ease-in-out infinite;
    transform: translateY(-2px);
  }
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--placeholder-gradient);
  background-size: cover;
  background-position: center top;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-initial {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent-pink);
  opacity: 0.55;
  font-family: var(--font-title);
}

.magic-ring {
  position: absolute;
  top: -7px;
  left: -7px;
  width: calc(100% + 14px);
  height: calc(100% + 14px);
  border: 1px dashed var(--accent-purple);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.55;
  animation: rotate-magic-circle 20s linear infinite;
}

.avatar-label {
  font-size: 11px;
  font-family: var(--font-title);
  letter-spacing: 1.5px;
  color: var(--text-muted);
  white-space: nowrap;
  transition: var(--transition-theme);

  &.active {
    color: var(--accent-pink);
    font-weight: 600;
  }
}

@media (max-width: 480px) {
  .thumbnail-strip {
    gap: 14px;
    padding: 4px 8px 2px;
  }

  .thumbnail-wrapper {
    min-width: 56px;
  }

  .thumbnail-avatar {
    width: 54px;
    height: 54px;

    &.active {
      width: 64px;
      height: 64px;
    }
  }

  .avatar-initial {
    font-size: 20px;
  }

  .avatar-label {
    display: none;
  }

  .magic-ring {
    top: -5px;
    left: -5px;
    width: calc(100% + 10px);
    height: calc(100% + 10px);
  }
}
</style>
