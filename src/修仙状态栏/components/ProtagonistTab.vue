<template>
  <div class="page-root">
    <div class="bg-glow"></div>

    <!-- ===== 头像编辑独立页面 ===== -->
    <div v-if="avatarEdit" class="avatar-page">
      <button class="avatar-page-back" @click="cancelAvatarEdit">
        <i class="fa-solid fa-chevron-left"></i> 返回
      </button>

      <!-- 顶部：现有头像演示 -->
      <div class="avatar-page-preview">
        <div class="portrait-frame large" @mouseenter="avHover = true" @mouseleave="avHover = false">
          <div class="portrait-outer"></div>
          <div class="portrait-dash"></div>
          <div class="portrait-inner">
            <div class="portrait-gradient"></div>
            <img v-if="avUrl" :src="avUrl" class="portrait-img" @error="avUrl = ''" />
            <i v-else class="fa-solid fa-user portrait-icon"></i>
          </div>
        </div>
        <p class="avatar-page-hint">{{ avUrl ? '预览效果（未保存）' : '尚未设置头像' }}</p>
      </div>

      <!-- 下方：链接输入 -->
      <div class="avatar-page-section">
        <div class="avatar-page-label">图片链接</div>
        <input
          v-model="avUrl"
          class="avatar-page-input"
          :class="{ 'has-error': !!avUrlError }"
          placeholder="粘贴 http(s) 图片链接..."
          @input="avUrlError = ''"
        />
        <p v-if="avUrlError" class="avatar-page-error">{{ avUrlError }}</p>
      </div>

      <!-- 分隔 -->
      <div class="avatar-page-or"><span>或</span></div>

      <!-- 本地图片 -->
      <div class="avatar-page-section">
        <div class="avatar-page-label">本地图片</div>
        <label class="avatar-page-file">
          <i class="fa-solid fa-folder-open"></i> 选择本地图片
          <input type="file" accept="image/*" hidden @change="onAvFile" />
        </label>
        <p class="avatar-page-note">本地图片会以 base64 形式保存在浏览器内，不会进入游戏变量。</p>
      </div>

      <!-- 底部操作 -->
      <div class="avatar-page-actions">
        <button class="avatar-page-btn cancel" @click="cancelAvatarEdit">取消</button>
        <button class="avatar-page-btn confirm" @click="confirmAvatar" :disabled="!avUrl">保存头像</button>
      </div>
    </div>

    <!-- ===== 主页面 ===== -->
    <template v-else>
    <div class="left-col">
      <div class="col-sep"></div>

      <!-- 头像框 -->
      <div class="avatar-section">
        <div class="portrait-frame" @click="startAvEdit" @mouseenter="avHover = true" @mouseleave="avHover = false">
          <div class="portrait-outer"></div>
          <div class="portrait-dash"></div>
          <div class="portrait-inner">
            <div class="portrait-gradient"></div>
            <img v-if="avatarUrl" :src="avatarUrl" class="portrait-img" />
            <i v-else class="fa-solid fa-user portrait-icon"></i>
            <div v-if="avHover" class="portrait-badge">{{ avatarUrl ? '点击换装' : '点击添像' }}</div>
          </div>
          <div v-if="avHover" class="portrait-edit-btn"><i class="fa-solid fa-pen"></i></div>
        </div>
        <h2 class="protag-name">{{ store.data.主角.名称 }}</h2>
        <p class="protag-title">{{ store.data.主角.称号 }}</p>
        <p class="protag-sect">{{ store.data.主角.宗门 }}</p>
        <div class="cultivation-card">
          <div class="cultivation-header">
            <span class="cultivation-realm">{{ store.data.主角.境界 }}</span>
            <span class="cultivation-value"
              >{{ cultivationDisplay }}<span class="cultivation-sep">/</span>{{ store.data.主角.修为上限 }}</span
            >
          </div>
          <div class="cultivation-track">
            <div class="cultivation-fill" :style="{ width: cultivationPercent + '%' }"></div>
          </div>
        </div>
        <p class="protag-status" :class="getStatusClass(store.data.主角.状态)">{{ store.data.主角.状态 }}</p>
      </div>

      <!-- 雷达图 -->
      <div class="radar-section">
        <RadarChart :values="radarValues" :max-value="100" />
      </div>

      <!-- 神契效果 -->
      <div v-if="shenqiBonusDisplay.length" class="shenqi-bonus-section">
        <i class="fa-solid fa-hand-sparkles shenqi-icon"></i>
        <span class="shenqi-desc">{{ shenqiBonusDisplay.join(' ') }}</span>
      </div>
    </div>

    <!-- 右栏：属性 + 装备 + 背包 -->
    <div class="right-col">
      <!-- 属性条 2×2 -->
      <div class="stats-grid">
        <StatBars type="stat" label="气血" :value="store.data.主角.气血" :max="store.data.主角.气血上限" color="hp" />
        <StatBars
          type="stat"
          label="法力值"
          :value="store.data.主角.法力值"
          :max="store.data.主角.法力上限"
          color="mp"
        />
        <StatBars type="karma" :value="store.data.主角.善恶值" />
        <StatBars type="stat" label="SAN值" :value="store.data.主角.san值" :max="100" color="san" />
      </div>

      <!-- 装备区 -->
      <div class="equip-section">
        <h3 class="section-head">
          <span class="head-bar"></span> 傍身之物
          <div class="head-line"></div>
        </h3>

        <div class="equip-wrapper">
          <!-- 神契槽：装备栏左侧，带微弱红色光效 -->
          <div
            class="shenqi-slot"
            @click="
              openShenqiModal = true;
              $event.stopPropagation();
            "
          >
            <div
              class="sq-icon-wrap"
              :class="{ empty: !store.data.主角.神契装备 }"
              :key="'sq-' + (store.data.主角.神契装备 || 'empty')"
            >
              <i class="fa-solid fa-hand-sparkles sq-icon"></i>
              <span v-if="store.data.主角.神契装备" class="sq-badge"><i class="fa-solid fa-circle"></i></span>
            </div>
            <span class="sq-label">神契</span>
            <span v-if="store.data.主角.神契装备" class="sq-name">{{ store.data.主角.神契装备 }}</span>
            <span v-else class="sq-empty">未结契</span>
          </div>

          <div class="equip-grid">
            <div
              v-for="slot in EQUIP_SLOTS"
              :key="slot"
              class="equip-slot"
              :class="{ empty: !getEquipItem(slot) || getEquipItem(slot)!.名称 === '空置' }"
            >
              <div
                class="slot-icon-wrap"
                :key="'eq-' + slot + '-' + (getEquipItem(slot)?.名称 || 'empty')"
                @click="
                  !getEquipItem(slot) || getEquipItem(slot)!.名称 === '空置'
                    ? openEquipSlot(slot)
                    : openItemDetail(getEquipItem(slot)!.名称, getEquipItem(slot)!, '装备', slot)
                "
              >
                <i :class="[slotIcon(slot), 'slot-icon']"></i>
                <span v-if="getEquipItem(slot) && getEquipItem(slot)!.名称 !== '空置'" class="slot-badge"
                  ><i class="fa-solid fa-circle"></i
                ></span>
              </div>
              <span class="slot-label">{{ slot }}</span>
              <span v-if="getEquipItem(slot) && getEquipItem(slot)!.名称 !== '空置'" class="slot-name">{{
                getEquipItem(slot)!.名称
              }}</span>
            </div>
          </div>
        </div>

        <button class="bag-btn" @click="inventoryOpen = true">探察袖里乾坤</button>

        <!-- 灵石 -->
        <div class="currency-row">
          <div class="currency-icon">◆</div>
          <span class="currency-label">灵石</span>
          <span class="currency-value">{{ store.data.主角.灵石 }}</span>
        </div>
      </div>
    </div>

    <!-- 背包弹窗 -->
    <div v-if="inventoryOpen" class="inv-overlay" @click.self="inventoryOpen = false">
      <div class="inv-modal">
        <button class="inv-modal-close" aria-label="关闭背包" @click="inventoryOpen = false">&times;</button>
        <div class="inv-modal-header">
          <i class="fa-solid fa-box-open inv-modal-icon"></i>
          <span>储物袋</span>
          <span class="inv-modal-count">{{ invCount }} 件</span>
        </div>
        <div class="inv-modal-body">
          <div v-if="!_.isEmpty(store.data.主角.背包)" class="inv-grid">
            <div
              v-for="(item, name) in store.data.主角.背包"
              :key="name"
              class="inv-item"
              :class="'t-' + (item.类型 || '杂物')"
              @click="openItemDetail(name, item, '物品')"
            >
              <i :class="[invIcon(item.类型), 'inv-item-icon']"></i>
              <span class="inv-item-name">{{ name }}</span>
              <span class="inv-item-qty">×{{ item.数量 }}</span>
            </div>
          </div>
          <div v-else class="inv-empty">
            <i class="fa-solid fa-feather-pointed inv-empty-icon"></i>
            <span>乾坤袋中空空如也</span>
            <span class="inv-empty-sub">出门历练，方能满载而归</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 装备选择弹窗 -->
    <div v-if="activeEquipSlot" class="equip-modal-overlay" @click.self="activeEquipSlot = null">
      <div class="equip-modal">
        <button class="equip-modal-close" aria-label="关闭装备选择" @click="activeEquipSlot = null">&times;</button>
        <div class="equip-modal-header">
          <i class="fa-solid fa-shield-halved equip-modal-icon"></i>
          <span>{{ activeEquipSlot }}</span>
        </div>
        <div class="equip-modal-body">
          <!-- 卸载按钮 -->
          <div class="equip-modal-row" @click="unequipSlot()">
            <span class="equip-modal-unequip">卸下装备</span>
          </div>
          <!-- 可装备物品列表 -->
          <div
            v-for="(item, name) in equippableItems"
            :key="name"
            class="equip-modal-row"
            :class="{ equipped: isEquipped(name) }"
            @click="equipItem(name, item)"
          >
            <div class="equip-modal-item-name">{{ name }}</div>
            <div class="equip-modal-item-desc">{{ item.描述 }}</div>
            <span v-if="isEquipped(name)" class="equip-modal-badge">已装备</span>
          </div>
          <div v-if="_.isEmpty(equippableItems)" class="equip-modal-empty">乾坤袋中无可装备之物</div>
        </div>
      </div>
    </div>

    <!-- 物品/装备详情弹窗 -->
    <div v-if="itemDetailVisible" class="item-detail-overlay" @click.self="itemDetailVisible = false">
      <div class="item-detail-modal">
        <button class="item-detail-close" aria-label="关闭详情" @click="itemDetailVisible = false">&times;</button>
        <div class="item-detail-header">
          <i
            :class="[detailIcon, 'item-detail-header-icon']"
          ></i>
          <span class="item-detail-title">{{ itemDetailName }}</span>
          <span v-if="itemDetailType === '装备'" class="item-detail-badge">已装备</span>
        </div>
        <div class="item-detail-body">
          <div class="id-row" v-if="detailEquip && detailEquip.名称 !== '空置'">
            <span class="id-lbl">品阶</span><span class="id-val id-rank">{{ detailEquip.品阶 }}</span>
          </div>
          <div class="id-row" v-if="detailInv">
            <span class="id-lbl">类型</span><span class="id-val">{{ detailInv.类型 }}</span>
          </div>
          <div class="id-row" v-if="detailInv">
            <span class="id-lbl">数量</span><span class="id-val id-qty">×{{ detailInv.数量 }}</span>
          </div>
          <div class="id-block" v-if="detailEquip && detailEquip.属性">
            <div class="id-block-title">战斗属性</div>
            <pre class="id-attrs">{{ detailEquip.属性 }}</pre>
          </div>
          <div class="id-block" v-if="detailDesc">
            <div class="id-block-title">描述</div>
            <p>{{ detailDesc }}</p>
          </div>
          <div v-if="itemDetailType === '装备'" class="id-actions">
            <button v-if="detailEquip && detailEquip.名称 !== '空置'" class="id-btn id-btn-unequip" @click="unequipFromDetail()">
              卸下装备
            </button>
            <button class="id-btn id-btn-equip" @click="equipFromDetail()">更换装备</button>
          </div>
          <div v-if="!detailDesc && itemDetailType !== '装备'" class="id-empty">暂无详细记载</div>
        </div>
      </div>
    </div>

    <!-- 神契选择弹窗 -->
    <div v-if="openShenqiModal" class="sq-overlay" @click.self="openShenqiModal = false">
      <div class="sq-modal">
        <button class="sq-modal-close" aria-label="关闭神契选择" @click="openShenqiModal = false">&times;</button>
        <div class="sq-modal-header">
          <i class="fa-solid fa-hand-sparkles sq-modal-icon"></i>
          <span>神契装备</span>
          <span class="sq-modal-count">{{ subduedGods.length }} 可用</span>
        </div>
        <div class="sq-modal-body">
          <div v-if="store.data.主角.神契装备" class="sq-modal-row" @click="unequipShenqi()">
            <span class="sq-unequip">卸下神契</span>
          </div>
          <div
            v-for="god in subduedGods"
            :key="god.name"
            class="sq-modal-row"
            :class="{ equipped: store.data.主角.神契装备 === god.name }"
            @click="equipShenqi(god.name)"
          >
            <i :class="[godIcon(god.name), 'sq-god-icon']"></i>
            <div class="sq-god-info">
              <span class="sq-god-name">{{ god.name }}</span>
              <span class="sq-god-skill">{{ god.data.神契技能 }}</span>
            </div>
            <span v-if="store.data.主角.神契装备 === god.name" class="sq-equipped-badge">已装备</span>
          </div>
          <div v-if="subduedGods.length === 0" class="sq-empty-msg">尚未收服任何古神，无神契可用</div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import { useAvatar, setAvatar } from '../avatarStore';
