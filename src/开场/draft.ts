import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 捏角阶段的临时草稿，不绑定 mvu 变量。
 * 当前用于暂存玩家选择的功法名单——这些功法不直接写入 stat_data.功法，
 * 而是在提交时通过 prompt 交给 AI，由 AI 用 <UpdateVariable> insert 到 /功法/。
 */
export const useDraftStore = defineStore('开场.draft', () => {
  const 已选功法 = ref<string[]>([]);

  function 切换功法(名: string) {
    const i = 已选功法.value.indexOf(名);
    if (i >= 0) 已选功法.value.splice(i, 1);
    else 已选功法.value.push(名);
  }

  function 清空() {
    已选功法.value = [];
  }

  return { 已选功法, 切换功法, 清空 };
});
