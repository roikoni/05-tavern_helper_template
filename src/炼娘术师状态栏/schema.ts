// 炼娘术师状态栏 · MVU 变量 schema
// 字段定义见设计文档 docs/superpowers/specs/2026-07-10-炼娘术师状态栏-design.md §2.1

export const Schema = z.object({
  世界: z
    .object({
      当前时间: z.string().prefault(''),
      当前地点: z.string().prefault(''),
    })
    .prefault({}),

  user: z
    .object({
      善恶值: z
        .preprocess(val => (val === null || val === undefined ? 0 : Number(val)), z.number())
        .transform(v => _.clamp(v, -100, 100))
        .prefault(0),
    })
    .prefault({}),

  莉莉安娜: z
    .object({
      外貌身材: z.string().prefault(''),
      内心想法: z.string().prefault(''),
      改造状态: z.string().prefault(''),
    })
    .prefault({}),

  艾琳娜: z
    .object({
      外貌身材: z.string().prefault(''),
      内心想法: z.string().prefault(''),
      改造状态: z.string().prefault(''),
    })
    .prefault({}),

  米璐: z
    .object({
      外貌身材: z.string().prefault(''),
      内心想法: z.string().prefault(''),
      改造状态: z.string().prefault(''),
    })
    .prefault({}),

  菲奥: z
    .object({
      外貌身材: z.string().prefault(''),
      内心想法: z.string().prefault(''),
      改造状态: z.string().prefault(''),
    })
    .prefault({}),
});

export type Schema = z.output<typeof Schema>;
