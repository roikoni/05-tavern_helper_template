<template>
  <div class="avatar-flipper" @click="isFlipped = !isFlipped">
    <div class="flipper" :class="{ flipped: isFlipped }">
      <div class="front">
        <div
          class="avatar-image"
          :style="frontImage ? { backgroundImage: `url(${frontImage})` } : {}"
        >
          <span v-if="!frontImage" class="watermark">{{ characterName }}</span>
        </div>
        <div class="corner tl">❖</div>
        <div class="corner tr">❖</div>
        <div class="corner bl">❖</div>
        <div class="corner br">❖</div>
      </div>
      <div class="back">
        <div
          class="avatar-image"
          :style="backImage ? { backgroundImage: `url(${backImage})` } : {}"
        >
          <span v-if="!backImage" class="watermark">{{ characterName }} · 里</span>
        </div>
        <div class="corner tl">❖</div>
        <div class="corner tr">❖</div>
        <div class="corner bl">❖</div>
        <div class="corner br">❖</div>
      </div>
    </div>
    <div class="magic-ring"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  characterName: string;
  frontImage?: string;
  backImage?: string;
}>();

const isFlipped = ref(false);
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.avatar-flipper {
  position: relative;
  width: 45%;
  aspect-ratio: 3 / 4;
  perspective: 1200px;
  cursor: pointer;
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
}

.flipper {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.flipped {
    transform: rotateY(180deg);
  }
}

.front,
.back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  border-image: var(--border-gradient) 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--placeholder-gradient);
    z-index: 0;
  }
}

.back {
  transform: rotateY(180deg);
}

.avatar-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.watermark {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-pink);
  opacity: 0.15;
  writing-mode: vertical-rl;
  font-family: var(--font-title);
  z-index: 1;
}

.corner {
  position: absolute;
  font-size: 8px;
  color: var(--accent-pink);
  opacity: 0.4;
  z-index: 2;

  &.tl { top: 4px; left: 4px; }
  &.tr { top: 4px; right: 4px; }
  &.bl { bottom: 4px; left: 4px; }
  &.br { bottom: 4px; right: 4px; }
}

.magic-ring {
  position: absolute;
  top: -12px;
  left: -12px;
  width: calc(100% + 24px);
  height: calc(100% + 24px);
  border: 1px dashed var(--accent-purple);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.3;
  animation: rotate-magic-circle 20s linear infinite;
  z-index: -1;
}

@media (max-width: 480px) {
  .avatar-flipper {
    width: 100%;
    max-width: 180px;
    aspect-ratio: 3 / 4;
    align-self: center;
  }

  .watermark {
    font-size: 18px;
  }

  .magic-ring {
    display: none;
  }
}
</style>
