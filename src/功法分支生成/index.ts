import { Schema } from '../修仙状态栏/schema';
import { 查流派 } from '../开场/catalog/流派';
import { 功法列表 } from '../开场/catalog/功法';

// ── 类型 ──────────────────────────────────────────────

type StatData = z.infer<typeof Schema>;

type AI功法 = {
  名称: string;
  类型: '主动' | '被动';
  层级: number;
  前置功法: string;
  效果: string;
  已学习: boolean;
  消耗灵悟: number;
  描述?: string;
};

// ── 常量 ──────────────────────────────────────────────

const 层级名: Record<number, string> = {
  1: '黄阶下品',
  2: '黄阶中品',
  3: '黄阶上品',
  4: '玄阶下品',
  5: '玄阶中品',
  6: '玄阶上品',
  7: '地阶下品',
  8: '地阶中品',
  9: '天阶下品',
  10: '天阶中品',
  11: '天阶上品',
  12: '仙阶',
};

const 层级消耗: Record<number, number> = {
  1: 10,
  2: 30,
  3: 60,
  4: 100,
  5: 160,
  6: 250,
  7: 400,
  8: 600,
  9: 900,
  10: 1300,
  11: 1800,
  12: 2500,
};

/** 功法树最大层级：到 12（仙阶）为止 */
const 最大层级 = 12;

// ── zod 校验 schema ─────────────────────────────────────

const AI功法条目Schema = z.object({
  名称: z.string().min(1),
  类型: z.preprocess(
    v => {
      const s = String(v).trim();
      if (s.includes('主动') || s.startsWith('act')) return '主动';
      if (s.includes('被动') || s.startsWith('pass')) return '被动';
      return '被动';
    },
    z.enum(['主动', '被动']),
  ),
  层级: z.preprocess(v => {
    const n = Number(v);
    if (Number.isNaN(n)) return 4;
    return _.clamp(Math.round(n), 1, 12);
  }, z.number().min(1).max(12)),
  前置功法: z.string(),
  效果: z.preprocess(v => (typeof v === 'string' ? v : String(v ?? '')), z.string()),
  已学习: z.preprocess(v => {
    if (v === true || v === 'true' || v === 1 || v === '1') return true;
    return false;
  }, z.boolean()),
  消耗灵悟: z.preprocess(v => {
    const n = Number(v);
    if (Number.isNaN(n) || n <= 0) return 10;
    return Math.max(5, Math.round(n));
  }, z.number().min(5)),
  描述: z.preprocess(v => (typeof v === 'string' ? v : String(v ?? '')), z.string().prefault('')),
});

// ── 字段名映射 ────────────────────────────────────────

const 字段映射: Record<string, string> = {
  name: '名称',
  type: '类型',
  level: '层级',
  prerequisite: '前置功法',
  effect: '效果',
  learned: '已学习',
  cost: '消耗灵悟',
  desc: '描述',
  description: '描述',
};

function 映射字段名(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    const mappedKey = 字段映射[key] ?? key;
    result[mappedKey] = val;
  }
  return result;
}

// ── JSON 提取 ──────────────────────────────────────────

