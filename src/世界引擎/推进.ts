// 世界引擎 · 世界推进
// 调用 generateRaw（custom_api 独立模型，严禁注入 chat_history）让 LLM 读「世界状态 + 主线摘要」，
// 输出纯文本【叙述】+【变更指令】，脚本自解析指令 patch 世界状态。
// 纯文本协议兼容所有渠道（含不支持 json_schema 的国产模型/中转）。

import type { 世界引擎, 世界状态 } from './schema';
import type { CustomApi } from './schema';
import { 生成世界氛围 } from './氛围';

// 推进进行中锁，防重复触发
let 推进中 = false;

function 系统提示词(): string {
  return `你是一个修仙世界的「世界引擎」。你的职责是独立推演世界局势演变，不围绕主角推进。

世界由五部分构成：势力（正道/魔道/古神/其他四类，含影响范围、实力、态势、内部动向）、人物动向（重要 NPC 的当前动向）、地区事件（各地区当前事件、氛围、安全度、传闻）、世界事件（跨地区大事件时间线）、暗流涌动（尚未爆发的暗线，成熟度到阈值会爆发为世界事件）。

根据给定的【当前世界状态】与【主线剧情摘要】，推演世界自然演变一小步。要求：
1. 世界按自身逻辑演进，主角行为只是影响因素之一，不喧宾夺主
2. 输出一段「叙述」概括本时段世界局势演变（150~300字）
3. 输出「变更指令」增量修改世界状态
4. 暗流涌动条目的成熟度可随时间增长，到 80 以上可考虑爆发（add 到世界事件、是否已爆发置 true）
5. 指令 path 用点号分隔，如 势力.太虚剑宗.态势
6. 人物动向会随世界演化自然更替：
   - 新登场的重要人物用 set 新增，如 set | 人物动向.李青莲 | {"称号":"...","势力":"...","当前动向":"...","所在地":"...","状态":"正常","最近变化":"..."}
   - 已陨落、退隐或不再重要的人物可用 remove 删除，如 remove | 人物动向.已退场角色
   - 新增人物应贴合本时段演变（新势力崛起、暗线爆发、新传闻牵出的角色等），不必每轮都增删

严格按以下格式输出，不要输出任何其他内容：

【叙述】
（本时段世界局势演变叙述，150~300字）

【变更指令】
set | 势力.太虚剑宗.态势 | 内乱
inc | 暗流涌动.剑冢封印松动.成熟度 | 15
add | 世界事件 | {"时间":"太初纪元","事件":"xxx","描述":"xxx","影响":"xxx"}
remove | 暗流涌动.已爆发暗线
set | 人物动向.李青莲 | {"称号":"散修剑客","势力":"散修联盟","当前动向":"游历中州","所在地":"中州·天京城","状态":"正常","最近变化":"初露锋芒"}

指令说明：
- set：设置字段值。第三段为值（字符串、数字或 JSON 对象）。对人物动向新增角色时第三段为该人物的 JSON 对象
- inc：数值字段自增。第三段为增量数字
- add：向数组追加元素。第三段为 JSON 对象字符串（如世界事件、地区事件.天京城.近期传闻）
- remove：删除字段（可删除已退场的人物动向条目）
- 无需变更的条目不必输出`;
}

// 把 custom_api 配置转成 generateRaw 的参数（未配置则不传）
function 构建custom_api(api: CustomApi | null): { custom_api: Record<string, unknown> } | Record<string, never> {
  if (!api || !api.apiurl || !api.model) return {};
  return {
    custom_api: {
      source: api.source,
      apiurl: api.apiurl,
      key: api.key || undefined,
      model: api.model,
    },
  };
}

// 解析【叙述】段
function 解析叙述(text: string): string {
  const m = text.match(/【叙述】([\s\S]*?)(?=【变更指令】|$)/);
  return m ? m[1].trim() : '';
}

// 尝试把字符串值转成 number / boolean / object，否则保留字符串
function 转换值(raw: string): unknown {
  const s = raw.trim();
  if (s === '') return '';
  // JSON 对象/数组
  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      return JSON.parse(s);
    } catch {
      return s;
    }
  }
  // 数字
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

