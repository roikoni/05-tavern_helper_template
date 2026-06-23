<template>
  <div class="status-bar-root" :class="{ collapsed, 'font-kaiti': fontMode === 'kaiti' }">
    <!-- 主容器 -->
    <div class="main-container">
      <!-- 顶部 Header -->
      <header class="app-header">
        <div class="header-left">
          <template v-if="inMijing">
            <MijingHud />
          </template>
          <template v-else>
            <div class="stamp-box">
              <span class="stamp-text">印</span>
            </div>
            <h1 class="header-title">
              {{ store.data.世界.当前年号 }}<span class="header-subtitle">纪元</span>
            </h1>
          </template>
        </div>

        <!-- 子标签栏 (仅基本信息页显示) -->
        <div v-if="mainTab === 'basic'" class="sub-tabs">
          <button
            v-for="tab in visibleSubTabs"
            :key="tab.id"
            class="sub-tab-btn"
            :class="{ active: subTab === tab.id }"
            @click="subTab = tab.id"
          >
            <i :class="[tab.icon, 'sub-tab-icon', { active: subTab === tab.id }]"></i>
            <span>{{ tab.label }}</span>
            <div v-if="subTab === tab.id" class="sub-tab-indicator"></div>
          </button>
        </div>
        <div v-else-if="mainTab === 'worldmap'" class="header-map-title">世界版图</div>
        <div v-else-if="mainTab === 'mijing'" class="header-map-title">秘境</div>
        <div v-else class="header-map-title">大事记</div>
      </header>

      <!-- 时间地点信息栏 -->
      <div class="info-bar">
        <div class="info-item">
          <i class="fa-solid fa-clock info-icon"></i>
          <span class="info-label">时间</span>
          <span class="info-value">{{ store.data.世界.当前时间 }}</span>
        </div>
        <div class="info-sep"></div>
        <div class="info-item">
          <i class="fa-solid fa-location-dot info-icon"></i>
          <span class="info-label">地点</span>
          <span class="info-value">{{ store.data.世界.当前地点 }}</span>
        </div>
        <button
          class="collapse-toggle"
          @click="collapsed = !collapsed"
          :title="collapsed ? '展开' : '折叠'"
          :aria-label="collapsed ? '展开状态栏' : '折叠状态栏'"
          :aria-expanded="!collapsed"
        >
          <i :class="collapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up'" aria-hidden="true"></i>
        </button>
        <button
          class="font-settings-btn"
          @click.stop="toggleFontMode"
          :title="fontMode === 'kaiti' ? '切换为原版字体' : '切换为楷体'"
          :aria-label="fontMode === 'kaiti' ? '切换为原版字体' : '切换为楷体'"
          :aria-pressed="fontMode === 'kaiti'"
        >
          <i class="fa-solid fa-font" aria-hidden="true"></i>
        </button>
      </div>

      <!-- 内容区域 (可折叠) -->
      <div class="content-area" :class="{ collapsed }">
        <Transition name="tab-fade" mode="out-in">
          <!-- 基本信息 - 子标签页 -->
          <template v-if="mainTab === 'basic'">
            <ProtagonistTab v-if="subTab === 'protagonist'" key="protagonist" />
            <YuanqiTab v-else-if="subTab === 'yuanqi'" key="yuanqi" />
            <TechniquesTab v-else-if="subTab === 'techniques'" key="techniques" />
            <DeitiesTab v-else-if="subTab === 'deities'" key="deities" />
            <ShenqiTab v-else-if="subTab === 'shenqi'" key="shenqi" />
            <AishiTab v-else-if="subTab === 'aishi'" key="aishi" />
          </template>
          <!-- 世界地图 -->
          <WorldMapTab v-else-if="mainTab === 'worldmap'" key="worldmap" />
          <!-- 秘境 -->
          <MijingTab v-else-if="mainTab === 'mijing'" key="mijing" />
          <!-- 大事记 -->
          <ChroniclesTab v-else key="chronicles" />
        </Transition>
      </div>

      <!-- 底部导航栏 -->
      <nav class="bottom-nav">
        <button
          class="nav-btn"
          :class="{ active: mainTab === 'basic' }"
          @click="mainTab = 'basic'"
        >
          <i class="fa-solid fa-user nav-btn-icon"></i>
          <span>基本信息</span>
        </button>
        <button
          class="nav-btn"
          :class="{ active: mainTab === 'chronicles' }"
          @click="mainTab = 'chronicles'"
        >
          <i class="fa-solid fa-book-journal-whills nav-btn-icon"></i>
          <span>大事记</span>
        </button>
        <button
          class="nav-btn"
          :class="{ active: mainTab === 'worldmap' }"
          @click="mainTab = 'worldmap'"
        >
          <i class="fa-solid fa-compass nav-btn-icon"></i>
          <span>世界地图</span>
        </button>
        <button
          class="nav-btn nav-btn-mijing"
          :class="{ active: mainTab === 'mijing', highlight: inMijing }"
          @click="mainTab = 'mijing'"
        >
          <i class="fa-solid fa-dungeon nav-btn-icon"></i>
          <span>秘境</span>
        </button>
      </nav>

      <div class="version-label">DESIGNED FOR CULTIVATION LLM GAME INTERFACE · VER 1.0</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { computed, watch } from 'vue';