import type { Schema } from '../schema';
import RadarChart from './RadarChart.vue';
import StatBars from './StatBars.vue';

type EquipSlot = '武器' | '法器' | '头盔' | '衣袍' | '腰带' | '靴子' | '项链' | '戒指' | '护腕';
type EquipItem = Schema['主角']['装备'][EquipSlot];
type InvItem = Schema['主角']['背包'][string];
type DetailData = EquipItem | InvItem;

const EQUIP_SLOTS: EquipSlot[] = ['武器', '法器', '头盔', '衣袍', '腰带', '靴子', '项链', '戒指', '护腕'];

const store = useDataStore();
const avatarUrl = useAvatar('主角');
const inventoryOpen = ref(false);
const activeEquipSlot = ref<EquipSlot | null>(null);
const itemDetailVisible = ref(false);
const itemDetailName = ref('');
const itemDetailData = ref<DetailData | null>(null);
const itemDetailType = ref<'装备' | '物品'>('物品');
const itemDetailSlot = ref<EquipSlot | ''>('');
const openShenqiModal = ref(false);
const avatarEdit = ref(false);
const avHover = ref(false);
const avUrl = ref('');
const avUrlError = ref('');

function startAvEdit() {
  avatarEdit.value = true;
  avUrl.value = avatarUrl.value || '';
}
function isValidImageSource(url: string): boolean {
  if (!url) return false;
  // base64 data URL
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml|bmp);base64,/i.test(url)) return true;
  // http(s) 链接，附扩展名校验放宽：仅要求是合法 URL
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function confirmAvatar() {
  const url = avUrl.value.trim();
  if (!isValidImageSource(url)) {
    avUrlError.value = '链接无效，请使用 http(s) 图片链接或本地图片';
    return;
  }
  setAvatar('主角', url);
  avatarEdit.value = false;
  avUrlError.value = '';
}
function cancelAvatarEdit() {
  avatarEdit.value = false;
  avUrl.value = '';
  avUrlError.value = '';
}
function onAvFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    avUrl.value = r.result as string;
  };
  r.readAsDataURL(f);
}

// ── 装备属性加成解析 ──
// 装备的「属性」字段是纯文本（如 "力道+5，身法+3"），从这里提取数值加成
function parseEquipBonus(attrs: string): Record<string, number> {
  const bonus: Record<string, number> = {};
  if (!attrs) return bonus;
  // 匹配 "属性名+数字" 或 "属性名-数字"
  const re = /([一-龥]+)\s*([+-]\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs)) !== null) {
    bonus[m[1]] = (bonus[m[1]] || 0) + Number(m[2]);
  }
  return bonus;
}

