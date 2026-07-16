<template>
  <section class="step">
    <h2>神契 <span class="optional">（可选）</span></h2>
    <p class="subtitle">选择一位古神缔结神契，作为开局陪伴者</p>

    <div class="grid">
      <button
        v-for="神 in 神契列表"
        :key="神.名称"
        class="card"
        :class="{ active: 已选神契 === 神.名称 }"
        @click="选神契(神.名称)"
      >
        <div class="avatar-wrap">
          <img :src="avatarOf(神.名称)" :alt="神.名称" class="avatar" />
          <span v-if="已选神契 === 神.名称" class="check-mark">✓</span>
        </div>
        <div class="name">{{ 神.名称 }}</div>
        <div class="identity">
          <span class="badge divine">神</span>
          {{ 神.身份 }}
        </div>
        <div class="tier-domain">
          <span class="tier">{{ 神.位阶 }}</span>
          <span class="sep">·</span>
          <span class="domain">{{ 神.领域 }}</span>
        </div>
        <div class="skill-name">{{ 神.神契技能 }}</div>
        <div class="skill-desc">{{ 神.神契描述 }}</div>
      </button>
    </div>

    <p class="hint">神契可选，不选亦可开局。所选古神将在开场剧情中以陪伴者身份自然登场。</p>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDataStore } from '../store';
import { useDraftStore } from '../draft';
import { 神契列表 } from '../catalog/神契';
import { avatarOf } from '../../修仙状态栏/avatarStore';

const { data } = storeToRefs(useDataStore());
const draft = useDraftStore();
const { 已选神契 } = storeToRefs(draft);

function 选神契(名: string) {
  draft.选神契(名);
  _.set(data.value, '主角.神契装备', draft.已选神契);
}
</script>

<style scoped lang="scss">
@use './theme' as *;

.step {
  padding: 1.4rem 1.4rem 1.8rem;
  color: $paper-cold;
  font-size: 1.05rem;
  animation: step-in 0.4s ease-out;
  @include mobile { padding: 0.8rem 0.7rem 1.2rem; font-size: 0.92rem; }
  @include tablet { padding: 1rem 1rem 1.4rem; }
}
@keyframes step-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

h2 {
  @include gold-heading;
  font-size: 1.7rem;
  margin: 0 0 0.3rem;
  @include mobile { font-size: 1.3rem; }
  .optional {
    font-size: 0.6em;
    font-weight: 400;
    color: $paper-dim;
    letter-spacing: 0.05em;
  }
}

.subtitle {
  font-size: 0.95rem;
  font-weight: 500;
  color: $paper-soft;
  margin: 0.2rem 0 1.2rem;
  font-style: italic;
  letter-spacing: 0.08em;
  @include mobile { font-size: 0.82rem; margin-bottom: 0.8rem; }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  @include tablet { grid-template-columns: repeat(2, 1fr); }
  @include mobile { grid-template-columns: 1fr; gap: 0.6rem; }
}

.card {
  @include xianxia-card;
  text-align: center;
  padding: 1rem 0.8rem 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  color: $paper-cold;
  font-size: 1rem;
  @include mobile { padding: 0.7rem 0.6rem; font-size: 0.9rem; }

  .avatar-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: $r-md;
    overflow: hidden;
    border: 2px solid rgba(200,200,210,0.15);
    margin-bottom: 0.3rem;
    flex-shrink: 0;
    @include mobile { width: 64px; height: 64px; }

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .check-mark {
      position: absolute;
      top: 4px;
      left: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: $blood-glow;
      color: #f0e8e0;
      font-size: 0.8rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px rgba(216,56,56,0.5);
      @include mobile { width: 20px; height: 20px; font-size: 0.7rem; }
    }
  }

  .name {
    font-family: $font-serif;
    font-weight: bold;
    font-size: 1.2rem;
    color: $paper-cold;
    letter-spacing: 0.1em;
    @include mobile { font-size: 1.05rem; }
  }

  .identity {
    font-size: 0.82rem;
    font-weight: 500;
    color: $paper-soft;
    display: flex;
    align-items: center;
    gap: 0.3em;
    @include mobile { font-size: 0.75rem; }

    .badge {
      font-size: 0.75em;
      color: #ffd8a8;
      border: 1px solid rgba(212,154,90,0.6);
      padding: 0.1em 0.45em;
      border-radius: $r-pill;
      background: rgba(80,50,20,0.35);
      text-shadow: 0 0 6px rgba(212,154,90,0.5);
      &.divine {
        letter-spacing: 0.1em;
      }
    }
  }

  .tier-domain {
    font-size: 0.78rem;
    font-weight: 500;
    color: $paper-dim;
    @include mobile { font-size: 0.72rem; }
    .sep { margin: 0 0.2em; opacity: 0.5; }
  }

  .skill-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: $blood-glow;
    margin-top: 0.25rem;
    text-shadow: 0 0 6px rgba(168,51,51,0.3);
    letter-spacing: 0.05em;
    @include mobile { font-size: 0.82rem; }
  }

  .skill-desc {
    font-size: 0.8rem;
    font-weight: 500;
    color: $paper-dim;
    line-height: 1.55;
    @include mobile { font-size: 0.74rem; }
  }
}

.hint {
  font-size: 0.92rem;
  font-weight: 500;
  color: $paper-soft;
  margin-top: 1.3rem;
  font-style: italic;
  text-align: center;
  letter-spacing: 0.08em;
  padding: 0.6rem;
  border-top: 1px dashed rgba(200,200,210,0.12);
  @include mobile { font-size: 0.8rem; padding: 0.45rem; margin-top: 0.9rem; }
}
</style>
