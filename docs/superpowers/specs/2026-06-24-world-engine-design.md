# 世界引擎 设计文档

日期：2026-06-24
状态：待审阅

## 目标

为「黑色修士」角色卡构建一个**不围绕主角推进的活世界**：通过酒馆内独立 LLM 调用，动态更新世界势力、重要人物动向、各地区事件、世界事件、暗流涌动。以独立脚本 + 可拖拽悬浮窗形式呈现。

## 已确认决策

| 决策点 | 选择 |
|---|---|
| 独立 api | 酒馆内独立 LLM 调用（`generate`/`generateRaw` + `custom_api`，独立模型） |
| 触发方式 | 手动按钮 + 可选每 N 楼自动 |
| 数据存储 | 聊天变量 `{type:'chat'}`（活世界全聊天单一真相，与主角 stat_data 隔离） |
| 世界对象 | 势力 / 重要人物动向 / 地区事件 / 世界事件 / 暗流涌动 |
| LLM 输入 | 世界状态 + 主线摘要（不读原文） |
| 主线摘要 | 定期预生成，逻辑在世界引擎脚本内部 |
| 产出落地 | 叙述 + 增量变更指令（脚本自解析 patch） |
| 指令解析 | 自定指令 + 自解析（不依赖 MVU parseMessage） |
| 初始状态 | 脚本内置种子数据 |

## 硬性约束（防正文 token 爆炸）

1. **世界推进 / 摘要请求一律用 `generateRaw` + `ordered_prompts`，严禁注入主线 `chat_history`**。主线正文一次都不重发。
2. 每次推进请求大小固定 = 世界状态 JSON + 摘要 + 世界书设定，不随楼层增长。
3. 摘要存聊天变量，不写楼层；摘要字符串上限 1500 字，滚动只保留近 M 轮。
4. 摘要与世界推进都用 `custom_api`（可在悬浮窗设置），与主线模型隔离，互不干扰。

## 数据结构

世界状态存于聊天变量键 `世界引擎`，zod 4 定义：

```ts
世界引擎: {
  世界状态: {
    势力: {
      分类: '正道' | '魔道' | '古神' | '其他',   // 各势力所属阵营
      记录: Record<势力名, {
        分类: '正道' | '魔道' | '古神' | '其他',
        影响范围: number,    // 0~100，饼图按此加权计算各阵营占比
        实力: number,        // 0~100
        态势: string,        // 如「内乱」「扩张」「闭关」
        内部动向: string,
        与主角关系: string,
        描述: string,
      }>,
    },
    人物动向: Record<人物名, {
      称号, 势力, 当前动向, 所在地, 状态, 最近变化,
    }>,
    地区事件: Record<地区名, {
      区域: '中州'|'西漠'|'东荒'|'南岭'|'北冥',
      当前事件, 氛围, 安全度: number, 近期传闻: string[],
    }>,
    世界事件: Array<{ 时间, 事件, 描述, 影响 }>,  // 取代被删的「大事记」
    暗流涌动: Record<暗线名, {
      涉及势力: string[], 成熟度: number,  // 0~100，到阈值爆发为世界事件
      描述, 是否已爆发: boolean,
    }>,
  },
  摘要: { 近期摘要: string, 上次摘要楼层: number },
  上次推进楼层: number,
  配置: {
    自动推进: boolean, 自动推进间隔: number,  // 楼
    摘要间隔: number,                          // 楼
    custom_api: {
      source: 'openai' | string,   // API 源，默认 openai
      apiurl: string,              // API 地址
      key: string,                 // API 密钥
      model: string,               // 模型名（从 getModelList 列表里选）
    } | null,                      // null 则用当前 ST 源
  },
}
```

### API 配置 UI

悬浮窗内设「设置」tab：
- **API 源**：下拉（openai / claude / deepseek / 其他，默认 openai）
- **API 地址**：文本框
- **API 密钥**：密码框
- **获取模型**按钮：填完地址+密钥后点击，调 `getModelList({apiurl, key})`，把返回模型列表填入下方下拉
- **模型**：下拉（来自上一步获取的列表）
- 配置变更实时写回聊天变量 `配置.custom_api`
- 调用推进/摘要时：`配置.custom_api` 非空则用之，为空则 `custom_api` 不传（用当前 ST 源）+ `toastr.info` 提示「未配置独立 API，使用当前酒馆源」