// 所有已装备物品的属性加成汇总
// 优先读取 属性加成 字段，若为空则从 属性 字段解析
const equipBonus = computed(() => {
  const bonus: Record<string, number> = {};
  const eq = store.data.主角.装备;
  if (!eq) return bonus;
  for (const item of Object.values(eq)) {
    const attrText: string = item?.属性加成 || item?.属性 || '';
    if (!attrText) continue;
    const b = parseEquipBonus(attrText);
    for (const [k, v] of Object.entries(b)) {
      bonus[k] = (bonus[k] || 0) + v;
    }
  }
  return bonus;
});

// ── 功法加成 ──
// 已学被动功法提供属性加成；优先读取 属性加成 字段，若为空则从 效果 文本解析
// 初始功法（恒已学）与功法树中已学被动一并计入
const techBonus = computed(() => {
  const bonus: Record<string, number> = {};
  const initial = store.data.初始功法 ?? {};
  const tree = store.data.功法 ?? {};
  const all = { ...initial, ...tree };
  for (const t of Object.values(all)) {
    if (!t.已学习 || t.类型 !== '被动') continue;
    // 优先读取 属性加成 字段，其次从 效果 文本解析
    const attrText: string = t.属性加成 || t.效果 || '';
    const b = parseEquipBonus(attrText);
    for (const [k, v] of Object.entries(b)) {
      bonus[k] = (bonus[k] || 0) + v;
    }
  }
  return bonus;
});

const radarValues = computed(() => {
  const b = store.data.主角.六维;
  const sq = shenqiBonus.value;
  const eq = equipBonus.value;
  const tech = techBonus.value;
  return [
    b.力道 + (eq.力道 || 0) + (tech.力道 || 0) + (sq.力道 || 0),
    b.体魄 + (eq.体魄 || 0) + (tech.体魄 || 0) + (sq.体魄 || 0),
    b.身法 + (eq.身法 || 0) + (tech.身法 || 0) + (sq.身法 || 0),
    b.灵力 + (eq.灵力 || 0) + (tech.灵力 || 0) + (sq.灵力 || 0),
    b.神识 + (eq.神识 || 0) + (tech.神识 || 0) + (sq.神识 || 0),
    b.根骨 + (eq.根骨 || 0) + (tech.根骨 || 0) + (sq.根骨 || 0),
  ];
});

const invCount = computed(() => Object.keys(store.data.主角.背包).length);

const cultivationPercent = computed(() => {
  const max = store.data.主角.修为上限 || 100;
  if (max <= 0) return 0;
  return Math.min(100, Math.round((store.data.主角.修为 / max) * 100));
});

// 显示用修为：超过上限时按上限封顶，避免视觉错位
const cultivationDisplay = computed(() =>
  Math.min(store.data.主角.修为, store.data.主角.修为上限),
);

const subduedGods = computed(() =>
  _(store.data.古神列表)
    .entries()
    .filter(([, god]) => god.收服)
    .map(([name, data]) => ({ name, data }))
    .value(),
);

const equippedGod = computed(() => {
  const name = store.data.主角.神契装备;
  if (!name) return null;
  return subduedGods.value.find(g => g.name === name) ?? null;
});

// 神契 bonus 解析：从 神契描述 中提取被动加值（如 "被动·身法+10"）
const shenqiBonus = computed<Record<string, number>>(() => {
  const g = equippedGod.value;
  if (!g) return {};
  const desc = g.data.神契描述 || '';
  return parseEquipBonus(desc);
});

const shenqiBonusDisplay = computed(() => {
  const g = equippedGod.value;
  if (!g) return [] as string[];
  const desc = g.data.神契描述;
  if (!desc) return g.data.神契技能 ? [g.data.神契技能] : [];
  // 提取被动行
  const lines = desc
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l.startsWith('被动'));
  return lines;
});

function equipShenqi(name: string) {
  store.data.主角.神契装备 = name;
  openShenqiModal.value = false;
}
function unequipShenqi() {
  store.data.主角.神契装备 = '';
  openShenqiModal.value = false;
}

const godIcons: Record<string, string> = {
  莫尔迦: 'fa-solid fa-crown',
  维拉: 'fa-solid fa-champagne-glasses',
  斯芬克丝: 'fa-solid fa-ghost',
  拉维妮亚: 'fa-solid fa-heart-circle-bolt',
  克茜拉: 'fa-solid fa-water',
  奈亚: 'fa-solid fa-mask',
  胧: 'fa-solid fa-feather-pointed',
};
function godIcon(name: string): string {
  return godIcons[name] || 'fa-solid fa-star';
}

function getEquipItem(slot: EquipSlot): EquipItem | null {
  const eq = store.data.主角.装备;
  if (!eq) return null;
  return eq[slot] || null;
}

// 槽位→允许的背包物品类型映射
// 筛选当前槽位可装备的物品（每个槽位只接受同名类型，法器槽额外汇总功法）
const equippableItems = computed(() => {
  if (!activeEquipSlot.value) return {};
  const slot = activeEquipSlot.value;
  return _.pickBy(store.data.主角.背包, item => {
    if (item.类型 === slot) return true;
    if (slot === '法器' && item.类型 === '功法') return true;
    return false;
  });
});

// 点击装备槽打开选择面板
function openEquipSlot(slot: EquipSlot) {
  activeEquipSlot.value = slot;
}

// 装备物品（从背包移到装备栏）
function equipItem(itemName: string, itemData: InvItem) {
  const slot = activeEquipSlot.value;
  if (!slot) return;
  if (!store.data.主角.装备) {
    store.data.主角.装备 = {} as Schema['主角']['装备'];
  }
  // 先卸下当前槽位的装备（放回背包）
  const cur = store.data.主角.装备[slot];
  if (cur && cur.名称 !== '空置') {
    if (!store.data.主角.背包) store.data.主角.背包 = {};
    store.data.主角.背包[cur.名称] = {
      描述: cur.描述 || '',
      数量: 1,
      类型: slot,
    };
  }
  // 装备新物品
  store.data.主角.装备[slot] = {
    名称: itemName,
    品阶: ('品阶' in itemData ? (itemData as { 品阶?: string }).品阶 : undefined) || '凡品',
    描述: itemData.描述 || '',
    属性: ('属性' in itemData ? (itemData as { 属性?: string }).属性 : undefined) || '',
    属性加成: ('属性加成' in itemData ? (itemData as { 属性加成?: string }).属性加成 : undefined) || '',
  };
  // 从背包移除（pinia响应式兼容）
  store.data.主角.背包 = _.omit(store.data.主角.背包, itemName) as Schema['主角']['背包'];
  activeEquipSlot.value = null;
}

// 卸载装备（放回背包）
function unequipSlot() {
  const slot = activeEquipSlot.value;
  if (!slot) return;
  const eq = store.data.主角.装备;
  if (eq && eq[slot] && eq[slot].名称 !== '空置') {
    const item = eq[slot];
    if (!store.data.主角.背包) store.data.主角.背包 = {};
    store.data.主角.背包[item.名称] = {
      描述: item.描述 || '',
      数量: 1,
      类型: slot,
    };
    eq[slot] = { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '', 属性加成: '' };
  }
  activeEquipSlot.value = null;
}

// 判定某物品是否已装备
const slotIcons: Record<string, string> = {
  武器: 'fa-solid fa-gavel',
  法器: 'fa-solid fa-gem',
  头盔: 'fa-solid fa-chess-rook',
  衣袍: 'fa-solid fa-vest',
  腰带: 'fa-solid fa-grip-lines',
  靴子: 'fa-solid fa-shoe-prints',
  项链: 'fa-solid fa-circle-notch',
  戒指: 'fa-solid fa-ring',
  护腕: 'fa-solid fa-hand-back-fist',
};
function slotIcon(s: string): string {
  return slotIcons[s] || 'fa-solid fa-circle';
}
function openItemDetail(name: string, data: DetailData, type: '装备' | '物品', slot?: EquipSlot) {
  itemDetailName.value = name;
  itemDetailData.value = data;
  itemDetailType.value = type;
  itemDetailSlot.value = slot || '';
  itemDetailVisible.value = true;
}

