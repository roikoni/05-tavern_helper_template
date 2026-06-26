import type { CombatBlock } from './parser';
import { 取流派主题 } from './流派主题';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** 根据检定结果返回额外动画 class */
function resultClass(result?: string): string {
  switch (result) {
    case '暴击':
      return 'combat-crit';
    case '大失败':
      return 'combat-fumble';
    case '落空':
      return 'combat-miss';
    default:
      return '';
  }
}

export function renderCombat(block: CombatBlock): string {
  const 主题 = 取流派主题(block.schoolName);
  const rCls = resultClass(block.result);

  const parts: string[] = [];
  parts.push(`<div class="combat-card ${rCls}" style="--cm:${主题.主色};--cs:${主题.辅色};--cb:${主题.边框};--cg:${主题.光晕}">`);

  // 标题行
  parts.push(`<div class="combat-head"><span class="combat-icon">⚔️</span><span class="combat-turn">${escapeHtml(block.turn)}</span></div>`);

  // 流派状态
  if (block.school) {
    parts.push(`<div class="combat-school"><span class="combat-badge">${escapeHtml(主题.标签)}</span><span class="combat-school-text">${escapeHtml(block.school)}</span></div>`);
  }

  // 行动
  parts.push(`<div class="combat-row"><span class="combat-label">行动</span><span class="combat-text">${escapeHtml(block.action)}</span></div>`);

  // 应对
  if (block.response) {
    parts.push(`<div class="combat-row combat-dim"><span class="combat-label">应对</span><span class="combat-text">${escapeHtml(block.response)}</span></div>`);
  }

  // 检定
  parts.push(`<div class="combat-roll-box"><div class="combat-roll-label">🎲 检定</div><div class="combat-roll">${escapeHtml(block.roll)}</div></div>`);

  // 伤害
  if (block.damage) {
    parts.push(`<div class="combat-damage-box"><span class="combat-damage-label">伤害</span><span class="combat-damage-text">${escapeHtml(block.damage)}</span></div>`);
  }

  // 状态
  parts.push(`<div class="combat-status-box"><div class="combat-status-label">状态变化</div><pre class="combat-status">${escapeHtml(block.status)}</pre></div>`);

  parts.push('</div>');
  return parts.join('');
}

/** 增强卡片的 CSS（注入一次到父页面 head） */
export const COMBAT_CSS = `
.combat-card{
  background:linear-gradient(180deg,#0a0a0a 0%,#050505 100%);
  border:1px solid var(--cb);border-radius:10px;padding:0 0 14px;margin:14px 0;
  color:#d4d4d4;font-family:'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;
  box-shadow:0 0 16px var(--cg);box-sizing:border-box;overflow:hidden;max-width:100%;
}
.combat-card::before{content:'';display:block;height:3px;background:linear-gradient(90deg,transparent,var(--cs) 30%,var(--cm) 50%,var(--cs) 70%,transparent);}
.combat-head{display:flex;align-items:center;gap:10px;padding:14px 18px 10px;border-bottom:1px solid var(--cb);}
.combat-icon{font-size:18px;filter:drop-shadow(0 0 4px var(--cg));}
.combat-turn{font-size:14px;font-weight:700;color:var(--cm);letter-spacing:2px;text-shadow:0 0 6px var(--cg);}
.combat-school{display:flex;align-items:center;gap:8px;padding:8px 18px 4px;}
.combat-badge{font-size:10px;padding:2px 8px;border-radius:2px;background:var(--cs);color:#fff;font-weight:600;letter-spacing:1px;}
.combat-school-text{font-size:12px;color:#a3a3a3;}
.combat-row{display:flex;padding:6px 18px;align-items:flex-start;gap:8px;}
.combat-row.combat-dim{opacity:0.7;}
.combat-label{min-width:48px;font-size:11px;font-weight:700;color:var(--cs);letter-spacing:2px;font-family:'Courier New',monospace;margin-top:3px;}
.combat-text{font-size:13px;color:#d4d4d4;line-height:1.5;}
.combat-roll-box{background:rgba(0,0,0,0.45);border-left:2px solid var(--cs);margin:6px 18px 10px;padding:10px 14px;border-radius:0 6px 6px 0;}
.combat-roll-label{font-size:11px;color:var(--cs);margin-bottom:5px;font-weight:600;letter-spacing:1px;font-family:'Courier New',monospace;}
.combat-roll{font-size:12px;color:#a3a3a3;font-family:'Courier New',monospace;line-height:1.6;}
.combat-damage-box{background:var(--cg);border:1px solid var(--cb);border-radius:6px;padding:10px 14px;margin:0 18px 10px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;}
.combat-damage-label{font-size:11px;color:var(--cs);font-weight:700;letter-spacing:1px;font-family:'Courier New',monospace;}
.combat-damage-text{font-size:13px;color:#ef4444;font-weight:800;text-shadow:0 0 8px var(--cg);font-family:'Courier New',monospace;}
.combat-status-box{background:rgba(255,255,255,0.02);border:1px solid rgba(82,82,82,0.15);border-radius:6px;padding:10px 14px;margin:0 18px;}
.combat-status-label{font-size:11px;color:#737373;font-weight:700;margin-bottom:6px;letter-spacing:1px;font-family:'Courier New',monospace;}
.combat-status{font-size:12px;color:#a3a3a3;line-height:1.7;white-space:pre-wrap;font-family:'Courier New',monospace;margin:0;}
/* 暴击：卡片金色闪光动画 */
.combat-card.combat-crit{animation:combat-flash-gold 0.8s ease-out 1;}
.combat-card.combat-crit .combat-damage-text{font-size:20px;color:#fbbf24;text-shadow:0 0 10px rgba(251,191,36,0.8),0 0 22px rgba(251,191,36,0.4);}
@keyframes combat-flash-gold{0%{box-shadow:0 0 0 rgba(251,191,36,0.8);}30%{box-shadow:0 0 40px rgba(251,191,36,0.7);}100%{box-shadow:0 0 16px var(--cg);}}
/* 大失败：卡片红色震屏动画 */
.combat-card.combat-fumble{animation:combat-shake 0.5s ease-in-out 1;}
@keyframes combat-shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-6px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(4px);}}
/* 落空：卡片灰化 */
.combat-card.combat-miss{opacity:0.65;filter:grayscale(0.5);}
`;
