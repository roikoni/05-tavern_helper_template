<template>
  <div class="opening-root dark-mode">
    <div class="stars stars-layer-1"></div>
    <div class="stars stars-layer-2"></div>

    <!-- 标题区 -->
    <div class="title-section">
      <div class="title-ornament top-ornament">◆ ◇ ◆</div>
      <h1 class="main-title">炼娘术师</h1>
      <p class="subtitle">—— 索拉尼斯大陆上，一份不太体面的营生 ——</p>
    </div>

    <!-- 简介区 -->
    <div class="intro-section">
      <p>
        欢迎来到<strong>索拉尼斯</strong>，这是一个魔力决定社会地位、奴隶贸易作为支柱产业、教团忙着在乡村传教、而<strong>你在东郊小树林里偷偷搞人体改造</strong>的奇妙世界。
      </p>
      <p>
        没错，你就是传说中的"炼娘术师"。你不炼金、不冒险，也不研究什么无趣死板的魔法。你的工作，就是<em>改造奴隶</em>。你受雇于奴隶集团，用不可告人的古老禁术将送来的少女们按买者的喜好逐一改造。是在一次次"炼娘"中逐渐抹杀自己的良心？还是不甘于现实带着奴隶们起身反抗？一切皆由你选择。
      </p>
      <p>
        顺带一提，你的领居也没有一个是省油的灯。在你偷偷摸摸做着黑色产业的同时，她们也在暗中行动着……。
      </p>
    </div>

    <!-- 角色四宫格 -->
    <div class="character-grid">
      <div class="character-card" v-for="char in characters" :key="char.name">
        <div class="avatar-frame">
          <div
            class="avatar-img"
            :style="{ backgroundImage: `url(${char.avatar})` }"
          ></div>
          <span class="corner tl">❖</span>
          <span class="corner tr">❖</span>
          <span class="corner bl">❖</span>
          <span class="corner br">❖</span>
        </div>
        <h3 class="char-name">{{ char.name }}</h3>
        <p class="char-bio">{{ char.bio }}</p>
      </div>
    </div>

    <!-- 底部 CTA -->
    <div class="cta-section">
      <div class="cta-line left"></div>
      <div class="cta-text-wrapper">
        <span class="cta-sparkle">✦</span>
        <span class="cta-text">开始游玩吧</span>
        <span class="cta-sparkle">✦</span>
      </div>
      <div class="cta-line right"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const avatarCdnBase =
  'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!';

const characters = [
  {
    name: '莉莉安娜·洛尔',
    avatar: `${avatarCdnBase}LL2.png`,
    bio: '19岁，前贵族大小姐，家道中落后沦为奴隶。成为了你的第一个改造对象。你是否愿意带着她一起逃生呢？',
  },
  {
    name: '艾琳娜·克罗斯',
    avatar: `${avatarCdnBase}LS.png`,
    bio: '20岁，东郊小教堂的修女。表面是完美无瑕的修女典范，实际上已经压抑到不行了。在信仰与欲望的消耗战中，前者似乎即将投降。',
  },
  {
    name: '米璐',
    avatar: `${avatarCdnBase}ML.png`,
    bio: '12岁，邻家农户的独生女，经常来你家窜门，觉得你是一个好玩的家伙。',
  },
  {
    name: '菲奥',
    avatar: `${avatarCdnBase}FAO.png`,
    bio: '17岁，可爱的男娘一枚呀~',
  },
];
</script>

<style lang="scss">
:root {
  --transition-theme: all 0.5s ease;
  --font-title: 'KeinannPOP', 'Noto Serif SC', 'Songti SC', 'SimSun', serif;
  --font-body: 'KeinannPOP', 'LXGW Marker Gothic', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --glass-radius: 12px;
}

