<template>
  <div class="map-root">
    <!-- ===== 地图交互区域 ===== -->
    <div
      ref="stageRef"
      class="map-stage"
      :class="{ grabbing: isDragging }"
      @mousedown="onPointerDown"
      @mousemove="onMouseMove"
      @selectstart.prevent
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @click="onStageClick"
      @wheel.prevent="onWheel"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <svg
        :viewBox="`0 0 ${imgWidth} ${imgHeight}`"
        class="map-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="marker-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="current-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <!-- 标记投影 —— 立体感的关键 -->
          <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.55" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <!-- 通用径向高光渐变（白色顶部高光） -->
          <radialGradient id="pin-highlight" cx="35%" cy="25%" r="65%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
            <stop offset="35%" stop-color="rgba(255,255,255,0.15)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </radialGradient>
          <!-- 朱砂渐变（当前位置用） -->
          <radialGradient id="pin-stamp" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#d44848" />
            <stop offset="60%" stop-color="#a83333" />
            <stop offset="100%" stop-color="#6b1414" />
          </radialGradient>
          <!-- 区域倒三角阴影 -->
          <filter id="region-tri-shadow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
            <feOffset dx="0" dy="3" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.6" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <!-- 区域倒三角渐变 -->
          <linearGradient id="region-tri-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1c1c1c" />
            <stop offset="40%" stop-color="#111111" />
            <stop offset="100%" stop-color="#080808" />
          </linearGradient>
          <!-- 区域倒三角顶部高光 -->
          <linearGradient id="region-tri-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="#0a0c10" />

        <g v-if="!mapBaseImg" class="no-image-placeholder">
          <rect :x="imgWidth*0.15" :y="imgHeight*0.38" :width="imgWidth*0.7" :height="imgHeight*0.24" rx="3" fill="none" stroke="#262626" stroke-width="1" stroke-dasharray="6,4" />
          <text :x="imgWidth/2" :y="imgHeight*0.48" text-anchor="middle" fill="#666" font-size="14" font-family="var(--font-ui)" letter-spacing="0.2em">地图底图未加载</text>
        </g>

        <!-- ========== 地图层 ========== -->
        <g :transform="viewTransform">
          <image :href="mapBaseImg" :width="imgWidth" :height="imgHeight" class="map-base-image" />

          <!-- ========== 区域中心标记（立体圆点） ========== -->
          <g v-for="poly in displayRegions" :key="'reg'+poly.name"
            class="region-marker"
            :class="{ selected: selectedRegion === poly.name }"
            :transform="`translate(${polyCenter(poly).x * imgWidth / 100}, ${polyCenter(poly).y * imgHeight / 100})`"
            @click.stop="selectRegion(poly.name)"
          >
            <!-- 透明点击区 -->
            <circle r="42" fill="none" stroke="transparent" />

            <!-- 立体圆点标记 -->
            <g class="region-triangle" filter="url(#region-tri-shadow)">
              <!-- 外圈描边圆 -->
              <circle r="13" :fill="poly.color" opacity="0.9" />
              <circle r="13" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="1.2" />
              <!-- 深色内圈（凹陷感） -->
              <circle r="13" fill="url(#region-tri-grad)" opacity="0.35" />
              <!-- 中心镂空圆孔 -->
              <circle r="5.5" fill="#0a0a0a" />
              <circle r="5.5" fill="none" :stroke="poly.color" stroke-width="0.7" opacity="0.7" />
              <!-- 顶部球面高光 -->
              <ellipse cx="-3.5" cy="-4.5" rx="5" ry="3.5" fill="rgba(255,255,255,0.35)" />
            </g>

            <!-- 区域名称标签 -->
            <text y="28" text-anchor="middle" :fill="poly.color" font-size="18" font-family="var(--font-ui)"
              letter-spacing="0.2em" font-weight="bold" opacity="0.85"
              paint-order="stroke" stroke="rgba(0,0,0,0.9)" stroke-width="3.5"
            >{{ poly.name }}</text>
          </g>

          <!-- ========== 地图标记点（立体 PIN） ========== -->
          <g
            v-for="(marker, name) in store.data.世界.地图标记" :key="name"
            class="map-marker" :class="{ selected: selectedMarker === name }"
            :transform="`translate(${markerToSvgX(marker)}, ${markerToSvgY(marker)})`"
            @click.stop="selectMarker(name, marker)"
          >
            <!-- 选中圈 -->
            <circle v-if="selectedMarker === name" r="20" fill="none" stroke="#cfc8b8" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.7" class="select-ring" />

            <!-- 地面阴影（椭圆软影） -->
            <ellipse cx="0" cy="2" rx="6" ry="1.6" fill="rgba(0,0,0,0.55)" class="pin-ground-shadow" />

            <!-- PIN 主体（水滴形）—— 顶部 -18 到尖端 4，整体高 22 -->
            <g class="pin-body" filter="url(#pin-shadow)">
              <!-- 水滴外形：顶部圆 + 底部尖 -->
              <path
                d="M 0,4 C -8,-4 -8,-12 0,-18 C 8,-12 8,-4 0,4 Z"
                :fill="marker.颜色||'#c9a94e'"
                stroke="rgba(0,0,0,0.5)"
                stroke-width="0.8"
              />
              <!-- 顶部白色高光（贴在 pin 头部） -->
              <ellipse cx="-2" cy="-13" rx="3.5" ry="2.2" fill="url(#pin-highlight)" opacity="0.85" />

              <!-- 内部符号（圆形浅底盘） -->
              <circle cx="0" cy="-11" r="5.2" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" stroke-width="0.4" />

              <!-- 类型符号（统一以 [0,-11] 为中心绘制） -->
              <g :fill="iconColor(marker.颜色)" :stroke="iconColor(marker.颜色)" stroke-width="0.6" transform="translate(0,-11)">
                <template v-if="marker.类型==='宗门'||marker.类型==='势力'">
                  <polygon points="0,-3.4 3,0 0,3.4 -3,0" stroke-width="0.6" />
                </template>
                <template v-else-if="marker.类型==='城镇'||marker.类型==='城市'">
                  <rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="0.6" stroke-width="0.6" />
                </template>
                <template v-else-if="marker.类型==='秘境'||marker.类型==='洞天'">
                  <polygon :points="starPoints(0,0,3.4,1.5,5)" stroke-width="0.5" />
                </template>
                <template v-else-if="marker.类型==='遗迹'">
                  <polygon points="0,-3.4 3.2,2 -3.2,2" stroke-width="0.6" />
                </template>
                <template v-else-if="marker.类型==='山脉'||marker.类型==='山'">
                  <polyline points="-3,1.8 -1.6,-1 0,0 0.8,-2.4 1.8,-0.5 3,1" fill="none" stroke-width="0.8" />
                </template>
                <template v-else-if="marker.类型==='危险'||marker.类型==='禁地'">
                  <line x1="-2.6" y1="-2.6" x2="2.6" y2="2.6" stroke-width="0.9" />
                  <line x1="2.6" y1="-2.6" x2="-2.6" y2="2.6" stroke-width="0.9" />
                </template>
                <template v-else-if="marker.类型==='灵脉'||marker.类型==='灵泉'">
                  <circle r="3" fill="none" stroke-width="0.6" />
                  <circle r="1.4" />
                </template>
                <template v-else>
                  <circle r="2.6" />
                </template>
              </g>
            </g>

            <!-- 标签 -->
            <text y="18" text-anchor="middle" class="marker-label" fill="#cfc8b8" opacity="0.8" font-size="8" font-family="var(--font-ui)" letter-spacing="0.15em">{{ name }}</text>
          </g>

          <!-- ========== 当前所在地（朱砂圆点） ========== -->
          <template v-if="currentLocationSvg">
            <g :transform="`translate(${currentLocationSvg.x}, ${currentLocationSvg.y})`" class="current-pin">
              <!-- 脉动光环 -->
              <circle r="9" fill="none" stroke="#a83333" stroke-width="1.8" class="pulse-ring" />
              <circle r="9" fill="none" stroke="#a83333" stroke-width="1.1" class="pulse-ring-2" />
              <!-- 地面阴影 -->
              <ellipse cx="0" cy="2.5" rx="5.5" ry="1.6" fill="rgba(0,0,0,0.55)" />
              <!-- 圆点主体 -->
              <g filter="url(#pin-shadow)">
                <!-- 朱砂外圈 -->
                <circle r="7" fill="url(#pin-stamp)" stroke="rgba(0,0,0,0.6)" stroke-width="0.8" />
                <!-- 顶部球面高光 -->
                <ellipse cx="-2" cy="-2.5" rx="3" ry="2" fill="url(#pin-highlight)" opacity="0.9" />
                <!-- 中心白色人形点 -->
                <circle r="2.4" fill="#fff" opacity="0.95" />
              </g>
            </g>
            <text :x="currentLocationSvg.x" :y="currentLocationSvg.y+18" text-anchor="middle" fill="#d44848" opacity="0.95" font-size="10" font-family="var(--font-ui)" font-weight="bold" letter-spacing="0.18em" class="current-pin-label"
              paint-order="stroke" stroke="rgba(0,0,0,0.85)" stroke-width="3"
            >{{ store.data.主角.名称 || '主角' }}</text>
          </template>
        </g>

        <!-- ========== 罗盘 ========== -->
        <g class="compass-rose" :transform="`translate(${compassX}, ${compassY})`">
          <circle r="32" fill="#111" stroke="#cfc8b8" stroke-width="0.8" opacity="0.85" />
          <circle r="28" fill="none" stroke="#cfc8b8" stroke-width="0.4" opacity="0.4" />
          <g stroke="#cfc8b8" stroke-width="0.4" opacity="0.4">
            <line v-for="i in 24" :key="'tick'+i"
              :x1="28*Math.cos(i*Math.PI/12)" :y1="28*Math.sin(i*Math.PI/12)"
              :x2="(i%6===0?24:i%3===0?25.5:26.5)*Math.cos(i*Math.PI/12)"
              :y2="(i%6===0?24:i%3===0?25.5:26.5)*Math.sin(i*Math.PI/12)" />
          </g>
          <polygon points="0,-24 3,-2 0,4 -3,-2" fill="#a83333" opacity="0.9" />
          <polygon points="0,24 3,2 0,-4 -3,2" fill="#cfc8b8" opacity="0.6" />
          <text y="-19" text-anchor="middle" fill="#a83333" font-size="10" font-family="var(--font-ui)" font-weight="bold">北</text>
          <text y="26" text-anchor="middle" fill="#cfc8b8" font-size="8" font-family="var(--font-ui)">南</text>
          <text x="-21" y="3.5" text-anchor="middle" fill="#cfc8b8" font-size="8" font-family="var(--font-ui)">西</text>
          <text x="21" y="3.5" text-anchor="middle" fill="#cfc8b8" font-size="8" font-family="var(--font-ui)">东</text>
        </g>

        <!-- ========== 图例 ========== -->
        <g class="map-legend" :transform="`translate(${legendX}, ${legendY})`" opacity="0.8">
          <rect x="0" y="0" width="148" height="86" rx="2" fill="#0c0c0c" stroke="#262626" stroke-width="0.5" />
          <text x="74" y="13" text-anchor="middle" fill="#cfc8b8" font-size="7" font-family="var(--font-ui)" letter-spacing="0.2em">图 例</text>
          <line x1="10" y1="17" x2="138" y2="17" stroke="#262626" stroke-width="0.5" />
          <g font-size="5.5" font-family="var(--font-ui)" fill="#888">
            <circle cx="18" cy="28" r="5" fill="#111" stroke="#cfc8b8" stroke-width="0.8" /><circle cx="18" cy="28" r="2.2" fill="#cfc8b8" opacity="0.6" /><text x="25" y="30">区域标记</text>
            <circle cx="18" cy="40" r="3" fill="#c9a94e" opacity="0.8" /><text x="25" y="43">宗门势力</text>
            <rect x="13" y="47" width="6" height="6" rx="1" fill="#c9a94e" opacity="0.8" /><text x="25" y="55">城镇据点</text>
            <polygon points="18,62 15,68 21,68" fill="#c9a94e" opacity="0.8" /><text x="25" y="68">远古遗迹</text>
            <polygon :points="starPoints(80,26,4,2,6)" fill="#c9a94e" opacity="0.8" /><text x="88" y="30">秘境洞天</text>
            <circle cx="80" cy="40" r="3.5" fill="#a83333" opacity="0.9" /><text x="88" y="44" fill="#a83333">当前位置</text>
            <circle cx="80" cy="52" r="3" fill="#c9a94e" stroke="#c9a94e" stroke-width="0.6" fill-opacity="0.4" /><text x="88" y="56">一般地点</text>
            <line x1="75" y1="66" x2="81" y2="72" stroke="#c9a94e" stroke-width="0.7" opacity="0.8" /><line x1="81" y1="66" x2="75" y2="72" stroke="#c9a94e" stroke-width="0.7" opacity="0.8" /><text x="88" y="72">危险禁地</text>
          </g>
        </g>
      </svg>

      <!-- 缩放控件 -->
      <div class="zoom-controls">
        <button class="zoom-btn" @click="zoomIn" title="放大">+</button>
        <span class="zoom-level">{{ Math.round(view.scale*100) }}%</span>
        <button class="zoom-btn" @click="zoomOut" title="缩小">−</button>
        <button class="zoom-btn zoom-reset" @click="fitToView" title="居中">⊡</button>
        <button v-if="currentLocationSvg" class="zoom-btn zoom-locate" @click="locateUser" title="定位到当前位置">📍</button>
      </div>
    </div>

    <!-- ========== 底部信息栏 ========== -->
    <div class="map-info-bar">
      <span class="info-loc"><i class="fa-solid fa-location-dot info-ico"></i>{{ store.data.世界.当前地点 }}</span>
      <span class="info-time"><i class="fa-solid fa-hourglass info-ico"></i>{{ store.data.世界.当前时间 }}</span>
    </div>

    <!-- ========== 详情面板 ========== -->
    <Transition name="detail-slide">
      <div v-if="selectedMarker || selectedRegion" class="marker-detail-panel" @click.stop>
        <button class="detail-close" @click="clearSelection"><i class="fa-solid fa-xmark"></i></button>
        <div class="detail-header">
          <span class="detail-dot" :style="{ background: detailColor }"></span>
          <span class="detail-name">{{ detailTitle }}</span>
          <span class="detail-type" :style="{ color: detailColor }">{{ detailType }}</span>
        </div>
        <p class="detail-desc" v-if="detailDesc">{{ detailDesc }}</p>
        <p class="detail-empty" v-else>暂无描述信息</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { computed, onMounted, reactive, ref } from 'vue';
