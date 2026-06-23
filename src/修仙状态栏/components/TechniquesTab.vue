<template>
  <div class="page-root">
    <div class="top-bar">
      <div class="top-card enl">
        <div class="tc-icon"><i class="fa-solid fa-star"></i></div>
        <div class="tc-body">
          <span class="tc-label">灵悟值</span><span class="tc-value">{{ S.data.主角.灵悟值 }}</span>
        </div>
      </div>
      <div class="top-card org">
        <div class="tc-icon"><i class="fa-solid fa-gem"></i></div>
        <div class="tc-body">
          <span class="tc-label">本源</span><span class="tc-value">{{ S.data.主角.本源 }}</span>
        </div>
      </div>
      <div class="top-card rt">
        <div class="tc-icon"><i class="fa-solid fa-seedling"></i></div>
        <div class="tc-body">
          <span class="tc-label">灵根</span><span class="tc-value">{{ S.data.主角.灵根 }}</span>
        </div>
      </div>
      <button class="top-card chk" :disabled="checking" @click="checkUpdate">
        <div class="tc-icon"><i class="fa-solid fa-wand-sparkles"></i></div>
        <div class="tc-body">
          <span class="tc-label">{{ checking ? '参悟中' : '参悟' }}</span>
        </div>
      </button>
    </div>

    <div class="learned-row">
      <span class="lr-label">已学</span>
      <span v-if="learnedCount === 0" class="lr-none">无</span>
      <span v-for="(t, n) in learnedTechs" :key="n" class="lr-tag" @click="open(n, t)"
        >{{ n
        }}<i class="lr-tp" :class="(t as any).类型 === '主动' ? 'tp-a' : 'tp-p'">{{
          (t as any).类型 === '主动' ? '⚔' : '🛡'
        }}</i></span
      >
    </div>

    <div class="tree-wrap">
      <div
        class="tree-canvas"
        ref="cv"
        @mousedown="ps"
        @mousemove="pm"
        @mouseup="pu"
        @mouseleave="pu"
        @wheel.prevent="wh"
        @dblclick="rs"
        @touchstart="ts"
        @touchmove="tm"
        @touchend="pu"
        :style="{ cursor: dg ? 'grabbing' : 'grab' }"
      >
        <div v-if="total === 0" class="empty"><span>功法树为空 · 请加载初始变量</span></div>
        <div v-else class="tree-world" :style="ws">
          <svg class="tw-svg" :width="tw" :height="tw">
            <defs>
              <filter id="connGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              v-for="(c, i) in conns"
              :key="i"
              :d="c.d"
              :stroke="c.color"
              stroke-width="1.3"
              fill="none"
              stroke-linecap="round"
              :stroke-dasharray="c.learned ? undefined : '4 3'"
              :filter="c.learned ? 'url(#connGlow)' : undefined"
              style="transition: stroke 0.3s"
            />
          </svg>
          <div
            v-for="(t, n) in techs"
            :key="n"
            class="t-node"
            :class="nc(n, t)"
            :style="ns(n)"
            @click.stop="open(n, t)"
            @touchend.stop="onNodeTouchEnd(n, t, $event)"
          >
            <span class="tn-name">{{ n }}</span>
            <span class="tn-type" :class="(t as any).类型 === '主动' ? 'tp-a' : 'tp-p'">{{
              (t as any).类型 === '主动' ? '⚔' : '🛡'
            }}</span>
            <span class="tn-cost">{{ (t as any).消耗灵悟 }}悟</span>
            <span class="tn-lv">Lv{{ (t as any).层级 }}</span>
          </div>
        </div>
      </div>
      <div class="tree-hint">拖拽移动 · 滚轮缩放 · 双击还原</div>
    </div>

    <div v-if="dv" class="dlg-bg" @click.self="dv = false">
      <div class="dlg">
        <button class="dlg-x" @click="dv = false">&times;</button>
        <div class="dlg-h">{{ dn }}</div>
        <div class="dlg-b">
          <div class="dr">
            <span class="dl">层级</span><span class="dv2">第{{ dd?.层级 }}层</span>
          </div>
          <div class="dr">
            <span class="dl">类型</span
            ><span class="dv2" :class="dd?.类型 === '主动' ? 'tp-a' : 'tp-p'">{{ dd?.类型 }}</span>
          </div>
          <div class="dr">
            <span class="dl">前置</span><span class="dv2">{{ dd?.前置功法 || '无' }}</span>
          </div>
          <div class="dr">
            <span class="dl">消耗</span><span class="dv2 gd">{{ dd?.消耗灵悟 }} 灵悟</span>
          </div>
          <div class="dr">
            <span class="dl">效果</span><span class="dv2">{{ dd?.效果 }}</span>
          </div>
          <div v-if="dd?.属性加成" class="dr">
            <span class="dl">属性加成</span><span class="dv2 gd">{{ dd?.属性加成 }}</span>
          </div>
          <div v-if="dd?.描述" class="dd2">{{ dd?.描述 }}</div>
          <button v-if="dd && !dd.已学习 && ok(dn, dd)" class="bl" @click="ln(dn, dd)">
            参悟 · {{ dd.消耗灵悟 }}悟
          </button>
          <div v-else-if="dd && !dd.已学习" class="bx"><i class="fa-solid fa-lock"></i> {{ why(dn, dd) }}</div>
          <div v-else class="by"><i class="fa-solid fa-check"></i> 已领悟</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