// 解析【变更指令】段为指令数组
function 解析指令(text: string): { op: string; path: string; value?: unknown }[] {
  const block = text.match(/【变更指令】([\s\S]*?)$/);
  if (!block) return [];
  const 指令: { op: string; path: string; value?: unknown }[] = [];
  for (const line of block[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || !/^(set|inc|add|remove)\s*\|/i.test(trimmed)) continue;
    const parts = trimmed.split('|').map(p => p.trim());
    const op = parts[0].toLowerCase();
    const path = parts[1] ?? '';
    if (!path) continue;
    const value = parts.length >= 3 ? 转换值(parts.slice(2).join('|')) : undefined;
    指令.push({ op, path, value });
  }
  return 指令;
}

// 应用指令，原地修改状态
function 应用指令(状态: 世界状态, 指令: { op: string; path: string; value?: unknown }[]): { 成功: number; 跳过: number } {
  let 成功 = 0;
  let 跳过 = 0;
  for (const cmd of 指令) {
    try {
      const { op, path, value } = cmd;
      switch (op) {
        case 'set':
          _.set(状态, path, value);
          成功++;
          break;
        case 'inc': {
          const cur = _.get(状态, path, 0);
          _.set(状态, path, Number(cur) + Number(value));
          成功++;
          break;
        }
        case 'add': {
          const arr = _.get(状态, path);
          if (Array.isArray(arr)) {
            arr.push(value);
            成功++;
          } else if (arr === undefined) {
            _.set(状态, path, [value]);
            成功++;
          } else {
            跳过++;
          }
          break;
        }
        case 'remove':
          _.unset(状态, path);
          成功++;
          break;
        default:
          跳过++;
      }
    } catch (e) {
      console.warn('[世界引擎] 指令解析失败，跳过', cmd, e);
      跳过++;
    }
  }
  return { 成功, 跳过 };
}

// 推进世界：手动按钮 / 自动触发共用入口。返回叙述文本供 UI 展示。
export async function 推进世界(): Promise<{ 叙述: string; 成功: number; 跳过: number } | null> {
  if (推进中) {
    toastr.warning('世界正在推进中，请稍候');
    return null;
  }
  推进中 = true;
  toastr.info('世界引擎推演中…');

  try {
    const variables = getVariables({ type: 'chat' });
    const engine = (variables.世界引擎 ?? {}) as 世界引擎;
    const 状态 = engine.世界状态 ?? ({} as 世界状态);
    const 摘要 = engine.摘要?.近期摘要 ?? '（暂无主线摘要）';
    const api = engine.配置?.custom_api ?? null;

    const result = (await generateRaw({
      should_silence: true,
      ...构建custom_api(api),
      ordered_prompts: [
        { role: 'system', content: 系统提示词() },
        { role: 'system', content: `【当前世界状态】\n${JSON.stringify(状态, null, 2)}` },
        { role: 'system', content: `【主线剧情摘要】\n${摘要}` },
        { role: 'user', content: '请推演世界本时段的演变，严格按指定格式输出。' },
      ],
    } as any)) as string;

    if (typeof result !== 'string') {
      throw new Error('LLM 返回非文本');
    }

    const 叙述 = 解析叙述(result);
    const 指令 = 解析指令(result);
    const 新状态 = klona(状态);
    const { 成功, 跳过 } = 应用指令(新状态, 指令);

    engine.世界状态 = 新状态;
    engine.世界氛围 = 生成世界氛围(新状态);
    engine.上次推进楼层 = getLastMessageId();
    _.set(variables, '世界引擎', engine);
    replaceVariables(variables, { type: 'chat' });

    console.info(`[世界引擎] 推进完成：${成功} 条指令生效，${跳过} 条跳过`);
    toastr.success('世界已推演演进');
    return { 叙述, 成功, 跳过 };
  } catch (e) {
    console.error('[世界引擎] 推进失败', e);
    toastr.error('世界推演失败，世界状态未变更');
    return null;
  } finally {
    推进中 = false;
  }
}