import { useDataStore } from '../store';

// 候选路径列表 — 按顺序尝试，哪个先加载成功用哪个
// 原因是实时同步通过 AJAX 注入 HTML，造成相对路径可能解析到错误的位置
const CANDIDATE_PATHS = [
  'https://cdn.jsdelivr.net/gh/roikoni/my_blog_image/A%3A%5CSilly%20Tavern%E7%9B%B8%E5%85%B3%5C%E5%9B%BE%E5%BA%8A-%E6%88%91%E8%A2%AB%E7%8C%AB%E5%A8%98%E5%8C%85%E5%9B%B4%E4%BA%86!%E5%9C%B0%E5%9B%BE%E5%BA%95%E5%9B%BE.png',
  'http://localhost:5500/dist/修仙状态栏/地图底图.png',
  './地图底图.png',
];

import mapRegionsData from '../map_regions.json';

const store = useDataStore();

// ========== 底图加载 ==========
const mapBaseImg = ref('');
const imgWidth = ref(1200);
const imgHeight = ref(800);
const imageLoaded = ref(false);

onMounted(async () => {
  // 加载底图
  for (const path of CANDIDATE_PATHS) {
    const img = await new Promise<HTMLImageElement | null>(resolve => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = path;
    });
    if (img) {
      mapBaseImg.value = img.src;
      imgWidth.value = img.naturalWidth;
      imgHeight.value = img.naturalHeight;
      imageLoaded.value = true;
      fitToView();
      break;
    }
  }
  if (!imageLoaded.value) imageLoaded.value = true;

  // 区域描述
  const regionDescs: Record<string, string> = {
    '西漠':'广袤沙漠与戈壁，隐藏上古遗迹。魔道四宗割据之地，莫尔迦的独立王国所在。大虞名义疆界止于天渊关口',
    '中州':'灵气最浓郁的核心地带，大虞皇朝所在，正道七宗有五宗坐落于此。地广人稠，修仙文明最发达',
    '北冥':'极寒冰原与无尽海域，无国家无宗门辖区，人口密度全大陆最低。龙族与远古异兽的传说栖息地',
    '南岭':'群山连绵，盛产灵草灵矿，丹修器修天堂。丹霞宗主导南岭宗盟，大虞州牧只有旁听权',
    '东荒':'原始森林与山脉交错，妖族传统领地。无统一国家，由诸侯七国、城邦、妖族部落各自统治',
    '无属沙海':'西漠最深处大沙漠，不属于任何势力。资源匮乏妖兽横行，只有亡命之徒和追寻者深入',
    '万象魔宗辖区':'西漠东南角绿洲群。万象魔宗主张以魔证道，对领民相对宽和。辖区内有凡人村庄和散修坊市',
    '幽魂谷辖区':'西漠地下溶洞群，地面荒凉地下灯火通明。幽魂谷以神魂秘术操纵亡者从事重体力劳动',
    '血煞宗辖区':'西漠最大矿区。血煞宗以血炼之法快速提升修为，正道公敌。矿区内秩序极严',
    '莫尔伽领地':'天渊裂谷以北三百里，古神莫尔迦自建的绿洲王国。修仙界未承认，但也没有宗门敢踏入',
    '玄冰城':'北冥唯一大城，建在冰山上。大虞最近一次派遣官员是一百二十年前',
    '天渊关口':'中州与西漠之间的关口，大虞名义疆界止于此。西行商队和逃亡者在此交汇',
    '北海渔港及渔村':'北海沿岸自治社区，没有法律没有税收。渔民自行推举长者裁决纠纷',
    '克茜拉的废弃渔村':'渔港以北约百里。古神克茜拉潜伏于此，村民已被深度污染',
    '玄冰宫':'唯一北冥大宗，正道七宗之一。修炼冰系功法，与世隔绝神秘低调',
    '太虚剑宗':'正道七宗之首，天下剑修祖庭。山门在中州河朔州苍云峰，以"太虚剑诀"名震修仙界。现任宗主为渡劫后期剑尊',
    '天机阁':'正道七宗之一，精研阵法与推演之术，号称"算尽天机"。阁址在天京城灵城区中枢，是七宗中唯一把山门设在凡人皇都内的',
    '万法门':'正道七宗之一，法术研究圣地，藏有最多品类的功法秘籍。山门在临江州万法山，主张"万法归宗"，兼容并蓄',
    '碧落宫':'正道七宗之一，以医道入世，悬壶济世。山门在云岫州药王谷，掌握最顶尖的疗伤续命之术',
    '镇岳宗':'正道七宗之一，体修正统，以肉身对抗天地。门人数量最少但个个战力惊人。山门在东平州铁岳',
    '北方边境关口':'大虞北方边境，当地郡守世代与玄冰宫通婚。大虞对北冥的实际控制止于此',
    '天京城':'大虞都城，大陆最大城市，人口逾百万。城中分凡城区与灵城区，灵城区内设万象坊，为五域商路总枢纽',
    '青木城':'东荒七诸侯国中最大者，散修猎妖者的主要集散地。以猎妖和灵草贸易为生',
    '东平州':'中州东部州郡，东接诸侯七国区，是通往东荒的商路起点',
    '临江州':'中州南部州郡，临江而建，水运要道，连接中州与南岭的重要枢纽',
    '灵台司':'直属于大虞皇帝的机构。收集修仙界情报、与宗门交涉、监管坊市税收',
    '云岫州':'中州西部州郡，临近西漠边境，是天渊关口以东最近的州治',
    '河朔州':'中州北部州郡，北接北方边境关口，土地贫瘠人口稀少',
    '丹霞宗':'南岭实际统治者。炼丹第一宗，垄断高阶丹药。对凡人采用药农制',
    '百草城':'南岭最大城市，药材集散中心。名义大虞城池，实由丹霞宗全权控制',
    '炉山镇':'南岭炼器师自治城镇。只对炼器师征税，凡人免税。吸引大量散修落户',
    '斯芬克斯的道观':'南岭群山深处废弃道观。古神斯芬克斯隐居二百年。丹霞宗评估威胁程度为零',
    '南岭宗盟':'丹霞宗主导的九宗联盟，南岭实际统治机构。大虞州牧只有旁听权',
    '无主之地':'东荒最深处，荒古遗迹所在，五阶以上妖兽栖息地。不属于任何政权',
    '诸侯七国区':'大虞册封的东荒边境七诸侯国。名义藩属，实际自主权极大',
    '万妖林':'妖族核心领地，妖王庭所在。三大部族分治，与邻近人族维持贸易与外交',
    '人族妖族共治区':'东荒缓冲带的自治城邦，由两族混血者建立',
    '无尽海':'大陆之外的无尽海域。出海者大多未归。归者说远方有雾，雾中有山',
    '北海':'北冥以北的寒冷海域，龙族与远古异兽的传说栖息地',
    '未知领域':'东荒最深处从未被探索的区域，迷雾笼罩。有些东西不愿意被找到',
    '无尽海群岛':'距海岸数百里的孤岛群。有归者声称岛上有人居住，建筑风格不属于任何已知时代',
  };

  // 从 JSON 同步区域数据到 MVU（只补全缺失的）
  const current = store.data.世界?.地图区域;
  if (current && mapRegionsData.regions) {
    let added = 0;
    for (const r of mapRegionsData.regions) {
      if (!current[r.name]) {
        current[r.name] = { 颜色: r.color, 顶点: r.vertices, 描述: regionDescs[r.name] || '' };
        added++;
      }
    }
    if (added > 0) console.info(`[WorldMapTab] 已从 JSON 补全 ${added} 个区域`);
  }
});