import { useDataStore } from './store';
import AishiTab from './components/AishiTab.vue';
import ChroniclesTab from './components/ChroniclesTab.vue';
import DeitiesTab from './components/DeitiesTab.vue';
import ShenqiTab from './components/ShenqiTab.vue';
import ProtagonistTab from './components/ProtagonistTab.vue';
import YuanqiTab from './components/YuanqiTab.vue';
import TechniquesTab from './components/TechniquesTab.vue';
import WorldMapTab from './components/WorldMapTab.vue';
import MijingTab from './components/MijingTab.vue';
import MijingHud from './components/MijingHud.vue';

const store = useDataStore();
const mainTab = useLocalStorage<string>('cultivation_bar:main_tab', 'basic');
const subTab = useLocalStorage<string>('cultivation_bar:sub_tab', 'protagonist');
const collapsed = useLocalStorage<boolean>('cultivation_bar:collapsed', false);
const fontMode = useLocalStorage<string>('cultivation_bar:font_mode', 'original');

function toggleFontMode() {
  fontMode.value = fontMode.value === 'kaiti' ? 'original' : 'kaiti';
}

const hasKey = computed(() => !!store.data.$flag.拥有黑之匙);
const inMijing = computed(() => !!store.data.当前秘境.在秘境中);

const visibleSubTabs = computed(() =>
  subTabs.filter(t => !t.hidden || hasKey.value)
);

const subTabs = [
  { id: 'protagonist', label: '本我', icon: 'fa-solid fa-user' },
  { id: 'yuanqi', label: '缘契', icon: 'fa-solid fa-users' },
  { id: 'techniques', label: '功法', icon: 'fa-solid fa-scroll' },
  { id: 'deities', label: '诸神', icon: 'fa-solid fa-skull' },
  { id: 'shenqi', label: '神契', icon: 'fa-solid fa-hand-sparkles' },
  { id: 'aishi', label: '爱室', icon: 'fa-solid fa-building-columns', hidden: true },
];

watch(inMijing, (now, before) => {
  if (now && !before) {
    mainTab.value = 'mijing';
  }
});
</script>

<style lang="scss" scoped>
/* ============ 全局过渡曲线 ============ */
$ease-out-soft: cubic-bezier(.22,.61,.36,1);
$ease-bounce:   cubic-bezier(.16,.84,.36,1.05);

/* ============ 黑色修士 · 水墨×黑暗 ============ */

.status-bar-root {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  position: relative;
  display: flex;
  justify-content: center;
  font-family: var(--font-ui);

  &.collapsed .main-container {
    height: auto;
    aspect-ratio: unset;
    overflow: hidden;       /* 折叠时裁剪多余背景 */
  }
}

