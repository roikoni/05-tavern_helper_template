// 世界引擎 · 全局主题样式（纯 CSS 字符串，注入弹窗 iframe head）
// 「墨卷山河」— 古风黑暗：极墨深底、宣纸暖白、朱砂血色、古铜金线

export const 主题样式 = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap');

:root {
  font-size: 17px;

  /* ═══ 墨阶 ═══ */
  --c-bg: #07090a;            /* 极墨底 */
  --c-bg-deep: #040506;       /* 更深 */
  --c-panel: #0f1214;         /* 面板底 */
  --c-panel-raised: #161a1e;  /* 抬升面板 */
  --c-panel-hover: #1e2328;   /* 悬停 */

  /* ═══ 宣纸文字 ═══ */
  --c-text: #ede8dd;          /* 主文字：明亮暖白 */
  --c-text-dim: #b5ad9e;      /* 次要：中灰 */
  --c-text-mid: #9a9386;      /* 中间态 */
  --c-text-faint: #6a645a;    /* 弱化但仍可读 */
  --c-text-ghost: #4a4640;    /* 装饰性 */

  /* ═══ 朱砂血色 ═══ */
  --c-accent: #d45650;
  --c-accent-bright: #e8706a;
  --c-accent-glow: rgba(212, 86, 80, 0.45);
  --c-accent-dim: rgba(212, 86, 80, 0.15);

  /* ═══ 古铜金 ═══ */
  --c-bronze: #c9a05c;
  --c-bronze-light: #ddb876;
  --c-bronze-dim: rgba(201, 160, 92, 0.22);

  /* ═══ 朱砂印 ═══ */
  --c-stamp: #9a2828;
  --c-stamp-bright: #c43a3a;

  /* ═══ 边框 ═══ */
  --c-border: rgba(201, 160, 92, 0.12);
  --c-border-mid: rgba(201, 160, 92, 0.22);
  --c-border-strong: rgba(201, 160, 92, 0.38);
  --c-border-blood: rgba(212, 86, 80, 0.42);
  --c-hairline: rgba(237, 232, 221, 0.03);

  /* ═══ 势力四色 ═══ */
  --c-faction-正道: #5a9a72;
  --c-faction-魔道: #d45650;
  --c-faction-古神: #9a6aba;
  --c-faction-其他: #c9a05c;

  --font-serif: 'KaiTi', 'Noto Serif SC', serif;
  --font-ui: 'Noto Serif SC', ui-serif, 'STSong', SimSun, serif;
  --font-brush: 'Ma Shan Zheng', 'KaiTi', serif;

  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-pill: 999px;

  --ease-out-soft: cubic-bezier(.22,.61,.36,1);
}

/* 确保 iframe 内部视口链正确，使 .we-root 的 height:100% 生效 */
html, body { height: 100%; }
html { scroll-behavior: smooth; }

.we-root, .we-root * { box-sizing: border-box; }

/* 全局顺滑：交互元素统一缓动曲线与时长 */
.we-root button,
.we-root input,
.we-root select,
.we-root .we-card,
.we-root [class*="card"],
.we-root [class*="btn"] {
  transition-timing-function: var(--ease-out-soft);
}

/* ═══ 墨卷底 ═══
   深墨 + 微噪纹理 + 顶部淡金晕染 + 四边暗角 */
.we-root {
  background:
    /* 顶部暖光晕染 */
    radial-gradient(ellipse 90% 50% at 50% 0%, rgba(201, 160, 92, 0.04) 0%, transparent 55%),
    /* 右下角淡红晕染 */
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(212, 86, 80, 0.03) 0%, transparent 50%),
    /* 全局暗角 */
    radial-gradient(ellipse 140% 140% at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%),
    /* 主渐变 */
    linear-gradient(175deg, #0d1012 0%, var(--c-bg) 40%, var(--c-bg-deep) 100%);
  color: var(--c-text);
  position: relative;
}

/* 噪点纹理 */
.we-root::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.025;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
  z-index: 0;
}

/* ═══ 滚动条 ═══ */
.we-root ::-webkit-scrollbar { width: 5px; height: 5px; }
.we-root ::-webkit-scrollbar-track { background: transparent; }
.we-root ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--c-bronze-dim), rgba(201,160,92,0.4));
  border-radius: var(--radius-pill);
}
.we-root ::-webkit-scrollbar-thumb:hover { background: var(--c-accent); }

/* ═══ 通用卡片基础 ═══ */
.we-card {
  background: linear-gradient(165deg, var(--c-panel-raised) 0%, var(--c-panel) 100%);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.we-card:hover {
  border-color: var(--c-border-mid);
  box-shadow: 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(201,160,92,0.04);
}

/* ═══ 古风分割线 ═══ */
.we-divider {
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--c-border-mid) 15%,
    var(--c-border-strong) 50%,
    var(--c-border-mid) 85%,
    transparent 100%
  );
}

/* ═══ 角花装饰 ═══ */
.we-corner {
  position: relative;
}
.we-corner::before,
.we-corner::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: var(--c-border-strong);
  border-style: solid;
  pointer-events: none;
}
.we-corner::before {
  top: -1px; left: -1px;
  border-width: 1px 0 0 1px;
}
.we-corner::after {
  bottom: -1px; right: -1px;
  border-width: 0 1px 1px 0;
}

/* ═══ 窄屏自适应（手机）═══ */
/* 弹窗 iframe 在窄屏下接近全屏，内部整体收窄留白、压小字号，并让所有双列网格降为单列 */
@media (max-width: 599px) {
  :root { font-size: 15px; }
  .we-header { padding: 10px 12px !important; }
  .we-title-main { font-size: 1.05rem; letter-spacing: 0.18em; }
  .we-title-sub { display: none; }
  .we-header-actions { gap: 6px; }
  .we-btn-primary { padding: 7px 12px !important; font-size: 0.82rem !important; }
  .we-btn-icon { width: 30px !important; height: 30px !important; }
  .we-tabs { padding: 0 6px !important; }
  .we-tab-btn { padding: 9px 10px !important; font-size: 0.82rem !important; gap: 4px !important; }
  .we-content { padding: 12px !important; }

  /* 饼图区：纵向堆叠 */
  .pie-wrap { flex-direction: column !important; gap: 14px !important; padding: 14px !important; align-items: stretch !important; }
  .pie { width: 150px !important; height: 150px !important; align-self: center; }

  /* 所有双列卡片网格 → 单列 */
  .faction-group .faction-cards,
  .we-page { grid-template-columns: 1fr !important; }

  .set-section { padding: 14px 14px; }
  .api-mode-switch { grid-template-columns: 1fr !important; }

  /* 时间线：窄屏改为单侧排列，避免卡片过窄 */
  .tl-entry.left, .tl-entry.right { padding-left: 0 !important; padding-right: 0 !important; padding-left: 26px !important; }
  .timeline-line { left: 8px !important; transform: none !important; }
  .tl-node { left: 8px !important; }
}
`;