// ========== 坐标转换 ==========
function markerToSvgX(marker: { x: number }): number {
  return (marker.x / 100) * imgWidth.value;
}
function markerToSvgY(marker: { y: number }): number {
  return (marker.y / 100) * imgHeight.value;
}

// ========== 固定叠加层位置 ==========
const compassX = computed(() => imgWidth.value - 75);
const compassY = computed(() => 70);
const legendX = computed(() => 18);
const legendY = computed(() => imgHeight.value - 88);

// ========== 星形生成 ==========
function starPoints(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    coords.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return coords.join(' ');
}

// 根据 pin 主色挑选符号颜色 —— 亮色 pin 用深色符号，暗色 pin 用亮色符号
function iconColor(pinColor?: string): string {
  if (!pinColor) return '#fff';
  // 解析 hex
  const m = pinColor.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return '#fff';
  const r = parseInt(m[1].slice(0, 2), 16);
  const g = parseInt(m[1].slice(2, 4), 16);
  const b = parseInt(m[1].slice(4, 6), 16);
  // 相对亮度 (W3C 简化)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? 'rgba(20,15,8,0.9)' : 'rgba(255,240,200,0.95)';
}

// ========== 当前所在地匹配 ==========
const currentLocationMatch = computed(() => {
  const loc = store.data.世界.当前地点;
  if (!loc) return null;
  const markers = store.data.世界.地图标记;

  // 优先精确匹配地图标记
  if (markers) {
    // 1) 精确 key 匹配
    if (markers[loc]) return { name: loc, marker: markers[loc], source: 'marker' };
    // 2) 双向包含匹配（取最短的匹配名，避免 "中州" 匹配到 "东平州" 等误命中）
    const matches: { name: string; marker: any; len: number }[] = [];
    for (const [name, marker] of Object.entries(markers)) {
      if (loc.includes(name) || name.includes(loc)) {
        matches.push({ name, marker, len: name.length });
      }
    }
    if (matches.length) {
      // 优先选择名称最长的匹配（最具体），但如果 loc 包含 name 则优先（因为更精确）
      matches.sort((a, b) => {
        const aExact = a.name === loc;
        const bExact = b.name === loc;
        if (aExact !== bExact) return aExact ? -1 : 1;
        // 相同精确度时，选更长的名称（更具体）
        return b.len - a.len;
      });
      return { name: matches[0].name, marker: matches[0].marker, source: 'marker' };
    }
  }

  // 回退：匹配区域名，使用区域中心作为坐标
  const regions = store.data.世界?.地图区域;
  if (regions) {
    // 精确 key 匹配
    if (regions[loc]) {
      const r = regions[loc];
      const center = polyCenter({ vertices: r.顶点 || [] });
      return { name: loc, marker: { x: center.x, y: center.y, 颜色: r.颜色 }, source: 'region' };
    }
    // 包含匹配
    for (const [name, data] of Object.entries(regions)) {
      if (loc.includes(name) || name.includes(loc)) {
        const r = data as any;
        const center = polyCenter({ vertices: r.顶点 || [] });
        return { name, marker: { x: center.x, y: center.y, 颜色: r.颜色 }, source: 'region' };
      }
    }
  }

  // 最终回退：在地图中心显示，标注为当前位置
  return { name: loc, marker: { x: 50, y: 50 }, source: 'fallback' };
});
const currentLocationName = computed(() => currentLocationMatch.value?.name ?? '');
const currentLocationSvg = computed(() => {
  const m = currentLocationMatch.value;
  if (!m) return null;
  return { x: markerToSvgX(m.marker), y: markerToSvgY(m.marker), source: m.source };
});

