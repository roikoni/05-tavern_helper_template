// 世界引擎 · 脚本入口
// 独立脚本（后台 iframe 运行）：在酒馆网页放可拖动常驻悬浮球，点击展开中央大弹窗世界引擎页面。
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { reloadOnChatChange } from '@util/script';
import 弹窗srcdoc from '../../util/modal_srcdoc.html';
import 悬浮球样式 from './ui/floating-ball.scss?raw';
import { 主题样式 } from './ui/theme';
import App from './ui/App.vue';
import { useWorldEngineStore } from './store';
import { 推进世界, 通知 } from './推进';
import { 生成摘要, 检查自动推进 } from './摘要';
import { 注册世界书宏 } from './世界书宏';

// 脚本运行在 iframe 中，$ 已指向酒馆网页，但 window/document 仍是脚本 iframe 自身的。
// 拖拽与尺寸需基于酒馆网页：用 window.parent（同源可用）。
const $酒馆doc = $(window.parent.document);
const 酒馆win = window.parent;

// 悬浮球
let $悬浮球: JQuery<HTMLElement> | null = null;
// 弹窗挂载状态
let 弹窗App: ReturnType<typeof createApp> | null = null;
let $弹窗iframe: JQuery<HTMLIFrameElement> | null = null;
let $全局样式节点: JQuery<HTMLElement> | null = null; // 注入到弹窗 iframe head 的全局主题样式
// 世界书宏注册句柄：世界书条目用 {{世界氛围}} {{势力:X}} {{地区:X}} {{人物:X}} 注入主线 prompt
let 宏句柄: { unregister: () => void } | null = null;

// 悬浮球尺寸：窄屏（手机）略小，少占触摸区；桌面端 52px。
const 球尺寸 = () => 视口宽() < 600 ? 44 : 52;
// 接近 int32 上限但留余量，确保悬浮球始终位于酒馆所有 UI 之上
const 球zIndex = 2147483600;
let 球位置 = { x: 0, y: 0 }; // left/top 定位
let 刚拖动 = false; // 抑制拖动结束后的 click

function 视口宽() { return 酒馆win.innerWidth || 1200; }
function 视口高() { return 酒馆win.innerHeight || 800; }

// 拖拽期间注入到酒馆 body 的全局抑制层：禁选区、禁指针事件，杜绝文字选中/元素 hover 带来的卡顿
let $拖拽抑制: JQuery<HTMLElement> | null = null;
function 开启拖拽抑制() {
  if ($拖拽抑制) return;
  $拖拽抑制 = $('<style>')
    .attr('script_id', getScriptId())
    .text(`*{user-select:none!important;-webkit-user-select:none!important;cursor:grabbing!important;}`)
    .appendTo('head');
}
function 关闭拖拽抑制() {
  if ($拖拽抑制) { $拖拽抑制.remove(); $拖拽抑制 = null; }
}

