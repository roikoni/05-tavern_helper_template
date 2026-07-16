<template>
  <header class="top-bar">
    <div class="world-info">
      <div class="time-display">
        <i class="fas fa-hourglass-half icon"></i>
        <span class="label">时序</span>
        <span class="value">{{ worldTime }}</span>
      </div>
      <div class="location-display">
        <i class="fas fa-map-marker-alt icon"></i>
        <span class="label">方位</span>
        <span class="value">{{ worldLocation }}</span>
      </div>
    </div>

    <div class="morality-section">
      <div class="morality-header">
        <span class="morality-label">善恶</span>
        <span class="morality-value" :class="valueClass">{{ moralityDisplay }}</span>
      </div>
      <div class="morality-meter">
        <div class="meter-track">
          <div class="meter-fill" :class="fillClass" :style="fillStyle"></div>
          <div class="meter-marker" :style="markerStyle"></div>
          <span class="meter-balance" :class="moralityClass">⚖</span>
          <div class="meter-marks">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="meter-labels">
          <span class="lbl evil">恶</span>
          <span class="lbl good">善</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  worldTime: string;
  worldLocation: string;
  moralityValue: number;
}>();

const moralityCategories = [
  { max: -50, label: '极恶', class: 'extreme-evil' },
  { max: -10, label: '偏恶', class: 'evil' },
  { max: 10, label: '中立', class: 'neutral' },
  { max: 50, label: '偏善', class: 'good' },
  { max: 100, label: '极善', class: 'extreme-good' },
];

const moralityInfo = computed(() => {
  const v = props.moralityValue;
  return moralityCategories.find(c => v <= c.max) ?? moralityCategories[4];
});

const moralityCategory = computed(() => moralityInfo.value.label);
const moralityClass = computed(() => moralityInfo.value.class);

// 数值显示：善正恶负
const moralityDisplay = computed(() => {
  const v = props.moralityValue;
  return v > 0 ? `+${v}` : `${v}`;
});

// 数值配色：随正负切换，便于察觉小幅变动
const valueClass = computed(() => {
  const v = props.moralityValue;
  if (v > 0) return 'val-good';
  if (v < 0) return 'val-evil';
  return 'val-neutral';
});

// 双向条：以中心(50%)为原点，标注指针位置
const markerStyle = computed(() => {
  const v = _.clamp(props.moralityValue, -100, 100);
  const pct = ((v + 100) / 200) * 100;
  return { left: `${pct}%` };
});

// 填充类：善绿恶红
const fillClass = computed(() => (props.moralityValue >= 0 ? 'fill-good' : 'fill-evil'));

// 填充：正向(善)从中心向右，负向(恶)从中心向左
const fillStyle = computed(() => {
  const v = _.clamp(props.moralityValue, -100, 100);
  if (v >= 0) {
    const w = (v / 100) * 50;
    return { left: '50%', width: `${w}%` };
  }
  const w = (-v / 100) * 50;
  return { right: '50%', width: `${w}%` };
});
</script>

<style lang="scss" scoped>
@use '../styles/_glass.scss' as glass;

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  @include glass.glass-card;
  position: relative;

  /* 底部细边线 -- 银白层次分隔 */
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(160, 170, 190, 0.15),
      rgba(180, 190, 210, 0.22),
      rgba(160, 170, 190, 0.15),
      transparent
    );
    opacity: 0.5;
  }
}

.world-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.time-display,
.location-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  min-width: 0;

  .icon {
    color: var(--accent-gold);
    font-size: 10px;
    width: 14px;
    text-align: center;
    flex-shrink: 0;
  }

  .label {
    color: var(--text-muted);
    font-size: 10px;
    font-family: var(--font-title);
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  .value {
    color: var(--text-primary);
    font-family: var(--font-title);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* ========== 善恶值 · 天平量表 ========== */
.morality-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 200px;
  flex-shrink: 0;
}

/* 善恶数值表头 -- 显示具体数值，正负变色 */
.morality-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 190px;
  margin-bottom: -2px;

  .morality-label {
    font-family: var(--font-title);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--text-muted);
  }

  .morality-value {
    font-family: var(--font-title);
    font-size: 15px;
    font-weight: bold;
    letter-spacing: 1px;
    transition: color 0.5s ease;

    &.val-good {
      color: var(--morality-good);
      text-shadow: 0 0 6px rgba(74, 154, 106, 0.5);
    }
    &.val-evil {
      color: var(--morality-evil);
      text-shadow: 0 0 6px rgba(196, 74, 74, 0.5);
    }
    &.val-neutral {
      color: var(--accent-gold);
    }
  }
}

.morality-meter {
  width: 190px;
}

.meter-track {
  position: relative;
  height: 10px;
  /* 底色：左红右绿的淡渐变，随时提示善恶方位 */
  background: linear-gradient(
    90deg,
    rgba(196, 74, 74, 0.16) 0%,
    rgba(106, 117, 128, 0.06) 50%,
    rgba(74, 154, 106, 0.16) 100%
  );
  border: 1px solid var(--glass-highlight);
  border-radius: 6px;
  overflow: visible;
  box-shadow: var(--inner-shadow), inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.meter-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 4px;
  transition: width 0.5s ease, left 0.5s ease, right 0.5s ease;

  /* 善：从中心向右的实心绿条，中心端最实 */
  &.fill-good {
    background: linear-gradient(90deg, var(--morality-good), rgba(74, 154, 106, 0.35));
    box-shadow: 0 0 10px rgba(74, 154, 106, 0.7);
  }
  /* 恶：从中心向左的实心红条，中心端最实 */
  &.fill-evil {
    background: linear-gradient(90deg, rgba(196, 74, 74, 0.35), var(--morality-evil));
    box-shadow: 0 0 10px rgba(196, 74, 74, 0.7);
  }
}

.meter-marker {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 3px;
  background: var(--text-primary);
  border-radius: 2px;
  transform: translateX(-50%);
  box-shadow: 0 0 6px var(--text-primary);
  transition: left 0.5s ease;
}

/* 天平徽记 -- 单枚，居中嵌于进度条，随善恶值变色 */
.meter-balance {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  color: var(--accent-gold);
  text-shadow: 0 0 6px rgba(138, 146, 160, 0.6);
  background: radial-gradient(circle, rgba(18, 20, 26, 0.95) 55%, transparent 75%);
  border-radius: 50%;
  z-index: 3;
  transition: color 0.5s ease, text-shadow 0.5s ease;

  &.extreme-evil {
    color: var(--morality-evil);
    text-shadow: 0 0 6px rgba(196, 74, 74, 0.65);
  }
  &.evil {
    color: var(--morality-evil);
    opacity: 0.85;
  }
  &.neutral {
    color: var(--accent-gold);
  }
  &.good {
    color: var(--morality-good);
    opacity: 0.85;
  }
  &.extreme-good {
    color: var(--morality-good);
    text-shadow: 0 0 6px rgba(74, 154, 106, 0.65);
  }
}

.meter-marks {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  pointer-events: none;

  span {
    width: 1px;
    height: 4px;
    background: var(--text-muted);
    opacity: 0.4;
  }
}

.meter-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;

  .lbl {
    font-family: var(--font-title);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--text-muted);

    &.evil { color: var(--morality-evil); }
    &.good { color: var(--morality-good); }
  }
}

@media (max-width: 480px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .morality-section {
    align-items: stretch;
    min-width: 0;
  }

  .morality-header {
    width: 100%;
  }

  .morality-meter {
    width: 100%;
  }
}
</style>
