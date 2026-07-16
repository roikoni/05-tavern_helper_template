<template>
  <section class="step">
    <!-- 头像编辑页 -->
    <div v-if="avatarEdit" class="av-edit-page">
      <button class="av-edit-back" @click="cancelAvatarEdit">
        <i class="fa-solid fa-chevron-left"></i> 返回
      </button>
      <div class="av-edit-preview">
        <div class="portrait-frame large">
          <div class="portrait-outer"></div>
          <div class="portrait-dash"></div>
          <div class="portrait-inner">
            <div class="portrait-gradient"></div>
            <img v-if="avUrl" :src="avUrl" class="portrait-img" @error="avUrl = ''" />
            <i v-else class="fa-solid fa-user portrait-icon"></i>
          </div>
        </div>
        <p class="av-edit-hint">{{ avUrl ? '预览效果（未保存）' : '尚未设置头像' }}</p>
      </div>
      <div class="av-edit-section">
        <div class="av-edit-label">图片链接</div>
        <input v-model="avUrl" class="av-edit-input" placeholder="粘贴图片链接…" />
      </div>
      <div class="av-edit-section">
        <div class="av-edit-label">本地图片</div>
        <label class="av-edit-file">
          <i class="fa-solid fa-folder-open"></i> 选择本地图片
          <input type="file" accept="image/*" hidden @change="onAvFile" />
        </label>
      </div>
      <div class="av-edit-actions">
        <button class="av-edit-btn cancel" @click="cancelAvatarEdit">取消</button>
        <button class="av-edit-btn confirm" @click="confirmAvatar" :disabled="!avUrl">保存头像</button>
      </div>
    </div>

    <template v-else>
    <!-- 头像 -->
    <div class="avatar-section">
      <div class="portrait-frame" @click="startAvEdit" @mouseenter="avHover = true" @mouseleave="avHover = false">
        <div class="portrait-outer"></div>
        <div class="portrait-dash"></div>
        <div class="portrait-inner">
          <div class="portrait-gradient"></div>
          <img v-if="avatarUrl" :src="avatarUrl" class="portrait-img" />
          <i v-else class="fa-solid fa-user portrait-icon"></i>
          <div v-if="avHover" class="portrait-badge">{{ avatarUrl ? '点击换装' : '点击添像' }}</div>
        </div>
        <div v-if="avHover" class="portrait-edit-btn"><i class="fa-solid fa-pen"></i></div>
      </div>
    </div>

    <h2>出身</h2>

    <!-- 开局身份（自由填表） -->
    <label class="field">
      <span>开局身份</span>
      <input v-model="身份" placeholder="如：散修联盟执事 / 太虚剑宗外门弟子 / 隐世老怪…" maxlength="30" />
    </label>

    <label class="field">
      <span>姓名</span>
      <input v-model="姓名" placeholder="请输入修士姓名" maxlength="20" />
    </label>

    <div class="field">
      <span>性别</span>
      <div class="seg">
        <button :class="{ active: 性别模式 === '男' }" @click="选性别('男')">男</button>
        <button :class="{ active: 性别模式 === '女' }" @click="选性别('女')">女</button>
        <button :class="{ active: 性别模式 === '其他' }" @click="选性别('其他')">其他</button>
      </div>
      <input
        v-if="性别模式 === '其他'"
        v-model="自定义性别"
        placeholder="请输入性别"
        maxlength="10"
        class="custom-gender"
      />
      <span v-if="性别模式 === '待定'" class="hint">请选择或自定义性别</span>
    </div>

    <!-- 种族 -->
    <div class="field">
      <span>种族</span>
      <div class="grid-种族">
        <button
          v-for="r in 种族列表"
          :key="r.名称"
          :class="{ active: 种族模式 === r.名称 }"
          @click="选种族(r.名称)"
        >
          <div class="title">{{ r.名称 }}</div>
          <div class="desc">{{ r.简介 }}</div>
        </button>
      </div>
      <input
        v-if="种族模式 === '自定义'"
        v-model="自定义种族"
        placeholder="请输入种族名"
        maxlength="10"
        class="custom-gender"
      />
    </div>

    <label class="field">
      <span>人物设定</span>
      <textarea v-model="外貌" rows="3" placeholder="自定义人设"></textarea>
    </label>

    <div class="field">
      <span>灵石</span>
      <div class="灵石控件">
        <button type="button" class="灵石-btn" @click="减灵石" :disabled="灵石 <= 0">−</button>
        <input
          type="number"
          v-model.number="灵石"
          min="0"
          class="灵石-input"
        />
        <button type="button" class="灵石-btn" @click="加灵石">+</button>
        <span class="灵石单位">枚</span>
      </div>
    </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 种族列表 } from '../catalog/种族';