const S = useDataStore();
const cv = ref<HTMLElement | null>(null);
const dv = ref(false);
const dn = ref('');
const dd = ref<any>(null);
const nw = 72;
const nh = 48;
const rg = 105;
const px = ref(0);
const py = ref(0);
const sc = ref(0.45);
const dg = ref(false);

// 安全获取功法数据，防止 undefined/null 导致 Object.keys 等操作抛出异常
const techs = computed(() => (_.isObject(S.data.功法) ? S.data.功法 : {}) as Record<string, any>);

let ds = { x: 0, y: 0, px: 0, py: 0 };
let touchMoved = false; // 区分触摸拖拽与点击
function ps(e: MouseEvent) {
  dg.value = true;
  ds = { x: e.clientX, y: e.clientY, px: px.value, py: py.value };
}
function pm(e: MouseEvent) {
  if (!dg.value) return;
  px.value = ds.px + (e.clientX - ds.x);
  py.value = ds.py + (e.clientY - ds.y);
}
function pu() {
  dg.value = false;
}
function wh(e: WheelEvent) {
  const r = cv.value?.getBoundingClientRect();
  if (!r) return;
  const mx = e.clientX - r.left,
    my = e.clientY - r.top;
  const wx = (mx - px.value) / sc.value,
    wy = (my - py.value) / sc.value;
  sc.value = _.clamp(sc.value * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 0.1, 3);
  px.value = mx - wx * sc.value;
  py.value = my - wy * sc.value;
}
function rs() {
  px.value = 0;
  py.value = 0;
  sc.value = 0.45;
}
let td = 0,
  ts2 = 0,
  tm2 = { x: 0, y: 0 };
function ts(e: TouchEvent) {
  touchMoved = false;
  if (e.touches.length === 1) {
    dg.value = true;
    ds = { x: e.touches[0].clientX, y: e.touches[0].clientY, px: px.value, py: py.value };
  } else if (e.touches.length === 2) {
    dg.value = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX,
      dy = e.touches[0].clientY - e.touches[1].clientY;
    td = Math.sqrt(dx * dx + dy * dy);
    ts2 = sc.value;
    tm2 = {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    };
  }
}
function tm(e: TouchEvent) {
  touchMoved = true;
  e.preventDefault();
  if (e.touches.length === 1 && dg.value) {
    px.value = ds.px + (e.touches[0].clientX - ds.x);
    py.value = ds.py + (e.touches[0].clientY - ds.y);
  } else if (e.touches.length === 2 && td > 0) {
    const dx = e.touches[0].clientX - e.touches[1].clientX,
      dy = e.touches[0].clientY - e.touches[1].clientY,
      d = Math.sqrt(dx * dx + dy * dy);
    const r = cv.value?.getBoundingClientRect();
    if (!r) return;
    const mx = tm2.x - r.left,
      my = tm2.y - r.top;
    const wx = (mx - px.value) / sc.value,
      wy = (my - py.value) / sc.value;
    sc.value = _.clamp(ts2 * (d / td), 0.1, 3);
    px.value = mx - wx * sc.value;
    py.value = my - wy * sc.value;
  }
}
// 功法节点触摸点击：只有未拖拽时才触发弹窗
function onNodeTouchEnd(n: string, t: any, e: TouchEvent) {
  if (!touchMoved) {
    open(n, t);
  }
}