// ========== 平移/缩放 ==========
const view = reactive({ x: 0, y: 0, scale: 1 });
const viewTransform = computed(() => `translate(${view.x}, ${view.y}) scale(${view.scale})`);

const stageRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
let dragStart = { x: 0, y: 0 };
let panStart = { x: 0, y: 0 };
let mouseHasMoved = false;  // ← 关键：区分拖拽和点击

// 拖拽灵敏度 — 触摸端乘数更大
const DRAG_MOUSE = 4;
const DRAG_TOUCH = 7;

function onPointerDown(e: MouseEvent) {
  // 忽略中键/右键
  if (e.button !== 0) return;
  isDragging.value = true;
  mouseHasMoved = false;
  dragStart = { x: e.clientX, y: e.clientY };
  panStart = { x: view.x, y: view.y };
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) mouseHasMoved = true;
  view.x = panStart.x + dx * DRAG_MOUSE;
  view.y = panStart.y + dy * DRAG_MOUSE;
  clampView();
}

function onMouseUp() {
  isDragging.value = false;
}

// 利用浏览器原生 click 事件（mousedown+up 无明显位移才触发）判点击
function onStageClick(_e: MouseEvent) {
  if (mouseHasMoved) return;
  clearSelection();
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? 0.88 : 1.12;
  applyZoom(delta, e.clientX, e.clientY);
}

