<template>
  <div class="status-bar-root dark-mode">
    <div class="stars stars-layer-1"></div>
    <div class="stars stars-layer-2"></div>
    <TopBar
      :world-time="store.data.世界.当前时间"
      :world-location="store.data.世界.当前地点"
      :morality-value="store.data.user.善恶值"
    />

    <ToggleButton :is-expanded="isExpanded" @toggle="isExpanded = !isExpanded" />

    <div class="expandable-region" :class="{ expanded: isExpanded }">
      <div class="expandable-inner">
        <ThumbnailStrip
          :characters="characters"
          :active-character="activeCharacter"
          :avatar-images="thumbnailImages"
          @select="handleCharacterSelect"
        />
        <CharacterDetail
          :active-character="activeCharacter"
          :character-data="characterData"
          :avatar-images="avatarImages"
          :back-images="backImages"
          :unlocked-thoughts="unlockedThoughts"
          @unlock="handleUnlock"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDataStore } from './composables/useDataStore';
import TopBar from './components/TopBar.vue';
import ThumbnailStrip from './components/ThumbnailStrip.vue';
import ToggleButton from './components/ToggleButton.vue';
import CharacterDetail from './components/CharacterDetail.vue';

const store = useDataStore();

const characters = ['莉莉安娜', '艾琳娜', '米璐', '菲奥'] as const;
type Character = (typeof characters)[number];

const activeCharacter = ref<Character>('莉莉安娜');
const isExpanded = ref(true);
const unlockedThoughts = ref<Set<string>>(new Set());

const avatarCdnBase =
  'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!';

const avatarImages = ref<Record<string, string>>({
  莉莉安娜: `${avatarCdnBase}LL2.png`,
  艾琳娜: `${avatarCdnBase}LS.png`,
  米璐: `${avatarCdnBase}ML.png`,
  菲奥: `${avatarCdnBase}FAO.png`,
});
const backImages = ref<Record<string, string>>({
  莉莉安娜: `${avatarCdnBase}LLNSFW.png`,
  艾琳娜: `${avatarCdnBase}LSNSFW.png`,
  米璐: `${avatarCdnBase}MLNSFW.png`,
  菲奥: `${avatarCdnBase}FAONSFW.png`,
});

// 缩略图 Q版头像
const thumbnailImages = ref<Record<string, string>>({
  莉莉安娜: `${avatarCdnBase}Q1.png`,
  艾琳娜: `${avatarCdnBase}Q2.png`,
  米璐: `${avatarCdnBase}Q3.png`,
  菲奥: `${avatarCdnBase}Q4.png`,
});

const characterData = computed(() => {
  const char = activeCharacter.value;
  return store.data[char as keyof typeof store.data] as
    | { 外貌身材: string; 内心想法: string; 改造状态: string }
    | undefined;
});

function handleCharacterSelect(char: string) {
  activeCharacter.value = char as Character;
}

function handleUnlock(char: string) {
  unlockedThoughts.value.add(char);
}
</script>

<style lang="scss" scoped>
@use './styles/_glass.scss' as glass;

.status-bar-root {
  width: 100%;
  @include glass.glass-panel;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--text-primary);
  font-family: var(--font-body);
  position: relative;
  transition: var(--transition-theme);
  min-height: min-content;

  /* 银黑玻璃背景 —— 金属质感+空间层次 */
  background:
    /* 顶部银白冷光 */
    linear-gradient(
      180deg,
      rgba(200, 210, 230, 0.03) 0%,
      transparent 25%
    ),
    /* 中心微亮银灰，四周纯黑 */
    radial-gradient(
      ellipse 70% 50% at 50% 25%,
      rgba(30, 32, 38, 0.35) 0%,
      rgba(15, 15, 18, 0.45) 50%,
      rgba(5, 5, 6, 0.5) 100%
    ),
    /* 基底纯黑 */
    linear-gradient(
      180deg,
      #08080a 0%,
      #030303 100%
    );

  /* 顶部银白细边线 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10px;
    right: 10px;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(180, 190, 210, 0.1),
      rgba(200, 210, 230, 0.18),
      rgba(180, 190, 210, 0.1),
      transparent
    );
    border-radius: 1px;
    pointer-events: none;
    z-index: 2;
  }
}

/* 动态银白星光 —— 两层错落闪烁 */
.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: var(--glass-radius);
  z-index: 0;

  /* 用极小元素 + box-shadow 复制成满天星，每颗都是高亮圆点 */
  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #fff;
  }
}

.stars-layer-1::after {
  box-shadow:
    20px 15px 0 0.5px rgba(230, 240, 255, 1),
    55px 40px 0 0 rgba(210, 225, 245, 0.9),
    90px 12px 0 0.5px rgba(240, 248, 255, 0.85),
    140px 55px 0 0 rgba(220, 235, 250, 0.9),
    180px 28px 0 0.5px rgba(200, 220, 245, 0.8),
    220px 60px 0 0 rgba(235, 245, 255, 1),
    260px 18px 0 0.5px rgba(215, 230, 250, 0.85),
    300px 45px 0 0 rgba(225, 240, 255, 0.9),
    340px 8px 0 0.5px rgba(245, 250, 255, 0.8),
    380px 52px 0 0 rgba(205, 225, 250, 0.75),
    30px 80px 0 0.5px rgba(235, 245, 255, 0.85),
    80px 95px 0 0 rgba(220, 235, 250, 0.9),
    120px 110px 0 0.5px rgba(240, 248, 255, 0.8),
    165px 88px 0 0 rgba(200, 220, 245, 0.85),
    205px 120px 0 0.5px rgba(230, 242, 255, 0.9),
    250px 100px 0 0 rgba(215, 235, 255, 0.8),
    290px 130px 0 0.5px rgba(245, 250, 255, 0.85),
    330px 92px 0 0 rgba(210, 228, 250, 0.9),
    370px 118px 0 0.5px rgba(225, 240, 255, 0.8);
  animation: twinkle-1 4s ease-in-out infinite;
}

.stars-layer-2::after {
  box-shadow:
    10px 30px 0 0 rgba(235, 245, 255, 0.7),
    48px 20px 0 0 rgba(200, 220, 250, 0.6),
    100px 65px 0 0 rgba(225, 240, 255, 0.75),
    150px 30px 0 0 rgba(245, 250, 255, 0.6),
    195px 75px 0 0 rgba(210, 230, 255, 0.65),
    245px 35px 0 0 rgba(230, 245, 255, 0.7),
    295px 70px 0 0 rgba(205, 225, 250, 0.6),
    345px 25px 0 0 rgba(240, 250, 255, 0.65),
    60px 105px 0 0 rgba(220, 238, 255, 0.6),
    110px 140px 0 0 rgba(235, 248, 255, 0.7),
    160px 125px 0 0 rgba(200, 222, 248, 0.55),
    215px 145px 0 0 rgba(230, 245, 255, 0.65),
    270px 110px 0 0 rgba(215, 235, 252, 0.6),
    320px 150px 0 0 rgba(245, 252, 255, 0.7),
    360px 80px 0 0 rgba(205, 225, 250, 0.55);
  animation: twinkle-2 5s ease-in-out infinite;
}

/* 确保内容层级高于星光 */
.status-bar-root > :not(.stars) {
  position: relative;
  z-index: 1;
}

/* 折叠区 -- 展开先撑高再淡入，收起先淡出再折叠 */
.expandable-region {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &.expanded {
    grid-template-rows: 1fr;
    opacity: 1;
    transition: grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.12s;
  }
}

.expandable-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
