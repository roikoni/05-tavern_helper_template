<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <button class="modal-close" @click="$emit('close')">&times;</button>

        <!-- 装饰渐变条 -->
        <div class="modal-banner"></div>

        <div class="modal-inner" v-if="!editMode">
          <!-- 左侧：头像 & 基础信息 -->
          <div class="modal-left">
            <div class="ml-avatar-frame" @click="zoomAvatar" @mouseenter="hoverAvatar = true" @mouseleave="hoverAvatar = false">
              <div class="ml-avatar-outer"></div>
              <div class="ml-avatar-inner" ref="avatarBox">
                <div class="ml-avatar-gradient"></div>
                <slot name="avatar" />
                <!-- 空头像编辑入口 -->
                <div v-if="editable && !hasAvatarImg" class="ml-avatar-empty" @click.stop="startEdit">
                  <i class="fa-solid fa-camera"></i>
                  <span>设置头像</span>
                </div>
              </div>
              <!-- 编辑按钮 -->
              <div v-if="editable && hoverAvatar" class="ml-avatar-edit" @click.stop="startEdit">
                <i class="fa-solid fa-pen"></i>
              </div>
              <div class="ml-avatar-badge">{{ subtitle || '无名' }}</div>
            </div>
            <h2 class="ml-name">{{ title }}</h2>

            <!-- 内心想法 -->
            <div v-if="innerThought" class="ml-thought">
              <div class="ml-thought-label">内心想法</div>
              <div class="ml-thought-wrap" :class="{ revealed: thoughtRevealed }" @click="thoughtRevealed = true">
                <p class="ml-thought-text">{{ innerThought }}</p>
                <div v-if="!thoughtRevealed" class="ml-thought-mask">
                  <i class="fa-solid fa-eye-slash"></i>
                  <span>点击揭示</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：详细内容 -->
          <div class="modal-right">
            <slot />
          </div>
        </div>

        <!-- ===== 头像编辑独立页 ===== -->
        <div v-if="editMode" class="ml-edit-page">
          <button class="ml-edit-back" @click="cancelEdit">
            <i class="fa-solid fa-chevron-left"></i> 返回
          </button>

          <div class="ml-edit-preview">
            <div class="ml-edit-frame">
              <div class="ml-edit-frame-outer"></div>
              <div class="ml-edit-frame-inner">
                <div class="ml-edit-frame-gradient"></div>
                <img v-if="editUrl" :src="editUrl" @error="editUrl = ''" />
                <i v-else class="fa-solid fa-user ml-edit-placeholder"></i>
              </div>
            </div>
            <p class="ml-edit-hint">{{ editUrl ? '预览效果（未保存）' : '尚未设置头像' }}</p>
          </div>

          <div class="ml-edit-section">
            <div class="ml-edit-label">图片链接</div>
            <input
              v-model="editUrl"
              class="ml-edit-input"
              :class="{ 'has-error': !!editError }"
              placeholder="粘贴 http(s) 图片链接..."
              @keyup.enter="confirmEdit"
              @input="editError = ''"
            />
            <p v-if="editError" class="ml-edit-error">{{ editError }}</p>
          </div>

          <div class="ml-edit-or"><span>或</span></div>

          <div class="ml-edit-section">
            <div class="ml-edit-label">本地图片</div>
            <label class="ml-edit-file">
              <i class="fa-solid fa-folder-open"></i> 选择本地图片
              <input type="file" accept="image/*" hidden @change="onFilePicked" />
            </label>
            <p class="ml-edit-note">本地图片会以 base64 形式保存在浏览器内，不会进入游戏变量。</p>
          </div>

          <div class="ml-edit-actions">
            <button class="ml-edit-btn cancel" @click="cancelEdit">取消</button>
            <button class="ml-edit-btn confirm" @click="confirmEdit" :disabled="!editUrl">保存头像</button>
          </div>
        </div>
      </div>

      <!-- 头像放大浮层 -->
      <Transition name="zoom">
        <div v-if="avatarZoomed" class="zoom-overlay" @click="avatarZoomed = false">
          <button class="zoom-close" @click="avatarZoomed = false">&times;</button>
          <div class="zoom-inner">
            <slot name="avatar" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = defineProps<{
  visible: boolean;
  title: string;
  subtitle?: string;
  innerThought?: string;
  editable?: boolean;
}>();

const emit = defineEmits<{ close: []; 'update-avatar': [url: string] }>();