function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {}

  const lastClose = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
  if (lastClose === -1) throw new Error('AI 返回的文本中找不到 JSON');

  const closeChar = text[lastClose];
  const openChar = closeChar === '}' ? '{' : '[';

  let depth = 0;
  for (let i = lastClose; i >= 0; i--) {
    if (text[i] === closeChar) depth++;
    else if (text[i] === openChar) depth--;
    if (depth === 0) {
      const candidate = text.slice(i, lastClose + 1);
      try {
        return JSON.parse(candidate);
      } catch {}
      break;
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  throw new Error('无法从 AI 返回的文本中提取有效 JSON');
}

// ── 增量生成提示词构建 ──────────────────────────────────

/**
 * 极简 prompt：只给 AI 角色流派、触发功法、目标层级、防重名清单和硬性字段要求。
 * 消耗灵悟由 writeBranchToData 按层级基础值与本流派折半重算，故不要求 AI 给精确数值。
 */
function buildBranchPrompt(
  statData: StatData,
  triggerName: string,
  triggerLevel: number,
  existingNames: Set<string>,
): string {
  const 主 = statData.主角;
  const 流派 = 主.修炼流派 || '未知';
  const 灵根 = 主.灵根 || '未知';
  const 目标层级 = triggerLevel + 1;

  // 触发功法所在层级附近的已有功法，作为前置链与命名参照
  const 相关 = Object.entries(statData.功法)
    .filter(([, v]) => v.层级 >= triggerLevel - 1 && v.层级 <= triggerLevel + 1)
    .map(([名, 功]) => `${名}(${功.类型},${层级名[功.层级]},前置:${功.前置功法 || '无'})`);

  const 行: string[] = [];
  行.push(`为修士生成功法进阶分支。流派:${流派} 灵根:${灵根}`);
  行.push(`刚学成:${triggerName}(${层级名[triggerLevel]}) → 生成${层级名[目标层级]}分支`);
  行.push(`相邻已学功法:${相关.join(' | ') || '无'}`);
  行.push(`已有功法名(禁重名):${[...existingNames].slice(0, 60).join('、')}`);
  行.push(
    '要求:2-5个;层级全为' +
      目标层级 +
      ';至少1-2个前置为' +
      triggerName +
      ';四字古韵命名;效果15-30字;已学习=false;类型主动|被动',
  );
  return 行.join('\n');
}

// ── 整套基础树现由开场白预加载注入变量，本脚本仅负责延续性的进阶分支生成 ──

// ── 校验 ──────────────────────────────────────────────

function validateBranch(
  techniques: AI功法[],
  triggerName: string,
  targetLevel: number,
  existingNames: Set<string>,
): AI功法[] {
  const 合法: AI功法[] = [];

  for (const raw of techniques) {
    const t = 映射字段名(raw);

    if (!t.名称 || typeof t.名称 !== 'string' || !t.名称.trim()) continue;
    if (existingNames.has(t.名称)) {
      console.info(`[功法分支] 跳过重复名称: ${t.名称}`);
      continue;
    }
    existingNames.add(t.名称);

    const parsed = AI功法条目Schema.safeParse(t);
    if (!parsed.success) {
      console.warn(`[功法分支] 跳过无法修正的条目: ${JSON.stringify(t)}`, parsed.error.issues);
      continue;
    }
    const 功 = parsed.data;

    // 强制层级为目标层级
    if (功.层级 !== targetLevel) {
      console.info(`[功法分支] 调整层级: ${功.名称} 从 ${功.层级} 调整为 ${targetLevel}`);
      功.层级 = targetLevel;
    }

    // 新功法一律未学习
    功.已学习 = false;

    合法.push(功);
  }

  // 确保至少有 1 个功法以触发功法为前置
  const 有触发前置 = 合法.some(t => t.前置功法 === triggerName);
  if (!有触发前置 && 合法.length > 0) {
    合法[0].前置功法 = triggerName;
    console.info(`[功法分支] 自动设置"${合法[0].名称}"的前置功法为"${triggerName}"`);
  }

  return 合法;
}

// ── 整套基础树校验现由开场白预加载承担，本脚本不再需要 ──

// ── 增量生成主函数 ─────────────────────────────────────

async function generateBranch(statData: StatData, triggerName: string, triggerLevel: number): Promise<AI功法[] | null> {
  const 目标层级 = triggerLevel + 1;

  const existingNames = new Set<string>([
    ...功法列表.map(g => g.名称),
    ...Object.keys(statData.功法),
    ...Object.keys(statData.初始功法 ?? {}),
  ]);

  const prompt = buildBranchPrompt(statData, triggerName, triggerLevel, existingNames);
  if (!prompt) return null;

  console.info(`[功法分支] 开始为"${triggerName}"(${层级名[triggerLevel]})生成${层级名[目标层级]}分支`);

  try {
    const result = await generateRaw({
      user_input: prompt,
      should_silence: true,
      ordered_prompts: [
        {
          role: 'system',
          content:
            '你是一个修仙世界功法设计引擎。你的唯一任务是按照用户要求生成结构化的功法分支 JSON 数据。不要输出任何 JSON 以外的内容，不要使用 <UpdateVariable> 或任何 XML 标签。输出格式必须严格为：{"techniques":[{"名称":"...","类型":"主动|被动","层级":数字,"前置功法":"...","效果":"...","已学习":false,"消耗灵悟":数字,"描述":"..."}]}',
        },
        'user_input',
      ],
    });

    let techniques: AI功法[];
    try {
      const text = typeof result === 'string' ? result : JSON.stringify(result);
      console.info('[功法分支] AI 返回原始文本（前300字）:', text.slice(0, 300));
      const parsed = extractJSON(text);
      const obj = parsed as any;

      if (Array.isArray(obj)) {
        techniques = obj;
      } else if (obj && typeof obj === 'object') {
        techniques = obj.techniques ?? obj.功法 ?? obj.data ?? obj;
        if (!Array.isArray(techniques)) {
          for (const val of Object.values(obj)) {
            if (Array.isArray(val)) {
              techniques = val;
              break;
            }
          }
        }
      } else {
        techniques = obj;
      }

      if (!Array.isArray(techniques)) {
        throw new Error('AI 返回的功法数据不是数组');
      }
    } catch (err) {
      console.error('[功法分支] 解析 AI 返回失败:', err);
      return null;
    }

    const 合法功法 = validateBranch(techniques, triggerName, 目标层级, existingNames);
    if (合法功法.length === 0) {
      console.warn('[功法分支] AI 生成的功法全部无效');
      return null;
    }

    console.info(`[功法分支] 成功生成 ${合法功法.length} 个${层级名[目标层级]}分支功法`);
    return 合法功法;
  } catch (err) {
    console.error('[功法分支] 生成失败:', err);
    return null;
  }
}

// ── 整套基础树生成现由开场白预加载注入变量，本脚本不再提供 generateTree ──

// ── 将新功法写入变量 ────────────────────────────────────

function writeBranchToData(statData: StatData, techniques: AI功法[]): void {
  const 流派关键字 = 查流派(statData.主角.修炼流派)?.关键字 ?? '';

  for (const t of techniques) {
    const 名称含流派 = 流派关键字 && t.名称.includes(流派关键字);
    const 流派折扣 = 名称含流派 ? 0.5 : 1;

    statData.功法[t.名称] = {
      类型: t.类型,
      层级: t.层级,
      前置功法: t.前置功法,
      效果: t.效果,
      已学习: false,
      消耗灵悟: Math.max(5, Math.round(层级消耗[t.层级] * 流派折扣)),
      描述: t.描述 ?? '',
    };
  }
}

// ── 触发生成分支并写入 ──────────────────────────────────

// 防止重复触发：记录正在处理的功法名称
const processingSet = new Set<string>();

async function triggerBranchGeneration(triggerName: string, triggerLevel: number): Promise<void> {
  // 到头判断：目标层级超过最大层级则不再生成
  if (triggerLevel + 1 > 最大层级) {
    console.info(`[功法分支] "${triggerName}"已达层级${triggerLevel}（上限${最大层级}），到头跳过`);
    return;
  }
  if (processingSet.has(triggerName)) return;
  processingSet.add(triggerName);

  try {
    // 获取最新变量
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: -1 });
    const statData = _.get(mvuData, 'stat_data') as StatData | undefined;
    if (!statData || !statData.功法) {
      console.warn('[功法分支] 无法获取最新变量数据');
      return;
    }

    // 再次确认：该功法是否已有后续分支（避免并发竞争）
    const 已有后续 = Object.values(statData.功法).some(功 => 功?.前置功法 === triggerName);
    if (已有后续) {
      console.info(`[功法分支] "${triggerName}"已有后续分支（再次确认），跳过`);
      return;
    }

    toastr.info('新的功法正在觉醒中……');
    const techniques = await generateBranch(statData, triggerName, triggerLevel);
    if (techniques && techniques.length > 0) {
      writeBranchToData(statData, techniques);
      // 写回 MVU 变量
      if (mvuData) {
        await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: -1 });
        console.info(`[功法分支] 已为"${triggerName}"生成 ${techniques.length} 个后续功法并写入变量`);
      }
      // 在酒馆中提示
      toastr.success(`有新的功法觉醒了！从「${triggerName}」领悟了 ${techniques.map(t => t.名称).join('、')}`);
    }
  } catch (err) {
    console.error(`[功法分支] 为"${triggerName}"生成分支失败:`, err);
  } finally {
    processingSet.delete(triggerName);
  }
}

