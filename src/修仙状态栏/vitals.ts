// 气血上限 / 法力上限 完全由六维派生，不作为独立变量存储。
// 状态栏据此实时计算，六维变化时上限自动随之更新。
// 公式与 战斗系统.txt / [mvu_update]变量更新规则.yaml 保持一致。

export type 六维Like = { 体魄?: number; 灵力?: number; 根骨?: number } | undefined | null;

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 气血上限 = 50 + 体魄×10 + 根骨×5 */
export function deriveMaxHp(六维: 六维Like): number {
  return 50 + num(六维?.体魄) * 10 + num(六维?.根骨) * 5;
}

/** 法力上限 = 50 + 灵力×15 + 根骨×5 */
export function deriveMaxMp(六维: 六维Like): number {
  return 50 + num(六维?.灵力) * 15 + num(六维?.根骨) * 5;
}

/** 显示用当前值：clamp 到 [0, 上限] */
export function clampCurrent(current: unknown, max: number): number {
  const n = num(current);
  return Math.max(0, Math.min(n, max));
}
