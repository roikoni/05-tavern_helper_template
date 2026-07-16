<template>
  <section class="step">
    <h2>宗门</h2>

    <!-- 主页：入口按钮 + 散修 ====-->
    <template v-if="!已选宗门名">
      <div class="阵营入口">
        <button class="阵营-btn 正道" @click="打开弹窗('正道')">
          <span class="阵营-btn-标">正</span>
          <span class="阵营-btn-文">
            <span class="阵营-btn-名">步入正道</span>
            <span class="阵营-btn-副">正道七宗 · 以天下苍生为己任</span>
          </span>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
        <button class="阵营-btn 魔道" @click="打开弹窗('魔道')">
          <span class="阵营-btn-标">魔</span>
          <span class="阵营-btn-文">
            <span class="阵营-btn-名">步入魔道</span>
            <span class="阵营-btn-副">魔道四宗 · 逆天而行唯我独尊</span>
          </span>
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <h3>散修</h3>
      <div class="散修网格">
        <button
          v-for="s in 散修选项"
          :key="s.名称"
          class="散修-btn"
          @click="选宗门(s)"
        >
          <div class="title">{{ s.名称 }}</div>
          <div class="desc">{{ s.简介 }}</div>
          <div class="rec free">自由选择流派</div>
        </button>
      </div>
    </template>

    <!-- 主页：已选宗门简介 ====-->
    <template v-if="已选宗门名">
      <div class="已选区">
        <div class="已选图框">
          <img v-if="已选宗门?.图" :src="已选宗门.图" :alt="已选宗门.名称" />
          <div v-else class="已选图占位">
            <span>{{ 已选宗门名[0] }}</span>
          </div>
        </div>
        <p class="已选简介">{{ 已选宗门?.简介 }}</p>
        <div class="已选底部">
          <div v-if="已选宗门?.推荐流派.length" class="已选流派">
            推荐流派：{{ 已选宗门.推荐流派.join('、') }}
          </div>
          <button class="更换-btn" @click="更换">
            <i class="fa-solid fa-rotate"></i> 更换宗门
          </button>
        </div>
      </div>
    </template>

    <!-- 浮层弹窗：正道/魔道 宗门挑选 ====-->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="弹窗可见" class="弹窗遮罩" @click.self="弹窗可见 = false">
          <div class="弹窗">
            <div class="弹窗头">
              <h3 class="弹窗标题">{{ 当前阵营 === '正道' ? '正道七宗' : '魔道四宗' }}</h3>
              <button class="弹窗关闭" @click="弹窗可见 = false">&times;</button>
            </div>
            <div class="弹窗体">
              <button
                v-for="s in 当前阵营宗门"
                :key="s.名称"
                class="宗门卡片"
                @click="选宗门(s)"
              >
                <div class="宗门卡片-图">
                  <img v-if="s.图" :src="s.图" :alt="s.名称" />
                  <div v-else class="宗门卡片-图占位">
                    <span>{{ s.名称[0] }}</span>
                  </div>
                </div>
                <div class="宗门卡片-名">{{ s.名称 }}</div>
                <div class="宗门卡片-区">{{ s.区域 }}</div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { 宗门列表, type 宗门候选 } from '../catalog/宗门';

const { data } = storeToRefs(useDataStore());

const 宗门 = computed({
  get: () => data.value.主角.宗门,
  set: v => data.value.主角.宗门 = v,
});

const 弹窗可见 = ref(false);
const 当前阵营 = ref<'正道' | '魔道'>('正道');

const 已选宗门名 = computed(() => 宗门.value && 宗门.value !== '待捏角' ? 宗门.value : '');
const 已选宗门 = computed(() => 宗门列表.find(s => s.名称 === 宗门.value));

const 正道宗门 = computed(() => 宗门列表.filter(s => s.阵营 === '正道'));
const 魔道宗门 = computed(() => 宗门列表.filter(s => s.阵营 === '魔道'));
const 散修选项 = computed(() => 宗门列表.filter(s => s.阵营 === '散修'));

const 当前阵营宗门 = computed(() =>
  当前阵营.value === '正道' ? 正道宗门.value : 魔道宗门.value,
);

function 打开弹窗(阵营: '正道' | '魔道') {
  当前阵营.value = 阵营;
  弹窗可见.value = true;
}