function 创建悬浮球() {
  if ($悬浮球) return;
  // 默认右下角
  const s = 球尺寸();
  球位置.x = 视口宽() - s - 24;
  球位置.y = 视口高() - s - 90;

  const $ball = $('<div>')
    .attr('script_id', getScriptId())
    .addClass('we-floating-ball')
    .html('<i class="fa-solid fa-globe"></i>')
    .css({
      position: 'fixed',
      left: '0',
      top: '0',
      transform: `translate3d(${球位置.x}px, ${球位置.y}px, 0)`,
      width: s + 'px',
      height: s + 'px',
      zIndex: 球zIndex,
      cursor: 'grab',
      userSelect: 'none',
      touchAction: 'none',
      willChange: 'transform',
    });
  $ball.appendTo('body');
  $悬浮球 = $ball;

  // click：若刚拖动过则吞掉，否则开关弹窗
  $ball.on('click', () => {
    if (刚拖动) {
      刚拖动 = false;
      return;
    }
    if (弹窗App) 关闭弹窗();
    else 打开弹窗();
  });

  // 拖拽：Pointer Events 统一鼠标 + 触摸；GPU 加速 + rAF
  $ball.on('pointerdown', (e: JQuery.PointerDownEvent) => {
    if (e.button !== undefined && e.button !== 0) return; // 仅主键/触摸
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = 球位置.x;
    const origY = 球位置.y;
    let 拖动 = false;
    let rafId = 0;
    let 目标X = origX;
    let 目标Y = origY;
    const ballEl = $ball[0] as HTMLElement;
    // 拖拽中暂停脉冲动画，避免与 transform 更新竞争
    ballEl.style.animation = 'none';
    ballEl.style.cursor = 'grabbing';
    try { ballEl.setPointerCapture((e as any).pointerId); } catch { /* 跨 document 捕获可能失败，忽略 */ }
    e.preventDefault();

    const apply = () => {
      球位置.x = 目标X;
      球位置.y = 目标Y;
      ballEl.style.transform = `translate3d(${目标X}px, ${目标Y}px, 0)`;
      rafId = 0;
    };

    const onMove = (ev: JQuery.PointerMoveEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!拖动 && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        拖动 = true;
        开启拖拽抑制();
      }
      if (拖动) {
        目标X = Math.max(0, Math.min(视口宽() - 球尺寸(), origX + dx));
        目标Y = Math.max(0, Math.min(视口高() - 球尺寸(), origY + dy));
        if (!rafId) rafId = requestAnimationFrame(apply);
        ev.preventDefault();
      }
    };
    const onUp = (ev: JQuery.PointerUpEvent) => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      // 强制应用最后一帧目标，避免 rAF 被取消导致球停在倒数第二帧
      apply();
      $酒馆doc.off('pointermove', onMove);
      $酒馆doc.off('pointerup', onUp);
      $酒馆doc.off('pointercancel', onUp);
      关闭拖拽抑制();
      ballEl.style.animation = '';
      ballEl.style.cursor = 'grab';
      if (拖动) 刚拖动 = true; // 抑制随后的 click
      ev.preventDefault();
    };
    $酒馆doc.on('pointermove', onMove);
    $酒馆doc.on('pointerup', onUp);
    $酒馆doc.on('pointercancel', onUp);
  });

  // 视口缩放时把球拉回界内，避免消失在屏幕外
  酒馆win.addEventListener('resize', 视口校正, { passive: true });
}

function 视口校正() {
  if (!$悬浮球) return;
  const s = 球尺寸();
  球位置.x = Math.max(0, Math.min(视口宽() - s, 球位置.x));
  球位置.y = Math.max(0, Math.min(视口高() - s, 球位置.y));
  const el = $悬浮球[0] as HTMLElement;
  el.style.width = s + 'px';
  el.style.height = s + 'px';
  el.style.transform = `translate3d(${球位置.x}px, ${球位置.y}px, 0)`;
}

function 销毁悬浮球() {
  if ($悬浮球) {
    酒馆win.removeEventListener('resize', 视口校正);
    $悬浮球.remove();
    $悬浮球 = null;
  }
}

function 打开弹窗() {
  if (弹窗App) return;

  // 遮罩
  const 移动端 = 视口宽() < 600;
  const $mask = $('<div>')
    .attr('script_id', getScriptId())
    .addClass('we-mask')
    .css({
      position: 'fixed', inset: '0', zIndex: 球zIndex + 1,
      background: 'rgba(0,0,0,0.6)',
      // 移动端：iframe 顶对齐填满可见区，避免 100vh 含地址栏导致底部被裁；
      // 桌面端：居中放置固定尺寸弹窗。
      display: 'flex',
      alignItems: 移动端 ? 'flex-start' : 'center',
      justifyContent: 'center',
    });
  $mask.on('click', (e: JQuery.ClickEvent) => {
    if (e.target === $mask[0]) 关闭弹窗();
  });

  // 弹窗 iframe（中央大弹窗）
  // 不使用 createScriptIdIframe：其 srcdoc 含 adjust_iframe_height.js，会把 iframe 高度
  // 改写为 body.scrollHeight，与本弹窗「固定 640px + 内部滚动」的布局形成循环依赖，导致页面塌缩。
  const $iframe = $('<iframe>')
    .attr({
      script_id: getScriptId(),
      frameborder: 0,
      srcdoc: 弹窗srcdoc,
    }) as JQuery<HTMLIFrameElement>;
  $iframe.css({
    width: '900px',
    height: '640px',
    maxWidth: '94vw',
    maxHeight: '90vh',
    border: '1px solid rgba(168, 128, 74, 0.5)',
    borderRadius: '12px',
    boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(184, 69, 61, 0.18)',
    background: '#1a1512',
  });
  // 窄屏（手机）下接近全屏，去掉圆角与边距以最大化可用空间。
  // 用 100dvh 替代 100vh：iOS Safari 的 100vh 含地址栏区域，会高出可见区导致内容顶到屏外、底部被裁。
  if (移动端) {
    $iframe.css({
      width: '100%',
      height: '100dvh',
      maxWidth: '100%',
      maxHeight: '100dvh',
      border: 'none',
      borderRadius: '0',
      boxShadow: 'none',
    });
  }
  $弹窗iframe = $iframe;
  $mask.append($iframe);
  // 先挂 load 监听再连入文档，避免 srcdoc 解析过快导致 load 在监听前触发（重开后白屏）
  $iframe.on('load', on弹窗加载);
  $mask.appendTo('body');
}