// 详情面板取值小帮手：依据当前 type 判定，安全访问联合类型字段
const detailEquip = computed<EquipItem | null>(() =>
  itemDetailType.value === '装备' && itemDetailData.value
    ? (itemDetailData.value as EquipItem)
    : null,
);
const detailInv = computed<InvItem | null>(() =>
  itemDetailType.value === '物品' && itemDetailData.value
    ? (itemDetailData.value as InvItem)
    : null,
);
const detailIcon = computed(() =>
  itemDetailType.value === '装备'
    ? slotIcon(itemDetailName.value)
    : invIcon(detailInv.value?.类型 || '杂物'),
);
const detailDesc = computed(() => itemDetailData.value?.描述 || '');
function unequipFromDetail() {
  if (!itemDetailSlot.value) return;
  unequipSlotByName(itemDetailSlot.value);
  itemDetailVisible.value = false;
}
function equipFromDetail() {
  if (!itemDetailSlot.value) return;
  itemDetailVisible.value = false;
  openEquipSlot(itemDetailSlot.value);
}
function unequipSlotByName(slot: EquipSlot) {
  const eq = store.data.主角.装备;
  if (eq && eq[slot] && eq[slot].名称 !== '空置') {
    const item = eq[slot];
    if (!store.data.主角.背包) store.data.主角.背包 = {};
    store.data.主角.背包[item.名称] = {
      描述: item.描述 || '',
      数量: 1,
      类型: slot,
    };
    eq[slot] = { 名称: '空置', 品阶: '凡品', 描述: '', 属性: '', 属性加成: '' };
  }
}

const invIcons: Record<string, string> = {
  丹药: 'fa-solid fa-flask',
  材料: 'fa-solid fa-leaf',
  功法: 'fa-solid fa-scroll',
  杂物: 'fa-solid fa-box',
  灵石: 'fa-solid fa-coins',
  武器: 'fa-solid fa-gavel',
  法器: 'fa-solid fa-gem',
  头盔: 'fa-solid fa-chess-rook',
  衣袍: 'fa-solid fa-vest',
  腰带: 'fa-solid fa-grip-lines',
  靴子: 'fa-solid fa-shoe-prints',
  项链: 'fa-solid fa-circle-notch',
  戒指: 'fa-solid fa-ring',
  护腕: 'fa-solid fa-hand-back-fist',
};
function invIcon(t: string): string {
  return invIcons[t] || 'fa-solid fa-box';
}

function getStatusClass(s: string): string {
  if (!s || s === '正常') return '';
  if (s.includes('伤') || s.includes('濒死')) return 'status-danger';
  if (s.includes('毒') || s.includes('混乱') || s.includes('疯狂')) return 'status-warn';
  if (s.includes('疲') || s.includes('恍惚')) return 'status-tired';
  return '';
}
function isEquipped(itemName: string): boolean {
  if (!store.data.主角.装备 || !activeEquipSlot.value) return false;
  const cur = store.data.主角.装备[activeEquipSlot.value];
  return cur?.名称 !== '空置' && cur?.名称 === itemName;
}
</script>

<style lang="scss" scoped>
.page-root {
  display: flex;
  height: 100%;
  position: relative;
}

.bg-glow {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 300px;
  height: 300px;
  background: rgba(207, 200, 184, 0.05);
  border-radius: 50%;
  filter: blur(100px);
  pointer-events: none;
}

/* ===== 左栏 ===== */
.left-col {
  width: 38%;
  padding: 28px;
  border-right: 1px solid rgba(180, 180, 190, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 10;
  overflow-y: auto;
  overflow-x: hidden;
}

.col-sep {
  position: absolute;
  right: 0;
  top: 15%;
  bottom: 15%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, var(--c-border), transparent);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

/* 头像框 — 参考竖长方形肖像风格 */
.portrait-frame {
  position: relative;
  width: 140px;
  height: 140px;
  padding: 6px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.5s;

  &:hover {
    transform: translateY(-3px);
  }
}

.portrait-outer {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(92, 92, 92, 0.3);
}

.portrait-dash {
  position: absolute;
  inset: 4px;
  border: 1px dashed rgba(92, 92, 92, 0.2);
}

.portrait-inner {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid var(--c-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.portrait-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8));
  z-index: 0;
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 5;
}

.portrait-icon {
  font-size: 3.5rem;
  color: rgba(92, 92, 92, 0.2);
  position: relative;
  z-index: 10;
}

.portrait-badge {
  position: absolute;
  bottom: 8px;
  border: 1px solid rgba(92, 92, 92, 0.3);
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
  padding: 2px 12px;
  color: var(--c-text-dim);
  font-size: 0.6rem;
  font-family: var(--font-ui);
  letter-spacing: 0.3em;
  z-index: 10;
}

.protag-name {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--c-text);
  letter-spacing: 0.18em;
}

.portrait-edit-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 25;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #cfc8b8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cfc8b8;
  font-size: 0.55rem;
}

.protag-title {
  color: var(--c-text-dim);
  margin-top: 6px;
  letter-spacing: 0.3em;
  font-size: 0.78rem;
  opacity: 0.8;
}

.protag-sect {
  color: var(--c-stamp);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  margin-top: 2px;
  opacity: 0.75;
}

.protag-realm {
  color: var(--c-gold);
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  margin-top: 2px;
}

/* ===== 修为进度卡 ===== */
.cultivation-card {
  width: 100%;
  max-width: 200px;
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid rgba(207, 200, 184, 0.16);
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.35);
}

.cultivation-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 5px;
}

.cultivation-realm {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--c-gold);
  letter-spacing: 0.15em;
  font-family: var(--font-brush);
}

.cultivation-value {
  font-size: 0.6rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  letter-spacing: 0.06em;
}

.cultivation-sep {
  opacity: 0.4;
  margin: 0 1px;
}

.cultivation-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-pill);
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6);
}

.cultivation-fill {
  height: 100%;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, rgba(168, 51, 51, 0.7), var(--c-accent-bright), rgba(212, 184, 122, 0.9));
  box-shadow:
    0 0 6px rgba(168, 51, 51, 0.5),
    0 0 12px rgba(207, 200, 184, 0.25);
  transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  min-width: 0;
}

.protag-status {
  font-size: 0.72rem;
  font-family: var(--font-serif);
  letter-spacing: 0.15em;
  margin-top: 4px;
  padding: 2px 10px;
  border: 1px solid rgba(92, 92, 92, 0.3);
  display: inline-block;
  border-radius: 2px;
  font-family: var(--font-ui);
  color: var(--c-text-dim);
  transition: all 0.3s;

  &.status-danger {
    color: var(--c-hp);
    border-color: rgba(155, 34, 38, 0.4);
  }
  &.status-warn {
    color: #cfc8b8;
    border-color: rgba(207, 200, 184, 0.4);
  }
  &.status-tired {
    color: var(--c-mp);
    border-color: rgba(58, 95, 112, 0.4);
  }
}

.radar-section {
  margin-top: 16px;
  width: 100%;
  max-width: 260px;
}

/* 神契加护展示 */
.shenqi-bonus-section {
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  border-left: 2px solid var(--c-stamp);
  padding: 4px 10px;
  width: 100%;
  max-width: 260px;
}
.shenqi-icon {
  color: var(--c-stamp);
  font-size: 0.7rem;
  margin-top: 1px;
}
.shenqi-desc {
  font-size: 0.6rem;
  color: var(--c-text-dim);
  line-height: 1.5;
}

/* ===== 右栏 ===== */
.right-col {
  flex: 1;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 10;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 24px;
}

/* ===== 装备区 ===== */
.equip-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 装备包裹：神契位于装备网格左侧 */
.equip-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  .equip-grid {
    flex: 1;
    margin: 0;
  }
}