// ========== 触摸事件 ==========
let lastTouchDist = 0;
let touchHasMoved = false;
let touchStartTime = 0;

function onTouchStart(e: TouchEvent) {
  // 如果有多个 touch 或 touch 目标并非 map-stage 本身 → 允许按钮等子元素正常响应
  if (e.touches.length === 1) {
    const target = e.target as HTMLElement | null;
    // 如果触摸到了按钮/控件，不接管事件
    if (target && (target.closest('.zoom-controls') || target.closest('.detail-close'))) {
      return;
    }
    // 不再在此处 preventDefault —— 让 click 事件能正常合成
    isDragging.value = true;
    touchHasMoved = false;
    touchStartTime = Date.now();
    dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    panStart = { x: view.x, y: view.y };
  } else if (e.touches.length === 2) {
    e.preventDefault();
    isDragging.value = false;
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
  }
}
function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && isDragging.value) {
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) touchHasMoved = true;
    // 只有确认在拖拽时才阻止默认行为，避免阻止 click 合成
    if (touchHasMoved) {
      e.preventDefault();
      view.x = panStart.x + dx * DRAG_TOUCH;
      view.y = panStart.y + dy * DRAG_TOUCH;
      clampView();
    }
  } else if (e.touches.length === 2) {
    e.preventDefault();
    const newDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    const newCenter = {
      x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
      y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
    };
    if (lastTouchDist > 0) applyZoom(newDist / lastTouchDist, newCenter.x, newCenter.y);
    lastTouchDist = newDist;
  }
}
function onTouchEnd(_e: TouchEvent) {
  isDragging.value = false;
}

