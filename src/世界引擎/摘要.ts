// 世界引擎 · 主线剧情摘要
// 监听 tavern_events.MESSAGE_RECEIVED，每「摘要间隔」楼调用 generateRaw 压缩新楼层原文，
// 存入聊天变量 摘要.近期摘要，不写楼层。摘要上限 1500 字，滚动裁剪。

import type { 世界引擎 } from './schema';

let 摘要中 = false;

function 摘要提示词(): string {
  return `你是修仙世界主线剧情的摘要助手。请把给定的【主线近期楼层原文】压缩成一段剧情摘要，用于让「世界引擎」了解主角近况以推演世界演变。

要求：
1. 只概括与主角行为、地点移动、关键互动、势力事件相关的剧情，忽略无关细节
2. 客观第三人称，简洁
3. 不超过 600 字
4. 直接输出摘要正文，不要任何标题或多余说明`;
}

// 取从 start 楼到当前最新楼层的原文，拼成字符串
function 取近期楼层原文(start: number): string {
  const last = getLastMessageId();
  if (start > last) return '（无新楼层）';
  const msgs = getChatMessages(`${start}-${last}`, { role: 'all' });
  return msgs
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `[${m.role === 'user' ? '主角' : '世界'}] ${m.message}`)
    .join('\n\n');
}

// 旧摘要 + 新摘要合并后再压缩到上限内
function 裁剪摘要(merged: string): string {
  if (merged.length <= 1500) return merged;
  // 保留较新的部分（末尾），前面截断
  return '…（前文略）' + merged.slice(merged.length - 1450);
}

// 生成摘要：传入当前世界引擎数据（含配置），返回是否执行了生成
export async function 生成摘要(engine: 世界引擎): Promise<boolean> {
  if (摘要中) return false;
  const 配置 = engine.配置;
  const 上次楼层 = engine.摘要?.上次摘要楼层 ?? 0;
  const 间隔 = 配置?.摘要间隔 ?? 5;
  const last = getLastMessageId();
  if (last - 上次楼层 < 间隔) return false;

  摘要中 = true;
  try {
    const 原文 = 取近期楼层原文(上次楼层 + 1);
    const api = 配置?.custom_api ?? null;
    const custom_api =
      api && api.apiurl && api.model
        ? { custom_api: { source: api.source, apiurl: api.apiurl, key: api.key || undefined, model: api.model } }
        : {};

    const 新摘要 = (await generateRaw({
      should_silence: true,
      ...custom_api,
      ordered_prompts: [
        { role: 'system', content: 摘要提示词() },
        { role: 'system', content: `【主线近期楼层原文】\n${原文}` },
        { role: 'user', content: '请生成主线剧情摘要。' },
      ],
    } as any)) as string;

    if (typeof 新摘要 !== 'string') return false;

    const 旧摘要 = engine.摘要?.近期摘要 ?? '';
    const 合并 = 旧摘要 ? `${旧摘要}\n\n${新摘要}` : 新摘要;
    engine.摘要 = {
      近期摘要: 裁剪摘要(合并),
      上次摘要楼层: last,
    };

    // 写回聊天变量
    const variables = getVariables({ type: 'chat' });
    _.set(variables, '世界引擎', engine);
    replaceVariables(variables, { type: 'chat' });

    console.info(`[世界引擎] 摘要已更新（截至第 ${last} 楼）`);
    return true;
  } catch (e) {
    console.error('[世界引擎] 摘要生成失败', e);
    return false;
  } finally {
    摘要中 = false;
  }
}

// 自动推进检查：达到间隔且开启自动推进时触发推进
export async function 检查自动推进(engine: 世界引擎): Promise<boolean> {
  const 配置 = engine.配置;
  if (!配置?.自动推进) return false;
  const 上次推进 = engine.上次推进楼层 ?? 0;
  const 间隔 = 配置.自动推进间隔 ?? 10;
  const last = getLastMessageId();
  if (last - 上次推进 < 间隔) return false;
  return true;
}
