<template>
  <div class="we-page">
    <!-- API 配置 -->
    <section class="set-section">
      <div class="set-title"><i class="fa-solid fa-plug"></i> API 配置</div>

      <!-- 主 API / 独立 API 切换 -->
      <div class="api-mode-switch">
        <button
          class="api-mode-btn"
          :class="{ active: 用主API }"
          @click="切换为主API"
        >
          <i class="fa-solid fa-tavern"></i>
          <span>使用主 API</span>
          <small>酒馆当前连接源</small>
        </button>
        <button
          class="api-mode-btn"
          :class="{ active: !用主API }"
          @click="切换为独立API"
        >
          <i class="fa-solid fa-shield-halved"></i>
          <span>使用独立 API</span>
          <small>自定模型，与主线隔离</small>
        </button>
      </div>

      <!-- 独立 API 详细配置：仅在选择「独立 API」时可用 -->
      <div class="set-fields" :class="{ disabled: 用主API }">
        <p class="set-hint">世界推进与摘要使用的独立模型，与主线 AI 隔离。留空则用当前酒馆源。</p>

        <div class="set-field">
          <label>API 源</label>
          <select v-model="api.source" :disabled="用主API">
            <option value="openai">openai</option>
            <option value="claude">claude</option>
            <option value="deepseek">deepseek</option>
          </select>
        </div>

        <div class="set-field">
          <label>API 地址</label>
          <input v-model="api.apiurl" :disabled="用主API" placeholder="https://..." />
        </div>

        <div class="set-field">
          <label>API 密钥</label>
          <input v-model="api.key" :disabled="用主API" type="password" placeholder="sk-..." />
        </div>

        <div class="set-field">
          <label>模型</label>
          <div class="model-row">
            <select v-model="api.model" :disabled="用主API || modelList.length === 0">
              <option value="" v-if="modelList.length === 0">（点右侧获取模型）</option>
              <option v-for="m in modelList" :key="m" :value="m">{{ m }}</option>
            </select>
            <button class="set-btn" :disabled="fetching || !api.apiurl || 用主API" @click="fetchModels">
              <i class="fa-solid fa-rotate"></i>
              <span>{{ fetching ? '获取中…' : '获取模型' }}</span>
            </button>
          </div>
        </div>

        <div class="set-actions">
          <button class="set-btn primary" :disabled="用主API" @click="saveApi">保存配置</button>
          <button class="set-btn" :disabled="用主API" @click="clearApi">清空</button>
        </div>
      </div>
    </section>

    <!-- 推进与摘要设置 -->
    <section class="set-section">
      <div class="set-title"><i class="fa-solid fa-sliders"></i> 推进与摘要</div>

      <div class="set-field row">
        <label>自动推进</label>
        <button class="toggle" :class="{ on: cfg.自动推进 }" @click="cfg.自动推进 = !cfg.自动推进">
          <span class="toggle-dot"></span>
        </button>
      </div>

      <div class="set-field">
        <label>自动推进间隔（楼）</label>
        <input v-model.number="cfg.自动推进间隔" type="number" min="1" />
      </div>

      <div class="set-field">
        <label>摘要间隔（楼）</label>
        <input v-model.number="cfg.摘要间隔" type="number" min="1" />
      </div>

      <div class="set-actions">
        <button class="set-btn primary" @click="saveCfg">保存设置</button>
      </div>
    </section>

    <!-- 摘要预览 -->
    <section class="set-section">
      <div class="set-title"><i class="fa-solid fa-scroll"></i> 主线摘要</div>
      <div class="atm-box">
        <i class="fa-solid fa-wind"></i>
        <span class="atm-label">世界氛围</span>
        <span class="atm-text">{{ store.data.世界氛围 || '天下暂安，暗流未显。' }}</span>
      </div>
      <p class="set-hint">截至第 {{ store.data.摘要?.上次摘要楼层 ?? 0 }} 楼</p>
      <div class="summary-box">{{ store.data.摘要?.近期摘要 || '（暂无摘要）' }}</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useWorldEngineStore } from '../store';