/* ===== 主容器：黑色金属边框 + 墨色磨砂底 ===== */
.main-container {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  aspect-ratio: 4 / 3;       /* 高度跟随宽度，符合 iframe 适配规则 */
  max-width: 1040px;
  margin: 0 auto;
  padding: 4px;          /* 让出 4px 金属边框宽度 */

  /* 外层：黑色金属拉丝边框 */
  background-image:
    linear-gradient(
      135deg,
      #050505 0%,
      #1a1a1a 18%,
      #3a3a3a 32%,
      #2a2a2a 50%,
      #3a3a3a 68%,
      #1a1a1a 82%,
      #000000 100%
    );
  border-radius: var(--radius-lg);
  box-shadow:
    0 0 0 1px rgba(120, 120, 120, 0.18),
    0 0 0 2px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(180, 180, 180, 0.22),
    inset 0 -1px 0 rgba(0, 0, 0, 0.7),
    0 12px 36px rgba(0, 0, 0, 0.75),
    0 0 80px rgba(168, 51, 51, 0.08);
  color: var(--c-text);

  /* 内层：墨色磨砂面板（绝对定位，撑满 padding 内部） */
  &::before {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 10px;
    background:
      /* 水墨噪点纹理 */
      url("data:image/svg+xml;utf8,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E") repeat,
      /* 暗角光晕 */
      radial-gradient(ellipse at 20% 0%, rgba(40, 30, 40, 0.45) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(80, 20, 20, 0.18) 0%, transparent 55%),
      /* 主底 */
      linear-gradient(145deg, rgba(15, 13, 18, 0.92), rgba(5, 4, 7, 0.97));
    background-size: 180px, cover, cover, cover;
    background-blend-mode: overlay, normal, normal, normal;
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.7),
      inset 0 0 32px rgba(0, 0, 0, 0.65),
      inset 0 0 80px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    z-index: 0;
  }

  /* 让子内容覆盖在 ::before 之上 */
  > * {
    position: relative;
    z-index: 1;
  }

  /* 顶部血色高光装饰带 */
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 14%;
    right: 14%;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(168, 51, 51, 0.45) 30%,
      rgba(207, 200, 184, 0.6) 50%,
      rgba(168, 51, 51, 0.45) 70%,
      transparent);
    pointer-events: none;
    z-index: 30;
  }
}

@media (max-width: 720px) {
  .status-bar-root { max-width: 100%; }
  .main-container { aspect-ratio: 9 / 16; max-width: 100%; }
}

/* ===== Header ===== */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 76px;
  border-bottom: 1px solid rgba(207, 200, 184, 0.12);
  background:
    linear-gradient(to bottom,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 100%);
  position: relative;
  z-index: 20;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
  flex: 0 1 auto;
}

/* 朱砂印章 —— 升级为带阴刻边的篆字印 */
.stamp-box {
  width: 44px;
  height: 44px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 80, 80, 0.55), transparent 60%),
    linear-gradient(135deg, var(--c-stamp-bright) 0%, var(--c-stamp) 100%);
  border: 2px solid rgba(80, 10, 10, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 22px rgba(168, 51, 51, 0.55),
    inset 0 0 8px rgba(255, 255, 255, 0.18),
    inset 0 0 0 1px rgba(255, 200, 200, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-sm);
  transform: rotate(-4deg);
  transition: transform 0.4s $ease-out-soft, box-shadow 0.35s;
  cursor: default;
  position: relative;

  /* 印章四周细微外晕 */
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border: 1px dashed rgba(168, 51, 51, 0.3);
    border-radius: calc(var(--radius-sm) + 2px);
    opacity: 0;
    transition: opacity 0.35s, transform 0.4s;
    transform: scale(0.9);
  }

  &:hover {
    transform: rotate(3deg) scale(1.08);
    box-shadow:
      0 0 28px rgba(198, 69, 69, 0.8),
      inset 0 0 10px rgba(255, 255, 255, 0.3),
      0 3px 6px rgba(0, 0, 0, 0.7);
    &::before { opacity: 1; transform: scale(1); }
  }
}