// ─── 头像 ───
const avStorage = useLocalStorage<Record<string, string>>('cultivation_bar:avatars', {});
const 主角默认头像 = 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!C85A7A1F61DB84E87C221D2C20DA7031.png';
const avatarUrl = computed(() => avStorage.value['主角'] || 主角默认头像);
const avatarEdit = ref(false);
const avHover = ref(false);
const avUrl = ref('');
const avUrlError = ref('');

function startAvEdit() {
  avatarEdit.value = true;
  avUrl.value = avatarUrl.value || '';
}
function isValidImageSource(url: string): boolean {
  if (!url) return false;
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);base64,/i.test(url)) return true;
  try { const u = new URL(url); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}
function confirmAvatar() {
  const url = avUrl.value.trim();
  if (!isValidImageSource(url)) { avUrlError.value = '链接无效'; return; }
  avStorage.value = { ...avStorage.value, '主角': url };
  avatarEdit.value = false;
  avUrlError.value = '';
}
function cancelAvatarEdit() {
  avatarEdit.value = false;
  avUrl.value = '';
  avUrlError.value = '';
}
function onAvFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { avUrl.value = reader.result as string; };
  reader.readAsDataURL(file);
}

const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const { 开局身份 } = storeToRefs(draft);

const 性别模式 = ref<'男' | '女' | '其他' | '待定'>(
  data.value.主角.性别 === '男' ? '男' :
  data.value.主角.性别 === '女' ? '女' :
  data.value.主角.性别 === '待捏角' ? '待定' : '其他'
);
const 自定义性别 = ref(
  data.value.主角.性别 !== '男' && data.value.主角.性别 !== '女' && data.value.主角.性别 !== '待捏角'
    ? data.value.主角.性别 : ''
);

// 种族：默认人族；若已存非预设值则视为自定义
const 预设种族名 = 种族列表.map(r => r.名称);
const 种族模式 = ref<string>(
  预设种族名.includes(data.value.主角.种族) ? data.value.主角.种族 : '自定义'
);
const 自定义种族 = ref(
  !预设种族名.includes(data.value.主角.种族) ? data.value.主角.种族 : ''
);

function 选种族(名: string) {
  种族模式.value = 名;
  if (名 === '自定义') {
    data.value.主角.种族 = 自定义种族.value || '人族';
  } else {
    自定义种族.value = '';
    data.value.主角.种族 = 名;
  }
}
watch(自定义种族, v => {
  if (种族模式.value === '自定义') data.value.主角.种族 = v || '人族';
});

// 开局身份：自由填表，存于 draft（不绑定境界/流派/宗门）
const 身份 = computed({
  get: () => 开局身份.value,
  set: v => { 开局身份.value = v; },
});

const 姓名 = computed({
  get: () => data.value.主角.名称 === '待捏角' ? '' : data.value.主角.名称,
  set: v => data.value.主角.名称 = v || '待捏角',
});
const 外貌 = computed({
  get: () => data.value.主角.外貌,
  set: v => data.value.主角.外貌 = v,
});

const 灵石 = computed({
  get: () => data.value.主角.灵石,
  set: v => {
    data.value.主角.灵石 = Math.max(0, Number(v) || 0);
  },
});

