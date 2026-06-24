<template>
  <div class="we-page">
    <!-- 饼图 -->
    <div class="pie-wrap">
      <svg class="pie" viewBox="0 0 200 200">
        <defs>
          <!-- 金属径向渐变：左上亮高光 → 中部主色 → 右下暗阴影，模拟凸起金属 -->
          <radialGradient id="grad-zheng" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stop-color="#c8f4d4"/>
            <stop offset="30%" stop-color="#7ec095"/>
            <stop offset="65%" stop-color="#4d8563"/>
            <stop offset="100%" stop-color="#21402f"/>
          </radialGradient>
          <radialGradient id="grad-mo" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stop-color="#ffc4be"/>
            <stop offset="30%" stop-color="#e8706a"/>
            <stop offset="65%" stop-color="#b8443f"/>
            <stop offset="100%" stop-color="#5a1f1c"/>
          </radialGradient>
          <radialGradient id="grad-gu" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stop-color="#e3c4f5"/>
            <stop offset="30%" stop-color="#aa7cc6"/>
            <stop offset="65%" stop-color="#7d509c"/>
            <stop offset="100%" stop-color="#42285e"/>
          </radialGradient>
          <radialGradient id="grad-qi" cx="32%" cy="28%" r="85%">
            <stop offset="0%" stop-color="#fbe6b8"/>
            <stop offset="30%" stop-color="#d8b26a"/>
            <stop offset="65%" stop-color="#a87f3f"/>
            <stop offset="100%" stop-color="#624423"/>
          </radialGradient>

          <!-- 顶部高光：模拟金属反光的细亮带，叠在每个切片上 -->
          <linearGradient id="metal-highlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
            <stop offset="35%" stop-color="rgba(255,255,255,0.12)"/>
            <stop offset="60%" stop-color="rgba(255,255,255,0)"/>
            <stop offset="88%" stop-color="rgba(0,0,0,0.18)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.42)"/>
          </linearGradient>

          <radialGradient id="pie-vignette" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0.35)"/>
          </radialGradient>
          <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="3" result="off"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- 投影底盘 -->
        <circle r="86" cx="100" cy="103" fill="rgba(0,0,0,0.45)" filter="url(#pie-shadow)"/>

        <!-- 外金边光晕 + 实线 -->
        <circle r="86" cx="100" cy="100" fill="none" stroke="var(--c-bronze)" stroke-width="5" opacity="0.22"/>
        <circle r="86" cx="100" cy="100" fill="none" stroke="var(--c-bronze-light)" stroke-width="1.6" filter="url(#gold-glow)"/>

        <!-- 切片主体 -->
        <g filter="url(#pie-shadow)">
          <circle v-for="(s, i) in slices" :key="i"
            :r="radius" cx="100" cy="100"
            fill="none"
            :stroke="s.color"
            :stroke-width="strokeWidth"
            :stroke-dasharray="s.dash"
            :stroke-dashoffset="s.offset"
            transform="rotate(-90 100 100)"
          />
        </g>
        <!-- 金属反光叠加：同一环宽度的渐变高光，叠在切片之上 -->
        <circle :r="radius" cx="100" cy="100" fill="none"
          stroke="url(#metal-highlight)" :stroke-width="strokeWidth"
          transform="rotate(-90 100 100)" pointer-events="none" />
        <!-- 暗角增强立体感 -->
        <circle r="84" cx="100" cy="100" fill="url(#pie-vignette)" pointer-events="none"/>

        <!-- 内金边 + 中心底盘 -->
        <circle r="44" cx="100" cy="100" fill="none" stroke="var(--c-bronze)" stroke-width="4" opacity="0.22"/>
        <circle r="42" cx="100" cy="100" fill="var(--c-bg-deep)" stroke="var(--c-bronze-light)" stroke-width="1.4" filter="url(#gold-glow)"/>

        <!-- 太极图案 -->
        <g class="taiji">
          <circle r="28" cx="100" cy="100" fill="var(--c-text)"/>
          <path d="M 100,72 a 28,28 0 1,1 0,56 a 14,14 0 1,0 0,-28 a 14,14 0 1,1 0,-28 z" fill="var(--c-bg-deep)"/>
          <circle r="5" cx="100" cy="86" fill="var(--c-text)"/>
          <circle r="5" cx="100" cy="114" fill="var(--c-bg-deep)"/>
        </g>
      </svg>
      <div class="legend">
        <div v-for="g in groupsWith占比" :key="g.分类" class="legend-item" :style="{ color: g.color }">
          <span class="legend-dot" :style="{ background: g.gradient }"></span>
          <span class="legend-name">{{ g.分类 }}</span>
          <span class="legend-bar-wrap">
            <span class="legend-bar" :style="{ width: g.占比 + '%', background: g.gradient }"></span>
          </span>
          <span class="legend-val">{{ g.占比 }}%</span>
        </div>
      </div>
    </div>

    <!-- 分组势力列表 -->
    <div v-for="g in groupsWith占比" :key="g.分类" class="faction-group">
      <div class="group-header">
        <div class="group-title-wrap">
          <span class="group-dot" :style="{ background: g.gradient, color: g.color }"></span>
          <span class="group-title">{{ g.分类 }}</span>
        </div>
        <span class="group-count">{{ g.势力.length }} 势力</span>
      </div>
      <div class="faction-cards">
      <div class="faction-card" v-for="f in g.势力" :key="f.name">
        <div class="fc-head">
          <span class="fc-name">{{ f.name }}</span>
          <span class="fc-态势">{{ f.态势 }}</span>
        </div>
        <div class="fc-bars">
          <div class="fc-bar-row">
            <span class="fc-bar-label">影响</span>
            <div class="fc-bar"><div class="fc-fill 影响" :style="{ width: f.影响范围 + '%' }"></div></div>
            <span class="fc-bar-val">{{ f.影响范围 }}</span>
          </div>
          <div class="fc-bar-row">
            <span class="fc-bar-label">实力</span>
            <div class="fc-bar"><div class="fc-fill 实力" :style="{ width: f.实力 + '%' }"></div></div>
            <span class="fc-bar-val">{{ f.实力 }}</span>
          </div>
        </div>
        <p v-if="f.内部动向" class="fc-dyn">{{ f.内部动向 }}</p>
        <div class="fc-foot">
          <span><i class="fa-solid fa-handshake"></i> {{ f.与主角关系 }}</span>
          <span v-if="f.描述" class="fc-desc">{{ f.描述 }}</span>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWorldEngineStore } from '../store';