.stamp-text {
  font-weight: bold;
  color: rgba(255, 240, 230, 0.95);
  font-size: 1.6rem;
  font-family: var(--font-brush);
  letter-spacing: 0.2em;
  padding-left: 2px;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(255, 200, 200, 0.4);
}

.header-title {
  font-size: 1.7rem;
  font-weight: 500;
  letter-spacing: 0.22em;
  font-family: var(--font-brush);
  color: var(--c-text);
  text-shadow:
    0 0 12px rgba(207, 200, 184, 0.25),
    0 2px 4px rgba(0, 0, 0, 0.6);
}

.header-subtitle {
  color: var(--c-text-dim);
  font-size: 1.05rem;
  font-weight: 300;
  font-family: var(--font-ui);
  margin-left: 0.3em;
}

.header-map-title {
  color: var(--c-text);
  font-family: var(--font-brush);
  letter-spacing: 0.4em;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(207, 200, 184, 0.3);

  /* 装饰两侧短线 */
  position: relative;
  padding: 0 1.4em;
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 14px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--c-text-dim));
    transform: translateY(-50%);
  }
  &::before { left: 0; }
  &::after  { right: 0; background: linear-gradient(270deg, transparent, var(--c-text-dim)); }
}

/* ===== 子标签栏 ===== */
.sub-tabs {
  display: flex;
  gap: 34px;
  position: relative;
}

.sub-tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 2px;
  border: none;
  background: transparent;
  color: var(--c-text-dim);
  font-family: var(--font-brush);
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: color 0.3s $ease-out-soft, text-shadow 0.3s;
  position: relative;

  &:hover {
    color: var(--c-text);
    .sub-tab-icon {
      opacity: 0.95;
      transform: translateY(-1px);
      filter: drop-shadow(0 0 4px rgba(207, 200, 184, 0.4));
    }
  }

  &.active {
    color: var(--c-text);
    text-shadow:
      0 0 10px rgba(168, 51, 51, 0.5),
      0 0 18px rgba(168, 51, 51, 0.3);
  }
}

.sub-tab-icon {
  font-size: 1.1rem;
  opacity: 0.55;
  transition: opacity 0.3s, transform 0.3s $ease-out-soft, filter 0.3s;

  &.active {
    opacity: 1;
    color: var(--c-accent-bright);
    filter: drop-shadow(0 0 8px rgba(198, 69, 69, 0.7));
  }
}

.sub-tab-indicator {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: linear-gradient(90deg,
    transparent,
    var(--c-accent) 30%,
    var(--c-accent-bright) 50%,
    var(--c-accent) 70%,
    transparent);
  border-radius: var(--radius-pill);
  box-shadow:
    0 -2px 12px rgba(168, 51, 51, 0.8),
    0 0 8px rgba(168, 51, 51, 0.6);
  animation: indicator-in 0.35s $ease-bounce;
}

@keyframes indicator-in {
  from { transform: translateX(-50%) scaleX(0.2); opacity: 0; }
  to   { transform: translateX(-50%) scaleX(1);   opacity: 1; }
}

/* ===== 时间地点信息栏 ===== */
.info-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 10px 28px;
  border-bottom: 1px solid rgba(207, 200, 184, 0.08);
  background:
    linear-gradient(180deg,
      rgba(0, 0, 0, 0.35) 0%,
      rgba(0, 0, 0, 0.18) 100%);
  font-family: var(--font-ui);
  flex-shrink: 0;
  position: relative;

  /* 底部细分割线 */
  &::after {
    content: '';
    position: absolute;
    left: 25%;
    right: 25%;
    bottom: -1px;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(207, 200, 184, 0.18) 50%,
      transparent);
  }
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 22px;
  transition: opacity 0.25s;

  &:hover {
    opacity: 1;
    .info-icon {
      color: var(--c-accent-bright);
      filter: drop-shadow(0 0 6px rgba(198, 69, 69, 0.6));
    }
  }
}