// ── 手动生成入口（供功法树界面按钮调用）──────────────────

type 手动生成模式 = '进阶' | '无需';

/**
 * 功法树界面按钮入口：
 * 基础功法树现由开场白预加载注入变量，本脚本只负责延续更新——
 * 为末端「已学 + 无后续 + 层级 < 上限」的功法补一层进阶分支。
 * 若功法树为空（预加载尚未注入），提示等待开场白完成。
 */
async function 手动生成(): Promise<{ 模式: 手动生成模式; 已触发: string[] }> {
  const mvuData = Mvu.getMvuData({ type: 'message', message_id: -1 });
  const statData = _.get(mvuData, 'stat_data') as StatData | undefined;
  if (!statData?.功法) return { 模式: '无需', 已触发: [] };

  // 功法树为空：基础树应由开场白预加载注入，此处不代为生成
  if (Object.keys(statData.功法).length === 0) {
    toastr.info('初始功法由开场白预加载注入，请先完成捏角与开场白');
    console.info('[功法树] /功法/ 为空，等待开场白预加载注入，本脚本不代为生成基础树');
    return { 模式: '无需', 已触发: [] };
  }

  // 扫描末端「已学+无后续+层级<上限」的功法，逐个补进阶分支
  const 已触发: string[] = [];
  for (const [名, 功] of Object.entries(statData.功法)) {
    if (!功?.已学习) continue;
    if (typeof 功.层级 === 'number' && 功.层级 >= 最大层级) continue;
    const 已有后续 = Object.values(statData.功法).some(g => g?.前置功法 === 名);
    if (已有后续) continue;
    const level = typeof 功.层级 === 'number' ? 功.层级 : 1;
    已触发.push(名);
    await triggerBranchGeneration(名, level);
  }

  if (已触发.length === 0) {
    toastr.info('功法树已到头，无需更新');
    return { 模式: '无需', 已触发: [] };
  }

  console.info(`[功法树] 手动生成：为 ${已触发.length} 个功法触发进阶分支：${已触发.join('、')}`);
  toastr.success(`已为 ${已触发.length} 个功法触发进阶分支生成`);
  return { 模式: '进阶', 已触发 };
}

// ── 脚本入口 ──────────────────────────────────────────

$(() => {
  errorCatched(async () => {
    await waitGlobalInitialized('Mvu');

    // 共享「手动生成」接口给功法树界面（跨 iframe 调用）
    initializeGlobal('GongfaBranch', { 手动生成 });

    console.info('[功法分支生成脚本] 已加载，等待功法树界面手动触发');
    toastr.success('功法更新脚本已就绪');

    // 监听页面卸载
    $(window).on('pagehide', () => {
      console.info('[功法分支生成脚本] 已卸载');
    });
  })();
});