const store = useWorldEngineStore();
const 势力 = computed(() => store.data.世界状态.势力 || {});

const 分类色: Record<string, string> = {
  正道: 'var(--c-faction-正道)',
  魔道: 'var(--c-faction-魔道)',
  古神: 'var(--c-faction-古神)',
  其他: 'var(--c-faction-其他)',
};

// 饼图切片用金属质感渐变（与扁平分类色区分）
const 分类渐变: Record<string, string> = {
  正道: 'url(#grad-zheng)',
  魔道: 'url(#grad-mo)',
  古神: 'url(#grad-gu)',
  其他: 'url(#grad-qi)',
};

// 图例/分组圆点用 CSS 渐变（横向高光→主色，确保细条上整段可见）
const 分类渐变css: Record<string, string> = {
  正道: 'linear-gradient(90deg, #b6f0c6 0%, #5a9a72 100%)',
  魔道: 'linear-gradient(90deg, #ffb0aa 0%, #d45650 100%)',
  古神: 'linear-gradient(90deg, #d9b6f0 0%, #9a6aba 100%)',
  其他: 'linear-gradient(90deg, #f5dca6 0%, #c9a05c 100%)',
};

const groups = computed(() => {
  const entries = _(势力.value).entries().map(([name, v]) => ({ name, ...v })).value();
  const byCat = _.groupBy(entries, '分类');
  return ['正道', '魔道', '古神', '其他']
    .map(分类 => {
      const list = byCat[分类] || [];
      const sum = list.reduce((a, f) => a + (f.影响范围 || 0), 0);
      return { 分类, color: 分类色[分类], gradient: 分类渐变css[分类], 势力: list, 影响和: sum };
    });
});

const 总范围 = computed(() => groups.value.reduce((a, g) => a + g.影响和, 0) || 1);

// 饼图切片
const radius = 60;
const strokeWidth = 48;
const circumference = 2 * Math.PI * radius;

const slices = computed(() => {
  const total = 总范围.value;
  let acc = 0;
  return groups.value.map(g => {
    const frac = g.影响和 / total;
    const len = frac * circumference;
    const slice = {
      color: 分类渐变[g.分类],
      dash: `${len} ${circumference - len}`,
      offset: -acc,
    };
    acc += len;
    return slice;
  });
});

// 占比百分比
const 占比map = computed(() => {
  const total = 总范围.value;
  const m: Record<string, number> = {};
  for (const g of groups.value) m[g.分类] = total > 0 ? Math.round((g.影响和 / total) * 100) : 0;
  return m;
});