/* 神契装备槽 — 微弱红色光效 */
.shenqi-slot {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.2s;
  width: 64px;
  &:hover {
    background: rgba(168, 50, 50, 0.08);
  }
}
.sq-icon-wrap {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(168, 50, 50, 0.35);
  border-radius: 2px;
  background: rgba(168, 50, 50, 0.05);
  position: relative;
  box-shadow:
    0 0 6px rgba(168, 50, 50, 0.18),
    inset 0 0 4px rgba(168, 50, 50, 0.1);
  animation: sq-glow-pulse 3.2s ease-in-out infinite;
  will-change: box-shadow;

  /* 四角朱砂光点（仅装备态显示）—— 用单个伪元素代替旋转环，省一个动画 */
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    pointer-events: none;
    background:
      radial-gradient(circle at 0% 0%, rgba(168, 50, 50, 0.5) 0%, transparent 28%),
      radial-gradient(circle at 100% 0%, rgba(168, 50, 50, 0.5) 0%, transparent 28%),
      radial-gradient(circle at 0% 100%, rgba(168, 50, 50, 0.5) 0%, transparent 28%),
      radial-gradient(circle at 100% 100%, rgba(168, 50, 50, 0.5) 0%, transparent 28%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:not(.empty) {
    border-color: rgba(168, 50, 50, 0.7);
    background: rgba(168, 50, 50, 0.14);
    box-shadow:
      0 0 10px rgba(168, 50, 50, 0.28),
      0 0 22px rgba(168, 50, 50, 0.16),
      inset 0 0 6px rgba(168, 50, 50, 0.22);
    animation:
      sq-glow-pulse-active 3s ease-in-out infinite,
      sq-bloom 0.55s ease-out;

    &::after {
      opacity: 0.7;
    }
  }
}

@keyframes sq-glow-pulse {
  0%,
  100% {
    box-shadow:
      0 0 4px rgba(168, 50, 50, 0.12),
      inset 0 0 3px rgba(168, 50, 50, 0.08);
  }
  50% {
    box-shadow:
      0 0 10px rgba(168, 50, 50, 0.22),
      inset 0 0 5px rgba(168, 50, 50, 0.14);
  }
}
@keyframes sq-glow-pulse-active {
  0%,
  100% {
    box-shadow:
      0 0 8px rgba(168, 50, 50, 0.22),
      0 0 18px rgba(168, 50, 50, 0.12),
      inset 0 0 5px rgba(168, 50, 50, 0.18);
  }
  50% {
    box-shadow:
      0 0 16px rgba(168, 50, 50, 0.4),
      0 0 32px rgba(168, 50, 50, 0.2),
      inset 0 0 9px rgba(168, 50, 50, 0.26);
  }
}
@keyframes sq-bloom {
  0% {
    transform: scale(0.88);
    filter: brightness(1.8) saturate(1.3);
  }
  60% {
    transform: scale(1.06);
    filter: brightness(1.3) saturate(1.15);
  }
  100% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
}
.sq-icon {
  font-size: 1.4rem;
  color: rgba(168, 50, 50, 0.5);
  filter: drop-shadow(0 0 3px rgba(168, 50, 50, 0.3));
  transition:
    color 0.3s,
    filter 0.3s;
  .sq-icon-wrap:not(.empty) & {
    color: var(--c-stamp);
    filter: drop-shadow(0 0 6px rgba(168, 50, 50, 0.65));
  }
}
.sq-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  font-size: 0.45rem;
  color: var(--c-stamp);
  filter: drop-shadow(0 0 3px rgba(168, 50, 50, 0.7));
}
.sq-label {
  font-size: 0.6rem;
  color: var(--c-stamp);
  font-family: var(--font-ui);
  letter-spacing: 0.1em;
}
.sq-name {
  font-size: 0.5rem;
  color: var(--c-stamp);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-family: var(--font-ui);
  text-shadow: 0 0 4px rgba(168, 50, 50, 0.45);
}
.sq-empty {
  font-size: 0.52rem;
  color: var(--c-text-dim);
  opacity: 0.5;
  font-family: var(--font-ui);
}

/* 神契选择弹窗 */
.sq-overlay {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.sq-modal {
  width: 320px;
  max-height: 360px;
  background: var(--c-panel);
  border: 1px solid rgba(180, 180, 190, 0.2);
  box-shadow: 0 0 40px rgba(168, 50, 50, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
}
.sq-modal-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: var(--c-text-dim);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
  &:hover {
    color: var(--c-stamp);
  }
}
.sq-modal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(168, 50, 50, 0.3);
  background: rgba(168, 50, 50, 0.06);
  font-size: 0.9rem;
  color: var(--c-stamp);
  font-family: var(--font-serif);
  letter-spacing: 0.1em;
}
.sq-modal-icon {
  color: var(--c-stamp);
  opacity: 0.7;
}
.sq-modal-count {
  margin-left: auto;
  font-size: 0.6rem;
  color: var(--c-text-dim);
}
.sq-modal-body {
  overflow-y: auto;
  padding: 4px;
  max-height: 280px;
}

.sq-modal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.06);
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(168, 50, 50, 0.06);
  }
  &.equipped {
    background: rgba(168, 50, 50, 0.08);
  }
}
.sq-unequip {
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  .sq-modal-row:hover & {
    color: var(--c-stamp);
  }
}
.sq-god-icon {
  font-size: 0.8rem;
  color: var(--c-stamp);
  opacity: 0.8;
}
.sq-god-info {
  flex: 1;
}
.sq-god-name {
  font-size: 0.78rem;
  color: var(--c-text);
  font-family: var(--font-ui);
  letter-spacing: 0.06em;
  display: block;
}
.sq-god-skill {
  font-size: 0.58rem;
  color: var(--c-stamp);
  opacity: 0.8;
}
.sq-equipped-badge {
  font-size: 0.5rem;
  color: #34d399;
  border: 1px solid rgba(4, 120, 87, 0.5);
  background: rgba(4, 120, 87, 0.2);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
}
.sq-empty-msg {
  text-align: center;
  padding: 24px;
  color: var(--c-text-dim);
  font-size: 0.72rem;
  font-family: var(--font-serif);
  font-style: italic;
}

.section-head {
  font-size: 1.15rem;
  font-family: var(--font-ui);
  color: var(--c-text);
  letter-spacing: 0.15em;
  padding-bottom: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.2);
}

.head-bar {
  display: inline-block;
  width: 4px;
  height: 20px;
  background: var(--c-stamp);
}

.head-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(180, 180, 190, 0.2), transparent);
  margin-left: 4px;
}

.equip-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 8px;
  margin: 0 auto 12px;
}

.equip-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 2px;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.slot-icon-wrap {
  position: relative;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(92, 92, 92, 0.25);
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.3);
  transition:
    box-shadow 0.3s,
    border-color 0.3s,
    background 0.3s,
    transform 0.2s;
  overflow: hidden;

  /* 装备态：金色辉光扫光（仅 hover 时触发一次，省 CPU） */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 50%;
    height: 200%;
    background: linear-gradient(105deg, transparent 35%, rgba(212, 184, 122, 0.22) 50%, transparent 65%);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .equip-slot:not(.empty) & {
    border-color: rgba(207, 200, 184, 0.45);
    background:
      radial-gradient(circle at center, rgba(207, 200, 184, 0.14), rgba(207, 200, 184, 0.06)), rgba(0, 0, 0, 0.3);
    box-shadow:
      0 0 8px rgba(207, 200, 184, 0.18),
      inset 0 0 6px rgba(207, 200, 184, 0.12);
    animation: eq-bloom 0.55s ease-out;
    will-change: box-shadow;
  }

  .equip-slot:not(.empty):hover & {
    border-color: rgba(212, 184, 122, 0.7);
    box-shadow:
      0 0 14px rgba(207, 200, 184, 0.32),
      0 0 28px rgba(207, 200, 184, 0.16),
      inset 0 0 8px rgba(207, 200, 184, 0.2);
    transform: translateY(-1px);

    &::before {
      opacity: 1;
      animation: eq-shine 0.9s ease-out;
    }
  }

  .equip-slot.empty:hover & {
    border-color: rgba(207, 200, 184, 0.25);
    background: rgba(255, 255, 255, 0.04);
  }
}

@keyframes eq-shine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(420%);
  }
}
@keyframes eq-bloom {
  0% {
    transform: scale(0.88);
    filter: brightness(1.9) saturate(1.3);
  }
  60% {
    transform: scale(1.06);
    filter: brightness(1.3) saturate(1.15);
  }
  100% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
}

.slot-icon {
  font-size: 1.4rem;
  color: rgba(92, 92, 92, 0.35);
  transition:
    color 0.2s,
    filter 0.3s,
    transform 0.2s;
  position: relative;
  z-index: 2;

  .equip-slot:hover & {
    color: rgba(92, 92, 92, 0.6);
  }
  .equip-slot:not(.empty) & {
    color: var(--c-gold);
    filter: drop-shadow(0 0 4px rgba(207, 200, 184, 0.45));
  }
  .equip-slot:not(.empty):hover & {
    transform: scale(1.08);
    filter: drop-shadow(0 0 6px rgba(207, 200, 184, 0.7));
  }
}

.slot-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  font-size: 0.5rem;
  color: var(--c-gold);
  z-index: 3;
  filter: drop-shadow(0 0 3px rgba(207, 200, 184, 0.6));
}