const thoughtRevealed = ref(false);
const avatarZoomed = ref(false);
const avatarBox = ref<HTMLElement | null>(null);
const hoverAvatar = ref(false);
const editMode = ref(false);
const editUrl = ref('');
const editError = ref('');
const hasAvatarImg = ref(false);

watch(() => props.visible, async (v) => {
  if (!v) { thoughtRevealed.value = false; avatarZoomed.value = false; cancelEdit(); }
  else { await nextTick(); checkAvatar(); }
});

function checkAvatar() {
  const img = avatarBox.value?.querySelector('img');
  hasAvatarImg.value = !!(img?.src && img.src.trim());
}

function zoomAvatar() {
  const img = avatarBox.value?.querySelector('img');
  if (img?.src) avatarZoomed.value = true;
}

function isValidImageSource(url: string): boolean {
  if (!url) return false;
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);base64,/i.test(url)) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function startEdit() {
  // 先读取当前头像，再切换编辑态（切换后 modal-inner 卸载，slot 内 img 不再可查）
  const img = avatarBox.value?.querySelector('img');
  editUrl.value = img?.src || '';
  editError.value = '';
  editMode.value = true;
}

function confirmEdit() {
  const url = editUrl.value.trim();
  if (!isValidImageSource(url)) {
    editError.value = '链接无效，请使用 http(s) 图片链接或本地图片';
    return;
  }
  emit('update-avatar', url);
  editMode.value = false;
  editError.value = '';
}

function cancelEdit() {
  editMode.value = false;
  editUrl.value = '';
  editError.value = '';
}

function onFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { editUrl.value = reader.result as string; };
  reader.readAsDataURL(file);
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  width: 94%;
  max-width: 720px;
  max-height: 88%;
  background: #050407;
  border: 1px solid #1a181c;
  border-radius: var(--radius-sm);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: #8a8378;
  font-size: 1.8rem;
  cursor: pointer;
  z-index: 10;
  transition: color 0.2s;

  &:hover { color: #cfc8b8; }
}

.modal-banner {
  height: 60px;
  background: linear-gradient(to bottom, #0a090d, transparent);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.modal-inner {
  display: flex;
  padding: 24px;
  position: relative;
  z-index: 0;
  overflow-y: auto;
  flex: 1;
  font-size: 0.95rem;
}

.modal-left {
  width: 42%;
  border-right: 1px solid #1a181c;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.ml-avatar-frame {
  position: relative;
  width: 100%;
  max-width: 200px;
  aspect-ratio: 3 / 4;
  margin-bottom: 20px;
  margin-top: 8px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover { transform: translateY(-2px); }
}

.ml-avatar-outer {
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(207, 200, 184, 0.3);
  box-shadow: 0 0 20px rgba(207, 200, 184, 0.1);
}

.ml-avatar-inner {
  position: absolute;
  inset: 0;
  border: 2px solid #cfc8b8;
  overflow: hidden;
  background: #0f0d12;
}

.ml-avatar-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8));
  z-index: 0;
  pointer-events: none;
}

.ml-avatar-badge {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #cfc8b8;
  color: #cfc8b8;
  font-size: 0.68rem;
  font-family: var(--font-serif);
  letter-spacing: 0.2em;
  padding: 4px 14px;
  white-space: nowrap;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
}

.ml-name {
  font-size: 1.6rem;
  font-weight: bold;
  color: #d8d2c2;
  letter-spacing: 0.2em;
  font-family: var(--font-serif);
  text-align: center;
}

/* 头像编辑 */
.ml-avatar-empty {
  position: absolute; inset: 0; z-index: 10;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; color: #5a564e; cursor: pointer; transition: color 0.2s;
  i { font-size: 2rem; }
  span { font-size: 0.68rem; letter-spacing: 0.1em; font-family: var(--font-serif); }
  &:hover { color: #cfc8b8; }
}

.ml-avatar-edit {
  position: absolute; top: 6px; right: 6px; z-index: 25;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0,0,0,0.7); border: 1px solid #cfc8b8;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #cfc8b8; font-size: 0.68rem;
  transition: background 0.2s;
  &:hover { background: rgba(207, 200, 184,0.2); }
}

