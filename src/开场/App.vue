<template>
  <div class="app">
    <DoneView v-if="data.$flag?.已完成捏角" />
    <template v-else>
      <Transition name="ink-fade" mode="out-in">
        <!-- 第 0 步：开场封面 -->
        <StartScreen
          v-if="!已开始"
          key="start"
          @enter="进入捏角"
        />

        <!-- 捏角主体 -->
        <div v-else key="creator" class="creator">
          <!-- 存档工具栏 -->
          <div class="save-toolbar">
            <button class="save-btn" @click="onSave" title="保存当前进度">
              <i class="fa-solid fa-floppy-disk"></i> 保存
            </button>
            <button class="save-btn" @click="onLoad" title="载入已保存的进度">
              <i class="fa-solid fa-folder-open"></i> 载入
            </button>
          </div>

          <PointBar />
          <StepIndicator v-model="当前步" />
          <Transition name="fade" mode="out-in">
            <StepBasic     v-if="当前步 === 1" key="1" />
            <StepOrigin    v-else-if="当前步 === 2" key="2" />
            <StepSect      v-else-if="当前步 === 3" key="3" />
            <StepShop      v-else-if="当前步 === 4" key="4" />
            <StepAttribute v-else-if="当前步 === 5" key="5" />
            <StepConfirm   v-else-if="当前步 === 6" key="6" />
          </Transition>
          <nav class="nav">
            <button v-if="当前步 > 1" class="nav-btn" @click="当前步 -= 1">
              <span class="arrow">‹</span> 上一步
            </button>
            <button v-if="当前步 < 6" class="nav-btn primary" @click="当前步 += 1">
              下一步 <span class="arrow">›</span>
            </button>
          </nav>
        </div>
      </Transition>
    </template>

    <!-- 保存存档弹窗 -->
    <div v-if="saveOpen" class="load-overlay" @click.self="saveOpen = false">
      <div class="load-modal save-modal">
        <button class="load-close" @click="saveOpen = false">&times;</button>
        <h2 class="load-title">保存存档</h2>
        <div class="save-form">
          <input
            ref="saveInput"
            v-model="saveName"
            class="save-input"
            placeholder="输入存档名称…"
            @keyup.enter="doSave"
          />
          <div class="save-actions">
            <button class="save-act-btn cancel" @click="saveOpen = false">取消</button>
            <button class="save-act-btn confirm" @click="doSave" :disabled="!saveName.trim()">确认</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loadOpen" class="load-overlay" @click.self="loadOpen = false">
      <div class="load-modal">
        <button class="load-close" @click="loadOpen = false">&times;</button>
        <h2 class="load-title">载入存档</h2>
        <div v-if="saves.length === 0" class="load-empty">暂无存档</div>
        <div
          v-for="s in saves"
          :key="s.name"
          class="load-row"
          @click="doLoad(s)"
        >
          <span class="load-name">{{ s.name }}</span>
          <span class="load-time">{{ fmtTime(s.timestamp) }}</span>
          <button class="load-del" @click.stop="onDelete(s.name)" title="删除存档">&times;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { klona } from 'klona';
import _ from 'lodash';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from './store';
import { useDraftStore } from './draft';
import { listSaves, saveCreator, deleteSave } from './lib/save';
import type { CreatorSave } from './lib/save';
import StartScreen from './components/StartScreen.vue';
import PointBar from './components/PointBar.vue';
import StepIndicator from './components/StepIndicator.vue';
import StepBasic from './components/StepBasic.vue';
import StepOrigin from './components/StepOrigin.vue';
import StepSect from './components/StepSect.vue';
import StepShop from './components/StepShop.vue';
import StepAttribute from './components/StepAttribute.vue';
import StepConfirm from './components/StepConfirm.vue';
import DoneView from './components/DoneView.vue';

const { data } = storeToRefs(useDataStore());
const draftStore = useDraftStore();
const 当前步 = ref(1);
const 已开始 = ref(false);

const loadOpen = ref(false);
const saveOpen = ref(false);
const saveName = ref('');
const saveInput = ref<HTMLInputElement | null>(null);
const saves = ref<CreatorSave[]>([]);

function 进入捏角() {
  已开始.value = true;
}

