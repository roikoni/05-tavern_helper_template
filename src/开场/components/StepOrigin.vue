<template>
  <section class="step">
    <h2>道途</h2>

    <!-- 灵根：分类选择 + 能量球 -->
    <h3>灵根</h3>
    <div class="灵根区">
      <div class="灵根左">
        <!-- 类别选择 -->
        <div class="类别组">
          <button
            v-for="g in 灵根类别列表"
            :key="g.名称"
            class="类别-btn"
            :class="{ active: 当前类别 === g.名称 }"
            @click="选类别(g.名称)"
          >
            <div class="title">{{ g.名称 }}</div>
            <div class="desc">{{ g.描述 }}</div>
          </button>
        </div>

        <!-- 属性选择 -->
        <div v-if="当前配置" class="属性组">
          <p class="属性行">
            可选 {{ 当前配置.最少 }}~{{ 当前配置.最多 }} 个属性，已选 {{ 已选属性.length }}
          </p>
          <div class="属性网格">
            <button
              v-for="a in 当前配置.池"
              :key="a.名称"
              class="属性-btn"
              :class="{ active: 已选属性.includes(a.名称) }"
              :style="{ '--属性色': a.色 }"
              @click="切属性(a.名称)"
            >
              <span class="属性点"></span>
              <span class="属性名">{{ a.名称 }}</span>
            </button>
          </div>
        </div>
        <p v-else class="prop-hint">请先选择灵根类别</p>
      </div>

      <!-- 能量球 -->
      <div class="能量球区" :class="{ active: 当前配置 }">
        <div class="能量球" :class="特效风格">
          <span class="光环"></span>
          <span class="轨道"></span>
          <span
            v-for="(a, i) in 已选属性候选"
            :key="a.名称"
            class="能量粒子"
            :style="粒子样式(i, a.色)"
          >
            <span class="粒子-点"></span>
          </span>
          <span class="核"></span>
          <span class="核-辉"></span>
        </div>
        <p class="能量提示">{{ 能量提示 }}</p>
      </div>
    </div>

    <h3>本源</h3>
    <label class="field">
      <input v-model="本源" placeholder="自由发挥，随意填写" maxlength="10" />
      <div class="基调组">
        <button
          v-for="k in 基调选项"
          :key="k.值"
          class="基调-btn"
          :class="{ active: 本源基调 === k.值, [k.值]: true }"
          @click="本源基调 = k.值"
        >
          <span class="基调-标记">{{ k.标记 }}</span>
          <span class="基调-名">{{ k.名 }}</span>
        </button>
      </div>
      <p class="hint-本源">
        本源是你修行的根本理念，由你自悟。AI 会根据你的本源 + 流派，为你独家定制一门自悟功法。基调会影响自悟功法与开场剧情的笔调。
      </p>
    </label>

    <!-- 修为境界 -->
      <h3>修为境界</h3>
      <div class="grid grid-境界">
        <button
          v-for="b in 境界列表"
          :key="b.名称"
          :class="{ active: 境界 === b.名称 }"
          @click="选境界(b.名称)"
        >
          <div class="title">{{ b.名称 }}</div>
            <div class="desc">{{ b.档次 }} · 寿元 {{ b.寿元 }}</div>
          </button>
      </div>
      <p class="hint">选定后修为自动填满上限，高境界附带更高的六维下限</p>

    <h3>修炼流派</h3>
    <div class="grid">
      <button v-for="s in 流派列表" :key="s.名称"
              :class="{ active: 流派 === s.名称 }"
              @click="选流派(s.名称)">
        <div class="title">{{ s.名称 }}</div>
        <div class="desc">{{ s.简介 }}</div>
      </button>
    </div>

    <h3>称号</h3>
    <label class="field">
      <input v-model="称号" placeholder="（默认从修炼流派生成，可改）" />
    </label>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 流派列表 } from '../catalog/流派';
import { 灵根类别列表, 解析灵根, type 灵根类别 } from '../catalog/灵根';
import { 境界列表, 查境界 } from '../catalog/境界';

const props = defineProps<{}>();

const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();

const 本源 = computed({
  get: () => data.value.主角.本源 === '待捏角' ? '' : data.value.主角.本源,
  set: v => data.value.主角.本源 = v || '待捏角',
});

