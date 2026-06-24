// 世界引擎 · pinia store
// 封装聊天变量 {type:'chat'} 下「世界引擎」键的读写。
// 全聊天单一真相：读取时用 schema 解析兜底，写入时 klona 去 proxy。

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 世界引擎Schema, 种子世界状态, type 世界引擎 } from './schema';
import { 生成世界氛围 } from './氛围';

const 变量键 = '世界引擎';

// 读取聊天变量里的世界引擎数据；不存在则用种子初始化并写回
function 读取世界引擎(): 世界引擎 {
  const variables = getVariables({ type: 'chat' });
  const raw = _.get(variables, 变量键);
  let engine: 世界引擎;
  if (!raw) {
    engine = 世界引擎Schema.parse({ 世界状态: 种子世界状态 });
    _.set(variables, 变量键, klona(engine));
    replaceVariables(variables, { type: 'chat' });
    console.info('[世界引擎] 首次初始化，写入种子数据');
  } else {
    engine = 世界引擎Schema.parse(raw);
  }
  // 旧数据或刚播种时 世界氛围 为空，按当前状态派生（下次 persist 落盘）
  if (!engine.世界氛围) engine.世界氛围 = 生成世界氛围(engine.世界状态);
  return engine;
}

export const useWorldEngineStore = defineStore('world-engine', () => {
  const data = ref<世界引擎>(读取世界引擎());

  // 写回聊天变量（去 proxy）
  function persist() {
    const variables = getVariables({ type: 'chat' });
    _.set(variables, 变量键, klona(data.value));
    replaceVariables(variables, { type: 'chat' });
  }

  // 重新从聊天变量拉取最新（推进/摘要后或外部变更时调用）
  function refresh() {
    data.value = 读取世界引擎();
  }

  // 直接更新整体数据并持久化
  function commit(next: 世界引擎) {
    data.value = next;
    persist();
  }

  return { data, persist, refresh, commit };
});
