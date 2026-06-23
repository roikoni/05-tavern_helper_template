<template>
  <div class="page-root" :class="{ unlocked: hasKey }">
    <!-- 未解锁状态 -->
    <div v-if="!hasKey" class="locked-overlay">
      <div class="locked-icon">
        <i class="fa-solid fa-key"></i>
      </div>
      <p class="locked-text">黑之匙未获</p>
      <p class="locked-hint">获得关键道具「黑之匙」后解锁</p>
    </div>

    <!-- 已解锁 -->
    <template v-else>
      <div class="gallery-header">
        <i class="fa-solid fa-building-columns header-icon"></i>
        <span class="header-title">爱 室</span>
        <span class="header-count">收藏 {{ gallery.length }} 件</span>
      </div>

      <div v-if="gallery.length === 0" class="empty-msg">
        亚空间空寂，尚无收藏
      </div>

      <div v-else class="gallery-grid">
        <div
          v-for="item in gallery"
          :key="item.name"
          class="gallery-item group"
          @click="openDetail(item)"
        >
          <!-- 头像框（放大尺寸） -->
          <div class="portrait-frame">
            <div class="frame-outer">
              <div class="frame-inner">
                <img
                  v-if="avatarOf(item.name)"
                  :src="avatarOf(item.name)"
                  class="portrait-img"
                  @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                  @click.stop="previewUrl = avatarOf(item.name)"
                />
                <div v-else class="portrait-placeholder">
                  <i class="fa-solid fa-user-large"></i>
                </div>
              </div>
            </div>
            <div class="sparkle sparkle-1"></div>
            <div class="sparkle sparkle-2"></div>
            <div class="sparkle sparkle-3"></div>
          </div>

          <p class="item-name">{{ item.name }}</p>
          <p class="item-date" v-if="item.被击败时间">{{ item.被击败时间 }}</p>
        </div>
      </div>

      <!-- ===== 详情弹窗 ===== -->
      <Teleport to="body">
        <div v-if="selected" class="modal-overlay" @click.self="selected = null">
          <div class="modal-card">
            <button class="modal-close" @click="selected = null">&times;</button>

            <!-- 详情弹窗 -->
            <div class="modal-portrait">
              <img
                v-if="avatarOf(selected.name)"
                :src="avatarOf(selected.name)"
                class="modal-img"
                @error="(e) => (e.target as HTMLImageElement).style.display='none'"
                @click="previewUrl = avatarOf(selected.name)"
              />
              <div v-else class="modal-placeholder">
                <i class="fa-solid fa-user-large"></i>
              </div>
            </div>

            <h2 class="modal-name">{{ selected.name }}</h2>
            <p v-if="selected.被击败时间" class="modal-date">{{ selected.被击败时间 }}</p>
            <p class="modal-desc">{{ selected.描述 || '暂无描述' }}</p>

            <div class="modal-stats">
              <div class="stat-row">
                <span class="stat-label">调教值</span>
                <div class="stat-bar-track">
                  <div class="stat-bar-fill" :style="{ width: (selected.调教值 || 0) + '%' }"></div>
                </div>
                <span class="stat-num">{{ selected.调教值 || 0 }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">心理状态</span>
                <span class="stat-value">{{ selected.心理状态 || '未知' }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">性器状态</span>
                <span class="stat-value">{{ selected.性器状态 || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ===== 头像全屏预览 ===== -->
      <Teleport to="body">
        <div v-if="previewUrl" class="preview-overlay" @click="previewUrl = null">
          <img :src="previewUrl" class="preview-full-img" @click.stop />
          <button class="preview-close" @click="previewUrl = null">&times;</button>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import { avatarOf } from '../avatarStore';

const store = useDataStore();

const hasKey = computed(() => !!store.data.$flag.拥有黑之匙);

const gallery = computed(() =>
  _(store.data.爱室)
    .entries()
    .map(([name, data]) => ({ name, ...data }))
    .value()
);

// 详情弹窗
const selected = ref<(ReturnType<typeof gallery.value>[0] & { name: string }) | null>(null);

function openDetail(item: (typeof gallery.value)[0] & { name: string }) {
  selected.value = item;
}

// 全屏预览
const previewUrl = ref<string | null>(null);
</script>

<style lang="scss" scoped>
/* ============ 爱室 — 黑色展廊美学 ============ */
.page-root {
  height: 100%;
  overflow-y: auto;
  padding: 20px 24px;
  position: relative;

  &.unlocked {
    background: radial-gradient(ellipse at 50% 0%, rgba(168, 51, 51, 0.06) 0%, transparent 60%);
  }
}

/* ===== 未解锁遮罩 ===== */
.locked-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  opacity: 0.55;
}

.locked-icon {
  font-size: 2.4rem;
  color: var(--c-text-dim);
  filter: drop-shadow(0 0 12px rgba(168, 51, 51, 0.3));
  animation: key-pulse 3s ease-in-out infinite;
}

@keyframes key-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.08); }
}