// 本源基调：正经 / 搞笑 / 涩涩，存于 draft，仅影响提示词笔调
const 基调选项 = [
  { 值: '正经', 名: '正经', 标记: '正', 描述: '冷峻克制、正剧笔调' },
  { 值: '搞笑', 名: '搞笑', 标记: '戏', 描述: '插科打诨、荒诞戏谑' },
  { 值: '涩涩', 名: '涩涩', 标记: '媚', 描述: '香艳暧昧、情欲暗涌' },
] as const;
const { 本源基调 } = storeToRefs(draft);
const 流派 = computed({
  get: () => data.value.主角.修炼流派,
  set: v => data.value.主角.修炼流派 = v,
});
const 称号 = computed({
  get: () => data.value.主角.称号 === '待捏角' ? '' : data.value.主角.称号,
  set: v => data.value.主角.称号 = v || '待捏角',
});
const 境界 = computed(() => data.value.主角.境界);

// ─── 灵根 ───
const 解析结果 = 解析灵根(data.value.主角.灵根);
const 当前类别 = ref<灵根类别 | ''>(解析结果?.类别 ?? '');
const 已选属性 = ref<string[]>(解析结果?.属性 ?? []);

const 当前配置 = computed(() =>
  灵根类别列表.find(g => g.名称 === 当前类别.value)
);

const 已选属性候选 = computed(() => {
  const cfg = 当前配置.value;
  if (!cfg) return [];
  return 已选属性.value
    .map(名 => cfg.池.find(a => a.名称 === 名))
    .filter(Boolean) as { 名称: string; 色: string }[];
});

const 特效风格 = computed(() => 当前配置.value?.特效 ?? 'pure');

const 能量提示 = computed(() => {
  const cfg = 当前配置.value;
  if (!cfg) return '静待灵根觉醒';
  const n = 已选属性.value.length;
  if (n < cfg.最少) return `还需选 ${cfg.最少 - n} 个属性`;
  if (n > cfg.最多) return `已超出 ${n - cfg.最多} 个，请减少`;
  return `${cfg.名称} · ${n} 属性流转`;
});

function 同步灵根() {
  const cfg = 当前配置.value;
  if (!cfg || 已选属性.value.length < cfg.最少) {
    data.value.主角.灵根 = '待捏角';
    return;
  }
  data.value.主角.灵根 = `${cfg.名称}·${已选属性.value.join('·')}`;
}

function 选类别(名: 灵根类别) {
  当前类别.value = 名;
  已选属性.value = [];
  同步灵根();
}

function 切属性(名: string) {
  const cfg = 当前配置.value;
  if (!cfg) return;
  const idx = 已选属性.value.indexOf(名);
  if (idx >= 0) {
    已选属性.value.splice(idx, 1);
  } else {
    if (已选属性.value.length >= cfg.最多) {
      // 达到上限，替换最早的（保持不超额）
      已选属性.value.shift();
    }
    已选属性.value.push(名);
  }
  同步灵根();
}

// 能量球粒子样式：在轨道上均衡布置 + 沿切线方向的火焰拖尾
// 用 --相位 控制每个粒子在公转动画中的起始位置（按索引平均分布）
function 粒子样式(i: number, 色: string) {
  const n = Math.max(已选属性候选.value.length, 1);
  const 相位 = (i / n) * 360;
  return {
    '--粒子色': 色,
    '--相位': `${相位}deg`,
    animationDelay: `${-(i / n) * 9}s`, // 让初始角度直接落在相位位置
  } as Record<string, string>;
}

function 选境界(名: string) {
  data.value.主角.境界 = 名;
  const 候选 = 查境界(名);
  if (候选) {
    data.value.主角.修为上限 = 候选.修为上限;
    data.value.主角.修为 = 候选.修为上限;
    const 六维 = data.value.主角.六维 as Record<string, number>;
    for (const k of Object.keys(六维)) {
      if (六维[k] < 候选.六维下限) 六维[k] = 候选.六维下限;
    }
  }
}

function 选流派(名: string) {
  const 旧流派 = 流派.value;
  const 旧默认称号 = 旧流派 && 旧流派 !== '待捏角' ? 旧流派 : '待捏角';
  流派.value = 名;
  if (data.value.主角.称号 === 旧默认称号 || data.value.主角.称号 === '待捏角') {
    data.value.主角.称号 = 名;
  }
}
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

