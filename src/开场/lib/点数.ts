import { 流派列表, 查流派 } from '../catalog/流派';
import { 灵根列表 } from '../catalog/灵根';
import { 武器列表, type 武器候选 } from '../catalog/武器';
import { 法器列表, type 法器候选 } from '../catalog/法器';
import { 功法列表, type 功法候选 } from '../catalog/功法';

export const 初始总点数 = 15;
export const 默认六维基线 = 10;
export const 六维上限 = 30;
export const 六维下限 = 0;
export const 单点属性换算 = 3; // 1 开局点 = 3 属性点
export const 灵石换算 = 1000; // 每 1000 灵石消耗 1 开局点

export interface 玩家选择 {
  本源: string;        // 玩家自由输入的"道之根本"，如"剑"、"红尘"、"杀戮"
  流派: string;        // 修炼流派名（如"剑修"），未选时为空字符串
  灵根: string;        // 灵根名（如"金灵根"），未选时为空字符串
  宗门: string;        // 宗门名（如"太虚剑宗"），未选时为空字符串
  已购武器: readonly string[]; // 武器名数组
  已购法器: readonly string[]; // 法器名数组
  已选功法: readonly string[]; // 功法名数组
  六维: {
    力道: number; 体魄: number; 身法: number;
    灵力: number; 神识: number; 根骨: number;
  };
  灵石: number;        // 开局灵石数量
}

/** 取玩家流派对应的关键字（如流派"剑修"→关键字"剑"），未选则为空串 */
function 取流派关键字(玩家流派: string): string {
  return 查流派(玩家流派)?.关键字 ?? '';
}

/** 同流派折扣后实际消耗，最低 0 点 */
export function 计算装备消耗(候选: 武器候选 | 法器候选, 玩家流派: string): number {
  const 关键字 = 取流派关键字(玩家流派);
  const 折扣 = 关键字 && 候选.适配流派.includes(关键字) ? 1 : 0;
  return Math.max(0, 候选.消耗 - 折扣);
}

export function 计算功法消耗(候选: 功法候选, 玩家流派: string): number {
  const 关键字 = 取流派关键字(玩家流派);
  const 折扣 = 关键字 && 候选.适配流派.includes(关键字) ? 1 : 0;
  return Math.max(0, 候选.消耗 - 折扣);
}

/** 六维净加点（相对基线）转换为开局点数：加点 ceil(净加点/3)，减点 floor(净减点/3) */
export function 计算属性点数(六维: 玩家选择['六维']): number {
  const 净变化 = Object.values(六维).reduce((acc, v) => acc + (v - 默认六维基线), 0);
  return 净变化 >= 0 ? Math.ceil(净变化 / 单点属性换算) : Math.floor(净变化 / 单点属性换算);
}

export function 计算总消耗(选择: 玩家选择): number {
  const 流派 = 流派列表.find(s => s.名称 === 选择.流派);
  const 灵根 = 灵根列表.find(g => g.名称 === 选择.灵根);
  let 总 = 0;
  // 本源是自由文本，不消耗点数；流派消耗按 catalog
  if (流派) 总 += 流派.消耗;
  if (灵根) 总 += 灵根.消耗;

  for (const 名 of 选择.已购武器) {
    const c = 武器列表.find(x => x.名称 === 名);
    if (c) 总 += 计算装备消耗(c, 选择.流派);
  }
  for (const 名 of 选择.已购法器) {
    const c = 法器列表.find(x => x.名称 === 名);
    if (c) 总 += 计算装备消耗(c, 选择.流派);
  }
  for (const 名 of 选择.已选功法) {
    const c = 功法列表.find(x => x.名称 === 名);
    if (c) 总 += 计算功法消耗(c, 选择.流派);
  }
  总 += 计算属性点数(选择.六维);
  // 灵石消耗：每 1000 枚消耗 1 开局点（向上取整）
  总 += Math.ceil((选择.灵石 ?? 0) / 灵石换算);
  return 总;
}

export function 计算剩余点数(选择: 玩家选择): number {
  return 初始总点数 - 计算总消耗(选择);
}

export interface 校验结果 {
  通过: boolean;
  错误: string[];
}

export function 校验玩家选择(选择: 玩家选择, 姓名: string, 出身地: string): 校验结果 {
  const 错误: string[] = [];
  if (!姓名 || 姓名 === '待捏角') 错误.push('请填写姓名');
  if (!选择.本源 || 选择.本源 === '待捏角') 错误.push('请填写本源');
  if (!选择.流派 || 选择.流派 === '待捏角') 错误.push('请选择修炼流派');
  if (!选择.灵根 || 选择.灵根 === '待捏角') 错误.push('请选择灵根');
  if (!出身地 || 出身地 === '待捏角') 错误.push('请选择出身地');
  if (!选择.宗门 || 选择.宗门 === '待捏角') 错误.push('请选择宗门');
  if (计算剩余点数(选择) < 0) 错误.push('点数超支，请减少购买或调整属性');
  for (const k of Object.keys(选择.六维) as (keyof 玩家选择['六维'])[]) {
    const v = 选择.六维[k];
    if (v < 六维下限 || v > 六维上限) 错误.push(`${k} 超出范围 ${六维下限}-${六维上限}`);
  }
  return { 通过: 错误.length === 0, 错误 };
}