.locked-text {
  font-size: 0.95rem;
  color: var(--c-text-dim);
  font-family: var(--font-serif);
  letter-spacing: 0.15em;
}

.locked-hint {
  font-size: 0.7rem;
  color: var(--c-text-faint);
  font-family: var(--font-serif);
  font-style: italic;
}

/* ===== 展廊头部 ===== */
.gallery-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(207, 200, 184, 0.1);
}

.header-icon {
  font-size: 1.1rem;
  color: var(--c-accent-bright);
  filter: drop-shadow(0 0 6px rgba(168, 51, 51, 0.5));
}

.header-title {
  font-size: 1.1rem;
  font-family: var(--font-brush);
  color: var(--c-text);
  letter-spacing: 0.2em;
}

.header-count {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--c-text-dim);
  font-family: var(--font-serif);
  letter-spacing: 0.08em;
}

.empty-msg {
  text-align: center;
  padding: 48px 0;
  color: var(--c-text-dim);
  font-size: 0.82rem;
  font-family: var(--font-serif);
  font-style: italic;
}

/* ===== 展品网格 ===== */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  padding-bottom: 16px;
}

/* ===== 单个展品卡片 ===== */
.gallery-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 18px 14px;
  border: 1px solid rgba(207, 200, 184, 0.1);
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.35);
  transition: all 0.35s var(--ease-out-soft);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(168, 51, 51, 0.08) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
  }

  &:hover {
    border-color: rgba(168, 51, 51, 0.45);
    transform: translateY(-4px);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.7),
      0 0 36px rgba(168, 51, 51, 0.12);

    &::before { opacity: 1; }

    .portrait-frame {
      transform: scale(1.05);
    }

    .frame-outer {
      box-shadow:
        0 0 0 2px rgba(168, 51, 51, 0.5),
        0 0 22px rgba(168, 51, 51, 0.3);
    }

    .sparkle { opacity: 1; }

    .item-name {
      text-shadow:
        0 0 10px rgba(168, 51, 51, 0.5),
        0 0 20px rgba(168, 51, 51, 0.3);
    }
  }
}

/* ===== 头像框（放大版） ===== */
.portrait-frame {
  position: relative;
  transition: transform 0.35s var(--ease-out-soft);
}

.frame-outer {
  width: 110px;
  height: 146px;
  border-radius: var(--radius-sm);
  border: 2px solid rgba(207, 200, 184, 0.3);
  background:
    linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 6px 16px rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: box-shadow 0.35s;
  position: relative;
}

.frame-inner {
  width: 100%;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: zoom-in;
}

.portrait-placeholder {
  font-size: 2.4rem;
  color: var(--c-text-faint);
  opacity: 0.4;
}

/* ===== 装饰光点 ===== */
.sparkle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--c-accent-bright);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s;
  animation: sparkle-twinkle 2s ease-in-out infinite;
}

.sparkle-1 { top: -4px; right: 14px; animation-delay: 0s; }
.sparkle-2 { bottom: 16px; left: -6px; animation-delay: 0.7s; }
.sparkle-3 { top: 22px; right: -6px; animation-delay: 1.4s; }

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0; box-shadow: 0 0 2px var(--c-accent-bright); }
  50% { opacity: 0.95; box-shadow: 0 0 6px var(--c-accent-bright), 0 0 14px rgba(168, 51, 51, 0.6); }
}

