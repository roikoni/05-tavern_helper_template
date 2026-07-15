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
          <aside class="step-sidebar">
            <StepIndicator v-model="当前步" :模式="模式" />
          </aside>
          <main class="step-main">
            <!-- 存档工具栏 -->
            <div class="save-toolbar">
              <span class="mode-tag">{{ 模式 === '普通' ? '普通模式' : 模式 === '自由' ? '自由模式' : '开挂模式' }}</span>
              <button class="save-btn danger" @click="resetOpen = true" title="重置所有捏角选择">
                <i class="fa-solid fa-rotate-left"></i> 重置
              </button>
              <button class="save-btn" @click="onSave" title="保存当前进度">
                <i class="fa-solid fa-floppy-disk"></i> 保存
              </button>
              <button class="save-btn" @click="onLoad" title="载入已保存的进度">
                <i class="fa-solid fa-folder-open"></i> 载入
              </button>
            </div>

            <PointBar />
            <div class="step-body">
              <Transition name="fade" mode="out-in">
                <StepBasic       v-if="当前步 === 1" key="1" :自由="模式 !== '普通'" />
                <StepOrigin      v-else-if="当前步 === 2" key="2" :自由="模式 !== '普通'" />
                <StepSect        v-else-if="当前步 === 3" key="3" />
                <StepShop        v-else-if="当前步 === 4" key="4" :开挂="模式 === '开挂'" />
                <StepAttribute   v-else-if="当前步 === 5" key="5" :自由="模式 !== '普通'" />
                <StepBirthplace  v-else-if="当前步 === 6" key="6" />
                <template v-else-if="模式 === '自由'">
                  <StepRelation v-if="当前步 === 7" key="7" />
                  <StepWorld    v-else-if="当前步 === 8" key="8" />
                  <StepConfirm  v-else-if="当前步 === 9" key="9" :自由="true" />
                </template>
                <template v-else-if="模式 === '开挂'">
                  <StepRelation v-if="当前步 === 7" key="7" />
                  <StepWorld    v-else-if="当前步 === 8" key="8" />
                  <StepCheat    v-else-if="当前步 === 9" key="9" />
                  <StepConfirm  v-else-if="当前步 === 10" key="10" :自由="true" :开挂="true" />
                </template>
                <StepConfirm   v-else-if="当前步 === 7" key="7" :自由="false" />
              </Transition>
            </div>
            <nav class="nav">
              <button v-if="当前步 > 1" class="nav-btn" @click="当前步 -= 1">
                <span class="arrow">‹</span> 上一步
              </button>
              <button v-if="当前步 < 总步数" class="nav-btn primary" @click="当前步 += 1">
                下一步 <span class="arrow">›</span>
              </button>
            </nav>
          </main>
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

    <!-- 重置确认弹窗 -->
    <div v-if="resetOpen" class="load-overlay" @click.self="resetOpen = false">
      <div class="load-modal save-modal">
        <button class="load-close" @click="resetOpen = false">&times;</button>
        <h2 class="load-title">重置捏角</h2>
        <div class="save-form">
          <p class="reset-warn">将清空所有已选选项（姓名、种族、境界、宗门、流派、灵根、装备、功法、六维、灵石、人脉、世界时间）并重置点数池与掷骰锁定。此操作不可撤销。</p>
          <div class="save-actions">
            <button class="save-act-btn cancel" @click="resetOpen = false">取消</button>
            <button class="save-act-btn confirm danger" @click="doReset">确认重置</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { klona } from 'klona';
import _ from 'lodash';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from './store';
import { useDraftStore, type 捏角模式 } from './draft';
import { listSaves, saveCreator, deleteSave } from './lib/save';
import type { CreatorSave } from './lib/save';
import { 神级武器列表, 神级法器列表 } from './catalog/神级装备';
import { 神级功法列表 } from './catalog/神级功法';
import StartScreen from './components/StartScreen.vue';
import PointBar from './components/PointBar.vue';
import StepIndicator from './components/StepIndicator.vue';
import StepBasic from './components/StepBasic.vue';
import StepOrigin from './components/StepOrigin.vue';
import StepSect from './components/StepSect.vue';
import StepShop from './components/StepShop.vue';
import StepAttribute from './components/StepAttribute.vue';
import StepBirthplace from './components/StepBirthplace.vue';
import StepRelation from './components/StepRelation.vue';
import StepWorld from './components/StepWorld.vue';
import StepCheat from './components/StepCheat.vue';
import StepConfirm from './components/StepConfirm.vue';
import DoneView from './components/DoneView.vue';

const { data } = storeToRefs(useDataStore());
const draftStore = useDraftStore();
const { 模式, 点数池 } = storeToRefs(draftStore);
const 当前步 = ref(1);
const 已开始 = ref(false);

const 总步数 = computed(() => 模式.value === '开挂' ? 10 : 模式.value === '自由' ? 9 : 7);

const loadOpen = ref(false);
const saveOpen = ref(false);
const resetOpen = ref(false);
const saveName = ref('');
const saveInput = ref<HTMLInputElement | null>(null);
const saves = ref<CreatorSave[]>([]);

