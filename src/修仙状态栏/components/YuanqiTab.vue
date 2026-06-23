<template>
  <div class="page-root">
    <!-- 左栏：在场 -->
    <div class="bt-left">
      <h2 class="section-head">
        <span class="head-bar nearby"></span> 在场
        <div class="head-line"></div>
      </h2>

      <div v-if="!_.isEmpty(presentChars)" class="card-list">
        <div
          v-for="(c, name) in presentChars"
          :key="name"
          class="char-card"
          @click="openDetail(name, c)"
        >
          <span class="char-name">{{ name }}</span>
          <div class="char-bars">
            <div class="cb-bar">
              <span class="cb-label">气血</span>
              <div class="cb-track"><div class="cb-fill cb-fill-hp" :style="{ width: pct(c.气血, c.气血上限) + '%' }"></div></div>
              <span class="cb-num">{{ c.气血 }}/{{ c.气血上限 }}</span>
            </div>
            <div class="cb-bar">
              <span class="cb-label">法力</span>
              <div class="cb-track"><div class="cb-fill cb-fill-mp" :style="{ width: pct(c.法力值, c.法力上限) + '%' }"></div></div>
              <span class="cb-num">{{ c.法力值 }}/{{ c.法力上限 }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-msg">四下无人</div>
    </div>

    <!-- 右栏：羁绊 -->
    <div class="bt-right">
      <h2 class="section-head">
        <span class="head-bar"></span> 羁绊
        <div class="head-line"></div>
      </h2>

      <div v-if="!_.isEmpty(bondChars)" class="card-list">
        <div
          v-for="(c, name) in bondChars"
          :key="name"
          class="char-card bond"
          @click="openDetail(name, c)"
        >
          <span class="char-name">{{ name }}</span>
          <div class="char-bars">
            <div class="cb-bar">
              <span class="cb-label">气血</span>
              <div class="cb-track"><div class="cb-fill cb-fill-hp" :style="{ width: pct(c.气血, c.气血上限) + '%' }"></div></div>
              <span class="cb-num">{{ c.气血 }}/{{ c.气血上限 }}</span>
            </div>
            <div class="cb-bar">
              <span class="cb-label">法力</span>
              <div class="cb-track"><div class="cb-fill cb-fill-mp" :style="{ width: pct(c.法力值, c.法力上限) + '%' }"></div></div>
              <span class="cb-num">{{ c.法力值 }}/{{ c.法力上限 }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-msg">孤身一人，暂无羁绊</div>
    </div>

    <!-- 详情弹窗 -->
    <CharacterDetailModal
      :visible="detailVisible"
      :title="detailName"
      :subtitle="detailData?.境界 || ''"
      :innerThought="detailData?.内心想法 || ''"
      :editable="!hasDefaultAvatar(detailName)"
      @close="detailVisible = false"
      @update-avatar="onAvatarUpdate"
    >
      <template #avatar>
        <img
          v-if="detailAvatar"
          :src="detailAvatar"
          style="width:100%;height:100%;object-fit:cover;position:relative;z-index:5"
          @error="(e) => (e.target as HTMLImageElement).style.display='none'"
        />
      </template>
      <div v-if="detailData" class="detail-body">
        <div class="dt-grid">
          <div class="dt-row"><span class="dt-lbl">种族</span><span class="dt-val">{{ detailData.种族 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">性别</span><span class="dt-val">{{ detailData.性别 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">境界</span><span class="dt-val dt-gold">{{ detailData.境界 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">好感</span><span class="dt-val" :class="getAffClass(detailData.好感度)">{{ detailData.好感度 >= 0 ? '+' : '' }}{{ detailData.好感度 }}</span></div>
          <div v-if="detailData.洗脑值 > 0" class="dt-row"><span class="dt-lbl">侵蚀</span><span class="dt-val dt-brainwash">{{ detailData.洗脑值 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">势力</span><span class="dt-val">{{ detailData.势力 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">关系</span><span class="dt-val">{{ detailData.关系 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">气血</span><span class="dt-val">{{ detailData.气血 }}/{{ detailData.气血上限 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">法力</span><span class="dt-val">{{ detailData.法力值 }}/{{ detailData.法力上限 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">善恶</span><span class="dt-val" :class="detailData.善恶值 >= 0 ? 'aff-good' : 'aff-evil'">{{ detailData.善恶值 >= 0 ? '+' : '' }}{{ detailData.善恶值 }}</span></div>
          <div class="dt-row"><span class="dt-lbl">SAN</span><span class="dt-val dt-san">{{ detailData.san值 }}</span></div>
        </div>

        <div v-if="detailData.六维" class="dt-block">
          <div class="dt-block-title">六维战力</div>
          <div class="dt-six-grid">
            <div class="dt-six-item"><span class="dt-six-lbl">力道</span><span class="dt-six-val">{{ detailData.六维.力道 }}</span></div>
            <div class="dt-six-item"><span class="dt-six-lbl">体魄</span><span class="dt-six-val">{{ detailData.六维.体魄 }}</span></div>
            <div class="dt-six-item"><span class="dt-six-lbl">身法</span><span class="dt-six-val">{{ detailData.六维.身法 }}</span></div>
            <div class="dt-six-item"><span class="dt-six-lbl">灵力</span><span class="dt-six-val">{{ detailData.六维.灵力 }}</span></div>
            <div class="dt-six-item"><span class="dt-six-lbl">神识</span><span class="dt-six-val">{{ detailData.六维.神识 }}</span></div>
            <div class="dt-six-item"><span class="dt-six-lbl">根骨</span><span class="dt-six-val">{{ detailData.六维.根骨 }}</span></div>
          </div>
        </div>

        <div v-if="detailData.外貌" class="dt-block">
          <div class="dt-block-title">外貌</div>
          <p>{{ detailData.外貌 }}</p>
        </div>
        <div v-if="detailData.描述" class="dt-block">
          <div class="dt-block-title">描述</div>
          <p>{{ detailData.描述 }}</p>
        </div>
      </div>
    </CharacterDetailModal>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import { useAvatar, setAvatar, hasDefaultAvatar } from '../avatarStore';
import CharacterDetailModal from './CharacterDetailModal.vue';

const store = useDataStore();

const presentChars = computed(() =>
  _.pickBy(store.data.缘契角色, (c: any) => c.在场)
);
const bondChars = computed(() =>
  _.pickBy(store.data.缘契角色, (c: any) => c.羁绊)
);

function pct(val: number, max: number): number {
  return Math.min((val / Math.max(max || 1, 1)) * 100, 100);
}

const detailVisible = ref(false);
const detailName = ref('');
const detailData = ref<any>(null);
const detailAvatar = useAvatar(detailName);

function openDetail(name: string, char: any) {
  detailName.value = name;
  detailData.value = char;
  detailVisible.value = true;
}

function onAvatarUpdate(url: string) {
  if (detailName.value) {
    setAvatar(detailName.value, url);
  }
}

function getAffClass(aff: number): string {
  if (aff > 30) return 'aff-good';
  if (aff < -30) return 'aff-evil';
  return '';
}
</script>

<style lang="scss" scoped>
.page-root { display: flex; height: 100%; font-size: 1.05rem; }

.bt-left {
  width: 48%; min-height: 0;
  border-right: 1px solid rgba(180, 180, 190, 0.16);
  padding: 16px 18px 18px;
  overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: rgba(92,92,92,0.3) transparent;
}
.bt-right {
  width: 52%; min-height: 0;
  padding: 16px 18px 18px;
  overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: rgba(92,92,92,0.3) transparent;
}

.section-head {
  font-size: 1.2rem; font-family: var(--font-ui); color: var(--c-text);
  letter-spacing: 0.12em; padding-bottom: 8px; margin-bottom: 14px;
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.2);
}
.head-bar { display: inline-block; width: 4px; height: 18px; background: var(--c-stamp); }
.head-bar.nearby { background: var(--c-mp); }
.head-line { flex: 1; height: 1px; background: linear-gradient(to right, rgba(180, 180, 190, 0.2), transparent); }

.empty-msg { text-align: center; padding: 24px; color: var(--c-text-dim); font-size: 0.9rem; font-style: italic; }

.card-list { display: flex; flex-direction: column; gap: 8px; }

.char-card {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(180, 180, 190, 0.10);
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s;

  &:hover {
    background: rgba(207, 200, 184, 0.05);
    border-color: rgba(207, 200, 184, 0.25);
  }
  &.bond:hover {
    background: rgba(207, 200, 184, 0.06);
    .char-name { color: var(--c-gold); }
  }
}

.char-name {
  display: block;
  font-size: 1.05rem;
  font-weight: bold;
  font-family: var(--font-serif);
  color: var(--c-text);
  letter-spacing: 0.06em;
  margin-bottom: 8px;
  transition: color 0.2s;
  .char-card:not(.bond):hover & { color: var(--c-mp); }
}

.char-bars { display: flex; flex-direction: column; gap: 4px; }
.cb-bar { display: flex; align-items: center; gap: 6px; }
.cb-label { font-size: 0.6rem; color: var(--c-text-dim); width: 24px; flex-shrink: 0; text-align: right; font-family: var(--font-serif); }
.cb-track { flex: 1; height: 6px; background: var(--c-border); border-radius: 1px; overflow: hidden; }
.cb-fill { height: 100%; border-radius: 1px; transition: width 0.3s; }
.cb-fill-hp { background: var(--c-hp); }
.cb-fill-mp { background: var(--c-mp); }
.cb-num { font-size: 0.58rem; color: var(--c-text-dim); min-width: 46px; text-align: right; font-family: var(--font-serif); }

.detail-body { display: flex; flex-direction: column; align-items: center; }
.dt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; width: 100%; margin-bottom: 16px; }
.dt-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(38,38,38,0.3); }
.dt-lbl { font-size: 0.9rem; color: var(--c-text-dim); font-family: var(--font-serif); }
.dt-val { font-size: 0.95rem; color: var(--c-text); text-align: right; font-family: var(--font-serif); }
.dt-gold { color: var(--c-gold); }
.dt-brainwash { color: #8b5a9a; }
.dt-san { color: var(--c-san); }
.aff-good { color: var(--c-affinity-green); }
.aff-evil { color: var(--c-stamp); }

.dt-six-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 12px; }
.dt-six-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(180,180,190,0.08); }
.dt-six-lbl { font-size: 0.78rem; color: var(--c-text-dim); }
.dt-six-val { font-size: 0.85rem; color: var(--c-text); font-weight: bold; }

.dt-block { width: 100%; margin-top: 14px; }
.dt-block-title {
  font-size: 0.9rem; color: var(--c-gold-dark);
  border-bottom: 1px solid rgba(38,38,38,0.4);
  padding-bottom: 5px; margin-bottom: 10px;
  font-family: var(--font-serif); letter-spacing: 0.06em;
}
.dt-block p { font-size: 0.92rem; color: var(--c-text); line-height: 1.7; margin: 0; font-family: var(--font-serif); }

.bt-left::-webkit-scrollbar, .bt-right::-webkit-scrollbar { width: 4px; }
.bt-left::-webkit-scrollbar-track, .bt-right::-webkit-scrollbar-track { background: transparent; }
.bt-left::-webkit-scrollbar-thumb, .bt-right::-webkit-scrollbar-thumb {
  background: rgba(92,92,92,0.3); border-radius: 2px;
}
.bt-left::-webkit-scrollbar-thumb:hover, .bt-right::-webkit-scrollbar-thumb:hover {
  background: rgba(92,92,92,0.5);
}

@media (max-width: 500px) {
  .page-root { flex-direction: column; }
  .bt-left { width: 100%; border-right: none; border-bottom: 1px solid rgba(38,38,38,0.4); padding: 12px 14px; max-height: 55%; }
  .bt-right { width: 100%; padding: 12px 14px; }
  .section-head { font-size: 1rem; margin-bottom: 10px; padding-bottom: 6px; }
  .char-name { font-size: 0.92rem; }
}
</style>