.slot-label {
  font-size: 0.7rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  letter-spacing: 0.15em;
  text-align: center;
}

.slot-name {
  font-size: 0.6rem;
  color: var(--c-gold);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-family: var(--font-ui);
}

.bag-btn {
  width: 100%;
  padding: 11px;
  border: 1px solid rgba(207, 200, 184, 0.35);
  border-radius: 2px;
  background: linear-gradient(180deg, rgba(207, 200, 184, 0.1), rgba(207, 200, 184, 0.02));
  color: var(--c-gold);
  font-size: 0.82rem;
  font-weight: 400;
  font-family: var(--font-ui);
  letter-spacing: 0.25em;
  cursor: pointer;
  transition: all 0.25s;
  margin-top: auto;
  position: relative;
  overflow: hidden;
  text-shadow: 0 0 8px rgba(207, 200, 184, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 50%;
    height: 100%;
    background: linear-gradient(105deg, transparent 35%, rgba(255, 235, 180, 0.25) 50%, transparent 65%);
    transition: left 0.6s ease;
  }

  &:hover {
    background: linear-gradient(180deg, rgba(207, 200, 184, 0.2), rgba(207, 200, 184, 0.08));
    border-color: var(--c-gold);
    box-shadow:
      0 0 18px rgba(207, 200, 184, 0.3),
      inset 0 0 12px rgba(207, 200, 184, 0.1);
    color: var(--c-gold-light);
    letter-spacing: 0.3em;
    &::before {
      left: 120%;
    }
  }
}

/* ===== 灵石货币 ===== */
.currency-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-top: 10px;
  border: 1px solid rgba(207, 200, 184, 0.22);
  border-left: 3px solid rgba(207, 200, 184, 0.55);
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(207, 200, 184, 0.08), rgba(255, 255, 255, 0.01));
  position: relative;
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -120%;
    width: 60%;
    height: 100%;
    background: linear-gradient(105deg, transparent 35%, rgba(212, 184, 122, 0.18) 50%, transparent 65%);
    transition: left 0.7s ease;
    pointer-events: none;
  }
  &:hover {
    border-color: rgba(212, 184, 122, 0.5);
    border-left-color: var(--c-gold);
    box-shadow: 0 0 14px rgba(207, 200, 184, 0.18);
    &::before { left: 120%; }
  }
}

.currency-icon {
  font-size: 1rem;
  color: var(--c-gold);
  filter: drop-shadow(0 0 8px rgba(207, 200, 184, 0.7));
  line-height: 1;
  animation: currency-pulse 3.2s ease-in-out infinite;
}
@keyframes currency-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 6px rgba(207, 200, 184, 0.5));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(212, 184, 122, 0.9));
    transform: scale(1.1);
  }
}

.currency-label {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 300;
  font-family: var(--font-ui);
  color: var(--c-text-dim);
  letter-spacing: 0.18em;
}

.currency-value {
  font-size: 1.15rem;
  font-weight: 400;
  font-family: var(--font-ui);
  color: var(--c-gold-light);
  letter-spacing: 0.08em;
  text-shadow: 0 0 12px rgba(212, 184, 122, 0.5);
  z-index: 1;
}

/* ===== 背包弹窗 ===== */
.inv-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(20, 15, 10, 0.7), rgba(0, 0, 0, 0.92));
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  animation: inv-fade 0.25s ease;
}
@keyframes inv-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.inv-modal {
  width: 480px;
  max-height: 460px;
  background: linear-gradient(145deg, rgba(28, 24, 20, 0.96), rgba(14, 12, 12, 0.98));
  border: 1px solid rgba(207, 200, 184, 0.28);
  border-radius: var(--radius-md);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.5),
    0 12px 48px rgba(0, 0, 0, 0.75),
    0 0 60px rgba(207, 200, 184, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: inv-modal-in 0.32s cubic-bezier(0.16, 0.84, 0.36, 1.05);
}
@keyframes inv-modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 顶部装饰边线 */
.inv-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(207, 200, 184, 0.6),
    rgba(212, 184, 122, 0.9),
    rgba(207, 200, 184, 0.6),
    transparent
  );
  pointer-events: none;
}

.inv-modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: var(--c-text-dim);
  font-size: 1.3rem;
  cursor: pointer;
  z-index: 2;
  transition:
    color 0.2s,
    transform 0.2s;
  &:hover {
    color: var(--c-gold);
    transform: rotate(90deg);
  }
}

.inv-modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(207, 200, 184, 0.18);
  background: linear-gradient(to bottom, rgba(207, 200, 184, 0.06), transparent), rgba(0, 0, 0, 0.3);
  font-size: 1rem;
  color: var(--c-gold);
  font-family: var(--font-serif);
  letter-spacing: 0.15em;
  text-shadow: 0 0 8px rgba(207, 200, 184, 0.4);
}

.inv-modal-icon {
  color: var(--c-gold);
  filter: drop-shadow(0 0 6px rgba(207, 200, 184, 0.5));
  font-size: 1.05rem;
}

.inv-modal-count {
  margin-left: auto;
  font-size: 0.62rem;
  font-weight: 300;
  color: var(--c-text-dim);
  letter-spacing: 0.1em;
  padding: 2px 8px;
  border: 1px solid rgba(207, 200, 184, 0.2);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
}

.inv-modal-body {
  padding: 14px;
  overflow-y: auto;
  max-height: 380px;
  /* 暗格纹理底 */
  background-image:
    linear-gradient(rgba(207, 200, 184, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(207, 200, 184, 0.025) 1px, transparent 1px);
  background-size: 24px 24px;
}

.inv-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
}