首次运行若聊天变量为空 → 写入种子数据。种子势力从世界书《世界格局》《正魔态势》提炼（太虚剑宗、血煞宗、幽魂谷、万象魔宗、丹霞宗、镇岳宗、散修联盟、大虞皇朝等）。

## 增量变更指令

LLM 经 `generateRaw` + `json_schema` 强制输出：

```json
{
  "叙述": "本时段世界局势演变……",
  "变更指令": [
    { "op": "set",    "path": "势力.太虚剑宗.态势",   "value": "内乱" },
    { "op": "inc",    "path": "暗流涌动.封印松动.成熟度", "value": 15 },
    { "op": "add",    "path": "世界事件", "value": { "时间":"…","事件":"…","描述":"…","影响":"…" } },
    { "op": "remove", "path": "暗流涌动.已爆发暗线" }
  ]
}
```

脚本自解析 `set`/`inc`/`add`/`remove`，用 lodash `_.set`/`_.unset` patch 世界状态。指令经 zod 校验，非法指令跳过并 `console.warn`。

## 组件结构

脚本项目 `src/世界引擎/`：

```
src/世界引擎/
  index.ts          入口：加载初始化、注册按钮、监听楼层事件
  schema.ts         世界状态 zod schema + 种子数据
  store.ts          pinia store，封装聊天变量读写（getVariables/replaceVariables）
  推进.ts            推进世界：调 LLM、解析指令、patch
  摘要.ts            生成主线摘要
  ui/App.vue        悬浮窗主组件（tab：势力/动向/地区/事件/暗流/设置）
  ui/components/*.vue 各 tab 子组件（设置 tab 含 API 配置 + 获取模型）

**势力 tab**：顶部饼图（正道/魔道/古神/其他四色，各阵营 = 该分类下所有势力的「影响范围」之和），下方势力列表卡片（按分类分组，展示实力/态势/内部动向/与主角关系）。饼图用轻量 SVG 手绘或 echarts。
```

悬浮窗：脚本按钮点击 → `createScriptIdIframe()` 挂到酒馆网页 → `teleportStyle(iframe.head)` → `app.mount(iframe.body)`。可拖拽（jqueryui / vueuse）。关闭脚本时 `app.unmount()` + `$app.remove()` + `destroy()`。tailwindcss 样式，与状态栏同一水墨黑暗风格。

## 数据流

**推进流程**：
1. 触发（按钮 / 每自动推进间隔楼）
2. 读聊天变量 `世界状态` + `摘要.近期摘要`
3. `generateRaw`：`custom_api` 用配置模型；`ordered_prompts` 自定义（不含 chat_history）；`injects` 注入 [世界引擎系统提示、世界状态 JSON、主线摘要、世界书设定摘要]；`json_schema` 强制 `{叙述, 变更指令}` 结构
4. zod 校验 → 自解析指令 patch 世界状态
5. 写回聊天变量；悬浮窗若开则刷新
6. 用 `toastr` 提示推进完成 + 叙述摘要

**摘要流程**：
1. 监听 `tavern_events.MESSAGE_RECEIVED`
2. `当前楼层 - 上次摘要楼层 ≥ 摘要间隔` 时触发
3. `getChatMessages` 取新楼层原文
4. `generateRaw` 压缩成 ≤1500 字；与旧摘要合并后再压缩/截断保上限
5. 写回 `摘要.近期摘要` + `上次摘要楼层`

**并发控制**：推进/摘要各设进行中标志位锁，防止重复触发。

## 错误处理

- LLM 调用失败：`console.error` + `toastr.error`，世界状态不动
- `json_schema` 输出仍解析失败：`try/catch`，保留旧状态，`console.warn`
- 非法变更指令：zod 纠错（prefault），跳过该条，`console.warn`
- `custom_api` 未配置：回退当前 ST 源，`toastr.info` 提示

## 测试

脚本运行在 iframe，无单测；靠 chrome-devtools 连酒馆实测：
1. 首次加载 → 聊天变量写入种子数据
2. 手动点「推进世界」→ 世界状态变化、悬浮窗刷新、toastr 提示
3. 手动加楼层达摘要间隔 → 摘要生成
4. 悬浮窗各 tab 展示正确、可拖拽、可关闭
5. 关闭脚本 → 悬浮窗与样式卸载干净

## 范围外（YAGNI）

- 不做世界状态的版本历史/回滚
- 不做世界事件的手动编辑（仅展示 + LLM 推进）
- 不接入状态栏（独立脚本，未来可加跳转）
- 不做暗流涌动的可视化时间轴（仅列表 + 成熟度条）