function onSave() {
  saveName.value = '';
  saveOpen.value = true;
  // 等弹窗渲染后聚焦输入框
  setTimeout(() => saveInput.value?.focus(), 50);
}

function doSave() {
  const name = saveName.value.trim();
  if (!name) return;
  saveCreator(
    {
      step: 当前步.value,
      主角: klona(data.value.主角) as Record<string, any>,
      已选功法: klona(draftStore.已选功法),
    },
    name,
  );
  saveOpen.value = false;
  toastr.success(`已保存「${name}」`);
}

function onLoad() {
  saves.value = listSaves();
  loadOpen.value = true;
}

function doLoad(s: CreatorSave) {
  // 恢复主角数据
  data.value.主角 = s.主角 as any;
  // 恢复步骤
  当前步.value = s.step;
  // 恢复已选功法
  draftStore.已选功法 = klona(s.已选功法);
  // 确保进入捏角界面
  已开始.value = true;
  loadOpen.value = false;
  toastr.success(`已载入「${s.name}」`);
}

function onDelete(name: string) {
  deleteSave(name);
  saves.value = listSaves();
  toastr.info(`已删除「${name}」`);
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
</script>

<style scoped lang="scss">
@use './components/theme' as *;

// 最外层容器：银色金属拉丝边框 + 圆角（开场页 / 捏角页都包在里面）
.app {
  width: 100%;
  background-color: $bg-ink;
  color: $paper-cold;
  font-family: $font-serif;
  // 手机小屏适当缩小基础字号
  font-size: 14px;
  @include desktop { font-size: 16px; }
  border-radius: 18px;
  position: relative;
  // padding 留出金属边框宽度（4px），让内层背景不溢出
  padding: 4px;
  @include mobile { padding: 2px; }
  // 金属基础：纵向黑色拉丝渐变
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
  // 多层阴影：外发光 + 抛光高光 + 深邃内阴影
  box-shadow:
    0 0 0 1px rgba(120,120,120,0.18),                 // 最外细高光
    0 0 0 2px rgba(0,0,0,0.8),                        // 外深线
    inset 0 1px 0 rgba(180,180,180,0.22),             // 顶部抛光
    inset 0 -1px 0 rgba(0,0,0,0.7),                   // 底部凹槽
    0 8px 28px rgba(0,0,0,0.8),                       // 落影
    0 2px 4px rgba(0,0,0,0.7);

  // 内层：真正的内容容器（暗色），加内阴影制造深嵌效果
  &::before {
    content: "";
    position: absolute;
    inset: 4px;
    border-radius: 14px;
    background: $bg-ink;
    box-shadow:
      inset 0 0 0 1px rgba(0,0,0,0.85),               // 黑色围线
      inset 0 0 0 2px rgba(90,90,90,0.2),             // 内反光
      inset 0 0 32px rgba(0,0,0,0.75),                // 内部暗角
      inset 0 0 80px rgba(0,0,0,0.5);
    z-index: 0;
    pointer-events: none;
  }
  @include mobile {
    &::before {
      inset: 2px;
      border-radius: 12px;
    }
  }

  // 让所有子内容浮在 ::before 之上
  > * {
    position: relative;
    z-index: 1;
    border-radius: 14px;
    overflow: hidden;
    @include mobile { border-radius: 12px; }
  }
}

.creator {
  @include paper-bg;
  position: relative;
}

.nav {
  display: flex;
  justify-content: space-between;
  padding: 1.2rem 1.2rem 1.4rem;
  gap: 1rem;
  position: relative;
  z-index: 2;

  // 手机端减少内边距
  @include mobile {
    padding: 0.85rem 0.7rem 1rem;
    gap: 0.5rem;
  }
  @include tablet {
    padding: 1rem 1rem 1.2rem;
  }

  // 顶部水墨分割线
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg,
      transparent, rgba(207,200,184,0.35) 50%, transparent);
  }
  // 中央小墨点
  &::after {
    content: "◆";
    position: absolute;
    top: -8px; left: 50%;
    transform: translateX(-50%);
    color: $paper-soft;
    opacity: 0.4;
    font-size: 0.7rem;
    background: $bg-ink;
    padding: 0 0.4em;
  }

  .nav-btn {
    @include xianxia-btn;
    font-size: 1.05rem;
    padding: 0.65rem 1.6rem;
    @include mobile {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }
    .arrow {
      display: inline-block;
      margin: 0 0.3em;
      font-size: 1.2em;
      vertical-align: middle;
    }
    &.primary { margin-left: auto; }
  }
}

