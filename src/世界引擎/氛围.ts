// 世界引擎 · 世界氛围摘要
// 纯函数：从世界状态派生一句话氛围，供世界书常驻条目注入主线 prompt。
// 不调用 LLM，推进时顺手更新；状态为空时给出默认文案。
import type { 世界状态 } from './schema';

// 命中即视为「紧张」的态势关键词
const 紧张态势词 = ['内乱', '扩张', '激进', '备战', '动荡', '试探', '集结'];

export function 生成世界氛围(状态: 世界状态 | undefined | null): string {
  if (!状态) return '天下初定，万象未显。';
  const parts: string[] = [];

  // 1. 最紧迫暗流：未爆发中成熟度最高者
  const 暗流 = _.orderBy(
    Object.entries(状态.暗流涌动 || {})
      .map(([name, v]) => ({ name, ...v }))
      .filter(u => !u.是否已爆发 && (u.成熟度 ?? 0) > 0),
    '成熟度', 'desc',
  );
  if (暗流.length && (暗流[0].成熟度 ?? 0) >= 40) {
    const u = 暗流[0];
    parts.push((u.成熟度 ?? 0) >= 80 ? `${u.name}一触即发` : `${u.name}暗涌`);
  }

  // 2. 紧张势力：态势命中关键词者，取前 2
  const 紧张势力 = Object.entries(状态.势力 || {})
    .map(([name, v]) => ({ name, ...v }))
    .filter(f => 紧张态势词.includes(f.态势 ?? ''));
  if (紧张势力.length) {
    parts.push(紧张势力.slice(0, 2).map(f => `${f.name}${f.态势}`).join('、'));
  }

  // 3. 最危险地区：安全度最低者
  const 地区 = _.orderBy(
    Object.entries(状态.地区事件 || {})
      .map(([name, v]) => ({ name, ...v })),
    '安全度', 'asc',
  );
  if (地区.length && (地区[0].安全度 ?? 100) < 35) {
    parts.push(`${地区[0].name}危殆`);
  }

  if (!parts.length) return '天下暂安，暗流未显。';
  return parts.join('，') + '。';
}