h2 { @include gold-heading; font-size: 1.7rem; margin: 0 0 1.2rem;
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
// 灵根区
// ═══════════════════════════════════════════════
.灵根区 {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 1.6rem;
  align-items: start;
  @include mobile { grid-template-columns: 1fr; gap: 1rem; }
  @include tablet { grid-template-columns: 1fr 180px; gap: 1.2rem; }
}

.灵根左 { min-width: 0; }

.类别组 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.7rem;
  @include mobile { grid-template-columns: 1fr 1fr; }
}

.类别-btn {
  @include xianxia-card;
  text-align: left;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  cursor: pointer;
  color: $paper-cold;
  font-size: 0.95rem;
  @include mobile { padding: 0.6rem; font-size: 0.85rem; }

  .title { font-weight: bold; letter-spacing: 0.08em; }
  .desc {
    font-size: 0.78rem;
    color: $paper-dim;
    line-height: 1.45;
    @include mobile { font-size: 0.72rem; }
  }
  &.active .title { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
}

.属性组 {
  margin-top: 1rem;
  .属性行 {
    font-size: 0.85rem;
    color: $paper-dim;
    margin: 0 0 0.5rem;
    letter-spacing: 0.05em;
  }
}

.属性网格 {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.属性-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: rgba(8,7,10,0.7);
  border: 1px solid rgba(207,200,184,0.18);
  border-radius: $r-pill;
  cursor: pointer;
  color: $paper-cold;
  font-family: $font-serif;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  @include mobile { font-size: 0.85rem; padding: 0.4rem 0.7rem; }

  .属性点 {
    width: 0.6rem; height: 0.6rem;
    border-radius: 50%;
    background: var(--属性色, #999);
    box-shadow: 0 0 6px var(--属性色, #999);
    transition: box-shadow 0.3s ease;
  }
  &.active {
    border-color: var(--属性色, rgba(207,200,184,0.5));
    background: rgba(20,18,24,0.9);
    box-shadow: 0 0 10px color-mix(in srgb, var(--属性色, #999) 40%, transparent);
    .属性点 { box-shadow: 0 0 12px var(--属性色, #999); }
  }
}

.prop-hint {
  margin-top: 0.8rem;
  font-size: 0.85rem;
  color: $paper-faint;
  font-style: italic;
}

// ═══════════════════════════════════════════════
// 能量球（平面环绕 + 沿切线方向火焰拖尾）
// ═══════════════════════════════════════════════
.能量球区 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  position: sticky;
  top: 1rem;
  opacity: 0.35;
  transition: opacity 0.4s ease;
  &.active { opacity: 1; }
}

.能量球 {
  position: relative;
  width: 200px; height: 200px;
  display: flex; align-items: center; justify-content: center;
  @include mobile { width: 160px; height: 160px; }
  @include tablet { width: 180px; height: 180px; }
}

.光环 {
  position: absolute; inset: -14%;
  border-radius: 50%;
  background: radial-gradient(circle at center,
    rgba(207,200,184,0.10) 0%,
    rgba(168,51,51,0.06) 38%,
    transparent 70%);
  filter: blur(6px);
  animation: 光环呼吸 6s ease-in-out infinite;
}

// 单一圆形轨道
.轨道 {
  position: absolute; inset: 16%;
  border-radius: 50%;
  border: 1px dashed rgba(207,200,184,0.22);
  animation: 轨道闪 8s ease-in-out infinite;
}

// 核心球
.核 {
  position: relative;
  width: 28%; height: 28%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    #fffaf0 0%, #d9d3c4 30%, #8a2424 75%, #3a0d0d 100%);
  box-shadow:
    0 0 26px rgba(207,200,184,0.35),
    0 0 52px rgba(168,51,51,0.30),
    inset 0 0 14px rgba(255,255,255,0.35);
  z-index: 4;
  animation: 核脉动 3.6s ease-in-out infinite;
}

.核-辉 {
  position: absolute;
  width: 40%; height: 40%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,250,240,0.4) 0%, transparent 65%);
  filter: blur(6px);
  z-index: 3;
  animation: 核脉动 3.6s ease-in-out infinite;
}

// 粒子：rotateZ 公转 + translateX 推到轨道半径。
// --相位 控制起始角度（粒子按索引均衡分布）；
// 元素整体被 rotateZ 转动后，内部 -x 方向恰为运动切线后方，
// 所以拖尾伪元素固定在本地 -x 即自然落在运动反方向。
.能量粒子 {
  position: absolute;
  top: 50%; left: 50%;
  width: 0; height: 0;
  z-index: 3;
  animation: 粒子公转 9s linear infinite;
  will-change: transform;
}

.粒子-点 {
  position: absolute;
  top: -0.5rem; left: -0.5rem;
  width: 1rem; height: 1rem;
  border-radius: 50%;
  background: radial-gradient(circle,
    #fff 0%,
    var(--粒子色, #e8e2d4) 28%,
    color-mix(in srgb, var(--粒子色, #e8e2d4) 50%, transparent) 60%,
    transparent 100%);
  box-shadow:
    0 0 12px var(--粒子色, #e8e2d4),
    0 0 24px color-mix(in srgb, var(--粒子色, #e8e2d4) 55%, transparent);
  // 拖尾长条：本地 -x 方向 = 切线后方 = 运动反方向
  &::before {
    content: "";
    position: absolute;
    top: 50%; left: 50%;
    width: 3.2rem; height: 0.45rem;
    transform: translate(-100%, -50%);
    transform-origin: 100% 50%;
    background: linear-gradient(90deg,
      transparent 0%,
      color-mix(in srgb, var(--粒子色, #e8e2d4) 14%, transparent) 35%,
      color-mix(in srgb, var(--粒子色, #e8e2d4) 48%, transparent) 75%,
      var(--粒子色, #e8e2d4) 100%);
    filter: blur(2px);
    border-radius: 50%;
    opacity: 0.88;
    animation: 尾摇 0.55s ease-in-out infinite alternate;
  }
  // 拖尾辉光：更宽更柔的径向辉光层
  &::after {
    content: "";
    position: absolute;
    top: 50%; left: 50%;
    width: 1.8rem; height: 1.4rem;
    transform: translate(-94%, -50%);
    transform-origin: 100% 50%;
    background: radial-gradient(ellipse at 100% 50%,
      color-mix(in srgb, var(--粒子色, #e8e2d4) 42%, transparent) 0%,
      transparent 70%);
    filter: blur(4px);
    opacity: 0.7;
    animation: 尾摇 0.42s ease-in-out infinite alternate-reverse;
  }
}

// 各类别配色差异（平面）
.能量球.pure {
  .轨道 { border-color: rgba(230,198,88,0.32); }
  .核 { background: radial-gradient(circle at 35% 35%, #fff7e0 0%, #e6c658 35%, #8a6a1a 100%); }
}
.能量球.dual { .轨道 { border-color: rgba(106,168,90,0.30); } }
.能量球.chaos {
  .轨道 { border-style: dotted; border-color: rgba(184,146,90,0.34); }
  .能量粒子 { animation-duration: 12s; }
}
.能量球.mutant {
  .轨道 { border-color: rgba(200,90,212,0.4); }
  .核 {
    background: radial-gradient(circle at 35% 35%, #f0d8ff 0%, #a86ad8 40%, #4a1a6a 100%);
    box-shadow: 0 0 30px rgba(168,90,212,0.4), 0 0 58px rgba(138,90,212,0.32), inset 0 0 16px rgba(255,230,255,0.4);
  }
}

@keyframes 光环呼吸 {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 0.95; transform: scale(1.08); }
}
@keyframes 轨道闪 {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}
@keyframes 粒子公转 {
  from { transform: rotate(var(--相位, 0deg)) translateX(4.4rem); }
  to   { transform: rotate(calc(var(--相位, 0deg) + 360deg)) translateX(4.4rem); }
}
@keyframes 核脉动 {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.12); filter: brightness(1.25); }
}
@keyframes 尾摇 {
  from { transform: translate(-100%, -50%) scaleX(0.9); opacity: 0.65; }
  to   { transform: translate(-100%, -50%) scaleX(1.08); opacity: 0.92; }
}

.能量提示 {
  font-family: $font-serif;
  font-size: 0.85rem;
  color: $paper-dim;
  letter-spacing: 0.1em;
  text-align: center;
  min-height: 1.2em;
  @include mobile { font-size: 0.78rem; }
}

// ═══════════════════════════════════════════════
// 其余 grid（流派 / 境界）
// ═══════════════════════════════════════════════
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
  gap: 0.7rem;
  @include mobile { grid-template-columns: 1fr; }
  &.grid-境界 {
    grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
    @include mobile { grid-template-columns: repeat(2, 1fr); }
  }
}

.grid button {
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
    font-size: 0.85rem; color: $paper-dim; flex: 1; line-height: 1.5;
    @include mobile { font-size: 0.78rem; }
  }
  &.active .title { color: #fff; text-shadow: 0 0 8px rgba(168,51,51,0.4); }
}

.field {
  display: flex; flex-direction: column; margin: 0.5rem 0;
  input { @include xianxia-input; font-size: 1.05rem;
    @include mobile { font-size: 0.92rem; }
  }
  .hint-本源 {
    font-size: 0.92rem; color: $paper-dim; margin: 0.4rem 0 0 0;
    font-style: italic; padding: 0.5rem 0.75rem;
    border-left: 2px solid $blood-mid; background: rgba(80,15,15,0.12);
    border-radius: 0 $r-sm $r-sm 0; line-height: 1.7;
    @include mobile { font-size: 0.8rem; padding: 0.4rem 0.55rem; }
  }
}

// ═══════════════════════════════════════════════
// 本源基调（正经 / 搞笑 / 涩涩）
// ═══════════════════════════════════════════════
.基调组 {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.6rem;
  @include mobile { gap: 0.35rem; }
}

.基调-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.55rem 0.5rem;
  background: rgba(8,7,10,0.7);
  border: 1px solid rgba(207,200,184,0.18);
  border-radius: $r-sm;
  cursor: pointer;
  color: $paper-dim;
  font-family: $font-serif;
  font-size: 0.92rem;
  letter-spacing: 0.12em;
  transition: all 0.3s ease;
  @include mobile { font-size: 0.82rem; padding: 0.45rem 0.3rem; }

  .基调-标记 {
    display: inline-flex; align-items: center; justify-content: center;
    width: 1.4rem; height: 1.4rem;
    border-radius: 50%;
    font-size: 0.95rem;
    font-weight: bold;
    border: 1px solid currentColor;
    opacity: 0.7;
    transition: all 0.3s ease;
    @include mobile { width: 1.2rem; height: 1.2rem; font-size: 0.85rem; }
  }

  &:hover {
    border-color: rgba(207,200,184,0.38);
    color: $paper-cold;
  }

  // 各基调激活态配色
  &.正经 { --基调色: #b8b0a4; }
  &.正经.active {
    color: $paper-cold;
    border-color: rgba(184,176,164,0.55);
    background: rgba(20,18,24,0.9);
    box-shadow: 0 0 10px rgba(184,176,164,0.18);
    .基调-标记 { color: #e8e2d4; border-color: rgba(232,226,212,0.7); opacity: 1; }
  }

  &.搞笑 { --基调色: #d8b44a; }
  &.搞笑.active {
    color: #f4e2a0;
    border-color: rgba(216,180,74,0.6);
    background: rgba(34,28,14,0.92);
    box-shadow: 0 0 12px rgba(216,180,74,0.28);
    .基调-标记 { color: #f4e2a0; border-color: rgba(244,226,160,0.75); opacity: 1; }
  }

  &.涩涩 { --基调色: #d45a7a; }
  &.涩涩.active {
    color: #f4b8cc;
    border-color: rgba(212,90,122,0.6);
    background: rgba(36,16,24,0.92);
    box-shadow: 0 0 12px rgba(212,90,122,0.3);
    .基调-标记 { color: #f4b8cc; border-color: rgba(244,184,204,0.75); opacity: 1; }
  }
}

.hint {
  font-size: 0.92rem; color: $paper-dim; font-style: italic;
  margin-top: 0.6rem; padding: 0.5rem 0.75rem;
  border-left: 2px solid $blood-mid; background: rgba(80,15,15,0.12);
  border-radius: 0 $r-sm $r-sm 0; line-height: 1.7;
  @include mobile { font-size: 0.8rem; padding: 0.4rem 0.55rem; }
}
</style>