import type { CustomApi } from '../schema';

const store = useWorldEngineStore();
const cfg = reactive({
  自动推进: store.data.配置?.自动推进 ?? false,
  自动推进间隔: store.data.配置?.自动推进间隔 ?? 10,
  摘要间隔: store.data.配置?.摘要间隔 ?? 5,
});
const api = reactive<CustomApi>({
  source: store.data.配置?.custom_api?.source ?? 'openai',
  apiurl: store.data.配置?.custom_api?.apiurl ?? '',
  key: store.data.配置?.custom_api?.key ?? '',
  model: store.data.配置?.custom_api?.model ?? '',
});
const modelList = ref<string[]>([]);
const fetching = ref(false);

// 用主 API ⇔ custom_api 为 null；独立 API ⇔ custom_api 为对象
const 用主API = computed(() => store.data.配置?.custom_api == null);

function 切换为主API() {
  if (用主API.value) return;
  store.data.配置.custom_api = null;
  store.persist();
  toastr.info('已切换为主 API（酒馆当前连接源）');
}

function 切换为独立API() {
  if (!用主API.value) return;
  // 恢复表单中保留的独立配置（若有），否则用默认空值
  store.data.配置.custom_api = { ...api };
  store.persist();
  toastr.success('已切换为独立 API，请在下方填写配置');
}

async function fetchModels() {
  if (!api.apiurl) return;
  fetching.value = true;
  try {
    const list = await getModelList({ apiurl: api.apiurl, key: api.key || undefined });
    modelList.value = list || [];
    if (list.length && !list.includes(api.model)) api.model = list[0];
    toastr.success(`获取到 ${list.length} 个模型`);
  } catch (e) {
    console.error('[世界引擎] 获取模型失败', e);
    toastr.error('获取模型失败，请检查 API 地址与密钥');
    modelList.value = [];
  } finally {
    fetching.value = false;
  }
}

function saveApi() {
  store.data.配置.custom_api = { ...api };
  store.persist();
  toastr.success('API 配置已保存');
}

function clearApi() {
  api.apiurl = '';
  api.key = '';
  api.model = '';
  modelList.value = [];
  store.data.配置.custom_api = { ...api };
  store.persist();
  toastr.info('独立 API 配置已清空');
}

function saveCfg() {
  store.data.配置.自动推进 = cfg.自动推进;
  store.data.配置.自动推进间隔 = cfg.自动推进间隔;
  store.data.配置.摘要间隔 = cfg.摘要间隔;
  store.persist();
  toastr.success('设置已保存');
}
</script>

<style lang="scss" scoped>
.we-page { display: flex; flex-direction: column; gap: 18px; }
.set-section {
  padding: 18px 20px;
  background: linear-gradient(165deg, var(--c-panel-raised), var(--c-panel));
  border: 1px solid var(--c-border);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: inset 0 1px 0 rgba(201,160,92,0.02);
}
.set-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 1rem; color: var(--c-text);
  letter-spacing: 0.14em;
  font-family: var(--font-brush);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--c-hairline);
  i { color: var(--c-bronze-light); font-size: 0.9rem; }
}
.set-hint { font-size: 0.76rem; color: var(--c-text-faint); margin: 0; line-height: 1.65; }