// ========== 缩放 ==========
function clampView() {
  const w = imgWidth.value;
  const h = imgHeight.value;
  // scale=1 时允许一定范围外的拖拽（±图像尺寸的 20%），scale 越大范围越大
  const paddingRatio = Math.max(0, (view.scale - 1) * w);
  view.x = _.clamp(view.x, w * (1 - view.scale) - paddingRatio, paddingRatio);
  view.y = _.clamp(view.y, h * (1 - view.scale) - paddingRatio, paddingRatio);
}

function applyZoom(ratio: number, cx: number, cy: number) {
  const rect = stageRef.value?.getBoundingClientRect();
  if (!rect) return;
  const newScale = _.clamp(view.scale * ratio, 1, 6);
  const relX = cx - rect.left;
  const relY = cy - rect.top;
  view.x = relX - (relX - view.x) * (newScale / view.scale);
  view.y = relY - (relY - view.y) * (newScale / view.scale);
  view.scale = newScale;
  clampView();
}
function zoomIn()  { const r = stageRef.value?.getBoundingClientRect(); if (r) applyZoom(1.25, r.left + r.width / 2, r.top + r.height / 2); }
function zoomOut() { const r = stageRef.value?.getBoundingClientRect(); if (r) applyZoom(0.8, r.left + r.width / 2, r.top + r.height / 2); }

function fitToView() {
  view.x = 0;
  view.y = 0;
  view.scale = 1;
  clearSelection();
}

function locateUser() {
  const loc = currentLocationSvg.value;
  if (!loc) return;
  view.scale = 3;
  view.x = imgWidth.value / 2 - loc.x * view.scale;
  view.y = imgHeight.value / 2 - loc.y * view.scale;
  clampView();
}

// ========== 区域数据（从 MVU 读取） ==========
const MAJOR_REGIONS = ['西漠', '中州', '北冥', '南岭', '东荒'];
const PARENT_COLORS: Record<string, string> = {
  中州: '#cfc8b8',  // 金色
  西漠: '#8b5e3c',  // 深棕
  南岭: '#a83333',  // 红色
  东荒: '#4a7b6b',  // 深绿
  北冥: '#5b7b8b',  // 青色
};