// 步骤切换淡入
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

// 开场→捏角 水墨退场+淡入
.ink-fade-enter-active { transition: opacity 0.7s ease 0.05s; }
.ink-fade-leave-active { transition: opacity 0.5s ease; }
.ink-fade-enter-from   { opacity: 0; }
.ink-fade-leave-to     { opacity: 0; }

// ═══════════════════════════════════════════════
// 存档工具栏
// ═══════════════════════════════════════════════
.save-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem 0;
  position: relative;
  z-index: 3;
  @include mobile {
    padding: 0.5rem 0.7rem 0;
    gap: 0.35rem;
  }
}

.save-btn {
  @include xianxia-btn;
  font-size: 0.78rem;
  padding: 0.35rem 0.85rem;
  opacity: 0.7;
  transition: opacity 0.2s, background 0.2s;
  @include mobile {
    font-size: 0.68rem;
    padding: 0.3rem 0.65rem;
  }
  &:hover {
    opacity: 1;
  }
  i {
    margin-right: 0.3em;
  }
}

// ═══════════════════════════════════════════════
// 载入存档弹窗
// ═══════════════════════════════════════════════
.load-overlay {
  position: absolute;
  inset: 0;
  z-index: 80;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  border-radius: 14px;
}

.load-modal {
  width: 340px;
  max-height: 380px;
  background: $bg-ink;
  border: 1px solid rgba(207, 200, 184, 0.25);
  border-radius: $r-md;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: modal-in 0.2s ease;
  @include mobile {
    width: 92vw;
    max-height: 70vh;
  }
}

.load-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: $paper-faint;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
  &:hover {
    color: $blood-bright;
  }
}

.load-title {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(207, 200, 184, 0.15);
  background: rgba(0, 0, 0, 0.4);
  font-size: 1rem;
  font-family: $font-serif;
  color: $paper-cold;
  letter-spacing: 0.1em;
  margin: 0;
  @include mobile {
    font-size: 0.9rem;
    padding: 10px 12px;
  }
}

.load-empty {
  text-align: center;
  padding: 24px;
  color: $paper-faint;
  font-size: 0.82rem;
  font-style: italic;
  font-family: $font-serif;
}

.load-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(207, 200, 184, 0.06);
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(207, 200, 184, 0.08);
  }
  @include mobile {
    padding: 8px 10px;
    gap: 6px;
  }
}

.load-name {
  flex: 1;
  font-size: 0.82rem;
  color: $paper-cold;
  font-family: $font-serif;
  letter-spacing: 0.05em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include mobile {
    font-size: 0.75rem;
  }
}

.load-time {
  font-size: 0.62rem;
  color: $paper-faint;
  font-family: $font-serif;
  white-space: nowrap;
  @include mobile {
    font-size: 0.55rem;
  }
}

.load-del {
  background: none;
  border: 1px solid transparent;
  color: $paper-faint;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  border-radius: 2px;
  transition: all 0.2s;
  &:hover {
    color: $blood-bright;
    border-color: rgba(168, 51, 51, 0.4);
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// ═══════════════════════════════════════════════
// 保存存档弹窗
// ═══════════════════════════════════════════════
.save-modal {
  width: 300px;
  @include mobile {
    width: 88vw;
  }
}

.save-form {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.save-input {
  @include xianxia-input;
  width: 100%;
  font-size: 0.9rem;
  @include mobile {
    font-size: 0.82rem;
  }
}

.save-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.save-act-btn {
  @include xianxia-btn;
  font-size: 0.78rem;
  padding: 0.4rem 1rem;
  @include mobile {
    font-size: 0.7rem;
    padding: 0.35rem 0.85rem;
  }
  &.confirm {
    opacity: 0.7;
    &:not(:disabled):hover { opacity: 1; }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
}
</style>
