// 世界引擎 · 世界书触发宏
// 为势力/地区/人物各注册一个宏，世界书绿灯条目按名触发，只注入相关切片。
// 用法：{{势力:太虚剑宗}} {{地区:天京城}} {{人物:沈清辞}}
// 命中即从聊天变量读对应条目，格式化成紧凑文本；查无则返回空串（条目不产生内容）。
import type { 世界状态 } from './schema';

function 取状态(): 世界状态 | null {
  try {
    const variables = getVariables({ type: 'chat' });
    return _.get(variables, '世界引擎.世界状态') ?? null;
  } catch {
    return null;
  }
}

const 势力宏正则 = /\{\{势力:([^}]+)\}\}/g;
const 地区宏正则 = /\{\{地区:([^}]+)\}\}/g;
const 人物宏正则 = /\{\{人物:([^}]+)\}\}/g;
const 氛围宏正则 = /\{\{世界氛围\}\}/g;

export function 注册世界书宏(): { unregister: () => void } {
  const r0 = registerMacroLike(氛围宏正则, () => {
    try {
      const variables = getVariables({ type: 'chat' });
      return _.get(variables, '世界引擎.世界氛围') || '天下暂安，暗流未显。';
    } catch {
      return '天下暂安，暗流未显。';
    }
  });

  const r1 = registerMacroLike(势力宏正则, (_ctx, _sub, 名: string) => {
    const f = 取状态()?.势力?.[名?.trim()];
    if (!f) return '';
    return `【势力·${名}】分类:${f.分类 ?? '其他'} | 态势:${f.态势 ?? '平稳'} | 影响:${f.影响范围 ?? 0} | 实力:${f.实力 ?? 0} | 与主角关系:${f.与主角关系 ?? '中立'}${f.内部动向 ? ` | 内部动向:${f.内部动向}` : ''}${f.描述 ? ` | 简介:${f.描述}` : ''}`;
  });

  const r2 = registerMacroLike(地区宏正则, (_ctx, _sub, 名: string) => {
    const r = 取状态()?.地区事件?.[名?.trim()];
    if (!r) return '';
    const 传闻 = r.近期传闻?.length ? ` | 传闻:${r.近期传闻.join('；')}` : '';
    return `【地区·${名}】区域:${r.区域 ?? '中州'} | 安全度:${r.安全度 ?? 50} | 氛围:${r.氛围 ?? '未知'}${r.当前事件 ? ` | 当前事件:${r.当前事件}` : ''}${传闻}`;
  });

  const r3 = registerMacroLike(人物宏正则, (_ctx, _sub, 名: string) => {
    const p = 取状态()?.人物动向?.[名?.trim()];
    if (!p) return '';
    return `【人物·${名}】${p.称号 ? `称号:${p.称号} | ` : ''}${p.势力 ? `势力:${p.势力} | ` : ''}状态:${p.状态 ?? '正常'}${p.所在地 ? ` | 所在地:${p.所在地}` : ''}${p.当前动向 ? ` | 当前动向:${p.当前动向}` : ''}${p.最近变化 ? ` | 最近变化:${p.最近变化}` : ''}`;
  });

  return {
    unregister: () => { r0.unregister(); r1.unregister(); r2.unregister(); r3.unregister(); },
  };
}
