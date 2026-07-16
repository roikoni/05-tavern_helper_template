import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 捏角阶段的临时草稿，不绑定 mvu 变量。
 * 沙盒模式：全功能开放，无限制。
 * - 已选功法：玩家选定的功法名，提交时通过 prompt 交给 AI 由其 insert 到 /初始功法/
 * - 已选神契：玩家选定的古神名，空字符串表示未选择
 */
export const useDraftStore = defineStore('开场.draft', () => {
  const 已选功法 = ref<string[]>([]);
  const 已选神契 = ref<string>('');
  const 开局身份 = ref<string>('');
  const 本源基调 = ref<'正经' | '搞笑' | '涩涩'>('正经');

  function 切换功法(名: string) {
    const i = 已选功法.value.indexOf(名);
    if (i >= 0) 已选功法.value.splice(i, 1);
    else 已选功法.value.push(名);
  }

  function 选神契(名: string) {
    if (已选神契.value === 名) {
      已选神契.value = '';
    } else {
      已选神契.value = 名;
    }
  }

  function 清空() {
    已选功法.value = [];
  }

  function 重置() {
    已选功法.value = [];
    已选神契.value = '';
    开局身份.value = '';
    本源基调.value = '正经';
  }

  return {
    已选功法, 已选神契, 开局身份, 本源基调,
    切换功法, 选神契, 清空, 重置,
  };
});
