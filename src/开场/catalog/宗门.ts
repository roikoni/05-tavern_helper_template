export interface 宗门候选 {
  名称: string;
  阵营: '正道' | '魔道' | '散修';
  区域: string;
  推荐流派: string[];
  简介: string;
  图?: string; // 宗门图片 URL
}

export const 宗门列表: readonly 宗门候选[] = [
  // ── 正道七宗 ──
  { 名称: '太虚剑宗', 阵营: '正道', 区域: '中州', 推荐流派: ['剑修'], 简介: '天下剑修祖庭，以"太虚剑诀"名震修仙界。现任宗主为渡劫后期剑尊', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!F69477E14BACF127868B1C9643254767.jpg' },
  { 名称: '天机阁',   阵营: '正道', 区域: '中州', 推荐流派: ['阵修'], 简介: '精研阵法与推演之术，号称"算尽天机"。收藏修仙界最完整的典籍', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!4C384C89E06F4210329C199BC9A62EB4.jpg' },
  { 名称: '丹霞宗',   阵营: '正道', 区域: '南岭', 推荐流派: ['丹修'], 简介: '炼丹第一宗，垄断高阶丹药炼制法门。与各大宗门均有利益往来', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!8344C3EAB224B1BF496E11EC8F25330F.jpg' },
  { 名称: '万法门',   阵营: '正道', 区域: '中州', 推荐流派: ['法修'], 简介: '法术研究圣地，藏有最多品类功法秘籍。主张"万法归宗"，兼容并蓄', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!716385362DCC4DF68467F16799E19DFB.jpg' },
  { 名称: '碧落宫',   阵营: '正道', 区域: '中州', 推荐流派: ['符修'], 简介: '以医道入世，悬壶济世。掌握最顶尖的疗伤续命之术', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!670FE94C9928D3A008DE78C840679022.jpg' },
  { 名称: '镇岳宗',   阵营: '正道', 区域: '中州', 推荐流派: ['体修'], 简介: '体修正统，以肉身对抗天地。门人数量最少但个个战力惊人', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!DF73A0E9436F5702EA815D3958BD29EF.jpg' },
  { 名称: '玄冰宫',   阵营: '正道', 区域: '北冥', 推荐流派: ['法修'], 简介: '唯一北冥大宗，修炼冰系功法。与世隔绝，神秘低调', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!444BD182B1CC2A273D4BAC33223CA578.jpg' },

  // ── 魔道四宗 ──
  { 名称: '血煞宗',   阵营: '魔道', 区域: '西漠', 推荐流派: ['魔修'], 简介: '以血炼之法快速提升修为，正道公敌。行事残忍但门规森严', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!79A6DBE3226F6C8F151DECA1F985243B.jpg' },
  { 名称: '幽魂谷',   阵营: '魔道', 区域: '西漠', 推荐流派: ['魂修'], 简介: '精通神魂秘术与傀儡炼制，操纵亡者。谷主据说已活了五千年', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!EE5D304F68120DAFEE19CE4EE3CC8F3F.jpg' },
  { 名称: '万象魔宗', 阵营: '魔道', 区域: '西漠', 推荐流派: ['魔修'], 简介: '主张"以魔证道"，认为魔道也是通往大道的路径。行事偏激但不滥杀', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!4F7A3862DF4E3A785A0CFFFC9DDD4FC0.jpg' },
  { 名称: '合欢宗',   阵营: '魔道', 区域: '散落各地', 推荐流派: ['魔修'], 简介: '以双修之法入道，被正魔两道同时鄙夷但无人敢轻视其实力', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!AA6417589FAB12EB8E330EA26BDA8E08.jpg' },

  // ── 散修 ──
  { 名称: '散修', 阵营: '散修', 区域: '各地', 推荐流派: [], 简介: '无门无派，资源匮乏，靠自力更生。', 图: 'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!0C17BD69F3F5F8D9EE9091393CA5D725.jpg' },
] as const;

export function 查宗门(名称: string): 宗门候选 | undefined {
  return 宗门列表.find(s => s.名称 === 名称);
}
