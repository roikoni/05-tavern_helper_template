<template>
  <div class="page-root">
    <!-- 左栏：古神 -->
    <div class="left-col" :class="{ collapsed: godsCollapsed }">
      <h2 class="section-head" @click="godsCollapsed = !godsCollapsed">
        <span class="head-bar"></span> 古神隐秘
        <div class="head-line"></div>
        <i class="fa-solid" :class="godsCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'" style="font-size:0.65rem;color:var(--c-text-dim);transition:transform 0.3s;flex-shrink:0"></i>
      </h2>

      <Transition name="collapse">
        <div v-if="!godsCollapsed" key="gods-content">
          <div v-if="!_.isEmpty(store.data.古神列表)" class="god-list">
        <div
          v-for="(god, name) in store.data.古神列表"
          :key="name"
          class="god-card group"
          @click="openDetail(name, god, 'deity')"
        >
          <div class="god-accent"></div>
          <div class="god-avatar">
            <div class="god-avatar-dash"></div>
            <img v-if="avatarOf(name)" :src="avatarOf(name)" class="god-avatar-img" />
            <span v-else class="god-avatar-label">虚空</span>
          </div>
          <div class="god-info">
            <div class="god-top-row">
              <span class="god-name">{{ name }}</span>
              <span class="god-threat" :class="getThreatClass(god.位阶)">[ {{ god.位阶 }} ]</span>
            </div>
            <p class="god-quote">"{{ god.描述 || '未知的远古存在...' }}"</p>
            <div class="god-bot-row">
              <span class="god-faction-tag">领域 · {{ god.领域 }}</span>
              <span class="god-rank-dots">
                <span v-for="i in 4" :key="i" class="rank-dot" :class="{ active: i <= getRankDots(god.位阶) }">&#9670;</span>
              </span>
            </div>
            <span class="god-status" :class="{ done: god.收服 }">{{ god.收服 ? '✓ 已结契' : '未结契' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-msg">诸神沉默，天道无言</div>
        </div>
      </Transition>
    </div>

    <!-- 右栏：重要人物 -->
    <div class="right-col" :class="{ collapsed: heroesCollapsed }">
      <h2 class="section-head" @click="heroesCollapsed = !heroesCollapsed">
        <span class="head-bar"></span> 当世豪杰
        <div class="head-line"></div>
        <i class="fa-solid" :class="heroesCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'" style="font-size:0.65rem;color:var(--c-text-dim);transition:transform 0.3s;flex-shrink:0"></i>
      </h2>

      <Transition name="collapse">
        <div v-if="!heroesCollapsed" key="heroes-content">
          <div v-if="!_.isEmpty(heroes)" class="vip-list">
        <div
          v-for="(npc, name) in heroes"
          :key="name"
          class="vip-card group"
          @click="openDetail(name, npc, 'vip')"
        >
          <div class="vip-avatar">
            <div class="vip-avatar-dash"></div>
            <img v-if="avatarOf(name)" :src="avatarOf(name)" class="vip-avatar-img" />
            <i v-else class="fa-solid fa-user vip-avatar-icon"></i>
          </div>
          <div class="vip-info">
            <div class="vip-top-row">
              <span class="vip-name">{{ name }}</span>
              <span class="vip-realm">{{ npc.境界 }}</span>
            </div>
            <p class="vip-desc">{{ npc.描述 || npc.特征 || '暂无描述' }}</p>
            <div v-if="npc.洗脑值 > 0" class="vip-brainwash">侵蚀：{{ npc.洗脑值 }}</div>
            <span class="vip-status" :class="{ done: npc.攻略 }">{{ npc.攻略 ? '✓ 已攻略' : '未攻略' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-msg">尚未结识天下英杰</div>
        </div>
      </Transition>
    </div>

    <!-- 详情弹窗 -->
    <CharacterDetailModal
      :visible="detailVisible"
      :title="detailName"
      :subtitle="detailSubtitle"
      :editable="!hasDefaultAvatar(detailName)"
      @close="detailVisible = false"
    >
      <template #avatar>
        <img
          v-if="avatarOf(detailName)"
          :src="avatarOf(detailName)"
          style="width:100%;height:100%;object-fit:cover;position:relative;z-index:5"
          @error="(e) => (e.target as HTMLImageElement).style.display='none'"
        />
      </template>
      <div v-if="detailData" class="detail-body">
        <div v-if="detailType === 'deity'" class="dt-grid">
          <div class="dt-row"><span class="dt-lbl">神格</span><span class="dt-val dt-stamp">{{ detailData.神格 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">领域</span><span class="dt-val">{{ detailData.领域 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">位阶</span><span class="dt-val dt-gold">{{ detailData.位阶 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">状态</span><span class="dt-val">{{ detailData.状态 }}</span></div>
        </div>
        <div v-else class="dt-grid">
          <div class="dt-row"><span class="dt-lbl">境界</span><span class="dt-val dt-gold">{{ detailData.境界 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">势力</span><span class="dt-val">{{ detailData.势力 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">好感</span><span class="dt-val" :class="detailData.好感度 >= 0 ? 'aff-good' : 'aff-evil'">{{ detailData.好感度 >= 0 ? '+' : '' }}{{ detailData.好感度 }}</span></div>
          <div v-if="detailData.洗脑值 > 0" class="dt-row"><span class="dt-lbl">侵蚀</span><span class="dt-val dt-brainwash">{{ detailData.洗脑值 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">关系</span><span class="dt-val">{{ detailData.关系 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">所在地</span><span class="dt-val">{{ detailData.所在地 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">特征</span><span class="dt-val">{{ detailData.特征 || '—' }}</span></div>
        </div>

        <div v-if="detailData.信仰" class="dt-block">
          <div class="dt-block-title">信仰</div><p>{{ detailData.信仰 }}</p>
        </div>
        <div v-if="detailData.描述" class="dt-block">
          <div class="dt-block-title">{{ detailType === 'deity' ? '传说' : '简介' }}</div><p>{{ detailData.描述 }}</p>
        </div>
        <div v-if="detailData.神迹" class="dt-block">
          <div class="dt-block-title">神迹</div><p>{{ detailData.神迹 }}</p>
        </div>
        <div v-if="detailType === 'vip' && detailData.外貌" class="dt-block">
          <div class="dt-block-title">外貌</div><p>{{ detailData.外貌 }}</p>
        </div>
      </div>
    </CharacterDetailModal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed } from 'vue';
import { useDataStore } from '../store';
import { avatarOf, hasDefaultAvatar } from '../avatarStore';
import CharacterDetailModal from './CharacterDetailModal.vue';

const store = useDataStore();
const detailVisible = ref(false);
const detailName = ref('');
const detailData = ref<any>(null);
const detailSubtitle = ref('');
const detailType = ref<'deity' | 'vip'>('vip');
const godsCollapsed = ref(false);
const heroesCollapsed = ref(false);

// 当世豪杰固定名单：仅这些人物显示在右栏，AI 新增的 NPC 不计入
const HEROES = ['沈清辞', '姜无忧', '顾千卷', '柳不移', '萧太薇'] as const;

// 右栏只显示固定名单内、且变量中存在的人物
const heroes = computed(() => {
  const all = store.data.重要人物 || {};
  return HEROES
    .filter(name => all[name])
    .reduce<Record<string, any>>((acc, name) => { acc[name] = all[name]; return acc; }, {});
});

function openDetail(name: string, data: any, type: 'deity' | 'vip') {
  detailName.value = name; detailData.value = data;
  detailSubtitle.value = type === 'deity' ? data.神格 : data.称号 || data.境界;
  detailType.value = type; detailVisible.value = true;
}

function getThreatClass(rank: string): string {
  if (rank?.includes('上位') || rank?.includes('主神')) return 'threat-high';
  if (rank?.includes('中位')) return 'threat-mid';
  return '';
}

function getRankDots(rank: string): number {
  if (rank?.includes('上位') || rank?.includes('主神')) return 4;
  if (rank?.includes('中位')) return 2;
  return 1;
}
</script>

<style lang="scss" scoped>
.page-root { display: flex; height: 100%; overflow: hidden; font-size: 1.05rem; }

/* ===== 左栏：古神 ===== */
.left-col {
  width: 50%; min-height: 0;
  border-right: 1px solid rgba(180, 180, 190, 0.2);
  padding: 16px 20px; overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin; scrollbar-color: rgba(92,92,92,0.3) transparent;
}

.section-head {
  font-size: 1.15rem; font-family: var(--font-ui); color: var(--c-text);
  letter-spacing: 0.15em; padding-bottom: 8px; margin-bottom: 14px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.2);
  cursor: pointer; user-select: none;
  transition: color 0.2s;
  &:hover { color: var(--c-accent-bright); }
}

.head-bar { width: 4px; height: 20px; background: var(--c-stamp); display: inline-block; }
.head-line { flex: 1; height: 1px; background: linear-gradient(to right, rgba(180, 180, 190, 0.2), transparent); }

/* ===== 右栏：重要人物 ===== */
.right-col {
  width: 50%; min-height: 0; padding: 16px 20px;
  overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin; scrollbar-color: rgba(92,92,92,0.3) transparent;
}

/* 古神卡片 */
.god-list { display: flex; flex-direction: column; gap: 14px; }
.god-card {
  position: relative; display: flex; gap: 14px; padding: 10px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.12); cursor: pointer;
  border-radius: 2px; transition: all 0.2s;
  &:hover { background: rgba(168, 51, 51, 0.06); border-color: rgba(168, 51, 51, 0.3); }
}
.god-accent {
  position: absolute; left: -9px; top: 8px; height: calc(100% - 16px); width: 2px;
  background: linear-gradient(to bottom, var(--c-stamp), transparent);
  opacity: 0; transition: opacity 0.2s;
  .god-card:hover & { opacity: 1; }
}
.god-avatar {
  width: 84px; height: 112px; border: 1px solid rgba(180, 180, 190, 0.2); background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0; position: relative; display: flex; align-items: center; justify-content: center; padding: 3px;
  transition: border-color 0.2s;
  .god-card:hover & { border-color: rgba(168, 51, 51, 0.4); }
}
.god-avatar-dash { position: absolute; inset: 2px; border: 1px dashed rgba(92, 92, 92, 0.1); }
.god-avatar-img { width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 5; }
.god-avatar-label {
  font-size: 0.55rem; color: rgba(92, 92, 92, 0.3); font-family: var(--font-serif);
  writing-mode: vertical-lr; letter-spacing: 0.2em; position: relative; z-index: 10;
}

.god-info { flex: 1; min-width: 0; }
.god-top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
.god-name { font-size: 1.15rem; font-weight: 500; font-family: var(--font-serif); color: var(--c-text); letter-spacing: 0.1em; transition: color 0.2s;
  .god-card:hover & { color: var(--c-stamp); }
}
.god-threat { font-size: 0.65rem; font-weight: 500; letter-spacing: 0.1em; font-family: var(--font-serif); }
.threat-high { color: var(--c-stamp); }
.threat-mid { color: var(--c-gold-dim); }
.god-quote {
  font-size: 0.85rem; color: var(--c-text-dim); line-height: 1.45; font-style: italic;
  font-family: var(--font-serif);
  margin: 4px 0; padding-left: 8px; border-left: 1px solid rgba(180, 180, 190, 0.2);
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}
.god-bot-row { display: flex; justify-content: space-between; align-items: center; }
.god-faction-tag { font-size: 0.62rem; color: var(--c-text-dim); border: 1px solid var(--c-border); padding: 2px 6px; border-radius: var(--radius-sm); background: rgba(0,0,0,0.2); font-family: var(--font-serif); }
.god-rank-dots { display: flex; gap: 2px; opacity: 0.4; }
.rank-dot { font-size: 0.45rem; color: var(--c-gold-dim); font-family: var(--font-serif); &.active { color: var(--c-gold); } }
.god-status { display: inline-block; margin-top: 5px; font-size: 0.72rem; color: var(--c-stamp); border: 1px solid rgba(168, 51, 51,0.35); padding: 3px 10px; border-radius: 2px; letter-spacing: 0.1em; font-family: var(--font-serif); &.done { color: #3a8f5c; border-color: rgba(58,143,92,0.35); } }

/* 重要人物卡片 */
.vip-list { display: flex; flex-direction: column; gap: 12px; }
.vip-card {
  position: relative; display: flex; gap: 12px; padding: 10px; border-bottom: 1px solid rgba(180, 180, 190, 0.12);
  border-radius: 2px; cursor: pointer; transition: all 0.2s;
  &:hover { background: rgba(207, 200, 184, 0.06); border-color: rgba(207, 200, 184, 0.3); }
}
.vip-status { display: inline-block; margin-top: 5px; font-size: 0.72rem; color: var(--c-stamp); border: 1px solid rgba(168, 51, 51,0.35); padding: 3px 10px; border-radius: 2px; letter-spacing: 0.1em; font-family: var(--font-serif); &.done { color: #3a8f5c; border-color: rgba(58,143,92,0.35); } }
.vip-brainwash { font-size: 0.72rem; color: #8b5a9a; font-family: var(--font-serif); letter-spacing: 0.08em; margin-top: 4px; }
.vip-avatar {
  width: 76px; height: 100px; border: 1px solid rgba(180, 180, 190, 0.2); background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0; position: relative; display: flex; align-items: center; justify-content: center; padding: 3px;
  transition: border-color 0.2s;
  .vip-card:hover & { border-color: rgba(207, 200, 184, 0.4); }
}
.vip-avatar-dash { position: absolute; inset: 2px; border: 1px dashed rgba(92, 92, 92, 0.1); }
.vip-avatar-img { width: 100%; height: 100%; object-fit: cover; position: relative; z-index: 5; }
.vip-avatar-icon { font-size: 1rem; color: rgba(92, 92, 92, 0.15); position: relative; z-index: 10; }

.vip-info { flex: 1; min-width: 0; }
.vip-top-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.vip-name { font-size: 1.15rem; font-weight: 500; font-family: var(--font-serif); color: var(--c-text); letter-spacing: 0.1em; transition: color 0.2s;
  .vip-card:hover & { color: var(--c-gold); }
}
.vip-realm { font-size: 0.6rem; color: var(--c-gold-dim); border: 1px solid rgba(207, 200, 184,0.2); padding: 2px 6px; border-radius: 2px; font-family: var(--font-serif); }
.vip-desc {
  font-size: 0.85rem; color: var(--c-text-dim); line-height: 1.45; margin: 0;
  font-family: var(--font-serif);
  display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
}

/* 详情弹窗 */
.detail-body { display: flex; flex-direction: column; align-items: center; }
.dt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; width: 100%; margin-bottom: 14px; }
.dt-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(38,38,38,0.3); }
.dt-lbl { font-size: 0.85rem; color: var(--c-text-dim); font-family: var(--font-serif); }
.dt-val { font-size: 0.9rem; color: var(--c-text); text-align: right; font-family: var(--font-serif); }
.dt-gold { color: var(--c-gold); }
.dt-stamp { color: var(--c-stamp); }
.dt-brainwash { color: #8b5a9a; }
.aff-good { color: var(--c-affinity-green); }
.aff-evil { color: var(--c-stamp); }

.dt-block { width: 100%; margin-top: 12px; }
.dt-block-title { font-size: 0.85rem; color: var(--c-gold-dark); border-bottom: 1px solid rgba(38,38,38,0.4); padding-bottom: 4px; margin-bottom: 8px; font-family: var(--font-serif); letter-spacing: 0.06em; }
.dt-block p { font-size: 0.88rem; color: var(--c-text); line-height: 1.7; margin: 0; font-family: var(--font-serif); }

.empty-msg { text-align: center; padding: 28px; color: var(--c-text-dim); font-size: 0.85rem; font-style: italic; }

/* 滚动条 */
.left-col::-webkit-scrollbar, .right-col::-webkit-scrollbar { width: 4px; }
.left-col::-webkit-scrollbar-track, .right-col::-webkit-scrollbar-track { background: transparent; }
.left-col::-webkit-scrollbar-thumb, .right-col::-webkit-scrollbar-thumb { background: rgba(92,92,92,0.3); border-radius: 2px; }
.left-col::-webkit-scrollbar-thumb:hover, .right-col::-webkit-scrollbar-thumb:hover { background: rgba(92,92,92,0.5); }

@media (max-width: 500px) {
  .page-root { flex-direction: column; }
  .left-col { width: 100%; border-right: none; border-bottom: 1px solid rgba(38,38,38,0.5); padding: 12px 10px; max-height: unset; flex: 1 1 auto; min-height: 0;
    &.collapsed { flex: 0 0 auto; min-height: auto; border-bottom: none; }
  }
  .right-col { width: 100%; padding: 12px 10px; flex: 1 1 auto; min-height: 0;
    &.collapsed { flex: 0 0 auto; min-height: auto; }
  }
  .god-avatar { width: 56px; height: 76px; }
  .vip-avatar { width: 52px; height: 68px; }
  .section-head { font-size: 1rem; margin-bottom: 10px; }
  .god-name, .vip-name { font-size: 1rem; }
  .god-quote { -webkit-line-clamp: 2; }
}

/* 折叠过渡 */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