const total = computed(() => Object.keys(techs.value).length);
// 已学标签 = 初始功法（全部已学，与功法树分离）+ 功法树中已学习的；同名时 /功法/ 优先
const initialTechs = computed(() => (_.isObject(S.data.初始功法) ? S.data.初始功法 : {}) as Record<string, any>);
const learnedTechs = computed(() => ({
  ...(initialTechs.value as any),
  ..._.pickBy(techs.value as any, (t: any) => t.已学习),
}));
const learnedCount = computed(() => Object.keys(learnedTechs.value).length);

// 子树权重比例扇形布局
const pos = computed(() => {
  const p: Record<string, { x: number; y: number }> = {};
  const ts = techs.value as any;
  if (_.isEmpty(ts)) return p;
  const kids: Record<string, string[]> = {};
  for (const [n, t] of Object.entries(ts)) {
    const pr = t.前置功法;
    if (pr) {
      if (!kids[pr]) kids[pr] = [];
      kids[pr].push(n);
    }
  }
  const roots = Object.entries(ts)
    .filter(([, t]) => !t.前置功法)
    .map(([n]) => n);
  function w(n: string): number {
    return 1 + (kids[n] || []).reduce((s, k) => s + w(k), 0);
  }
  function place(n: string, lv: number, a0: number, a1: number) {
    const r = lv === 1 ? rg * 0.55 : lv * rg;
    const mid = (a0 + a1) / 2;
    p[n] = { x: Math.cos(mid) * r - nw / 2, y: Math.sin(mid) * r - nh / 2 };
    const ks = kids[n] || [];
    if (!ks.length) return;
    const tw = ks.reduce((s, k) => s + w(k), 0);
    let a = a0;
    ks.forEach(k => {
      const wt = w(k) / tw;
      const sp = (a1 - a0) * wt;
      place(k, lv + 1, a, a + sp);
      a += sp;
    });
  }
  const twb = roots.reduce((s, r) => s + w(r), 0);
  let a = -Math.PI / 2;
  roots.forEach(r => {
    const wt = w(r) / twb;
    const sp = 2 * Math.PI * wt;
    place(r, 1, a, a + sp);
    a += sp;
  });
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const k of Object.keys(p)) {
    const cx = p[k].x + nw / 2,
      cy = p[k].y + nh / 2;
    if (cx < minX) minX = cx;
    if (cy < minY) minY = cy;
    if (cx > maxX) maxX = cx;
    if (cy > maxY) maxY = cy;
  }
  const ox = -minX + 30,
    oy = -minY + 30;
  for (const k of Object.keys(p)) {
    p[k].x += ox;
    p[k].y += oy;
  }
  return p;
});
const tw = computed(() => {
  const pv = pos.value;
  const vs = Object.values(pv);
  if (!vs.length) return 400;
  let mw = 0,
    mh = 0;
  for (const v of vs) {
    if (v.x + nw > mw) mw = v.x + nw;
    if (v.y + nh > mh) mh = v.y + nh;
  }
  return Math.max(mw, mh) + 30;
});
const ws = computed(() => ({
  width: tw.value + 'px',
  height: tw.value + 'px',
  transform: `translate(${px.value}px,${py.value}px) scale(${sc.value})`,
  transformOrigin: '0 0',
}));

// 矩形边缘点：从中心向目标方向，找到矩形边框上的点
function rectEdgePoint(cx: number, cy: number, w: number, h: number, tx: number, ty: number) {
  const dx = tx - cx,
    dy = ty - cy;
  const angle = Math.atan2(dy, dx);
  const absCos = Math.abs(Math.cos(angle));
  const absSin = Math.abs(Math.sin(angle));
  const t =
    absCos < 0.001 ? h / 2 / absSin : absSin < 0.001 ? w / 2 / absCos : Math.min(w / 2 / absCos, h / 2 / absSin);
  return { x: cx + Math.cos(angle) * t, y: cy + Math.sin(angle) * t };
}