// 射线法判断点是否在多边形内
function pointInPolygon(px: number, py: number, vertices: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const allRegions = computed(() => {
  const src = store.data.世界?.地图区域;
  if (!src) return [];
  return Object.entries(src).map(([name, data]: [string, any]) => ({
    name,
    vertices: data.顶点 || [],
    color: data.颜色 || '#cfc8b8',
    desc: data.描述 || '',
  }));
});

// 大域的多边形数据（用于判断归属）
const majorRegionPolygons = computed(() =>
  allRegions.value.filter(r => MAJOR_REGIONS.includes(r.name))
);

// 非大域的区域（显示在地图上），附带归属信息，颜色继承自所属大域
const displayRegions = computed(() => {
  return allRegions.value
    .filter(r => !MAJOR_REGIONS.includes(r.name))
    .map(r => {
      const center = polyCenter(r);
      const parent = majorRegionPolygons.value.find(m =>
        pointInPolygon(center.x, center.y, m.vertices)
      );
      const parentName = parent?.name || '';
      return {
        ...r,
        parent: parentName,
        color: PARENT_COLORS[parentName] || '#e0e0e0',
      };
    });
});

function polyCenter(poly: { vertices: { x: number; y: number }[] }) {
  const n = poly.vertices.length;
  if (n === 0) return { x: 0, y: 0 };
  const sum = poly.vertices.reduce((a, v) => ({ x: a.x + v.x, y: a.y + v.y }), { x: 0, y: 0 });
  return { x: Math.round(sum.x / n), y: Math.round(sum.y / n) };
}

// ========== 选中（标记点 + 区域） ==========
const selectedMarker = ref<string | null>(null);
const selectedRegion = ref<string | null>(null);

function selectMarker(name: string, _marker: unknown) {
  selectedMarker.value = selectedMarker.value === name ? null : name;
  selectedRegion.value = null;
}
function selectRegion(name: string) {
  selectedRegion.value = selectedRegion.value === name ? null : name;
  selectedMarker.value = null;
}
function clearSelection() {
  selectedMarker.value = null;
  selectedRegion.value = null;
}

const selectedRegionData = computed(() => {
  if (!selectedRegion.value) return null;
  return displayRegions.value.find(r => r.name === selectedRegion.value) ?? null;
});
const selectedRegionParent = computed(() => selectedRegionData.value?.parent || '');

const detailTitle = computed(() => {
  if (selectedMarker.value) return selectedMarker.value;
  if (selectedRegion.value) return selectedRegion.value;
  return '';
});
const detailColor = computed(() => {
  if (selectedMarker.value) return store.data.世界.地图标记?.[selectedMarker.value]?.颜色 || '#c9a94e';
  if (selectedRegion.value) return selectedRegionData.value?.color || '#c9a94e';
  return '#c9a94e';
});
const detailType = computed(() => {
  if (selectedMarker.value) return store.data.世界.地图标记?.[selectedMarker.value]?.类型 || '地点';
  if (selectedRegion.value) return selectedRegionParent.value ? `所属：${selectedRegionParent.value}` : '区域';
  return '';
});
const detailDesc = computed(() => {
  if (selectedMarker.value) return store.data.世界.地图标记?.[selectedMarker.value]?.描述 || '';
  if (selectedRegionData.value) return selectedRegionData.value.desc || '暂无区域描述';
  return '';
});
</script>

<style lang="scss" scoped>
.map-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #080a0c;
  position: relative;
}

/* ===== 加载状态 ===== */
.map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  font-size: 0.75rem;
  z-index: 5;
}
.loading-icon { font-size: 2rem; color: var(--c-gold); opacity: 0.6; }

/* ===== 地图画布 ===== */
.map-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
  min-height: 0;
  background: #080a0c;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;

  &.grabbing { cursor: grabbing; }
}
.map-svg { width: 100%; height: 100%; display: block; }
.map-base-image { image-rendering: auto; }

