import { defineStore } from 'pinia';
import { ref } from 'vue';

export type 捏角模式 = '普通' | '自由' | '开挂';

export const 普通模式点数 = 15;
const 骰子面数 = 101; // 0~100

/**
 * 捏角阶段的临时草稿，不绑定 mvu 变量。
 * - 已选功法：玩家选定的功法名，提交时通过 prompt 交给 AI 由其 insert 到 /初始功法/
 * - 模式 / 点数池：自由模式由 roll 决定预算；普通模式固定 15；开挂模式无限点数
 * - 锁定：自由模式「花费后锁定」——一旦玩家做出任何消耗点数的选择，便不可再 reroll。
 *   开挂模式点数无限，无 roll、无锁定。
 */
export const useDraftStore = defineStore('开场.draft', () => {
  const 已选功法 = ref<string[]>([]);
  const 模式 = ref<捏角模式>('普通');
  const 点数池 = ref<number>(普通模式点数);
  const 锁定 = ref<boolean>(false);
  // 自由模式：开局身份自由填表（纯背景描述，不绑定境界/流派/宗门）
  const 开局身份 = ref<string>('');
  // 开挂模式：自定义能力填表
  const 自定义能力 = ref<string>('');
  // 本源基调：影响 AI 生成自悟功法与开场剧情的笔调。正经/搞笑/涩涩
  const 本源基调 = ref<'正经' | '搞笑' | '涩涩'>('正经');

  function 切换功法(名: string) {
    const i = 已选功法.value.indexOf(名);
    if (i >= 0) 已选功法.value.splice(i, 1);
    else 已选功法.value.push(名);
    标记花费();
  }

  function 清空() {
    已选功法.value = [];
  }

  function 设模式(m: 捏角模式) {
    模式.value = m;
    if (m === '普通') {
      点数池.value = 普通模式点数;
      锁定.value = false;
    }
    // 自由/开挂：点数池由 roll 或无限逻辑自行管理，不在此重置
  }

  /** 任何消耗点数的选择调用此函数以锁定 roll（开挂模式无意义但无害） */
  function 标记花费() {
    if (模式.value === '自由') 锁定.value = true;
  }

  /** 重置点数池与锁定（自由模式专用） */
  function 重置点数() {
    锁定.value = false;
    点数池.value = 普通模式点数;
  }

  /** 重置全部草稿：已选功法、锁定、点数池、开局身份、自定义能力、本源基调 */
  function 重置() {
    已选功法.value = [];
    锁定.value = false;
    点数池.value = 普通模式点数;
    开局身份.value = '';
    自定义能力.value = '';
    本源基调.value = '正经';
  }

  /** 自由模式掷骰：0~100，结果直接成为点数池总量。已花费点数时不可 reroll */
  function roll(): number {
    if (锁定.value) return 点数池.value;
    点数池.value = Math.floor(Math.random() * 骰子面数); // 0~100
    return 点数池.value;
  }

  return {
    已选功法, 模式, 点数池, 锁定, 开局身份, 自定义能力, 本源基调,
    切换功法, 清空, 设模式, 标记花费, 重置点数, 重置, roll,
  };
});
