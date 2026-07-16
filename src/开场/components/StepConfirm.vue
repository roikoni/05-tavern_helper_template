<template>
  <section class="step">
    <h2>总览</h2>

    <div class="grid">
      <div class="cell">
        <span>姓名</span><b>{{ 主角.名称 }}</b>
      </div>
      <div class="cell">
        <span>性别</span><b>{{ 主角.性别 }}</b>
      </div>
      <div class="cell">
        <span>种族</span><b>{{ 主角.种族 || '人族' }}</b>
      </div>
      <div class="cell">
        <span>开局身份</span><b>{{ 开局身份 || '（未填）' }}</b>
      </div>
      <div class="cell">
        <span>称号</span><b>{{ 主角.称号 }}</b>
      </div>
      <div class="cell">
        <span>境界</span><b>{{ 主角.境界 }}（修为 {{ 主角.修为 }}/{{ 主角.修为上限 }}）</b>
      </div>
      <div class="cell">
        <span>出身地</span><b>{{ 主角.出身地 }}</b>
      </div>
      <div class="cell">
        <span>宗门</span><b>{{ 主角.宗门 }}</b>
      </div>
      <div class="cell">
        <span>本源</span><b>{{ 主角.本源 }}（{{ 本源基调 }}）</b>
      </div>
      <div class="cell">
        <span>修炼流派</span><b>{{ 主角.修炼流派 }}</b>
      </div>
      <div class="cell">
        <span>灵根</span><b>{{ 主角.灵根 }}</b>
      </div>
      <div class="cell">
        <span>灵石</span><b>{{ 主角.灵石 }} 枚</b>
      </div>
      <div class="cell">
        <span>善恶 / san</span><b>{{ 主角.善恶值 }} / {{ 主角.san值 }}</b>
      </div>
      <div class="cell wide">
        <span>人物设定</span><b>{{ 主角.外貌 || '（未填）' }}</b>
      </div>
    </div>

    <h3>六维</h3>
    <div class="六维">
      <span v-for="k in 六维键" :key="k">{{ k }}:{{ 主角.六维[k] }}</span>
    </div>

    <h3>装备</h3>
    <p>武器：{{ 主角.装备?.武器?.名称 ?? '空置' }} · 法器：{{ 主角.装备?.法器?.名称 ?? '空置' }}</p>

    <h3>功法</h3>
    <ul v-if="已学功法.length">
      <li v-for="(g, i) in 已学功法" :key="i">{{ g }}</li>
    </ul>
    <p v-else class="hint">（未选择功法）</p>

    <h3>神契</h3>
    <p v-if="已选神契条目">
      {{ 已选神契条目.名称 }}（{{ 已选神契条目.身份 }}）— 神契技能：{{ 已选神契条目.神契技能 }}
    </p>
    <p v-else class="hint">（未选择神契）</p>

    <div v-if="校验.错误.length" class="errors">
      <p v-for="(e, i) in 校验.错误" :key="i">⚠ {{ e }}</p>
    </div>

    <button class="confirm" :disabled="生成中 || !校验.通过" @click="onConfirm">
      {{ 生成中 ? '剧情生成中…' : '开始旅途' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { buildOpeningPrompt } from '../lib/prompt';
import { 神契列表 } from '../catalog/神契';
import { deriveMaxHp, deriveMaxMp } from '../../修仙状态栏/vitals';
const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const { 已选功法, 开局身份, 本源基调 } = storeToRefs(draft);
const 生成中 = ref(false);
const 六维键 = ['力道', '体魄', '身法', '灵力', '神识', '根骨'] as const;

const 主角 = computed(() => data.value.主角);
const 已学功法 = computed(() => 已选功法.value);
const 已选神契条目 = computed(() => 神契列表.find(s => s.名称 === draft.已选神契));

const 校验 = computed(() => {
  const 主 = data.value.主角;
  const 错误: string[] = [];
  if (!主.名称 || 主.名称 === '待捏角') 错误.push('请填写姓名');
  if (!主.本源 || 主.本源 === '待捏角') 错误.push('请填写本源');
  if (!主.修炼流派 || 主.修炼流派 === '待捏角') 错误.push('请选择修炼流派');
  if (!主.灵根 || 主.灵根 === '待捏角') 错误.push('请选择灵根');
  if (!主.出身地 || 主.出身地 === '待捏角') 错误.push('请选择出身地');
  if (!主.宗门 || 主.宗门 === '待捏角') 错误.push('请选择宗门');
  const 上限 = 100;
  for (const k of ['力道','体魄','身法','灵力','神识','根骨']) {
    const v = (主.六维 as any)[k];
    if (v === undefined || v < 0 || v > 上限) 错误.push(`${k} 超出范围 0-${上限}`);
  }
  return { 通过: 错误.length === 0, 错误 };
});

async function onConfirm() {
  if (!校验.value.通过) return;
  生成中.value = true;

  try {
    // 1. 锁定捏角状态
    data.value.$flag.已完成捏角 = true;

    // 1.5 角色初创：气血/法力值回满至六维派生上限。
    // 上限不存储、由六维派生，当前值须在捏角落定时初始化为满值，
    // 否则将沿用 initvar 占位 0，呈现“上限正常但血量/蓝条为 0”。
    const 六维 = data.value.主角.六维;
    data.value.主角.气血 = deriveMaxHp(六维);
    data.value.主角.法力值 = deriveMaxMp(六维);

    // 2. 清空第 0 楼原本的 <开场> 开场白，避免其字面内容进入 AI 上下文
    await setChatMessages([{ message_id: 0, message: '' }], { refresh: 'none' });

    // 3. 把开场 prompt 作为一条可见的 user 消息追加到聊天末尾（和玩家手动发送等效）
    //    玩家选定的初始功法通过 prompt 嵌入，由 AI 用 <UpdateVariable> insert 到 /初始功法/
    const 开场白 = buildOpeningPrompt(
      data.value as any,
      已选功法.value,
      true,
      开局身份.value,
      本源基调.value,
    );
    await createChatMessages([{ role: 'user', message: 开场白 }]);

    // 4. 触发 AI 生成开场剧情
    await triggerSlash('/trigger');
  } catch (err) {
    // 5. 失败停留在 StepConfirm，玩家可重试
    const msg = err instanceof Error ? err.message : String(err);
    toastr.error(`开场失败：${msg}，请重试`);
    console.error('[开场] 失败', err);
  } finally {
    生成中.value = false;
  }
}
</script>

<style scoped lang="scss">
@use './theme' as *;

.step {
  padding: 1.4rem 1.4rem 2rem;
  color: $paper-cold;
  font-size: 1.05rem;
  animation: step-in 0.4s ease-out;
  @include mobile {
    padding: 0.8rem 0.7rem 1.4rem;
    font-size: 0.92rem;
  }
  @include tablet {
    padding: 1rem 1rem 1.6rem;
  }
}
@keyframes step-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  @include gold-heading;
  font-size: 1.7rem;
  margin: 0 0 1.3rem;
  @include mobile {
    font-size: 1.3rem;
  }
}
h3 {
  font-family: $font-serif;
  color: $paper-cold;
  margin: 1.6rem 0 0.7rem;
  letter-spacing: 0.15em;
  font-size: 1.2rem;
  @include mobile {
    font-size: 1.05rem;
    margin: 1.2rem 0 0.5rem;
  }
  &::before {
    content: '❖ ';
    color: $blood-glow;
    opacity: 0.7;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.55rem;
  margin: 1rem 0;
  @include mobile {
    grid-template-columns: 1fr;
  }

  .cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0.95rem;
    background: linear-gradient(180deg, rgba(22, 19, 24, 0.65) 0%, rgba(10, 9, 13, 0.8) 100%);
    border: 1px solid rgba(207, 200, 184, 0.12);
    border-radius: $r-sm;
    transition: all 0.3s ease;
    font-size: 1.05rem;
    @include mobile {
      padding: 0.55rem 0.65rem;
      font-size: 0.92rem;
    }

    &:hover {
      border-color: rgba(168, 51, 51, 0.5);
      background: linear-gradient(180deg, rgba(35, 20, 22, 0.7) 0%, rgba(15, 10, 12, 0.85) 100%);
      box-shadow: 0 0 10px rgba(168, 51, 51, 0.15);
    }
    > span {
      color: $paper-dim;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.1em;
      @include mobile {
        font-size: 0.82rem;
      }
    }
    > b {
      color: $paper-cold;
      font-family: $font-serif;
      font-weight: 600;
      letter-spacing: 0.05em;
      font-size: 1.05rem;
      @include mobile {
        font-size: 0.92rem;
      }
    }
    &.wide {
      grid-column: 1 / -1;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.3rem;
      @include mobile {
        grid-column: 1;
      }
      > b {
        font-weight: normal;
        color: $paper-cold;
        line-height: 1.7;
      }
    }
  }
}

.六维 {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  @include mobile {
    gap: 0.35rem;
  }
  > span {
    padding: 0.45rem 0.85rem;
    background: linear-gradient(180deg, rgba(40, 18, 18, 0.50), rgba(20, 10, 12, 0.65));
    border: 1px solid rgba(168, 51, 51, 0.35);
    border-radius: $r-pill;
    font-family: $font-serif;
    color: $paper-cold;
    letter-spacing: 0.1em;
    font-size: 1.05rem;
    font-weight: 500;
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.45);
    @include mobile {
      font-size: 0.88rem;
      padding: 0.35rem 0.55rem;
    }
  }
}

