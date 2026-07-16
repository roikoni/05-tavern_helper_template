import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  主角: z.object({
    名称: z.string().prefault('未命名修士'),
    称号: z.string().prefault('散修'),
    境界: z.string().prefault('炼气期'),
    修为: z.coerce.number().prefault(0),
    修为上限: z.coerce.number().prefault(100),
    气血: z.preprocess(
      val => (val === <user> || val === undefined) ? 100 : Number(val),
      z.number(),
    ).prefault(100),
    // 气血上限 / 法力上限 不再作为变量存储，由六维派生：
    // 气血上限 = 50 + 体魄×10 + 根骨×5；法力上限 = 50 + 灵力×15 + 根骨×5
    法力值: z.preprocess(
      val => (val === <user> || val === undefined) ? 80 : Number(val),
      z.number(),
    ).prefault(80),
    善恶值: z.preprocess(
      val => (val === <user> || val === undefined) ? 0 : Number(val),
      z.number(),
    ).transform(v => _.clamp(v, -100, 100))
    .prefault(0),
    san值: z.preprocess(
      val => (val === <user> || val === undefined) ? 80 : Number(val),
      z.number(),
    ).transform(v => _.clamp(v, 0, 100))
    .prefault(80),
    状态: z.string().prefault('正常'),
    六维: z.object({
      力道: z.preprocess(
        val => (val === <user> || val === undefined) ? 10 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100))
      .prefault(10),
      体魄: z.preprocess(
        val => (val === <user> || val === undefined) ? 10 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100))
      .prefault(10),
      身法: z.preprocess(
        val => (val === <user> || val === undefined) ? 10 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100))
      .prefault(10),
      灵力: z.preprocess(
        val => (val === <user> || val === undefined) ? 10 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100))
      .prefault(10),
      神识: z.preprocess(
        val => (val === <user> || val === undefined) ? 10 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100))
      .prefault(10),
      根骨: z.preprocess(
        val => (val === <user> || val === undefined) ? 10 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100))
      .prefault(10),
    }).prefault({}),
    灵悟值: z.preprocess(
      val => (val === <user> || val === undefined) ? 0 : Number(val),
      z.number(),
    ).prefault(0),
    本源: z.string().prefault('剑'),
    灵根: z.string().prefault('金灵根'),
    灵石: z.preprocess(
      val => (val === <user> || val === undefined) ? 0 : Number(val),
      z.number(),
    ).prefault(0),
    神契装备: z.string().prefault(''),
    装备: z.record(
      z.enum(['武器', '法器', '头盔', '衣袍', '腰带', '靴子', '项链', '戒指', '护腕']),
      z.object({
        名称: z.string().prefault('空置'),
        品阶: z.string().prefault('凡品'),
        描述: z.string().prefault(''),
        属性: z.string().prefault(''),
        属性加成: z.string().prefault(''),
      }).prefault({}),
    ).prefault({}),
    背包: z.record(
      z.string().describe('物品名'),
      z.object({
        描述: z.string().prefault(''),
        数量: z.preprocess(
          val => (val === <user> || val === undefined) ? 1 : Number(val),
          z.number(),
        ).prefault(1),
        类型: z.enum(['丹药', '材料', '功法', '杂物', '灵石', '武器', '法器', '头盔', '衣袍', '腰带', '靴子', '项链', '戒指', '护腕']).prefault('杂物'),
      }).prefault({}),
    ).prefault({}),
    性别: z.string().prefault(''),
    外貌: z.string().prefault(''),
    出身地: z.string().prefault(''),
    宗门: z.string().prefault(''),
    修炼流派: z.string().prefault(''),
  }).prefault({}),

  世界: z.object({
    当前年号: z.string().prefault('太初'),
    当前时间: z.string().prefault('混沌历元年'),
    当前地点: z.string().prefault('未知之地'),
    地图标记: z.record(
      z.string().describe('标记点名'),
      z.object({
        x: z.preprocess(
          val => (val === <user> || val === undefined) ? 50 : Number(val),
          z.number(),
        ).prefault(50),
        y: z.preprocess(
          val => (val === <user> || val === undefined) ? 50 : Number(val),
          z.number(),
        ).prefault(50),
        类型: z.string().prefault('地点'),
        颜色: z.string().prefault('#c9a94e'),
        描述: z.string().prefault(''),
      }).prefault({}),
    ).prefault({}),
    地图区域: z.record(
      z.string().describe('区域名'),
      z.object({
        颜色: z.string().prefault('#c6a664'),
        描述: z.string().prefault(''),
        顶点: z.array(z.object({
          x: z.coerce.number().prefault(0),
          y: z.coerce.number().prefault(0),
        }).prefault({})).prefault([]),
      }).prefault({}),
    ).prefault({}),
  }).prefault({}),

  古神列表: z.record(
    z.string().describe('古神名'),
    z.object({
      神格: z.string().prefault('未知'),
      领域: z.string().prefault('未知'),
      位阶: z.string().prefault('下位神'),
      状态: z.string().prefault('沉睡'),
      信仰: z.string().prefault(''),
      描述: z.string().prefault(''),
      神迹: z.string().prefault(''),
      收服: z.boolean().prefault(false),
      神契技能: z.string().prefault(''),
      神契描述: z.string().prefault(''),
    }).prefault({}),
  ),

  在场: z.record(
    z.string().describe('角色名'),
    z.object({
      气血: z.preprocess(v => (v === <user> || v === undefined) ? 100 : Number(v), z.number()).prefault(100),
      法力值: z.preprocess(v => (v === <user> || v === undefined) ? 80 : Number(v), z.number()).prefault(80),
      善恶值: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).transform(v => _.clamp(v, -100, 100)).prefault(0),
      san值: z.preprocess(v => (v === <user> || v === undefined) ? 80 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(80),
      好感度: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).transform(v => _.clamp(v, -100, 100)).prefault(0),
      洗脑值: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(0),
      内心想法: z.string().prefault(''),
      境界: z.string().prefault('凡人'),
      种族: z.string().prefault('人族'),
      性别: z.string().prefault('未知'),
      势力: z.string().prefault('散修'),
      描述: z.string().prefault(''),
      外貌: z.string().prefault(''),
      关系: z.string().prefault('陌路人'),
      六维: z.object({
        力道: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        体魄: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        身法: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        灵力: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        神识: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        根骨: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
      }).prefault({}),
    }).prefault({}),
  ).prefault({}),

  羁绊: z.record(
    z.string().describe('角色名'),
    z.object({
      气血: z.preprocess(v => (v === <user> || v === undefined) ? 100 : Number(v), z.number()).prefault(100),
      法力值: z.preprocess(v => (v === <user> || v === undefined) ? 80 : Number(v), z.number()).prefault(80),
      善恶值: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).transform(v => _.clamp(v, -100, 100)).prefault(0),
      san值: z.preprocess(v => (v === <user> || v === undefined) ? 80 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(80),
      好感度: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).transform(v => _.clamp(v, -100, 100)).prefault(0),
      洗脑值: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(0),
      内心想法: z.string().prefault(''),
      境界: z.string().prefault('凡人'),
      种族: z.string().prefault('人族'),
      性别: z.string().prefault('未知'),
      势力: z.string().prefault('散修'),
      描述: z.string().prefault(''),
      外貌: z.string().prefault(''),
      关系: z.string().prefault('陌路人'),
      六维: z.object({
        力道: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        体魄: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        身法: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        灵力: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        神识: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
        根骨: z.preprocess(v => (v === <user> || v === undefined) ? 0 : Number(v), z.number()).prefault(0),
      }).prefault({}),
    }).prefault({}),
  ).prefault({}),

  重要人物: z.record(
    z.string().describe('人物名'),
    z.object({
      称号: z.string().prefault(''),
      境界: z.string().prefault('未知'),
      势力: z.string().prefault('散修'),
      好感度: z.preprocess(
          val => (val === <user> || val === undefined) ? 0 : Number(val),
          z.number(),
        ).transform(v => _.clamp(v, -100, 100))
        .prefault(0),
      洗脑值: z.preprocess(
          val => (val === <user> || val === undefined) ? 0 : Number(val),
          z.number(),
        ).transform(v => _.clamp(v, 0, 100))
        .prefault(0),
      描述: z.string().prefault(''),
      外貌: z.string().prefault(''),
      特征: z.string().prefault(''),
      关系: z.string().prefault('中立'),
      所在地: z.string().prefault('未知'),
      攻略: z.boolean().prefault(false),
      // _属性 为只读字段（以 _ 开头），AI 不可通过变量更新命令修改
      _属性: z.object({
        力道: z.preprocess(v => (v === <user> || v === undefined) ? 10 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(10),
        体魄: z.preprocess(v => (v === <user> || v === undefined) ? 10 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(10),
        身法: z.preprocess(v => (v === <user> || v === undefined) ? 10 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(10),
        灵力: z.preprocess(v => (v === <user> || v === undefined) ? 10 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(10),
        神识: z.preprocess(v => (v === <user> || v === undefined) ? 10 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(10),
        根骨: z.preprocess(v => (v === <user> || v === undefined) ? 10 : Number(v), z.number()).transform(v => _.clamp(v, 0, 100)).prefault(10),
      }).prefault({}),
    }).prefault({}),
  ),

  功法: z.record(
    z.string().describe('功法名'),
    z.object({
      类型: z.enum(['主动', '被动']).prefault('被动'),
      层级: z.coerce.number().prefault(1),
      前置功法: z.string().prefault(''),
      效果: z.string().prefault(''),
      属性加成: z.string().prefault(''),
      已学习: z.preprocess(
        val => (val === <user> || val === undefined) ? false : Boolean(val),
        z.boolean(),
      ).prefault(false),
      消耗灵悟: z.coerce.number().prefault(10),
      描述: z.string().prefault(''),
    }).prefault({}),
  ).prefault({}),

  // 开场捏角选定的初始功法，与功法树分离：不参悟、不长进阶分支，只出现在「已学」标签与被动加成中
  初始功法: z.record(
    z.string().describe('功法名'),
    z.object({
      类型: z.enum(['主动', '被动']).prefault('被动'),
      层级: z.coerce.number().prefault(1),
      前置功法: z.string().prefault(''),
      效果: z.string().prefault(''),
      属性加成: z.string().prefault(''),
      已学习: z.preprocess(
        val => (val === <user> || val === undefined) ? true : Boolean(val),
        z.boolean(),
      ).prefault(true),
      消耗灵悟: z.coerce.number().prefault(0),
      描述: z.string().prefault(''),
    }).prefault({}),
  ).prefault({}),

  爱室: z.record(
    z.string().describe('角色名'),
    z.object({
      描述: z.string().prefault(''),
      被击败时间: z.string().prefault(''),
      调教值: z.preprocess(
        val => (val === <user> || val === undefined) ? 0 : Number(val),
        z.number(),
      ).transform(v => _.clamp(v, 0, 100)).prefault(0),
      心理状态: z.string().prefault('未知'),
      性器状态: z.string().prefault('未知'),
      来源: z.enum(['古神', '重要人物']).prefault('重要人物'),
      收入时间: z.string().prefault(''),
    }).prefault({}),
  ),

  $flag: z.object({
    已完成捏角: z.boolean().prefault(false),
    拥有黑之匙: z.boolean().prefault(false),
    开场功法豁免: z.array(z.string()).prefault([]),
  }).prefault({}),
});

$(() => {
  registerMvuSchema(Schema);
})