// 给 groups 补 占比 字段，模板里饼图图例与分组列表都用此
const groupsWith占比 = computed(() =>
  groups.value.map(g => ({ ...g, 占比: 占比map.value[g.分类] || 0 }))
);
</script>

<style lang="scss" scoped>
.we-page { display: flex; flex-direction: column; gap: 18px; }

/* ═══ 饼图区 ═══ */
.pie-wrap {
  display: flex; align-items: center; gap: 24px;
  padding: 20px 24px;
  background: linear-gradient(160deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.03);
}
.pie { width: 160px; height: 160px; flex-shrink: 0; filter: drop-shadow(0 4px 14px rgba(0,0,0,0.5)); }

/* 太极缓慢旋转 */
.taiji {
  transform-box: fill-box;
  transform-origin: center;
  animation: taiji-spin 24s linear infinite;
}
@keyframes taiji-spin { to { transform: rotate(360deg); } }

.legend { display: flex; flex-direction: column; gap: 12px; flex: 1; }
.legend-item { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; }
.legend-dot { width: 11px; height: 11px; border-radius: 2px; box-shadow: 0 0 8px currentColor; flex-shrink: 0; }
.legend-name { color: var(--c-text); width: 44px; flex-shrink: 0; font-size: 0.86rem; }
.legend-bar-wrap {
  flex: 1; height: 7px;
  background: rgba(0,0,0,0.45);
  border: 1px solid var(--c-hairline);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.legend-bar {
  display: block;
  height: 100%;
  border-radius: var(--radius-pill);
  box-shadow: 0 0 6px currentColor;
  transition: width 0.7s var(--ease-out-soft);
}
.legend-val { color: var(--c-bronze-light); font-family: var(--font-ui); font-weight: 500; font-size: 0.82rem; width: 42px; text-align: right; flex-shrink: 0; }

/* ═══ 势力分组 ═══ */
.faction-group { display: flex; flex-direction: column; gap: 10px; }
.group-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 4px 8px;
  border-bottom: 1px solid var(--c-border);
}
.group-title-wrap { display: flex; align-items: center; gap: 10px; }
.group-dot { width: 11px; height: 11px; border-radius: 50%; box-shadow: 0 0 8px currentColor; flex-shrink: 0; }
.group-title { font-family: var(--font-brush); font-size: 1.08rem; letter-spacing: 0.2em; color: var(--c-text); }
.group-count { font-size: 0.7rem; color: var(--c-text-faint); letter-spacing: 0.08em; }

.faction-group .faction-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.faction-card {
  padding: 14px 16px;
  background: linear-gradient(165deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  display: flex; flex-direction: column; gap: 9px;
  transition: border-color 0.35s var(--ease-out-soft), box-shadow 0.35s var(--ease-out-soft), transform 0.3s var(--ease-out-soft);
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.02);
  &:hover {
    border-color: var(--c-border-mid);
    box-shadow: 0 4px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(201,160,92,0.04);
    transform: translateY(-2px);
  }
}
.fc-head { display: flex; justify-content: space-between; align-items: center; }
.fc-name { font-size: 1rem; color: var(--c-text); font-weight: 500; letter-spacing: 0.06em; }
.fc-态势 { font-size: 0.74rem; color: var(--c-accent-bright); letter-spacing: 0.1em; }
.fc-bars { display: flex; flex-direction: column; gap: 6px; }
.fc-bar-row { display: flex; align-items: center; gap: 10px; }
.fc-bar-label { font-size: 0.72rem; color: var(--c-text-faint); width: 32px; letter-spacing: 0.05em; }
.fc-bar { flex: 1; height: 6px; background: rgba(0,0,0,0.4); border-radius: var(--radius-pill); overflow: hidden; }
.fc-fill { height: 100%; border-radius: var(--radius-pill); transition: width 0.6s var(--ease-out-soft); }
.fc-fill.影响 { background: linear-gradient(90deg, var(--c-bronze-dim), var(--c-bronze-light)); }
.fc-fill.实力 { background: linear-gradient(90deg, var(--c-accent-dim), var(--c-accent-bright)); }
.fc-bar-val { font-size: 0.72rem; color: var(--c-text-dim); width: 26px; text-align: right; }
.fc-dyn { font-size: 0.82rem; color: var(--c-text-mid); line-height: 1.65; margin: 0; letter-spacing: 0.02em; }
.fc-foot {
  display: flex; justify-content: space-between; gap: 8px;
  font-size: 0.72rem; color: var(--c-text-faint);
  padding-top: 6px;
  border-top: 1px solid var(--c-hairline);
  i { margin-right: 4px; color: var(--c-bronze); }
}
.fc-desc { color: var(--c-text-ghost); }
</style>