function 进入捏角(m: 捏角模式) {
  draftStore.设模式(m);
  if (m === '开挂') {
    // 无限点数
    draftStore.点数池 = Infinity;
    // 六维拉满
    data.value.主角.六维 = { 力道: 100, 体魄: 100, 身法: 100, 灵力: 100, 神识: 100, 根骨: 100 };
    // 预装神级装备（优先通用型）
    const w = 神级武器列表.find(x => x.适配流派.length === 0) ?? 神级武器列表[0];
    _.set(data.value, '主角.装备.武器', { 名称: w.名称, 品阶: w.品阶, 描述: w.描述, 属性: w.适配流派.join('/') });
    const f = 神级法器列表[0];
    _.set(data.value, '主角.装备.法器', { 名称: f.名称, 品阶: f.品阶, 描述: f.描述, 属性: f.适配流派.join('/') });
    // 预学所有神级功法
    draftStore.已选功法 = 神级功法列表.map(g => g.名称);
  }
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
      模式: 模式.value,
      点数池: 模式.value === '开挂' ? -1 : 点数池.value, // -1 表示无限，规避 JSON Infinity 丢失
      开局身份: draftStore.开局身份,
      自定义能力: draftStore.自定义能力,
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
  // 恢复模式与点数池
  draftStore.设模式(s.模式 ?? '普通');
  if (s.模式 === '开挂') {
    draftStore.点数池 = Infinity;
  } else if (s.模式 === '自由' && typeof s.点数池 === 'number') {
    draftStore.点数池 = s.点数池;
  }
  if (typeof s.开局身份 === 'string') draftStore.开局身份 = s.开局身份;
  if (typeof s.自定义能力 === 'string') draftStore.自定义能力 = s.自定义能力;
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

function doReset() {
  try {
    // 直接覆写主角为捏角初始状态（不依赖 Schema.parse，避免默认值与「待捏角」占位不一致）
    data.value.主角 = {
      名称: '待捏角',
      称号: '待捏角',
      境界: '炼气期',
      修为: 100,
      修为上限: 100,
      气血: 100,
      法力值: 80,
      善恶值: 0,
      san值: 80,
      状态: '正常',
      六维: { 力道: 10, 体魄: 10, 身法: 10, 灵力: 10, 神识: 10, 根骨: 10 },
      灵悟值: 0,
      本源: '待捏角',
      灵根: '待捏角',
      灵石: 0,
      神契装备: '',
      装备: {
        武器: { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '', 属性加成: '' },
        法器: { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '', 属性加成: '' },
      },
      背包: {},
      性别: '待捏角',
      种族: '人族',
      外貌: '',
      出身地: '待捏角',
      宗门: '待捏角',
      修炼流派: '待捏角',
    } as any;

    // 世界时间恢复默认
    data.value.世界.当前年号 = '太初';
    data.value.世界.当前时间 = '混沌历元年';

    // 清空玩家在「人脉羁绊」中设置的重要人物
    data.value.重要人物 = {};

    // 清空古神列表中玩家勾选的神契（如胧）
    if (data.value.古神列表) {
      for (const 名 of Object.keys(data.value.古神列表)) {
        data.value.古神列表[名].收服 = false;
        data.value.古神列表[名].沉沦值 = 0;
      }
    }

    // 草稿：已选功法、锁定、点数池全部重置
    draftStore.重置();

    // 回到第一步
    当前步.value = 1;
    resetOpen.value = false;
    toastr.success('已重置所有捏角选择');
    console.info('[开场] 已重置捏角');
  } catch (err) {
    console.error('[开场] 重置失败', err);
    toastr.error(`重置失败：${err instanceof Error ? err.message : String(err)}`);
  }
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
</script>

<style scoped lang="scss">
@use './components/theme' as *;

// 最外层容器：不做额外边框，让开场 / 捏角内容自然铺开
.app {
  width: 100%;
  background-color: transparent;
  color: $paper-cold;
  font-family: $font-serif;
  // 手机小屏适当缩小基础字号
  font-size: 14px;
  @include desktop { font-size: 18px; }
  border-radius: 0;
  position: relative;
  padding: 0;
  background-image: none;
  box-shadow: none;

  &::before {
    display: none;
  }

  &::after {
    display: none;
  }

  > * {
    position: relative;
    z-index: 1;
    border-radius: 0;
    overflow: hidden;
    @include mobile { border-radius: 0; }
  }
}

.creator {
  @include paper-bg;
  position: relative;
  display: flex;
  min-height: 0;
}

.step-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: linear-gradient(180deg,
    rgba(8,7,10,0.98) 0%,
    rgba(12,10,15,0.95) 100%);
  border-right: 1px solid rgba(207,200,184,0.12);
  position: relative;
  z-index: 5;
  overflow: hidden;

  @include mobile { width: 64px; }
  @include tablet { width: 160px; }
}

.step-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.step-body {
  flex: 1;
  min-height: 0;
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
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem 0;
  position: relative;
  z-index: 3;
  @include mobile {
    padding: 0.5rem 0.7rem 0;
    gap: 0.35rem;
  }
}

.mode-tag {
  margin-right: auto;
  font-family: $font-serif;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  color: $blood-glow;
  padding: 0.2rem 0.6rem;
  border: 1px solid rgba(168,51,51,0.4);
  border-radius: $r-xs;
  background: rgba(80,15,15,0.18);
  @include mobile { font-size: 0.65rem; padding: 0.15rem 0.45rem; }
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
  &.danger {
    color: $blood-bright;
    border-color: rgba(198,69,69,0.4);
    &:hover {
      background: linear-gradient(180deg, rgba(50,12,12,0.95) 0%, rgba(20,5,5,0.98) 100%);
      border-color: $blood-bright;
      box-shadow: 0 0 10px rgba(168,51,51,0.3);
    }
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
    &.danger {
      color: $blood-bright;
      border-color: rgba(198,69,69,0.5);
      opacity: 0.85;
      &:hover {
        background: linear-gradient(180deg, $blood-bright 0%, $blood-glow 50%, $blood 100%);
        color: #f4e8d8;
        border-color: $blood-bright;
      }
    }
  }
}

.reset-warn {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: $paper-dim;
  font-family: $font-serif;
  letter-spacing: 0.03em;
  @include mobile { font-size: 0.74rem; }
}
</style>