.dark-mode {
  --bg-primary: transparent;
  --bg-card: rgba(200, 205, 215, 0.05);
  --bg-overlay: rgba(160, 165, 175, 0.03);
  --glass-bg: rgba(210, 215, 225, 0.06);
  --glass-highlight: rgba(220, 225, 235, 0.12);
  --glass-highlight-strong: rgba(230, 235, 245, 0.18);
  --inner-shadow: inset 0 1px 0 rgba(240, 245, 255, 0.06);
  --text-primary: #d8dce4;
  --text-secondary: #9095a0;
  --text-muted: #5a5f6a;
  --accent-pink: #a0a8b8;
  --accent-purple: #7a8290;
  --accent-gold: #8a92a0;
  --accent-rose: #b0b8c8;
  --shadow-glow: rgba(160, 170, 190, 0.3);
  --shadow-purple: rgba(120, 130, 150, 0.25);
  --border-gradient: linear-gradient(135deg, #6a7280, #8a92a0);
  --border-copper: rgba(140, 150, 165, 0.3);
  --placeholder-gradient: radial-gradient(ellipse at center, #0e0e10 0%, #050505 100%);
  --mask-overlay: rgba(5, 5, 6, 0.65);
}

@keyframes twinkle-1 {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}
@keyframes twinkle-2 {
  0%, 100% { opacity: 0.8; }
  50%      { opacity: 0.2; }
}
@keyframes pulse-cta {
  0%, 100% { text-shadow: 0 0 8px rgba(180, 190, 210, 0.3), 0 0 20px rgba(160, 170, 190, 0.15); }
  50%      { text-shadow: 0 0 16px rgba(200, 210, 230, 0.5), 0 0 40px rgba(180, 190, 210, 0.3); }
}
@keyframes float-sparkle {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50%      { transform: translateY(-4px); opacity: 1; }
}
</style>

<style lang="scss" scoped>
.opening-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 32px 28px 28px;
  color: var(--text-primary);
  font-family: var(--font-body);
  position: relative;
  border-radius: var(--glass-radius);
  box-sizing: border-box;

  background:
    linear-gradient(180deg, rgba(200, 210, 230, 0.03) 0%, transparent 25%),
    radial-gradient(ellipse 70% 50% at 50% 25%, rgba(30, 32, 38, 0.35) 0%, rgba(15, 15, 18, 0.45) 50%, rgba(5, 5, 6, 0.5) 100%),
    linear-gradient(180deg, #08080a 0%, #030303 100%);
  border: 1px solid var(--glass-highlight);
  box-shadow: var(--inner-shadow), 0 4px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(180, 190, 210, 0.04);
  backdrop-filter: blur(18px) saturate(120%);
  -webkit-backdrop-filter: blur(18px) saturate(120%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10px;
    right: 10px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(180, 190, 210, 0.1), rgba(200, 210, 230, 0.18), rgba(180, 190, 210, 0.1), transparent);
    border-radius: 1px;
    pointer-events: none;
    z-index: 2;
  }
}

.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: var(--glass-radius);
  z-index: 0;

  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #fff;
  }
}
.stars-layer-1::after {
  box-shadow:
    15px 10px 0 0.5px rgba(230, 240, 255, 1),
    50px 35px 0 0 rgba(210, 225, 245, 0.9),
    85px 8px 0 0.5px rgba(240, 248, 255, 0.85),
    130px 50px 0 0 rgba(220, 235, 250, 0.9),
    170px 22px 0 0.5px rgba(200, 220, 245, 0.8),
    210px 55px 0 0 rgba(235, 245, 255, 1),
    250px 14px 0 0.5px rgba(215, 230, 250, 0.85),
    290px 40px 0 0 rgba(225, 240, 255, 0.9),
    330px 6px 0 0.5px rgba(245, 250, 255, 0.8),
    370px 48px 0 0 rgba(205, 225, 250, 0.75),
    25px 180px 0 0.5px rgba(235, 245, 255, 0.85),
    75px 230px 0 0 rgba(220, 235, 250, 0.9),
    115px 290px 0 0.5px rgba(240, 248, 255, 0.8),
    160px 210px 0 0 rgba(200, 220, 245, 0.85),
    200px 320px 0 0.5px rgba(230, 242, 255, 0.9),
    245px 260px 0 0 rgba(215, 235, 255, 0.8),
    285px 250px 0 0.5px rgba(245, 250, 255, 0.85),
    340px 300px 0 0 rgba(210, 228, 250, 0.9),
    395px 220px 0 0.5px rgba(225, 240, 255, 0.8),
    45px 350px 0 0 rgba(230, 245, 255, 0.65),
    150px 400px 0 0.5px rgba(220, 235, 255, 0.7),
    300px 370px 0 0 rgba(240, 250, 255, 0.6),
    380px 420px 0 0.5px rgba(205, 225, 250, 0.55),
    90px 480px 0 0 rgba(215, 235, 255, 0.65),
    220px 500px 0 0.5px rgba(235, 248, 255, 0.7),
    350px 460px 0 0 rgba(200, 225, 250, 0.55),
    70px 550px 0 0.5px rgba(230, 242, 255, 0.6),
    260px 580px 0 0 rgba(220, 238, 255, 0.55),
    60px 620px 0 0.5px rgba(240, 250, 255, 0.5),
    180px 650px 0 0 rgba(210, 228, 250, 0.5);
  animation: twinkle-1 4s ease-in-out infinite;
}
.stars-layer-2::after {
  box-shadow:
    8px 25px 0 0 rgba(235, 245, 255, 0.7),
    42px 15px 0 0 rgba(200, 220, 250, 0.6),
    95px 60px 0 0 rgba(225, 240, 255, 0.75),
    145px 25px 0 0 rgba(245, 250, 255, 0.6),
    190px 70px 0 0 rgba(210, 230, 255, 0.65),
    240px 28px 0 0 rgba(230, 245, 255, 0.7),
    280px 65px 0 0 rgba(205, 225, 250, 0.6),
    340px 20px 0 0 rgba(240, 250, 255, 0.65),
    55px 150px 0 0 rgba(220, 238, 255, 0.6),
    105px 160px 0 0 rgba(235, 248, 255, 0.7),
    155px 200px 0 0 rgba(200, 222, 248, 0.55),
    210px 240px 0 0 rgba(230, 245, 255, 0.65),
    265px 190px 0 0 rgba(215, 235, 252, 0.6),
    330px 230px 0 0 rgba(245, 252, 255, 0.7),
    385px 170px 0 0 rgba(205, 225, 250, 0.55),
    30px 310px 0 0 rgba(240, 248, 255, 0.55),
    120px 380px 0 0.5px rgba(225, 240, 255, 0.6),
    250px 340px 0 0 rgba(215, 235, 255, 0.55),
    310px 440px 0 0.5px rgba(230, 245, 255, 0.5),
    170px 470px 0 0 rgba(210, 228, 250, 0.5),
    80px 530px 0 0.5px rgba(235, 245, 255, 0.5),
    320px 560px 0 0 rgba(200, 220, 250, 0.45),
    40px 600px 0 0.5px rgba(225, 240, 255, 0.45),
    200px 610px 0 0 rgba(215, 235, 252, 0.45);
  animation: twinkle-2 5s ease-in-out infinite;
}