function on弹窗加载() {
  const $iframe = $弹窗iframe;
  if (!$iframe) return; // 已被关闭
  const doc = $iframe[0].contentDocument;
  if (!doc || !doc.head || !doc.body) {
    console.warn('[世界引擎] 弹窗 iframe 文档未就绪，跳过挂载');
    return;
  }
  if (弹窗App) 弹窗App.unmount(); // 容错：避免重复挂载
  try {
    // 主题样式（:root 变量）优先注入，确保组件 var(--c-*) 有定义
    $全局样式节点 = $('<style>').text(主题样式).prependTo(doc.head);
    // 将脚本 iframe 中已注入的组件样式复制到弹窗 iframe（style-loader 注入在脚本 document 中）
    document.head.querySelectorAll('style').forEach(s => {
      doc.head.appendChild(s.cloneNode(true));
    });
    const app = createApp(App, { onClose: () => 关闭弹窗() }).use(createPinia());
    app.mount(doc.body);
    弹窗App = app;
  } catch (e) {
    console.error('[世界引擎] 弹窗挂载失败', e);
    通知('世界引擎面板加载失败，请重试', 'error');
  }
}

function 关闭弹窗() {
  if (弹窗App) {
    弹窗App.unmount();
    弹窗App = null;
  }
  if ($全局样式节点) {
    $全局样式节点.remove();
    $全局样式节点 = null;
  }
  if ($弹窗iframe) {
    $弹窗iframe.parent('.we-mask').remove(); // 连遮罩一起移除
    $弹窗iframe = null;
  }
}

$(() => {
  console.info('[世界引擎] 脚本加载');

  // 传送悬浮球样式到酒馆网页 head
  const $styleWrap = $('<div>').attr('script_id', getScriptId()).appendTo('head');
  $('<style>').text(悬浮球样式).appendTo($styleWrap);

  创建悬浮球();

  // 注册世界书宏：{{世界氛围}}（常驻一句话）+ {{势力:X}} {{地区:X}} {{人物:X}}（绿灯按名触发切片）。
  // 世界书条目用这些宏即可让主线 AI 感知世界演变，无需依赖 getvar 嵌套路径解析。
  宏句柄 = 注册世界书宏();

  // 监听主线消息：触发摘要 + 自动推进检查
  eventOn(tavern_events.MESSAGE_RECEIVED, async () => {
    try {
      const store = useWorldEngineStore();
      store.refresh();
      const engine = store.data;
      await 生成摘要(engine);
      if (await 检查自动推进(engine)) {
        await 推进世界(true);
      }
    } catch (e) {
      console.error('[世界引擎] 消息事件处理失败', e);
    }
  });

  reloadOnChatChange();

  $(window).on('pagehide', () => {
    关闭弹窗();
    销毁悬浮球();
    关闭拖拽抑制();
    if (宏句柄) { 宏句柄.unregister(); 宏句柄 = null; }
    $styleWrap.remove();
  });
});