/* ===== 头像编辑独立页 ===== */
.ml-edit-page {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.ml-edit-back {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  transition: color 0.2s;
  &:hover { color: var(--c-text); }
}
.ml-edit-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.ml-edit-frame {
  position: relative;
  width: 200px;
  height: 200px;
  padding: 6px;
}
.ml-edit-frame-outer {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(207, 200, 184, 0.3);
  box-shadow: 0 0 20px rgba(207, 200, 184, 0.1);
}
.ml-edit-frame-inner {
  position: absolute;
  inset: 6px;
  border: 2px solid var(--c-gold);
  overflow: hidden;
  background: #0f0d12;
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 5; }
}
.ml-edit-frame-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8));
  z-index: 0;
  pointer-events: none;
}
.ml-edit-placeholder {
  font-size: 3.5rem;
  color: rgba(92, 92, 92, 0.2);
  position: relative;
  z-index: 10;
}
.ml-edit-hint {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
  margin: 0;
}
.ml-edit-section {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ml-edit-label {
  font-size: var(--fs-xs);
  color: var(--c-text-mid);
  font-family: var(--font-ui);
  letter-spacing: 0.15em;
}
.ml-edit-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-size: var(--fs-sm);
  border-radius: var(--radius-xs);
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: var(--c-gold); }
  &.has-error { border-color: var(--c-stamp); }
}
.ml-edit-error {
  margin: 0;
  font-size: var(--fs-2xs);
  color: var(--c-stamp-bright);
  font-family: var(--font-ui);
  letter-spacing: 0.05em;
}
.ml-edit-or {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  font-size: var(--fs-2xs);
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.2em;
  &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--c-border); }
}
.ml-edit-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed var(--c-border);
  border-radius: var(--radius-xs);
  font-size: var(--fs-sm);
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: var(--c-gold); color: var(--c-gold); }
}
.ml-edit-note {
  margin: 0;
  font-size: var(--fs-2xs);
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.05em;
  line-height: 1.5;
}
.ml-edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}
.ml-edit-btn {
  padding: 9px 26px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xs);
  font-size: var(--fs-sm);
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
  transition: all 0.2s;
  &.cancel {
    background: transparent;
    color: var(--c-text-dim);
    &:hover { color: var(--c-text); }
  }
  &.confirm {
    background: rgba(207, 200, 184, 0.12);
    color: var(--c-gold);
    border-color: var(--c-gold);
    &:hover:not(:disabled) { background: rgba(207, 200, 184, 0.25); }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
}

/* ===== 内心想法 ===== */
.ml-thought {
  margin-top: 18px;
  width: 100%;
}

.ml-thought-label {
  font-size: 0.72rem;
  color: #b0a99a;
  letter-spacing: 0.15em;
  font-family: var(--font-serif);
  margin-bottom: 8px;
  text-align: center;
}

.ml-thought-wrap {
  position: relative;
  border: 1px solid #1a181c;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  padding: 12px 14px;
  cursor: pointer;
  min-height: 52px;
  transition: border-color 0.3s;

  &.revealed {
    border-color: rgba(207, 200, 184, 0.3);
    cursor: default;
  }
}

.ml-thought-text {
  font-size: 0.82rem;
  color: #cfc8b8;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.ml-thought-mask {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 12, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 2px;
  transition: opacity 0.3s;
  color: #8a8378;
  font-size: 0.7rem;
  font-family: var(--font-serif);
  letter-spacing: 0.12em;

  i { font-size: 1.05rem; opacity: 0.5; }

  .ml-thought-wrap:hover & {
    color: #cfc8b8;
    i { opacity: 0.8; }
  }
}

/* ===== 头像放大浮层 ===== */
.zoom-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0, 0, 0, 0.95);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

.zoom-close {
  position: absolute; top: 24px; right: 28px; z-index: 10;
  background: none; border: none; color: #8a8378;
  font-size: 2.4rem; cursor: pointer; transition: color 0.2s;
  &:hover { color: #cfc8b8; }
}

.zoom-inner {
  max-width: 90vw; max-height: 90vh;
  & :deep(img) {
    max-width: 88vw; max-height: 88vh;
    object-fit: contain;
    border: 2px solid #cfc8b8;
    box-shadow: 0 0 40px rgba(0,0,0,0.6);
  }
}

.zoom-enter-active { animation: zoom-in 0.25s ease; }
.zoom-leave-active { animation: zoom-in 0.2s ease reverse; }
@keyframes zoom-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-right {
  flex: 1;
  padding-left: 24px;
  overflow-y: auto;
  min-width: 0;
}

/* 过渡 */
.modal-enter-active { animation: modal-in 0.3s ease; }
.modal-leave-active { animation: modal-in 0.2s ease reverse; }

@keyframes modal-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