function 选宗门(候选: 宗门候选) {
  宗门.value = 候选.名称;
  弹窗可见.value = false;

  if (候选.推荐流派.length > 0) {
    const 当前流派 = data.value.主角.修炼流派;
    if (!当前流派 || 当前流派 === '待捏角' || 当前流派 === '散修') {
      data.value.主角.修炼流派 = 候选.推荐流派[0];
    }
  }

  if (候选.名称 === '散修') {
    const 当前出身地 = data.value.主角.出身地;
    if (!当前出身地 || 当前出身地 === '待捏角' || 当前出身地 === '未知之地') {
      data.value.主角.出身地 = '散修联盟分舵';
    }
  }
}

function 更换() {
  宗门.value = '待捏角';
}
</script>

<style scoped lang="scss">
@use './theme' as *;

.step {
  padding: 1.4rem 1.4rem 1.8rem;
  color: $paper-cold;
  font-size: 1.05rem;
  @include mobile { padding: 0.8rem 0.7rem 1.2rem; font-size: 0.92rem; }
  @include tablet { padding: 1rem 1rem 1.4rem; }
}

h2 {
  @include gold-heading;
  font-size: 1.7rem;
  margin: 0 0 1.2rem;
  @include mobile { font-size: 1.3rem; }
}

h3 {
  font-family: $font-serif;
  margin: 1.8rem 0 1rem;
  color: $paper-cold;
  letter-spacing: 0.15em;
  font-size: 1.2rem;
  @include mobile { font-size: 1rem; margin: 1.2rem 0 0.7rem; }
  &::before { content: "▸ "; color: $blood-glow; opacity: 0.7; }
}

// ═══════════════════════════════════════════════
// 阵营入口按钮
// ═══════════════════════════════════════════════
.阵营入口 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @include mobile { gap: 0.7rem; }
}