.opening-root > :not(.stars) {
  position: relative;
  z-index: 1;
}

/* ========== 标题区 ========== */
.title-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title-ornament {
  font-size: 12px;
  color: var(--accent-gold);
  letter-spacing: 8px;
  opacity: 0.5;
}

.main-title {
  font-family: var(--font-title);
  font-size: 48px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 12px;
  margin: 0;
  line-height: 1.3;
  background: linear-gradient(180deg, #e8ecf4 0%, #b0b8c8 50%, #8a92a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-family: var(--font-title);
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 4px;
  margin: 0;
}

/* ========== 简介区 ========== */
.intro-section {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid rgba(160, 170, 190, 0.08);
  border-radius: 10px;
  box-shadow: inset 0 0 24px rgba(200, 210, 230, 0.015);

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.85;
    color: var(--text-secondary);
    text-indent: 2em;
    letter-spacing: 0.5px;

    strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    em {
      color: var(--accent-rose);
      font-style: normal;
    }
  }
}

/* ========== 角色四宫格 ========== */
.character-grid {
  width: 100%;
  max-width: 700px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.character-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 12px;
  background: var(--bg-card);
  border: 1px solid rgba(160, 170, 190, 0.06);
  border-radius: 10px;
  box-shadow: inset 0 0 24px rgba(200, 210, 230, 0.015);
}

.avatar-frame {
  position: relative;
  width: 85%;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  border-image: var(--border-gradient) 1;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--placeholder-gradient);
    z-index: 0;
  }
}

.avatar-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.corner {
  position: absolute;
  font-size: 8px;
  color: var(--accent-pink);
  opacity: 0.4;
  z-index: 2;

  &.tl { top: 4px; left: 4px; }
  &.tr { top: 4px; right: 4px; }
  &.bl { bottom: 4px; left: 4px; }
  &.br { bottom: 4px; right: 4px; }
}

.char-name {
  font-family: var(--font-title);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 2px;
}

.char-bio {
  font-size: 12px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
}

/* ========== 底部 CTA ========== */
.cta-section {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 500px;
  margin-top: 4px;
}

.cta-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(160, 170, 190, 0.3), rgba(200, 210, 230, 0.4), rgba(160, 170, 190, 0.3), transparent);

  &.left {
    background: linear-gradient(90deg, transparent, rgba(160, 170, 190, 0.4));
  }
  &.right {
    background: linear-gradient(90deg, rgba(160, 170, 190, 0.4), transparent);
  }
}

.cta-text-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cta-text {
  font-family: var(--font-title);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 6px;
  color: #c8d0dc;
  animation: pulse-cta 2.5s ease-in-out infinite;
}

.cta-sparkle {
  font-size: 10px;
  color: var(--accent-gold);
  opacity: 0.7;
  animation: float-sparkle 2s ease-in-out infinite;

  &:last-child {
    animation-delay: 1s;
  }
}

/* ========== 响应式 ========== */
@media (max-width: 520px) {
  .opening-root {
    padding: 20px 14px 20px;
    gap: 18px;
  }
  .main-title {
    font-size: 32px;
    letter-spacing: 8px;
  }
  .subtitle {
    font-size: 12px;
    letter-spacing: 2px;
  }
  .intro-section p {
    font-size: 13px;
    text-indent: 1.5em;
  }
  .character-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .avatar-frame {
    width: 65%;
  }
  .cta-text {
    font-size: 18px;
    letter-spacing: 4px;
  }
}
</style>
