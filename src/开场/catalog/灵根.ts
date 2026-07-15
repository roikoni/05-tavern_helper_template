// 灵根分类系统：天灵根 / 真灵根 / 杂灵根 / 变异灵根
// 灵根存储为主角.灵根字符串，格式：`<类别>·<属性1>·<属性2>...`，如 "天灵根·金"、"真灵根·金·水"

export type 灵根类别 = '天灵根' | '真灵根' | '杂灵根' | '变异灵根';

export interface 属性候选 {
  名称: string;
  色: string; // 能量球中该属性的主色
}

export interface 灵根类别配置 {
  名称: 灵根类别;
  描述: string;
  最少: number;     // 至少选几个属性
  最多: number;     // 最多选几个属性
  消耗: number;     // 开局点数消耗
  池: readonly 属性候选[]; // 可选属性来源
  特效: 'pure' | 'dual' | 'chaos' | 'mutant'; // 能量球特效风格
}

// 五行属性池（天/真/杂 灵根选用）
export const 五行属性: readonly 属性候选[] = [
  { 名称: '金', 色: '#e6c658' },
  { 名称: '木', 色: '#6aa85a' },
  { 名称: '水', 色: '#5a92d4' },
  { 名称: '火', 色: '#d4563a' },
  { 名称: '土', 色: '#b8925a' },
];

// 变异属性池（变异灵根选用）
export const 变异属性: readonly 属性候选[] = [
  { 名称: '雷', 色: '#b88aff' },
  { 名称: '火', 色: '#ff6a3a' },
  { 名称: '风', 色: '#9cd8e8' },
  { 名称: '毒', 色: '#8ed04a' },
  { 名称: '炎', 色: '#ff8a2a' },
  { 名称: '暗', 色: '#8a5ad4' },
  { 名称: '磁', 色: '#7ab4d8' },
  { 名称: '血', 色: '#d63a5a' },
];

export const 灵根类别列表: readonly 灵根类别配置[] = [
  {
    名称: '天灵根',
    描述: '单一五行，纯粹通明，修行最快',
    最少: 1, 最多: 1, 消耗: 0, 池: 五行属性, 特效: 'pure',
  },
  {
    名称: '真灵根',
    描述: '两至三种五行并存，根基厚实',
    最少: 2, 最多: 3, 消耗: 1, 池: 五行属性, 特效: 'dual',
  },
  {
    名称: '杂灵根',
    描述: '四至五种五行杂糅，资质平庸',
    最少: 4, 最多: 5, 消耗: 3, 池: 五行属性, 特效: 'chaos',
  },
  {
    名称: '变异灵根',
    描述: '异变属性，稀有而偏锋',
    最少: 1, 最多: 3, 消耗: 2, 池: 变异属性, 特效: 'mutant',
  },
];

export function 查灵根类别(名: string): 灵根类别配置 | undefined {
  if (!名) return undefined;
  return 灵根类别列表.find(g => 名.startsWith(g.名称));
}

/** 解析灵根字符串为 {类别, 属性们}；无法解析返回 null */
export function 解析灵根(s: string): { 类别: 灵根类别; 属性: string[] } | null {
  if (!s || s === '待捏角') return null;
  const cfg = 查灵根类别(s);
  if (!cfg) return null;
  const rest = s.slice(cfg.名称.length).replace(/^[·、,\s]+/, '');
  const 属性 = rest ? rest.split(/[·、,\s]+/).filter(Boolean) : [];
  return { 类别: cfg.名称 as 灵根类别, 属性 };
}