.阵营-btn {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.4rem;
  border: 1px solid rgba(207,200,184,0.15);
  border-radius: $r-md;
  background: linear-gradient(180deg, rgba(20,18,24,0.9) 0%, rgba(10,9,13,0.95) 100%);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  color: $paper-cold;
  font-family: $font-serif;
  position: relative;
  overflow: hidden;
  @include mobile { padding: 1rem; gap: 0.8rem; }

  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 4px;
    transition: all 0.4s ease;
  }

  &.正道 {
    &::before { background: linear-gradient(180deg, $blood-glow 0%, $blood 100%); }
    .阵营-btn-标 { background: $blood-glow; }
    &:hover {
      border-color: $blood-mid;
      background: linear-gradient(180deg, rgba(30,14,14,0.95) 0%, rgba(15,8,8,0.98) 100%);
      box-shadow: 0 0 20px rgba(168,51,51,0.18);
      transform: translateX(4px);
    }
  }

  &.魔道 {
    &::before { background: linear-gradient(180deg, #8a4a8a 0%, #4a1a6a 100%); }
    .阵营-btn-标 { background: #8a4a8a; }
    &:hover {
      border-color: rgba(138,74,138,0.5);
      background: linear-gradient(180deg, rgba(28,14,28,0.95) 0%, rgba(12,6,12,0.98) 100%);
      box-shadow: 0 0 20px rgba(128,60,128,0.18);
      transform: translateX(4px);
    }
  }

  i {
    opacity: 0.4;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  &:hover i { opacity: 0.8; transform: translateX(3px); }
}

.阵营-btn-标 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem; height: 3rem;
  border-radius: 50%;
  font-size: 1.3rem;
  font-weight: bold;
  color: #f4e8d8;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(0,0,0,0.4);
  @include mobile { width: 2.4rem; height: 2.4rem; font-size: 1.1rem; }
}

.阵营-btn-文 {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.阵营-btn-名 {
  font-size: 1.25rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  @include mobile { font-size: 1.05rem; }
}

.阵营-btn-副 {
  font-size: 0.82rem;
  font-weight: 500;
  color: $paper-dim;
  letter-spacing: 0.05em;
  @include mobile { font-size: 0.74rem; }
}

// ═══════════════════════════════════════════════
// 散修
// ═══════════════════════════════════════════════
.散修网格 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}

.散修-btn {
  @include xianxia-card;
  text-align: left;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  cursor: pointer;
  color: $paper-cold;
  font-size: 1rem;
  @include mobile { padding: 0.65rem; font-size: 0.9rem; }

  .title { font-weight: bold; color: $paper-cold; letter-spacing: 0.08em; }
  .desc {
    font-size: 0.85rem; font-weight: 500; color: $paper-dim; line-height: 1.5;
    @include mobile { font-size: 0.78rem; }
  }
  .rec {
    font-size: 0.82rem; font-weight: 500; align-self: flex-end; color: $blood-glow;
    letter-spacing: 0.05em; padding: 0.15rem 0.5rem;
    background: rgba(80,15,15,0.20); border-radius: $r-xs;
    &.free { color: $jade; background: rgba(40,80,40,0.18); &::before { content: "✓ "; } }
  }
}

// ═══════════════════════════════════════════════
// 已选宗门展示（上下布局）
// ═══════════════════════════════════════════════
.已选区 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.已选图框 {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid rgba(207,200,184,0.2);
  border-radius: $r-md;
  overflow: hidden;
  background: rgba(8,7,10,0.8);

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
}

.已选图占位 {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, rgba(20,14,14,0.8) 0%, rgba(8,7,10,0.95) 100%);
  span {
    font-family: $font-brush;
    font-size: 4rem;
    color: $paper-faint;
    opacity: 0.4;
    @include mobile { font-size: 3rem; }
  }
}

.已选简介 {
  font-size: 0.95rem;
  font-weight: 500;
  color: $paper-cold;
  line-height: 1.7;
  margin: 0;
  padding: 0.8rem;
  background: rgba(8,8,10,0.45);
  border-left: 2px solid $blood-mid;
  border-radius: 0 $r-sm $r-sm 0;
  @include mobile { font-size: 0.85rem; }
}

.已选底部 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.已选流派 {
  font-size: 0.85rem;
  font-weight: 500;
  color: $blood-glow;
  letter-spacing: 0.05em;
  padding: 0.4rem 0.7rem;
  background: rgba(80,15,15,0.12);
  border-radius: $r-xs;
}

.更换-btn {
  @include xianxia-btn;
  font-size: 0.82rem;
  padding: 0.45rem 1rem;
  i { margin-right: 0.3em; }
}

// ═══════════════════════════════════════════════
// 浮层弹窗
// ═══════════════════════════════════════════════
.弹窗遮罩 {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  @include mobile { padding: 1rem; }
}

.弹窗 {
  background: linear-gradient(180deg, rgba(14,14,18,0.98) 0%, rgba(6,6,8,0.99) 100%);
  border: 1px solid rgba(200,200,210,0.12);
  border-radius: $r-lg;
  box-shadow:
    0 0 50px rgba(0,0,0,0.6),
    0 0 20px rgba(0,0,0,0.3);
  max-width: 720px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.弹窗头 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
  border-bottom: 1px solid rgba(200,200,210,0.08);
  @include mobile { padding: 0.9rem 1rem; }
}

.弹窗标题 {
  margin: 0;
  font-family: $font-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: $paper-cold;
  letter-spacing: 0.12em;
  @include mobile { font-size: 1.1rem; }
  &::before { content: none; }
}

.弹窗关闭 {
  background: none;
  border: none;
  color: $paper-dim;
  font-size: 1.6rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 0.2rem;
  transition: color 0.2s;
  &:hover { color: $blood-bright; }
}

.弹窗体 {
  padding: 1.5rem 1.6rem 1.8rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 1rem;
  flex: 1;
  @include mobile { padding: 1rem; grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
  @include tablet { grid-template-columns: repeat(3, 1fr); }
}

.宗门卡片 {
  @include xianxia-card;
  text-align: center;
  padding: 0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  color: $paper-cold;
  font-size: 1rem;
  overflow: hidden;
  @include mobile { font-size: 0.9rem; }

  &:hover {
    .宗门卡片-图 img,
    .宗门卡片-图占位 { transform: scale(1.05); }
  }
}

.宗门卡片-图 {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(8,7,10,0.8);
  border-bottom: 1px solid rgba(207,200,184,0.1);

  img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
}

.宗门卡片-图占位 {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, rgba(20,14,14,0.7) 0%, rgba(10,9,13,0.9) 100%);
  transition: transform 0.4s ease;
  span {
    font-family: $font-brush;
    font-size: 3rem;
    color: $paper-faint;
    opacity: 0.35;
    @include mobile { font-size: 2rem; }
  }
}

.宗门卡片-名 {
  padding: 0.65rem 0.5rem 0;
  font-weight: bold;
  font-family: $font-serif;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
  @include mobile { font-size: 0.9rem; padding: 0.5rem 0.4rem 0; }
}

.宗门卡片-区 {
  padding: 0.15rem 0.5rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: $paper-dim;
  letter-spacing: 0.05em;
  @include mobile { font-size: 0.7rem; padding: 0.1rem 0.4rem 0.5rem; }
}

// ═══════════════════════════════════════════════
// 弹窗动画
// ═══════════════════════════════════════════════
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
  .弹窗 { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease; }
}
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .弹窗 {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}
.modal-leave-to .弹窗 {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>