ul {
  margin: 0;
  padding-left: 1.5rem;
  color: $paper-cold;
  @include mobile {
    padding-left: 1.2rem;
  }
  li {
    font-family: $font-serif;
    margin: 0.4rem 0;
    letter-spacing: 0.05em;
    font-size: 1.05rem;
    font-weight: 500;
    @include mobile {
      font-size: 0.92rem;
    }
    &::marker {
      color: $blood-glow;
    }
  }
}
p {
  color: $paper-cold;
  line-height: 1.7;
  font-size: 1.05rem;
  font-weight: 500;
  @include mobile {
    font-size: 0.92rem;
  }
}
.cheat-text {
  white-space: pre-wrap;
  color: $blood-glow;
  font-style: italic;
  padding: 0.6rem 0.8rem;
  background: rgba(80, 15, 15, 0.15);
  border-left: 3px solid $blood-mid;
  border-radius: 0 $r-sm $r-sm 0;
}
.hint {
  color: $paper-dim;
  font-style: italic;
  font-weight: 500;
}

.errors {
  background: linear-gradient(180deg, rgba(80, 15, 15, 0.40), rgba(35, 5, 5, 0.55));
  padding: 0.8rem 1.1rem;
  border-left: 3px solid $blood-bright;
  border-radius: 0 $r-sm $r-sm 0;
  margin: 1rem 0;
  box-shadow: inset 0 0 12px rgba(168, 51, 51, 0.12);
  @include mobile {
    padding: 0.6rem 0.8rem;
  }
  p {
    color: #f0c0c0;
    margin: 0.3rem 0;
    font-size: 1rem;
    font-weight: 500;
    @include mobile {
      font-size: 0.88rem;
    }
  }
}