/* ===== 标记 ===== */
.marker-label {
  pointer-events: none;
  user-select: none;
  paint-order: stroke;
  stroke: #0c0c0c;
  stroke-width: 2px;
  stroke-opacity: 0.85;
  transition: opacity 0.2s, fill 0.2s;
}
.map-marker {
  cursor: pointer;
  transition: opacity 0.2s;

  /* PIN 本体的"起跳"动效（用 transform-origin 锁定尖端） */
  .pin-body {
    transform-origin: 0 4px;
    transform-box: fill-box;
    transition: transform 0.2s cubic-bezier(.22,.61,.36,1);
  }
  .pin-ground-shadow {
    transition: transform 0.2s, opacity 0.2s;
  }
  .select-ring {
    animation: select-ring-anim 1.5s ease-in-out infinite;
    transform-origin: 0 0;
    transform-box: fill-box;
  }

  &:hover {
    opacity: 1 !important;
    .marker-label { opacity: 1 !important; fill: #e8e0d0 !important; }
    .pin-body { transform: translateY(-3px) scale(1.08); }
    .pin-ground-shadow { transform: scaleX(1.25); opacity: 0.4; }
  }
  &.selected {
    opacity: 1 !important;
    .pin-body { animation: pin-bounce 1.4s ease-in-out infinite; }
    .marker-label { opacity: 1 !important; fill: #e8e0d0 !important; font-weight: bold; }
  }
}
@keyframes pin-bounce {
  0%, 100% { transform: translateY(0)    scale(1);    }
  50%      { transform: translateY(-4px) scale(1.06); }
}
@keyframes select-ring-anim {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 0.85; }
}

/* 当前位置 PIN 标签 */
.current-pin-label {
  pointer-events: none;
  user-select: none;
}

/* ===== 脉动动画 ===== */
@keyframes pulse-ring-anim {
  0%, 100% { r: 9; opacity: 0.8; }
  50% { r: 20; opacity: 0; }
}
@keyframes pulse-ring-anim-2 {
  0%, 100% { r: 9; opacity: 0.6; }
  50% { r: 16; opacity: 0; }
}
.pulse-ring  { animation: pulse-ring-anim 2.2s ease-out infinite; }
.pulse-ring-2 { animation: pulse-ring-anim-2 2.2s ease-out 0.55s infinite; }

/* ===== 缩放控件 ===== */
.zoom-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 10;
}
.zoom-btn {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(180, 180, 190, 0.22);
  border-radius: 2px;
  color: var(--c-gold);
  font-size: 0.85rem;
  font-family: var(--font-ui);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
  &:hover { background: rgba(207, 200, 184, 0.15); border-color: var(--c-gold); }
}
.zoom-level {
  text-align: center;
  font-size: 0.5rem;
  color: var(--c-text-dim);
  font-family: var(--font-ui);
  padding: 1px 0;
}
.zoom-reset { font-size: 0.65rem; }
.zoom-locate { font-size: 0.75rem; }

/* ===== 区域倒三角标记 ===== */
.region-marker {
  cursor: pointer;
  transition: opacity 0.2s;

  .region-triangle {
    transition: transform 0.25s cubic-bezier(.22,.61,.36,1), filter 0.25s;
    transform-origin: center center;
    transform-box: fill-box;
  }

  &:hover {
    opacity: 1 !important;
    .region-triangle {
      transform: scale(1.12);
      filter: url(#region-tri-shadow) brightness(1.2);
    }
    text { opacity: 1 !important; fill: #e8e0d0 !important; }
  }
  &.selected {
    opacity: 1 !important;
    .region-triangle {
      animation: tri-pulse 1.5s ease-in-out infinite;
    }
    text { opacity: 1 !important; font-weight: bold; }
  }
}

@keyframes tri-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}

/* ===== 底部信息栏 ===== */
.map-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  border-top: 1px solid rgba(180, 180, 190, 0.16);
  background: rgba(0, 0, 0, 0.5);
  font-family: var(--font-ui);
  font-size: 0.68rem;
  color: var(--c-text-dim);
  backdrop-filter: blur(4px);
  flex-shrink: 0;
}
.info-ico { font-size: 0.55rem; color: var(--c-gold); opacity: 0.5; margin-right: 4px; }
.info-loc { color: var(--c-gold); }

/* ===== 详情面板 ===== */
.marker-detail-panel {
  position: absolute;
  bottom: 8px; left: 8px; right: 8px;
  background: rgba(12, 12, 12, 0.92);
  border: 1px solid rgba(180, 180, 190, 0.22);
  border-radius: 2px;
  padding: 12px 16px;
  backdrop-filter: blur(14px);
  z-index: 20;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.6);
}
.detail-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.detail-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.detail-name {
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--c-text);
  font-weight: bold;
  letter-spacing: 0.1em;
}
.detail-type {
  font-family: var(--font-ui);
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  margin-left: auto;
  padding: 1px 8px;
  border: 1px solid currentColor;
  border-radius: 2px;
  opacity: 0.7;
}
.detail-desc {
  font-family: var(--font-ui);
  font-size: 0.68rem;
  color: var(--c-text-dim);
  line-height: 1.6;
  margin: 0;
}
.detail-empty {
  font-size: 0.62rem;
  color: var(--c-text-dim);
  opacity: 0.5;
  font-family: var(--font-ui);
  margin: 0;
}
.detail-close {
  position: absolute;
  top: 6px; right: 8px;
  background: none;
  border: none;
  color: var(--c-text-dim);
  cursor: pointer;
  font-size: 0.7rem;
  padding: 2px 4px;
  transition: color 0.2s;
  &:hover { color: var(--c-gold); }
}
.detail-slide-enter-active,
.detail-slide-leave-active { transition: all 0.25s ease; }
.detail-slide-enter-from,
.detail-slide-leave-to { opacity: 0; transform: translateY(12px); }

/* ===== 响应式 ===== */
@media (max-width: 500px) {
  .map-info-bar { padding: 4px 10px; font-size: 0.65rem; }
  .zoom-controls { top: 6px; right: 6px; gap: 4px; }
  .zoom-btn { width: 32px; height: 32px; font-size: 0.9rem; }
  .zoom-level { font-size: 0.55rem; }
  .marker-detail-panel { padding: 8px 12px; }
  .detail-name { font-size: 0.8rem; }
  .detail-desc { font-size: 0.7rem; }
}
@media (max-width: 360px) {
  .zoom-btn { width: 28px; height: 28px; font-size: 0.75rem; }
}
</style>