function 减灵石() {
  if (灵石.value >= 1000) data.value.主角.灵石 = 灵石.value - 1000;
  else if (灵石.value > 0) data.value.主角.灵石 = 0;
}
function 加灵石() {
  data.value.主角.灵石 = 灵石.value + 1000;
}

function 选性别(g: string) {
  if (g === '其他') {
    性别模式.value = '其他';
    data.value.主角.性别 = 自定义性别.value || '';
  } else {
    性别模式.value = g as '男' | '女';
    自定义性别.value = '';
    data.value.主角.性别 = g;
  }
}

// 同步自定义性别输入到数据
watch(自定义性别, v => {
  if (性别模式.value === '其他') {
    data.value.主角.性别 = v;
  }
});
</script>

<style scoped lang="scss">
@use './theme' as *;

.step {
  padding: 1.4rem 1.4rem 1.8rem;
  color: $paper-cold;
  font-size: 1.05rem;
  animation: step-in 0.4s ease-out;

  @include mobile { padding: 0.8rem 0.7rem 1.2rem; font-size: 0.92rem; }
  @include tablet { padding: 1rem 1rem 1.4rem; }
}
@keyframes step-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

h2 { @include gold-heading; font-size: 1.7rem; margin: 0 0 1.6rem;
  @include mobile { font-size: 1.3rem; margin: 0 0 1rem; }
}

.field {
  display: flex; flex-direction: column; gap: 0.5rem;
  margin: 1.3rem 0;
  @include mobile { margin: 0.9rem 0; }
  > span {
    font-family: $font-serif;
    font-size: 1.05rem;
    font-weight: 500;
    color: $paper-cold;
    letter-spacing: 0.15em;
    @include mobile { font-size: 0.92rem; }
    &::before { content: "❖ "; color: $blood-glow; opacity: 0.7; }
  }
  input, textarea, select {
    @include xianxia-input;
    font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; }
  }
  select option { background: $bg-soft; color: $paper-cold; font-size: 1.05rem; }
  textarea { resize: vertical; min-height: 5rem; line-height: 1.7; border-radius: $r-sm; }
}

.seg {
  display: flex; gap: 0.4rem;
  @include mobile { flex-direction: column; }
  button {
    @include xianxia-btn;
    flex: 1; padding: 0.7rem;
    font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; padding: 0.55rem; }
    &.active {
      background: linear-gradient(180deg, $blood-glow 0%, $blood-mid 55%, $blood 100%);
      color: #f4e8d8;
      border-color: $blood-bright;
      font-weight: bold;
      box-shadow:
        inset 0 0 14px rgba(255,200,200,0.18),
        0 0 12px rgba(168,51,51,0.4);
    }
  }
}
.custom-gender { margin-top: 0.5rem; }

.grid-种族 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
  @include mobile { grid-template-columns: 1fr; }

  button {
    @include xianxia-card;
    text-align: left;
    padding: 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    cursor: pointer;
    color: $paper-cold;
    font-size: 0.95rem;
    @include mobile { padding: 0.5rem; font-size: 0.85rem; }

    .title { font-weight: bold; letter-spacing: 0.08em; }
    .desc {
      font-size: 0.78rem;
      font-weight: 500;
      color: $paper-dim;
      line-height: 1.45;
      @include mobile { font-size: 0.72rem; }
    }
    &.active .title { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
  }
}

.灵石控件 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  .灵石-btn {
    @include xianxia-btn;
    width: 2.8rem;
    height: 2.8rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    line-height: 1;
    @include mobile { width: 2.4rem; height: 2.4rem; font-size: 1rem; }
  }
  .灵石-input {
    @include xianxia-input;
    width: 5rem;
    text-align: center;
    font-size: 1.3rem;
    font-weight: bold;
    font-family: $font-serif;
    color: $amber-bright;
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    @include mobile { width: 4rem; font-size: 1.1rem; }
  }
  .灵石单位 {
    color: $paper-dim;
    font-size: 0.95rem;
    font-weight: 500;
    font-family: $font-serif;
    letter-spacing: 0.1em;
    @include mobile { font-size: 0.82rem; }
  }
}