.inv-item {
  aspect-ratio: 1;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.04), transparent 70%),
    linear-gradient(145deg, rgba(28, 26, 24, 0.9), rgba(10, 10, 12, 0.9));
  border: 1px solid rgba(80, 76, 70, 0.4);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px;
  position: relative;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.2s,
    box-shadow 0.25s,
    background 0.25s;
  overflow: hidden;

  /* 角标装饰：右上小三角 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 8px 8px 0;
    border-color: transparent rgba(207, 200, 184, 0.18) transparent transparent;
    transition: border-color 0.25s;
  }
  /* 内嵌光泽 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.06) 0%, transparent 40%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px) scale(1.04);
    border-color: rgba(207, 200, 184, 0.6);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 12px rgba(207, 200, 184, 0.25),
      inset 0 0 8px rgba(207, 200, 184, 0.08);
    z-index: 5;
    &::before {
      border-color: transparent var(--c-gold) transparent transparent;
    }
  }
}

/* 按类型分色 —— 通过 type-* class 控制 */
.inv-item.t-丹药 {
  box-shadow: inset 0 0 12px rgba(168, 50, 50, 0.12);
  .inv-item-icon {
    color: #c97a7a;
    filter: drop-shadow(0 0 5px rgba(168, 50, 50, 0.45));
  }
  &:hover {
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 14px rgba(168, 50, 50, 0.35),
      inset 0 0 12px rgba(168, 50, 50, 0.18);
    border-color: rgba(168, 50, 50, 0.6);
  }
  &::before {
    border-color: transparent rgba(168, 50, 50, 0.45) transparent transparent;
  }
}
.inv-item.t-材料 {
  box-shadow: inset 0 0 12px rgba(88, 139, 139, 0.12);
  .inv-item-icon {
    color: #7fbfb0;
    filter: drop-shadow(0 0 5px rgba(88, 139, 139, 0.45));
  }
  &:hover {
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 14px rgba(88, 139, 139, 0.35),
      inset 0 0 12px rgba(88, 139, 139, 0.18);
    border-color: rgba(88, 139, 139, 0.6);
  }
  &::before {
    border-color: transparent rgba(88, 139, 139, 0.45) transparent transparent;
  }
}
.inv-item.t-功法 {
  box-shadow: inset 0 0 12px rgba(84, 49, 107, 0.18);
  .inv-item-icon {
    color: #b292d4;
    filter: drop-shadow(0 0 5px rgba(84, 49, 107, 0.5));
  }
  &:hover {
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 14px rgba(84, 49, 107, 0.45),
      inset 0 0 12px rgba(84, 49, 107, 0.28);
    border-color: rgba(178, 146, 212, 0.6);
  }
  &::before {
    border-color: transparent rgba(178, 146, 212, 0.55) transparent transparent;
  }
}
.inv-item.t-装备 {
  box-shadow: inset 0 0 12px rgba(207, 200, 184, 0.16);
  .inv-item-icon {
    color: var(--c-gold);
    filter: drop-shadow(0 0 5px rgba(207, 200, 184, 0.5));
  }
  &:hover {
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.5),
      0 0 16px rgba(207, 200, 184, 0.4),
      inset 0 0 12px rgba(207, 200, 184, 0.22);
    border-color: var(--c-gold);
  }
  &::before {
    border-color: transparent var(--c-gold) transparent transparent;
  }
}
.inv-item.t-灵石 {
  box-shadow: inset 0 0 12px rgba(212, 184, 122, 0.18);
  .inv-item-icon {
    color: #e5cd92;
    filter: drop-shadow(0 0 6px rgba(212, 184, 122, 0.6));
    animation: inv-shimmer 2.4s ease-in-out infinite;
  }
  &::before {
    border-color: transparent rgba(212, 184, 122, 0.6) transparent transparent;
  }
}
.inv-item.t-杂物 {
  .inv-item-icon {
    color: var(--c-text-dim);
  }
}
@keyframes inv-shimmer {
  0%,
  100% {
    filter: drop-shadow(0 0 4px rgba(212, 184, 122, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 10px rgba(212, 184, 122, 0.85));
  }
}

.inv-item-icon {
  font-size: 1.15rem;
  color: var(--c-gold-dim);
  margin-bottom: 4px;
  z-index: 1;
  transition: transform 0.2s;
  .inv-item:hover & {
    transform: scale(1.15);
  }
}

.inv-item-name {
  font-size: 0.58rem;
  font-weight: 300;
  color: var(--c-text);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  line-height: 1.2;
  letter-spacing: 0.04em;
  z-index: 1;
  font-family: var(--font-serif);
  .inv-item:hover & {
    color: var(--c-gold-light);
  }
}

.inv-item-qty {
  position: absolute;
  bottom: 3px;
  right: 5px;
  font-size: 0.55rem;
  font-weight: 400;
  color: var(--c-gold);
  background: rgba(0, 0, 0, 0.6);
  padding: 0 4px;
  border-radius: 6px;
  z-index: 2;
  font-family: var(--font-serif);
}

/* 详情弹窗操作按钮 */
.id-actions {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}
.id-btn {
  flex: 1;
  padding: 7px 0;
  border-radius: 2px;
  font-size: 0.72rem;
  font-family: var(--font-serif);
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  text-align: center;
}
.id-btn-unequip {
  border: 1px solid rgba(168, 51, 51, 0.4);
  color: var(--c-stamp);
  &:hover {
    background: rgba(168, 51, 51, 0.1);
  }
}
.id-btn-equip {
  border: 1px solid rgba(207, 200, 184, 0.4);
  color: var(--c-gold);
  &:hover {
    background: rgba(207, 200, 184, 0.1);
  }
}

.inv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
  padding: 36px 20px;
  color: var(--c-text-dim);
  font-size: 0.78rem;
  font-style: italic;
  font-family: var(--font-serif);
  letter-spacing: 0.12em;
}
.inv-empty-icon {
  font-size: 2rem;
  color: var(--c-gold-dim);
  opacity: 0.4;
  margin-bottom: 4px;
  animation: inv-empty-float 4s ease-in-out infinite;
}
@keyframes inv-empty-float {
  0%,
  100% {
    transform: translateY(0) rotate(-4deg);
  }
  50% {
    transform: translateY(-4px) rotate(4deg);
  }
}
.inv-empty-sub {
  font-size: 0.6rem;
  opacity: 0.55;
  letter-spacing: 0.2em;
  font-style: normal;
}

/* ===== 装备选择弹窗 ===== */
.equip-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.equip-modal {
  width: 340px;
  max-height: 380px;
  background: var(--c-panel);
  border: 1px solid rgba(180, 180, 190, 0.2);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  position: relative;
  animation: modal-in 0.2s ease;
}

.equip-modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: none;
  border: none;
  color: var(--c-text-dim);
  font-size: 1.3rem;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: var(--c-gold);
  }
}

.equip-modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.2);
  background: rgba(0, 0, 0, 0.4);
  font-size: 1rem;
  color: var(--c-text);
  font-family: var(--font-serif);
  letter-spacing: 0.1em;
}

.equip-modal-icon {
  color: rgba(207, 200, 184, 0.7);
}

.equip-modal-body {
  overflow-y: auto;
  padding: 6px;
  max-height: 340px;
}

.equip-modal-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.12);
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(207, 200, 184, 0.08);
  }
}

.equip-modal-unequip {
  color: var(--c-text-dim);
  font-family: var(--font-serif);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  .equip-modal-row:hover & {
    color: var(--c-text);
  }
}

.equip-modal-item-name {
  font-weight: bold;
  font-size: 0.85rem;
  color: var(--c-text);
  font-family: var(--font-serif);
  letter-spacing: 0.1em;
  white-space: nowrap;
  .equip-modal-row:hover & {
    color: var(--c-gold);
  }
}

.equip-modal-item-desc {
  flex: 1;
  font-size: 0.62rem;
  color: var(--c-text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.equip-modal-badge {
  font-size: 0.55rem;
  border: 1px solid rgba(4, 120, 87, 0.5);
  background: rgba(4, 120, 87, 0.2);
  color: #34d399;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.equip-modal-row.equipped {
  background: rgba(207, 200, 184, 0.06);
}

.equip-modal-empty {
  text-align: center;
  padding: 24px;
  color: var(--c-text-dim);
  font-size: 0.78rem;
  font-style: italic;
}

/* 物品/装备详情弹窗 */
.item-detail-overlay {
  position: absolute;
  inset: 0;
  z-index: 60;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.item-detail-modal {
  width: 320px;
  max-height: 380px;
  background: var(--c-panel);
  border: 1px solid rgba(180, 180, 190, 0.2);
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  position: relative;
  animation: modal-in 0.2s ease;
}
.item-detail-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: var(--c-text-dim);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 2;
  &:hover {
    color: var(--c-gold);
  }
}
.item-detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.12);
  background: rgba(0, 0, 0, 0.4);
}
.item-detail-header-icon {
  font-size: 0.9rem;
  color: var(--c-gold);
}
.item-detail-title {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  font-family: var(--font-serif);
  color: var(--c-text);
  letter-spacing: 0.08em;
}
.item-detail-badge {
  font-size: 0.52rem;
  color: #34d399;
  border: 1px solid rgba(4, 120, 87, 0.5);
  background: rgba(4, 120, 87, 0.2);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}
.item-detail-body {
  padding: 12px 14px;
  overflow-y: auto;
  flex: 1;
}
.id-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid rgba(180, 180, 190, 0.06);
  font-size: 0.75rem;
}
.id-lbl {
  color: var(--c-text-dim);
  font-family: var(--font-serif);
}
.id-val {
  color: var(--c-text);
  text-align: right;
  font-family: var(--font-serif);
}
.id-rank {
  color: var(--c-gold);
}
.id-qty {
  color: var(--c-gold);
}
.id-block {
  margin-top: 10px;
}
.id-block-title {
  font-size: 0.7rem;
  color: var(--c-gold-dark);
  border-bottom: 1px solid rgba(180, 180, 190, 0.1);
  padding-bottom: 3px;
  margin-bottom: 6px;
  font-family: var(--font-serif);
  letter-spacing: 0.06em;
}
.id-block p {
  font-size: 0.75rem;
  color: var(--c-text);
  line-height: 1.6;
  margin: 0;
  font-family: var(--font-serif);
}
.id-attrs {
  font-size: 0.68rem;
  color: var(--c-gold);
  line-height: 1.5;
  margin: 0;
  font-family: var(--font-serif);
  white-space: pre-line;
}
.id-empty {
  text-align: center;
  padding: 16px;
  color: var(--c-text-dim);
  font-size: 0.72rem;
  font-style: italic;
}

/* ===== 头像编辑独立页面 ===== */
.avatar-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px 24px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  position: relative;
  z-index: 10;
}

.avatar-page-back {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  transition: color 0.2s;
  &:hover { color: var(--c-text); }
}

.avatar-page-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  .portrait-frame.large {
    width: 200px;
    height: 200px;
  }
}

.avatar-page-hint {
  font-size: var(--fs-xs);
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
}

