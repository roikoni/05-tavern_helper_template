import { defineMvuDataStore } from '@util/mvu';
import { Schema } from './schema';

// 使用 -1（最新楼层）而非 getCurrentMessageId()，确保始终读取最新的变量数据，
// 不受状态栏 iframe 所在具体楼层的限制
export const useDataStore = defineMvuDataStore(Schema, { type: 'message', message_id: -1 });