/* ===== 名字与日期 ===== */
.item-name {
  font-size: 0.85rem;
  color: var(--c-text);
  font-family: var(--font-serif);
  letter-spacing: 0.12em;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  transition: text-shadow 0.3s;
}

.item-date {
  font-size: 0.65rem;
  color: var(--c-text-faint);
  font-family: var(--font-serif);
  font-style: italic;
}

/* ============ 详情弹窗 ============ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: overlay-in 0.25s ease;
}

@keyframes overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  position: relative;
  width: 90vw;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  background:
    linear-gradient(145deg, rgba(18, 16, 22, 0.98), rgba(8, 6, 10, 0.99));
  border: 1px solid rgba(207, 200, 184, 0.2);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 0 80px rgba(168, 51, 51, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: card-in 0.35s var(--ease-bounce);
}

@keyframes card-in {
  from { opacity: 0; transform: scale(0.92) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(207, 200, 184, 0.12);
  background: rgba(0, 0, 0, 0.5);
  color: var(--c-text-dim);
  font-size: 1.2rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: var(--c-accent-bright);
    color: var(--c-accent-bright);
    background: rgba(168, 51, 51, 0.15);
  }
}

/* 大图 */
.modal-portrait {
  width: 150px;
  height: 200px;
  border-radius: var(--radius-sm);
  border: 2px solid rgba(207, 200, 184, 0.3);
  background:
    linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.8),
    0 8px 24px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(168, 51, 51, 0.08);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: zoom-in;
  transition: transform 0.3s;
  &:hover { transform: scale(1.05); }
}

.modal-placeholder {
  font-size: 3rem;
  color: var(--c-text-faint);
  opacity: 0.35;
}

.modal-name {
  font-size: 1.3rem;
  font-family: var(--font-brush);
  color: var(--c-text);
  letter-spacing: 0.2em;
  margin: 0 0 4px;
}

.modal-date {
  font-size: 0.72rem;
  color: var(--c-text-dim);
  font-family: var(--font-serif);
  font-style: italic;
  margin: 0 0 14px;
}

.modal-desc {
  font-size: 0.82rem;
  color: var(--c-text-mid);
  font-family: var(--font-serif);
  line-height: 1.7;
  text-align: center;
  margin: 0 0 16px;
  padding: 0 4px;
}

/* ===== 详情属性面板 ===== */
.modal-stats {
  width: 100%;
  border-top: 1px solid rgba(207, 200, 184, 0.1);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-label {
  width: 64px;
  flex-shrink: 0;
  font-size: 0.72rem;
  color: var(--c-text-dim);
  font-family: var(--font-serif);
  letter-spacing: 0.08em;
}

.stat-value {
  font-size: 0.78rem;
  color: var(--c-text);
  font-family: var(--font-serif);
}

/* 调教值进度条 */
.stat-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(207, 200, 184, 0.12);
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #a83333, #c64545);
  box-shadow: 0 0 6px rgba(168, 51, 51, 0.4);
  transition: width 0.5s var(--ease-out-soft);
}

.stat-num {
  width: 28px;
  flex-shrink: 0;
  text-align: right;
  font-size: 0.75rem;
  color: var(--c-accent-bright);
  font-family: var(--font-serif);
  font-weight: 500;
}

/* ============ 头像全屏预览 ============ */
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  animation: overlay-in 0.2s ease;
}

.preview-full-img {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow:
    0 0 40px rgba(168, 51, 51, 0.15),
    0 0 100px rgba(0, 0, 0, 0.6);
  cursor: default;
}

.preview-close {
  position: absolute;
  top: 20px;
  right: 28px;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(207, 200, 184, 0.2);
  background: rgba(0, 0, 0, 0.6);
  color: var(--c-text-dim);
  font-size: 1.6rem;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: var(--c-accent-bright);
    color: var(--c-accent-bright);
  }
}
</style>