.info-icon {
  font-size: 0.78rem;
  color: var(--c-text);
  opacity: 0.7;
  filter: drop-shadow(0 0 4px rgba(207, 200, 184, 0.3));
  transition: color 0.25s, filter 0.25s;
}

.info-label {
  font-size: 0.72rem;
  color: var(--c-text-dim);
  letter-spacing: 0.18em;
  font-weight: 300;
  font-family: var(--font-ui);
}

.info-value {
  font-size: 0.85rem;
  color: var(--c-text);
  font-family: var(--font-ui);
  letter-spacing: 0.08em;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.info-sep {
  width: 1px;
  height: 18px;
  background: linear-gradient(to bottom,
    transparent,
    rgba(207, 200, 184, 0.25),
    transparent);
}

.collapse-toggle {
  margin-left: auto;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(207, 200, 184, 0.18);
  color: var(--c-text-dim);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s $ease-out-soft;
  font-size: 0.65rem;
  flex-shrink: 0;

  &:hover {
    border-color: var(--c-accent-bright);
    color: var(--c-accent-bright);
    background: rgba(168, 51, 51, 0.12);
    box-shadow:
      0 0 10px rgba(168, 51, 51, 0.35),
      inset 0 0 6px rgba(168, 51, 51, 0.15);
  }
  &:active { transform: scale(0.92); }
}

.font-settings-btn {
  margin-left: 6px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(207, 200, 184, 0.18);
  color: var(--c-text-dim);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s $ease-out-soft;
  font-size: 0.65rem;
  flex-shrink: 0;

  &:hover {
    border-color: var(--c-accent-bright);
    color: var(--c-accent-bright);
    background: rgba(168, 51, 51, 0.12);
    box-shadow:
      0 0 10px rgba(168, 51, 51, 0.35),
      inset 0 0 6px rgba(168, 51, 51, 0.15);
  }
  &:active { transform: scale(0.92); }
}

/* ===== 内容区域 ===== */
.content-area {
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 10;
  background: transparent;
  min-height: 0;
  transition: max-height 0.4s $ease-out-soft, opacity 0.3s ease;
  opacity: 1;

  &.collapsed {
    max-height: 0 !important;
    opacity: 0;
    flex: 0;
  }
}

/* ===== 底部导航栏 ===== */
.bottom-nav {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  height: 74px;
  background:
    linear-gradient(to top,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(0, 0, 0, 0.25) 100%);
  border-top: 1px solid rgba(207, 200, 184, 0.12);
  z-index: 20;
  flex-shrink: 0;
  position: relative;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  background: transparent;
  color: var(--c-text);
  opacity: 0.5;
  font-family: var(--font-ui);
  font-size: 0.76rem;
  font-weight: 400;
  letter-spacing: 0.22em;
  cursor: pointer;
  transition: all 0.3s $ease-out-soft;
  position: relative;
  overflow: hidden;

  &:first-child {
    border-right: 1px solid rgba(207, 200, 184, 0.08);
  }
  &:nth-child(2) {
    border-right: 1px solid rgba(207, 200, 184, 0.08);
  }

  /* hover 时光晕从下涌起 */
  &::before {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 0;
    background: linear-gradient(to top,
      rgba(207, 200, 184, 0.1) 0%,
      transparent 100%);
    transition: height 0.35s $ease-out-soft;
    pointer-events: none;
  }

  &:hover {
    opacity: 0.9;
    .nav-btn-icon {
      transform: translateY(-2px);
      filter: drop-shadow(0 0 6px rgba(207, 200, 184, 0.4));
    }
    &::before { height: 100%; }
  }

  &.active {
    opacity: 1;
    color: var(--c-text);
    text-shadow:
      0 0 10px rgba(168, 51, 51, 0.5),
      0 0 18px rgba(168, 51, 51, 0.3);
    .nav-btn-icon {
      color: var(--c-accent-bright);
      filter: drop-shadow(0 0 8px rgba(198, 69, 69, 0.7));
    }
    &::before {
      height: 100%;
      background: linear-gradient(to top,
        rgba(168, 51, 51, 0.2) 0%,
        rgba(168, 51, 51, 0.05) 50%,
        transparent 100%);
    }
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 44%;
      height: 2px;
      background: linear-gradient(90deg,
        transparent,
        var(--c-accent-bright),
        transparent);
      box-shadow: 0 0 14px rgba(198, 69, 69, 0.8);
    }
  }
}