.confirm {
  display: block;
  width: 100%;
  padding: 1.2rem;
  margin-top: 1.8rem;
  background: linear-gradient(180deg, $blood-bright 0%, $blood-glow 45%, $blood 100%);
  color: #f4e8d8;
  border: 1px solid $blood-bright;
  border-radius: $r-md;
  font-size: 1.3rem;
  font-family: $font-serif;
  font-weight: bold;
  letter-spacing: 0.5em;
  text-indent: 0.5em;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  box-shadow:
    inset 0 0 18px rgba(255, 200, 200, 0.2),
    0 0 24px rgba(168, 51, 51, 0.45),
    0 4px 12px rgba(0, 0, 0, 0.5);
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
  @include mobile {
    font-size: 1.1rem;
    padding: 1rem;
    margin-top: 1.2rem;
    letter-spacing: 0.3em;
  }

  // 高光扫过动画
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 220, 220, 0.3), transparent);
    transition: left 0.7s ease;
  }
  &:hover:not(:disabled)::before {
    left: 150%;
  }
  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #d85555 0%, $blood-bright 45%, $blood-glow 100%);
    box-shadow:
      inset 0 0 22px rgba(255, 200, 200, 0.3),
      0 0 36px rgba(198, 69, 69, 0.65),
      0 5px 18px rgba(0, 0, 0, 0.6);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    filter: grayscale(0.8);
    &::before {
      display: none;
    }
  }
}
</style>
