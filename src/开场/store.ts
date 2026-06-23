import { defineMvuDataStore } from '@util/mvu';
import { Schema } from '../修仙状态栏/schema';

export const useDataStore = defineMvuDataStore(
  Schema,
  { type: 'message', message_id: getCurrentMessageId() },
);
