import { parseCombat } from './parser';
import { renderCombat, COMBAT_CSS } from './render';

const ENHANCED_CLASS = 'combat-enhanced';
const CSS_FLAG_ATTR = 'data-combat-css-injected';
let $injectedStyle: JQuery<HTMLElement> | null = null;

/** 注入增强卡片 CSS 到酒馆父页面 head（只注一次） */
function injectCss(): void {
  if ($(`style[${CSS_FLAG_ATTR}]`).length > 0) return;
  $injectedStyle = $(`<style ${CSS_FLAG_ATTR}="1"></style>`);
  $injectedStyle.text(COMBAT_CSS);
  $('head').append($injectedStyle);
}

/** 扫描所有未增强的 data-combat 容器并替换为增强卡片 */
function enhanceAll(): void {
  const $containers = $(`div[data-combat="1"]:not(.${ENHANCED_CLASS})`);
  if ($containers.length === 0) return;

  let count = 0;
  $containers.each((_, el) => {
    const $el = $(el);
    const raw = $el.html();
    const block = parseCombat(raw);
    if (!block) {
      // 解析失败：保留原兜底内容，仅标记已处理避免重复尝试
      $el.addClass(ENHANCED_CLASS);
      console.warn('[战斗美化] 解析失败，保留兜底显示:', raw.slice(0, 100));
      return;
    }
    $el.html(renderCombat(block));
    $el.addClass(ENHANCED_CLASS);
    count++;
  });
  if (count > 0) console.info(`[战斗美化] 增强 ${count} 个战斗块`);
}

/** 楼层渲染完成后扫描：正则显示替换是异步的，轮询几次确保 data-combat 容器已生成 */
function enhanceAfterRender(): void {
  let tries = 0;
  const tick = () => {
    enhanceAll();
    // 仍未增强的容器可能正则还没替换完，最多轮询 5 次（约 500ms）
    if ($(`div[data-combat="1"]:not(.${ENHANCED_CLASS})`).length > 0 && tries++ < 5) {
      setTimeout(tick, 100);
    }
  };
  tick();
}

$(() => {
  errorCatched(() => {
    injectCss();

    // 初始扫描（已存在的消息）
    enhanceAfterRender();

    // AI 消息渲染完成后扫描（战斗 <combat> 块出现在 AI 回复中）
    eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, () => {
      enhanceAfterRender();
    });

    // 用户消息渲染完成后扫描（以防战斗块出现在用户输入）
    eventOn(tavern_events.USER_MESSAGE_RENDERED, () => {
      enhanceAfterRender();
    });

    // 消息被编辑/更新后重新扫描
    eventOn(tavern_events.MESSAGE_UPDATED, () => {
      enhanceAfterRender();
    });

    console.info('[战斗美化脚本] 已加载');
  })();
});

$(window).on('pagehide', () => {
  if ($injectedStyle) {
    $injectedStyle.remove();
    $injectedStyle = null;
  }
  console.info('[战斗美化脚本] 已卸载');
});