.hint {
  font-size: 0.95rem;
  font-weight: 500;
  color: $paper-soft;
  font-style: italic;
  margin-top: 0.7rem;
  padding: 0.5rem 0.75rem;
  border-left: 2px solid $blood-mid;
  background: rgba(80,15,15,0.10);
  border-radius: 0 $r-sm $r-sm 0;
  line-height: 1.7;
  @include mobile { font-size: 0.82rem; padding: 0.4rem 0.55rem; }
}

// ═══════════════════════════════════════════════
// 头像
// ═══════════════════════════════════════════════
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.8rem;
}

.portrait-frame {
  position: relative;
  width: 110px;
  height: 110px;
  padding: 5px;
  cursor: pointer;
  transition: transform 0.5s;
  &:hover { transform: translateY(-3px); }
  &.large { width: 170px; height: 170px; }
  @include mobile {
    width: 90px; height: 90px;
    &.large { width: 140px; height: 140px; }
  }
}

.portrait-outer {
  position: absolute; inset: 0;
  border: 1px solid rgba(200,200,210,0.18);
}

.portrait-dash {
  position: absolute; inset: 3px;
  border: 1px dashed rgba(200,200,210,0.12);
}

.portrait-inner {
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(200,200,210,0.08);
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  position: relative;
}

.portrait-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
  z-index: 0;
}

.portrait-img {
  width: 100%; height: 100%;
  object-fit: cover;
  position: relative; z-index: 5;
}

.portrait-icon {
  font-size: 2.2rem;
  color: rgba(200,200,210,0.15);
  position: relative; z-index: 10;
  .portrait-frame.large & { font-size: 3rem; }
  @include mobile { font-size: 1.6rem; }
}

.portrait-badge {
  position: absolute; bottom: 5px;
  border: 1px solid rgba(200,200,210,0.18);
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 10px;
  color: $paper-dim;
  font-size: 0.6rem; font-weight: 500;
  font-family: $font-serif;
  letter-spacing: 0.15em;
  z-index: 10;
}

.portrait-edit-btn {
  position: absolute; top: 5px; right: 5px;
  z-index: 15;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(200,200,210,0.18);
  display: flex; align-items: center; justify-content: center;
  color: $paper-dim;
  font-size: 0.65rem;
}

// 头像编辑页
.av-edit-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0 1rem;
}

.av-edit-back {
  align-self: flex-start;
  background: transparent; border: none;
  color: $paper-dim;
  font-family: $font-serif;
  font-size: 0.88rem; font-weight: 500;
  letter-spacing: 0.1em;
  cursor: pointer;
  &:hover { color: $paper-cold; }
}

.av-edit-preview {
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
}

.av-edit-hint {
  font-size: 0.78rem; font-weight: 500;
  color: $paper-faint;
  letter-spacing: 0.1em;
}

.av-edit-section {
  width: 100%;
  display: flex; flex-direction: column; gap: 0.4rem;
}

.av-edit-label {
  font-size: 0.82rem; font-weight: 500;
  color: $paper-soft;
  letter-spacing: 0.1em;
}

.av-edit-input {
  @include xianxia-input;
  width: 100%;
  font-size: 0.88rem;
}

.av-edit-file {
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem;
  border: 1px dashed rgba(200,200,210,0.18);
  border-radius: $r-sm;
  font-size: 0.88rem; font-weight: 500;
  color: $paper-dim;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: $blood-glow;
    color: $blood-glow;
  }
}

.av-edit-actions {
  display: flex; gap: 0.7rem;
}

.av-edit-btn {
  @include xianxia-btn;
  padding: 0.5rem 1.5rem;
  font-size: 0.88rem; font-weight: 500;
  &.confirm {
    opacity: 0.7;
    &:not(:disabled):hover { opacity: 1; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
}
</style>