.nav-btn-mijing {
  &.highlight:not(.active) {
    opacity: 0.85;
    color: var(--c-accent-bright);
    .nav-btn-icon {
      color: var(--c-accent-bright);
      filter: drop-shadow(0 0 6px rgba(198, 69, 69, 0.55));
      animation: mijing-pulse 2.4s ease-in-out infinite;
    }
  }
  &:not(.highlight):not(.active) {
    opacity: 0.3;
  }
}

@keyframes mijing-pulse {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}

.nav-btn-icon {
  font-size: 1.25rem;
  transition: transform 0.3s $ease-out-soft, filter 0.3s, color 0.3s;
}

/* ===== 版本标签 ===== */
.version-label {
  position: absolute;
  bottom: 0;
  right: 4px;
  padding: 4px;
  font-size: 0.42rem;
  color: var(--c-text-dim);
  opacity: 0.18;
  pointer-events: none;
  z-index: 20;
  font-weight: 300;
  font-family: var(--font-ui);
  letter-spacing: 0.1em;
}

/* ===== 过渡 ===== */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.32s $ease-out-soft, filter 0.3s ease;
}
.tab-fade-enter-from { opacity: 0; transform: translateY(8px); filter: blur(3px); }
.tab-fade-leave-to   { opacity: 0; transform: translateY(-6px); filter: blur(3px); }

/* ===== 内容区美化滚动条（仅状态栏内部生效） ===== */
.content-area :deep(::-webkit-scrollbar)        { width: 6px; height: 6px; }
.content-area :deep(::-webkit-scrollbar-track)  { background: rgba(0,0,0,0.3); }
.content-area :deep(::-webkit-scrollbar-thumb)  {
  background: linear-gradient(180deg,
    rgba(207,200,184,0.2),
    rgba(207,200,184,0.3),
    rgba(207,200,184,0.2));
  border-radius: 3px;
  transition: background 0.25s, box-shadow 0.25s;
}
.content-area :deep(::-webkit-scrollbar-thumb:hover) {
  background: linear-gradient(180deg,
    rgba(168,51,51,0.5),
    rgba(198,69,69,0.7),
    rgba(168,51,51,0.5));
  box-shadow: 0 0 6px rgba(168,51,51,0.4);
}

/* ===== 手机端 ===== */
@media (max-width: 500px) {
  .app-header { height: 60px; padding: 0 12px; }
  .header-title { font-size: 1.2rem; }
  .header-subtitle { font-size: 0.85rem; }
  .stamp-box { width: 34px; height: 34px; }
  .stamp-text { font-size: 1.15rem; }
  .sub-tabs { gap: 16px; }
  .sub-tab-btn { font-size: 0.68rem; }
  .sub-tab-icon { font-size: 0.85rem; }
  .sub-tab-indicator { bottom: -3px; width: 24px; }
  .info-bar { padding: 7px 10px; }
  .info-item { padding: 0 8px; gap: 4px; }
  .info-label, .info-value { font-size: 0.68rem; }
  .content-area { max-height: none; overflow-y: auto; min-height: 0; }
  .bottom-nav { height: 56px; }
  .nav-btn { font-size: 0.62rem; gap: 2px; }
  .nav-btn-icon { font-size: 1rem; }
  .header-map-title { font-size: 0.85rem; padding: 0 1em; }
}
</style>
