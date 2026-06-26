import { parseCombat } from './parser';
import { renderCombat, COMBAT_CSS } from './render';

const ENHANCED_CLASS = 'combat-enhanced';
const CSS_FLAG_ATTR = 'data-combat-css-injected';

/** 注入增强卡片 CSS 到酒馆父页面 head（只注一次） */
function injectCss(): void {
  if ($(`style[${CSS_FLAG_ATTR}]`).length > 0) return;
  const $style = $(`<style ${CSS_FLAG_ATTR}="1"></style>`);
  $style.text(COMBAT_CSS);
  $('head').append($style);
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

$(() => {
  errorCatched(() => {
    injectCss();

    // 初始扫描（已存在的消息）
    enhanceAll();

    // 新消息到达后扫描
    eventOn(tavern_events.MESSAGE_RECEIVED, () => {
      // 延迟一帧，确保正则显示替换已完成
      requestAnimationFrame(() => enhanceAll());
    });

    // 重新生成消息后扫描
    eventOn(tavern_events.GENERATION_AFTER_COMMANDS, () => {
      requestAnimationFrame(() => enhanceAll());
    });

    console.info('[战斗美化脚本] 已加载');
  })();
});

$(window).on('pagehide', () => {
  console.info('[战斗美化脚本] 已卸载');
});
