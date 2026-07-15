const SAVE_KEY_PREFIX = 'tavern_creator_save_';
const SAVE_LIST_KEY = 'tavern_creator_save_list';

export type 存档模式 = '普通' | '自由' | '开挂';

export interface CreatorSave {
  /** 存档名（用户自定义或自动生成） */
  name: string;
  /** 保存时间戳 */
  timestamp: number;
  /** 当前捏角步骤 */
  step: number;
  /** 捏角模式 */
  模式: 存档模式;
  /** 自由模式的点数池（普通模式为 15） */
  点数池?: number;
  /** 自由模式的开局身份（自由填表） */
  开局身份?: string;
  /** 开挂模式的自定义能力（自由填表） */
  自定义能力?: string;
  /** 本源基调：正经/搞笑/涩涩，影响 AI 生成笔调 */
  本源基调?: '正经' | '搞笑' | '涩涩';
  /** 主角完整数据 */
  主角: Record<string, any>;
  /** 已选功法列表 */
  已选功法: string[];
}

/** 获取所有存档列表（按时间倒序） */
export function listSaves(): CreatorSave[] {
  try {
    const raw = localStorage.getItem(SAVE_LIST_KEY);
    if (!raw) return [];
    const ids: string[] = JSON.parse(raw);
    return ids
      .map(id => loadSaveById(id))
      .filter((s): s is CreatorSave => s !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/** 根据 ID 读取单个存档 */
function loadSaveById(id: string): CreatorSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as CreatorSave;
  } catch {
    return null;
  }
}

/** 保存当前捏角进度。name 为空时自动生成。返回存档标识 */
export function saveCreator(data: Omit<CreatorSave, 'name' | 'timestamp'>, name?: string): string {
  const id = name || autoName();
  const save: CreatorSave = {
    ...data,
    name: id,
    timestamp: Date.now(),
  };
  localStorage.setItem(SAVE_KEY_PREFIX + id, JSON.stringify(save));

  // 更新存档列表
  const list = listSaveIds();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(list));
  }
  return id;
}

/** 载入存档。返回存档数据，或 null */
export function loadCreator(name: string): CreatorSave | null {
  return loadSaveById(name);
}

/** 删除存档 */
export function deleteSave(name: string): void {
  localStorage.removeItem(SAVE_KEY_PREFIX + name);
  const list = listSaveIds().filter(id => id !== name);
  localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(list));
}

function listSaveIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVE_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function autoName(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `存档_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}
