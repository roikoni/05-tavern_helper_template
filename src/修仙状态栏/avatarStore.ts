import { useLocalStorage } from '@vueuse/core';
import { computed, type Ref } from 'vue';

// 随卡分发的默认头像（按角色名索引）。用户在状态栏内的覆盖会优先于此表。
const DEFAULT_AVATARS: Record<string, string> = {
  主角: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!C85A7A1F61DB84E87C221D2C20DA7031.png',
  莫尔迦: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E8%8E%AB%E5%B0%94%E8%BF%A6.png',
  维拉: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E7%BB%B4%E6%8B%89.png',
  斯芬克丝: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E6%96%AF%E8%8A%AC%E5%85%8B%E4%B8%9D.png',
  拉维妮亚: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E6%8B%89%E7%BB%B4%E5%A6%AE%E4%BA%9A.png',
  克茜拉: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E5%85%8B%E8%8C%9C%E6%8B%89.png',
  奈亚: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E5%A5%88%E4%BA%9A.png',
  胧: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E8%83%A7.png',
  沈清辞: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E6%B2%88%E6%B8%85%E8%BE%9E.png',
  姜无忧: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E5%A7%9C%E6%97%A0%E5%BF%A72.png',
  顾千卷: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E9%A1%BE%E5%8D%83%E5%8D%B72.png',
  柳不移: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E6%9F%B3%E4%B8%8D%E7%A7%BB2.png',
  萧太薇: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E8%90%A7%E5%A4%AA%E8%96%87.png',
};

const overrides = useLocalStorage<Record<string, string>>('cultivation_bar:avatars', {});

function resolve(name: string): string {
  if (!name) return '';
  return overrides.value[name] ?? DEFAULT_AVATARS[name] ?? '';
}

export function avatarOf(name: string): string {
  return resolve(name);
}

// 是否有随卡分发的默认头像。有默认头像的角色（古神/重要人物）不可自定义；
// 主角虽在默认表内但作为玩家角色始终可自定义，由调用方自行特判。
export function hasDefaultAvatar(name: string): boolean {
  return !!name && Object.prototype.hasOwnProperty.call(DEFAULT_AVATARS, name);
}

export function useAvatar(name: Ref<string> | string | (() => string)) {
  const getter = typeof name === 'string' ? computed(() => name) : typeof name === 'function' ? computed(name) : name;
  return computed(() => resolve(getter.value));
}

export function setAvatar(name: string, url: string): void {
  if (!name) return;
  overrides.value = { ...overrides.value, [name]: url };
}