.avatar-page-section {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-page-label {
  font-size: var(--fs-xs);
  color: var(--c-text-mid);
  font-family: var(--font-ui);
  letter-spacing: 0.15em;
}

.avatar-page-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-size: var(--fs-sm);
  border-radius: var(--radius-xs);
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: var(--c-gold); }
  &.has-error { border-color: var(--c-stamp); }
}

.avatar-page-error {
  margin: 0;
  font-size: var(--fs-2xs);
  color: var(--c-stamp-bright);
  font-family: var(--font-ui);
  letter-spacing: 0.05em;
}

.avatar-page-or {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  font-size: var(--fs-2xs);
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.2em;
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--c-border);
  }
}

.avatar-page-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed var(--c-border);
  border-radius: var(--radius-xs);
  font-size: var(--fs-sm);
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: var(--c-gold);
    color: var(--c-gold);
  }
}

.avatar-page-note {
  margin: 0;
  font-size: var(--fs-2xs);
  color: var(--c-text-faint);
  font-family: var(--font-ui);
  letter-spacing: 0.05em;
  line-height: 1.5;
}

.avatar-page-actions {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.avatar-page-btn {
  padding: 9px 26px;
  border: 1px solid var(--c-border);
  border-radius: var(--radius-xs);
  font-size: var(--fs-sm);
  font-family: var(--font-ui);
  letter-spacing: 0.12em;
  transition: all 0.2s;
  &.cancel {
    background: transparent;
    color: var(--c-text-dim);
    &:hover { color: var(--c-text); }
  }
  &.confirm {
    background: rgba(207, 200, 184, 0.12);
    color: var(--c-gold);
    border-color: var(--c-gold);
    &:hover:not(:disabled) { background: rgba(207, 200, 184, 0.25); }
    &:disabled { opacity: 0.3; cursor: not-allowed; }
  }
}

/* ============ 手机端适配 ============ */
@media (max-width: 500px) {
  .page-root {
    flex-direction: column;
    overflow: visible;
    height: auto;
  }

  .left-col {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(180, 180, 190, 0.2);
    padding: 16px 12px;
    flex-shrink: 0;
    overflow: visible;
  }

  .right-col {
    padding: 14px 12px;
    gap: 12px;
    overflow-y: visible;
    flex: none;
  }

  .col-sep {
    display: none;
  }

  .avatar-section {
    margin-bottom: 10px;
  }
  .portrait-frame {
    width: 100px;
    height: 100px;
    padding: 4px;
    margin-bottom: 12px;
  }
  .portrait-icon {
    font-size: 2.2rem;
  }
  .protag-name {
    font-size: 1rem;
  }
  .protag-title {
    font-size: 0.68rem;
  }
  .protag-realm {
    font-size: 0.7rem;
  }
  .cultivation-card {
    max-width: 160px;
    padding: 4px 8px;
  }
  .cultivation-realm {
    font-size: 0.68rem;
  }
  .cultivation-value {
    font-size: 0.55rem;
  }
  .cultivation-track {
    height: 3px;
  }

  .radar-section {
    max-width: 180px;
  }

  .stats-grid {
    gap: 10px 12px;
  }

  /* 装备包裹：手机端纵向堆叠 - 神契横条在上、装备网格在下 */
  .equip-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .shenqi-slot {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
    padding: 8px 10px;
    border: 1px solid rgba(168, 50, 50, 0.18);
    border-radius: var(--radius-sm);
    background: rgba(168, 50, 50, 0.04);
  }
  .sq-icon-wrap {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  .sq-icon {
    font-size: 1rem;
  }
  .sq-label {
    font-size: 0.65rem;
    order: -1;
  }
  .sq-name {
    font-size: 0.6rem;
  }
  .sq-empty {
    font-size: 0.55rem;
  }

  .equip-grid {
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 10px;
  }

  .equip-slot {
    padding: 5px 2px;
    gap: 4px;
  }
  .slot-icon-wrap {
    width: 48px;
    height: 48px;
  }
  .slot-icon {
    font-size: 1.2rem;
  }
  .slot-label {
    font-size: 0.65rem;
  }
  .slot-name {
    font-size: 0.55rem;
  }

  .section-head {
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .bag-btn {
    font-size: 0.78rem;
    padding: 10px;
    letter-spacing: 0.18em;
    margin-top: 4px;
  }

  .currency-row {
    padding: 8px 12px;
    gap: 10px;
    margin-top: 8px;
  }
  .currency-value {
    font-size: 1.05rem;
  }
  .currency-label {
    font-size: 0.78rem;
  }
  .currency-icon {
    font-size: 0.95rem;
  }

  /* 背包弹窗 — 占满屏幕、自适应列数 */
  .inv-modal {
    width: 96vw;
    max-height: 82vh;
    border-radius: var(--radius-sm);
  }
  .inv-modal-header {
    font-size: 0.88rem;
    padding: 10px 14px;
  }
  .inv-modal-body {
    padding: 8px;
  }
  .inv-grid {
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 5px;
  }
  .inv-item {
    padding: 6px 3px;
    aspect-ratio: auto;
    min-height: 56px;
  }
  .inv-item-icon {
    font-size: 1rem;
    margin-bottom: 3px;
  }
  .inv-item-name {
    font-size: 0.52rem;
  }
  .inv-item-qty {
    font-size: 0.52rem;
    bottom: 2px;
    right: 3px;
  }

  /* 装备选择弹窗 */
  .equip-modal {
    width: 94vw;
    max-height: 78vh;
  }
  .equip-modal-header {
    font-size: 0.88rem;
    padding: 10px 12px;
  }
  .equip-modal-row {
    padding: 8px 10px;
  }
  .equip-modal-item-name {
    font-size: 0.78rem;
  }
  .equip-modal-item-desc {
    font-size: 0.6rem;
  }

  /* 物品详情弹窗 */
  .item-detail-modal {
    width: 94vw;
    max-height: 78vh;
  }
  .item-detail-header {
    padding: 10px 12px;
  }
  .item-detail-title {
    font-size: 0.82rem;
  }
  .item-detail-body {
    padding: 10px 12px;
  }

  /* 神契选择弹窗 */
  .sq-modal {
    width: 94vw;
    max-height: 70vh;
  }
  .sq-modal-header {
    font-size: 0.82rem;
    padding: 10px 12px;
  }
  .sq-modal-row {
    padding: 8px 10px;
    gap: 6px;
  }
  .sq-god-name {
    font-size: 0.72rem;
  }
  .sq-god-skill {
    font-size: 0.55rem;
  }

  /* 头像编辑页 */
  .avatar-page {
    padding: 14px 12px 20px;
    gap: 14px;
  }
  .avatar-page-preview .portrait-frame.large {
    width: 160px;
    height: 160px;
  }
  .avatar-page-actions {
    gap: 10px;
  }
  .avatar-page-btn {
    padding: 8px 20px;
  }
}

/* 极小屏进一步压缩 */
@media (max-width: 380px) {
  .equip-grid {
    gap: 5px 4px;
  }
  .slot-icon-wrap {
    width: 40px;
    height: 40px;
  }
  .slot-icon {
    font-size: 1rem;
  }
  .slot-label {
    font-size: 0.58rem;
  }
  .slot-name {
    font-size: 0.5rem;
  }
  .sq-icon-wrap {
    width: 36px;
    height: 36px;
  }
  .sq-icon {
    font-size: 0.9rem;
  }
  .sq-label {
    font-size: 0.6rem;
  }
  .inv-grid {
    grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  }
  .inv-item {
    min-height: 48px;
  }
  .inv-item-icon {
    font-size: 0.88rem;
  }
  .inv-item-name {
    font-size: 0.45rem;
  }
}

/* 宽屏手机横屏 — 增大间距 */
@media (min-width: 501px) and (max-width: 680px) {
  .equip-wrapper {
    gap: 14px;
  }
  .shenqi-slot {
    width: 58px;
  }
  .sq-icon-wrap {
    width: 48px;
    height: 48px;
  }
  .sq-icon {
    font-size: 1.2rem;
  }
  .slot-icon-wrap {
    width: 52px;
    height: 52px;
  }
  .slot-icon {
    font-size: 1.35rem;
  }
  .slot-label {
    font-size: 0.68rem;
  }
  .slot-name {
    font-size: 0.58rem;
  }
  .inv-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