// 连线：从节点边缘到边缘，避免线穿过节点
const conns = computed(() => {
  const ts = techs.value as any;
  const r: any[] = [];
  const pv = pos.value;
  for (const [n, t] of Object.entries(ts)) {
    const pn = t.前置功法;
    if (!pn) continue;
    const pp = pv[pn],
      cp = pv[n];
    if (!pp || !cp) continue;
    const x1c = pp.x + nw / 2,
      y1c = pp.y + nh / 2,
      x2c = cp.x + nw / 2,
      y2c = cp.y + nh / 2;
    const p1 = rectEdgePoint(x1c, y1c, nw, nh, x2c, y2c);
    const p2 = rectEdgePoint(x2c, y2c, nw, nh, x1c, y1c);
    const x1 = p1.x,
      y1 = p1.y,
      x2 = p2.x,
      y2 = p2.y;
    const dx = x2 - x1,
      dy = y2 - y1,
      dist = Math.sqrt(dx * dx + dy * dy);
    const seed = (n + pn).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const perpX = -dy / dist,
      perpY = dx / dist;
    const offset = ((seed % 41) - 20) * (dist * 0.0015);
    const cx1 = x1 + dx * 0.3 + perpX * offset,
      cx2 = x2 - dx * 0.3 + perpX * offset;
    const cy1 = y1 + dy * 0.3 + perpY * offset,
      cy2 = y2 - dy * 0.3 + perpY * offset;
    r.push({
      d: `M${x1.toFixed(1)},${y1.toFixed(1)} C${cx1.toFixed(1)},${cy1.toFixed(1)} ${cx2.toFixed(1)},${cy2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
      color: t.已学习 ? 'rgba(207, 200, 184,0.5)' : 'rgba(58,95,112,0.35)',
      learned: !!t.已学习,
    });
  }
  return r;
});
const ns = (n: string) => {
  const p = pos.value[n];
  return p ? { left: p.x + 'px', top: p.y + 'px' } : { display: 'none' };
};
const nc = (n: string, t: any) => ({
  learned: t.已学习,
  'can-learn': !t.已学习 && ok(n, t),
  locked: !t.已学习 && !ok(n, t),
});
function ok(_name: string, t: any): boolean {
  if (!t) return false;
  const cost = _.clamp(Number(t.消耗灵悟), 1, Infinity);
  if (S.data.主角.灵悟值 < cost) return false;
  const p = t.前置功法;
  if (!p) return true;
  const pr = (techs.value as any)[p];
  if (!pr || !pr.已学习) return false;
  return true;
}
function why(_: string, t: any): string {
  const p = t.前置功法;
  if (p) {
    const pr = (techs.value as any)[p];
    if (!pr || !pr.已学习) return `需先领悟「${p}」`;
  }
  if (S.data.主角.灵悟值 < t.消耗灵悟) return `灵悟不足(需${t.消耗灵悟},现有${S.data.主角.灵悟值})`;
  return '无法学习';
}
function open(n: string, t: any) {
  dn.value = n;
  dd.value = t;
  dv.value = true;
}
function ln(n: string, t: any) {
  if (!ok(n, t)) return;
  const cost = _.clamp(Number(t.消耗灵悟), 1, Infinity);
  S.data.主角.灵悟值 = Math.max(0, S.data.主角.灵悟值 - cost);
  (techs.value as any)[n].已学习 = true;
  dd.value = { ...(techs.value as any)[n] };
}

// 手动生成功法：/功法/ 为空则生成整套基础树，否则为末端已学功法补进阶分支
const checking = ref(false);
async function checkUpdate() {
  if (checking.value) return;
  try {
    checking.value = true;
    // waitGlobalInitialized 仅负责“等到该全局被 initializeGlobal 注册”，其返回值不是接口对象
    // （官方契约：await 后直接以全局变量名访问，参考 Mvu 用法）。
    // 脚本侧用 initializeGlobal('GongfaBranch', { 手动生成 }) 注册，故 await 后直接读 window.GongfaBranch。
    await waitGlobalInitialized('GongfaBranch');
    const G = window.GongfaBranch as { 手动生成: () => Promise<{ 模式: '基础树' | '进阶' | '无需'; 已触发: string[] }> } | undefined;
    if (!G?.手动生成) {
      toastr.warning('功法生成脚本未就绪');
      return;
    }
    await G.手动生成();
    // 脚本内部已经按模式给出了 toastr 提示，此处无需重复
  } catch (e) {
    toastr.error('功法生成失败');
    console.error('[功法树] 手动生成', e);
  } finally {
    checking.value = false;
  }
}
</script>

<style lang="scss" scoped>
.page-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 18px 8px;
  overflow-y: auto;
  gap: 10px;
  font-weight: 300;
}
.top-bar {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.top-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid rgba(38, 38, 38, 0.5);
  background: rgba(0, 0, 0, 0.3);
}
.tc-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  font-size: 0.75rem;
  flex-shrink: 0;
}
.enl .tc-icon {
  background: rgba(207, 200, 184, 0.15);
  color: var(--c-gold);
}
.org .tc-icon {
  background: rgba(168, 51, 51, 0.15);
  color: var(--c-stamp);
}
.rt .tc-icon {
  background: rgba(58, 95, 112, 0.15);
  color: var(--c-mp);
}
.chk {
  cursor: pointer;
  border: 1px solid rgba(207, 200, 184, 0.28);
  transition:
    background 0.2s,
    border-color 0.2s;
}
.chk:hover:not(:disabled) {
  background: rgba(207, 200, 184, 0.1);
  border-color: var(--c-gold);
}
.chk:disabled {
  opacity: 0.5;
  cursor: wait;
}
.chk .tc-icon {
  background: rgba(207, 200, 184, 0.12);
  color: #d4af37;
}
.chk .tc-label,
.chk .tc-value {
  color: #d4af37;
}
.tc-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tc-label {
  font-size: 0.82rem;
  color: var(--c-text-dim);
  letter-spacing: 0.1em;
  font-weight: 300;
}
.tc-value {
  font-size: 1rem;
  font-weight: 400;
  color: var(--c-text);
  font-family: var(--font-serif);
  letter-spacing: 0.04em;
}

.learned-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
  padding: 4px 0;
  border-bottom: 1px solid rgba(38, 38, 38, 0.3);
}
.lr-label {
  font-size: 0.6rem;
  color: var(--c-text-dim);
  letter-spacing: 0.15em;
  font-family: var(--font-serif);
  font-weight: 300;
}
.lr-none {
  font-size: 0.6rem;
  color: var(--c-text-dim);
  font-style: italic;
  font-weight: 300;
}
.lr-tag {
  font-size: 0.58rem;
  color: var(--c-gold);
  border: 1px solid rgba(207, 200, 184, 0.3);
  padding: 1px 7px;
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--font-serif);
  font-weight: 400;
}
.lr-tag:hover {
  background: rgba(207, 200, 184, 0.15);
  border-color: var(--c-gold);
}
.lr-tp {
  font-style: normal;
  margin-left: 3px;
  font-size: 0.5rem;
}

.tree-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tree-canvas {
  flex: 1;
  min-height: 260px;
  border: 1px solid rgba(38, 38, 38, 0.3);
  background:
    radial-gradient(circle at 30% 30%, rgba(90, 138, 159, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 70% 70%, rgba(207, 200, 184, 0.08) 0%, transparent 45%),
    radial-gradient(circle at center, rgba(207, 200, 184, 0.08) 0%, rgba(0, 0, 0, 0.2) 60%), #1a1a1a;
  overflow: hidden;
  position: relative;
  border-radius: var(--radius-sm);
  user-select: none;
  touch-action: none;
  -webkit-user-select: none;
}
.tree-world {
  position: relative;
}
.tw-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.t-node {
  position: absolute;
  width: 72px;
  z-index: 10;
  cursor: pointer;
  transition:
    transform 0.18s var(--ease-out-soft),
    filter 0.18s;
  will-change: transform;
}
.t-node:hover {
  z-index: 20;
  transform: scale(1.1);
  filter: brightness(1.2);
}
.tn-name {
  display: block;
  font-size: 0.6rem;
  text-align: center;
  color: var(--c-text);
  padding: 8px 5px 6px;
  font-family: var(--font-serif);
  letter-spacing: 0.06em;
  line-height: 1.25;
  border: 1px solid rgba(207, 200, 184, 0.32);
  border-radius: var(--radius-sm);
  background:
    linear-gradient(180deg, rgba(22, 20, 25, 0.88) 0%, rgba(14, 12, 16, 0.95) 100%),
    radial-gradient(ellipse at 50% 0%, rgba(207, 200, 184, 0.08) 0%, transparent 70%);
  font-weight: 400;
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(207, 200, 184, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.4);
}
.t-node.can-learn .tn-name {
  border-color: rgba(90, 138, 159, 0.45);
  color: #7ab8c8;
  background:
    linear-gradient(180deg, rgba(14, 20, 24, 0.9) 0%, rgba(10, 14, 16, 0.96) 100%),
    radial-gradient(ellipse at 50% 0%, rgba(90, 138, 159, 0.12) 0%, transparent 60%);
  box-shadow:
    inset 0 1px 0 rgba(90, 138, 159, 0.08),
    0 0 10px rgba(90, 138, 159, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.4);
  animation: nodeBreathe 3s ease-in-out infinite;
}
.t-node.learned .tn-name {
  border-color: rgba(207, 200, 184, 0.55);
  color: var(--c-gold-light);
  background:
    linear-gradient(180deg, rgba(30, 26, 18, 0.9) 0%, rgba(18, 14, 8, 0.96) 100%),
    radial-gradient(ellipse at 50% 0%, rgba(207, 200, 184, 0.14) 0%, transparent 60%);
  box-shadow:
    inset 0 1px 0 rgba(207, 200, 184, 0.12),
    0 0 14px rgba(207, 200, 184, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.5);
}
.t-node.locked .tn-name {
  border-color: rgba(38, 38, 38, 0.2);
  background: rgba(0, 0, 0, 0.25);
  color: var(--c-text-faint);
  box-shadow: none;
}
.t-node.locked {
  opacity: 0.52;
}
.t-node:hover .tn-name {
  border-color: rgba(207, 200, 184, 0.65);
}
.t-node.can-learn:hover .tn-name {
  border-color: rgba(90, 138, 159, 0.7);
  animation: none;
  box-shadow:
    inset 0 1px 0 rgba(90, 138, 159, 0.15),
    0 0 18px rgba(90, 138, 159, 0.16),
    0 3px 10px rgba(0, 0, 0, 0.5);
}
.t-node.learned:hover .tn-name {
  box-shadow:
    inset 0 1px 0 rgba(207, 200, 184, 0.18),
    0 0 20px rgba(207, 200, 184, 0.2),
    0 3px 10px rgba(0, 0, 0, 0.5);
}
.tn-name::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 1px;
  background: rgba(207, 200, 184, 0.18);
  border-radius: 1px;
}
.t-node.learned .tn-name::after {
  background: rgba(207, 200, 184, 0.35);
  width: 20px;
}
.t-node.can-learn .tn-name::after {
  background: rgba(90, 138, 159, 0.25);
}
.t-node.locked .tn-name::after {
  opacity: 0;
}
@keyframes nodeBreathe {
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(90, 138, 159, 0.08),
      0 0 10px rgba(90, 138, 159, 0.06),
      0 2px 6px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      inset 0 1px 0 rgba(90, 138, 159, 0.12),
      0 0 16px rgba(90, 138, 159, 0.12),
      0 2px 6px rgba(0, 0, 0, 0.4);
  }
}
.tn-cost {
  display: block;
  font-size: 0.4rem;
  text-align: center;
  color: var(--c-gold-dim);
  margin-top: 3px;
  font-weight: 300;
  letter-spacing: 0.05em;
}
.t-node.can-learn .tn-cost {
  color: rgba(122, 184, 200, 0.65);
}
.t-node.locked .tn-cost {
  opacity: 0.25;
}
.tn-type {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 0.48rem;
  line-height: 1;
  font-weight: 400;
  z-index: 2;
}
.tp-a {
  color: #c4785e;
}
.tp-p {
  color: #6a9aaa;
}
.tn-lv {
  position: absolute;
  top: 8px;
  right: 4px;
  font-size: 0.34rem;
  color: var(--c-text-dim);
  opacity: 0.6;
  font-weight: 300;
}
.t-node.learned .tn-lv {
  color: var(--c-gold);
  opacity: 0.85;
}
.t-node.can-learn .tn-lv {
  color: rgba(122, 184, 200, 0.55);
}
.tree-hint {
  text-align: center;
  font-size: 0.5rem;
  color: var(--c-text-dim);
  opacity: 0.35;
  padding: 2px 0 0;
  flex-shrink: 0;
  font-weight: 300;
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--c-text-dim);
  font-family: var(--font-serif);
  font-size: 0.85rem;
  font-weight: 300;
}

.dlg-bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.dlg {
  width: 340px;
  background: var(--c-panel);
  border: 1px solid rgba(38, 38, 38, 0.5);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  position: relative;
  animation: mi 0.18s ease;
  font-weight: 300;
}
@keyframes mi {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.dlg-x {
  position: absolute;
  top: 7px;
  right: 9px;
  background: none;
  border: none;
  color: var(--c-text-dim);
  font-size: 1.1rem;
  cursor: pointer;
}
.dlg-x:hover {
  color: var(--c-gold);
}
.dlg-h {
  padding: 11px 14px;
  border-bottom: 1px solid rgba(38, 38, 38, 0.5);
  background: rgba(0, 0, 0, 0.4);
  font-size: 0.9rem;
  font-family: var(--font-serif);
  color: var(--c-text);
  letter-spacing: 0.08em;
  font-weight: 400;
}
.dlg-b {
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dr {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  padding: 2px 0;
  font-weight: 300;
}
.dl {
  color: var(--c-text-dim);
}
.dv2 {
  color: var(--c-text);
  text-align: right;
}
.gd {
  color: var(--c-gold);
}
.dd2 {
  font-size: 0.7rem;
  color: var(--c-text-dim);
  line-height: 1.45;
  padding: 6px 0;
  border-top: 1px solid rgba(38, 38, 38, 0.3);
  font-weight: 300;
}
.bl {
  width: 100%;
  padding: 7px;
  margin-top: 5px;
  border: 1px solid var(--c-gold);
  background: rgba(207, 200, 184, 0.12);
  color: var(--c-gold);
  font-family: var(--font-serif);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  font-weight: 400;
}
.bl:hover {
  background: rgba(207, 200, 184, 0.22);
}
.bx {
  text-align: center;
  padding: 8px;
  color: var(--c-text-dim);
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid rgba(38, 38, 38, 0.3);
  margin-top: 5px;
  font-weight: 300;
}
.by {
  text-align: center;
  padding: 8px;
  color: var(--c-gold);
  font-size: 0.78rem;
  border: 1px solid rgba(207, 200, 184, 0.3);
  margin-top: 5px;
  font-family: var(--font-serif);
  font-weight: 400;
}

/* ===== 手机端适配 ===== */
@media (max-width: 500px) {
  .page-root {
    padding: 8px 10px 6px;
    gap: 8px;
  }
  .top-bar {
    gap: 5px;
  }
  .top-card {
    padding: 5px 6px;
    gap: 5px;
  }
  .tc-icon {
    width: 24px;
    height: 24px;
    font-size: 0.65rem;
  }
  .tc-label {
    font-size: 0.68rem;
  }
  .tc-value {
    font-size: 0.82rem;
  }
  .learned-row {
    gap: 4px;
    padding: 3px 0;
  }
  .lr-label,
  .lr-none {
    font-size: 0.55rem;
  }
  .lr-tag {
    font-size: 0.52rem;
    padding: 1px 5px;
  }
  .tree-canvas {
    min-height: 200px;
    border-radius: var(--radius-xs);
  }
  .t-node {
    width: 68px;
  }
  .tn-name {
    font-size: 0.58rem;
    padding: 7px 4px 5px;
  }
  .tn-cost {
    font-size: 0.38rem;
    margin-top: 2px;
  }
  .tn-type {
    font-size: 0.44rem;
  }
  .tn-lv {
    font-size: 0.32rem;
    top: 7px;
  }
  .tree-hint {
    font-size: 0.45rem;
  }
  .dlg {
    width: auto;
    max-width: 92vw;
    margin: 0 12px;
  }
  .dlg-h {
    font-size: 0.82rem;
    padding: 9px 12px;
  }
  .dlg-b {
    padding: 9px 12px;
  }
  .dr {
    font-size: 0.65rem;
  }
  .dd2 {
    font-size: 0.62rem;
  }
  .bl,
  .by,
  .bx {
    font-size: 0.7rem;
  }
}

/* 触摸设备上禁用 hover 粘滞：通过 @media 精确匹配 */
@media (hover: none) {
  .t-node:hover {
    transform: none;
    filter: none;
  }
  .t-node:active {
    transform: scale(1.06);
    filter: brightness(1.15);
  }
}
</style>
