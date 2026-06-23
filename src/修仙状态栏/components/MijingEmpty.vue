<template>
  <div class="mijing-empty">
    <div class="empty-icon">
      <i class="fa-solid fa-dungeon"></i>
    </div>
    <div class="empty-title">尚未踏入任何秘境</div>
    <div class="empty-hint">
      行走在修仙界,或许某日<br />
      会有一道空间裂隙在你眼前缓缓张开。
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mijing-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: var(--c-text-dim);
  text-align: center;
  padding: 40px 20px;
  user-select: none;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.18;
  color: var(--c-text);
  filter: drop-shadow(0 0 12px rgba(168, 51, 51, 0.2));
}

.empty-title {
  font-family: var(--font-brush);
  font-size: 1.15rem;
  letter-spacing: 0.3em;
  color: var(--c-text);
  opacity: 0.6;
}

.empty-hint {
  font-family: var(--font-ui);
  font-size: 0.85rem;
  line-height: 1.8;
  opacity: 0.5;
  max-width: 280px;
}
</style>