/* API 模式切换 */
.api-mode-switch {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.api-mode-btn {
  display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
  padding: 12px 14px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  color: var(--c-text-faint);
  cursor: pointer; text-align: left;
  transition: all 0.3s var(--ease-out-soft);
  i { font-size: 1.05rem; margin-bottom: 2px; color: var(--c-text-ghost); transition: color 0.3s var(--ease-out-soft); }
  span { font-size: 0.92rem; font-weight: 500; letter-spacing: 0.06em; }
  small { font-size: 0.66rem; color: var(--c-text-ghost); letter-spacing: 0.04em; }
  &:hover {
    border-color: var(--c-border-mid);
    color: var(--c-text-dim);
    background: rgba(201,160,92,0.04);
    i { color: var(--c-bronze-light); }
  }
  &.active {
    border-color: var(--c-border-blood);
    background: linear-gradient(145deg, rgba(212,86,80,0.16), rgba(100,24,24,0.28));
    color: var(--c-text);
    box-shadow: 0 0 12px rgba(212,86,80,0.18), inset 0 1px 0 rgba(201,160,92,0.05);
    i { color: var(--c-accent-bright); }
    small { color: var(--c-text-faint); }
  }
}

/* 独立 API 字段区：选「主 API」时整体置灰禁用 */
.set-fields {
  display: flex; flex-direction: column; gap: 14px;
  transition: opacity 0.3s var(--ease-out-soft);
  &.disabled { opacity: 0.4; pointer-events: none; }
}
.set-field { display: flex; flex-direction: column; gap: 6px;
  &.row { flex-direction: row; align-items: center; justify-content: space-between; }
}
.set-field label { font-size: 0.84rem; color: var(--c-text-dim); letter-spacing: 0.08em; }
.set-field input, .set-field select {
  padding: 9px 12px;
  background: rgba(0,0,0,0.35);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  color: var(--c-text);
  font-family: var(--font-ui);
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.3s var(--ease-out-soft), box-shadow 0.3s var(--ease-out-soft);
  &:focus {
    border-color: var(--c-accent-bright);
    box-shadow: 0 0 10px var(--c-accent-glow), inset 0 0 6px rgba(212,86,80,0.05);
  }
}
.model-row { display: flex; gap: 8px; }
.model-row select { flex: 1; }
.set-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 14px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  font-size: 0.86rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s var(--ease-out-soft);
  &:hover:not(:disabled) {
    color: var(--c-bronze-light);
    border-color: var(--c-border-mid);
    background: rgba(201,160,92,0.06);
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &.primary {
    background: linear-gradient(145deg, rgba(212,86,80,0.2), rgba(100,24,24,0.4));
    border-color: var(--c-border-blood);
    color: var(--c-text);
    &:hover {
      box-shadow: 0 0 14px var(--c-accent-glow);
      border-color: var(--c-accent-bright);
    }
  }
}
.set-actions { display: flex; gap: 10px; padding-top: 4px; }
.toggle {
  width: 46px; height: 26px; border-radius: var(--radius-pill);
  background: rgba(0,0,0,0.4); border: 1px solid var(--c-border);
  position: relative; cursor: pointer; transition: background 0.3s var(--ease-out-soft), border-color 0.3s var(--ease-out-soft);
  &.on { background: rgba(212,86,80,0.3); border-color: var(--c-border-blood); }
  .toggle-dot {
    position: absolute; top: 2px; left: 2px;
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--c-text-dim); transition: transform 0.3s var(--ease-out-soft), background 0.3s var(--ease-out-soft);
  }
  &.on .toggle-dot { transform: translateX(20px); background: var(--c-accent-bright); box-shadow: 0 0 8px var(--c-accent-glow); }
}
.summary-box {
  padding: 12px 14px;
  background: rgba(0,0,0,0.35);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem; color: var(--c-text-dim); line-height: 1.8;
  max-height: 220px; overflow-y: auto; white-space: pre-wrap;
}
/* 世界氛围条：一句话，供世界书常驻条目注入主线 */
.atm-box {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px;
  background: linear-gradient(145deg, rgba(212,86,80,0.1), rgba(201,160,92,0.05));
  border: 1px solid var(--c-border-blood);
  border-radius: var(--radius-sm);
  i { color: var(--c-accent-bright); font-size: 0.85rem; }
  .atm-label { font-size: 0.72rem; color: var(--c-text-faint); letter-spacing: 0.12em; flex-shrink: 0; }
  .atm-text { font-size: 0.86rem; color: var(--c-text); font-family: var(--font-brush); letter-spacing: 0.04em; }
}
</style>
