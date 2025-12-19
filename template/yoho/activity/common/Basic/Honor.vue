<!-- 荣耀勋章组件 - 集成魅力/财富/VIP图标 -->
<template>
  <div class="honor" :style="{ width: w ? w + 'rem' : '100%' }" :class="{ top: top3 }">
    <!-- 图标区域（魅力/财富/VIP） -->
    <div class="fc icon" v-if="showIcon">
      <!-- 魅力图标 -->
      <div
        v-if="data?.glamourLevel"
        class="icon-wrap"
        :class="charmIconClass"
        :style="charmIconStyle"
        style="margin: 0 0.03rem"
      >
        <span>{{ data.glamourLevel }}</span>
      </div>
      <!-- 财富图标 -->
      <div
        v-if="data?.wealthLevel"
        class="icon-wrap"
        :class="wealthIconClass"
        :style="wealthIconStyle"
        style="margin: 0 0.03rem"
      >
        <span>{{ data.wealthLevel }}</span>
      </div>
      <!-- VIP图标 -->
      <div
        v-if="vipLevel"
        class="vip-icon-wrap fc"
        :class="['vip', TOOL_countryCode]"
        style="margin: 0 0.03rem"
      >
        <img v-lazyload.webp="`${ossIconDomain}/vip.png`" alt="" />
        <span class="level">VIP{{ vipLevel }}</span>
      </div>
    </div>
    <!-- 勋章图片区域 -->
    <template v-if="showBadge && data">
      <cdnImg
        v-for="icPic in data?.badgeImg"
        :key="icPic"
        :fid="icPic"
        :style="{
          margin: top3 ? '0 0.08rem' : '0 0.03rem',
          width: '0.4rem',
          height: '0.4rem'
        }"
      />
    </template>
  </div>
</template>

<script lang="ts" setup name="Honor">
import { ref, computed, onMounted, inject } from 'vue'
import injectTool from '@publicComponents/injectTool'

const { TOOL_httpClient, TOOL_countryCode } = injectTool()

/* ============================================================
   Props 定义
============================================================ */
const props = defineProps({
  // 数据源
  data: {
    type: Object,
    default: () => ({})
  },
  // 容器宽度 (rem)
  w: {
    type: Number
  },
  // 是否为 top3 样式
  top3: {
    type: Boolean,
    default: false
  },
  // 显示控制
  showIcon: {
    type: Boolean,
    default: true
  },
  showBadge: {
    type: Boolean,
    default: true
  },
  // 阿拉伯语布局（未设置时根据 countryCode 判断）
  ar: {
    type: Boolean,
    default: undefined
  },
  // rem 单位配置
  rem: {
    type: Boolean,
    default: true
  },
  remOption: {
    type: Object,
    default: () => ({ screenWidth: 375, screenRem: 7.5 })
  },
  // vw 单位配置
  vw: {
    type: Boolean,
    default: false
  },
  vwOption: {
    type: Object,
    default: () => ({ screenWidth: 375 })
  }
})

/* ============================================================
   基础配置
============================================================ */
declare const ENV: string

// 是否阿拉伯语布局
const isAr = computed(() => (props.ar !== undefined ? props.ar : TOOL_countryCode === 'EG'))

// OSS 域名
const ossUrl = inject('ossUrl') as string
const ossIconDomain = computed(() => `${ossUrl}/icon`)

// CDN 域名
const cdnDomainPrefix = ENV === 'build' ? 'cdn' : 'cdn-test'
const cdnAssetsPrefix = `https://${cdnDomainPrefix}.waka.media/`

/* ============================================================
   缓存配置
============================================================ */
const CACHE_KEYS = {
  CHARM: 'GLAMOUR_LEVEL_CONFIG',
  CHARM_EXPIRY: 'GLAMOUR_LEVEL_CONFIG_EXPIRY',
  WEALTH: 'WEALTH_LEVEL_CONFIG',
  WEALTH_EXPIRY: 'WEALTH_LEVEL_CONFIG_EXPIRY'
} as const

const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时

// 图标配置数据
const charmConfig = ref<any[]>([])
const wealthConfig = ref<any[]>([])

/* ============================================================
   缓存操作
============================================================ */
const loadFromCache = (cacheKey: string, expiryKey: string) => {
  try {
    const expiry = localStorage.getItem(expiryKey)
    const now = Date.now()
    if (!expiry || now > parseInt(expiry)) {
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(expiryKey)
      return null
    }
    const cached = localStorage.getItem(cacheKey)
    return cached ? JSON.parse(cached) : null
  } catch (e) {
    console.error('读取缓存失败:', e)
    return null
  }
}

const saveToCache = (cacheKey: string, expiryKey: string, data: any) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data))
    localStorage.setItem(expiryKey, String(Date.now() + CACHE_DURATION))
  } catch (e) {
    console.error('保存缓存失败:', e)
  }
}

/* ============================================================
   API 请求
============================================================ */
let fetchingPromise: Promise<any> | null = null

const fetchConfig = () => {
  return TOOL_httpClient({ url: '/api/activity/commonBusiness/getSvrConfig', method: 'get' })
    .then((response: any) => {
      const {
        data: { data, errorCode }
      } = response
      if (errorCode !== 0) throw response

      if (data) {
        // 解析魅力等级图标
        try {
          const charmData = JSON.parse(data.glamour_level_icon)
          charmConfig.value = charmData.glamour_level_icon
          saveToCache(CACHE_KEYS.CHARM, CACHE_KEYS.CHARM_EXPIRY, charmData.glamour_level_icon)
        } catch (e) {
          console.error('解析魅力等级图标数据失败:', e)
        }
        // 解析财富等级图标
        try {
          const wealthData = JSON.parse(data.wealth_level_icon)
          wealthConfig.value = wealthData.wealth_level_icon
          saveToCache(CACHE_KEYS.WEALTH, CACHE_KEYS.WEALTH_EXPIRY, wealthData.wealth_level_icon)
        } catch (e) {
          console.error('解析财富等级图标数据失败:', e)
        }
      }
    })
    .catch((err: any) => console.error(err.toString()))
    .finally(() => (fetchingPromise = null))
}

const loadConfig = () => {
  // 从缓存加载
  const cachedCharm = loadFromCache(CACHE_KEYS.CHARM, CACHE_KEYS.CHARM_EXPIRY)
  const cachedWealth = loadFromCache(CACHE_KEYS.WEALTH, CACHE_KEYS.WEALTH_EXPIRY)

  if (cachedCharm) charmConfig.value = cachedCharm
  if (cachedWealth) wealthConfig.value = cachedWealth

  // 缓存都有则不请求
  if (cachedCharm && cachedWealth) return
  // 避免重复请求
  if (fetchingPromise) return

  fetchingPromise = fetchConfig()
}

/* ============================================================
   单位转换工具
============================================================ */
const pxToRem = (px: number) => (px / props.remOption.screenWidth) * props.remOption.screenRem
const pxToVw = (px: number) => (px / props.vwOption.screenWidth) * 100
const transformPx = (px: number) => (props.vw ? `${pxToVw(px)}vw` : `${pxToRem(px)}rem`)

const getDefaultStyle = () => {
  return props.vw
    ? { height: '3.733vw', lineHeight: '3.733vw', padding: '0 5.6vw', width: '8.533vw' }
    : { height: '0.28rem', lineHeight: '0.28rem', padding: '0 0.42rem', width: '0.64rem' }
}

const getStyleFromConfig = (config: any) => ({
  height: transformPx(config.bg_size.height),
  width: transformPx(config.bg_size.width),
  padding: `${config.min >= 500 ? 2 : 1}px ${transformPx(config.text_position - 1)} 0`,
  letterSpacing: transformPx(-0.4)
})

/* ============================================================
   VIP 图标
============================================================ */
const VIP_RANGE = [1, 9] as const

const vipLevel = computed(() => {
  const level = props.data?.vipLevel
  return level && level >= VIP_RANGE[0] && level <= VIP_RANGE[1] ? level : 0
})

/* ============================================================
   魅力图标
============================================================ */
const charmIconClass = computed(() => {
  const level = props.data?.glamourLevel || 0
  const baseClass = 'charismal_'
  return isAr.value ? `${baseClass}${level}_ar text text_ar` : `text ${baseClass}${level}`
})

const charmIconStyle = computed(() => {
  const level = props.data?.glamourLevel || 0
  if (!level) return {}

  let config = charmConfig.value?.find((c: any) => level >= c.min && level <= c.max)
  if (!config?.fid && level > 0) {
    config = charmConfig.value?.[charmConfig.value.length - 1]
  }

  if (!config?.fid) {
    return { color: '#FFFFFF', ...getDefaultStyle() }
  }

  return {
    backgroundImage: `url(${cdnAssetsPrefix}${isAr.value ? config.ar_fid : config.fid})`,
    color: config.text_color || '#FFFFFF',
    ...getStyleFromConfig(config)
  }
})

/* ============================================================
   财富图标
============================================================ */
const wealthIconClass = computed(() => {
  const level = props.data?.wealthLevel || 0
  const baseClass = 'wealth_'
  return isAr.value ? `${baseClass}${level}_ar text text_ar` : `text ${baseClass}${level}`
})

const wealthIconStyle = computed(() => {
  const level = props.data?.wealthLevel || 0
  if (!level) return {}

  let config = wealthConfig.value?.find((c: any) => level >= c.min && level <= c.max)
  if (!config?.fid && level > 0) {
    config = wealthConfig.value?.[wealthConfig.value.length - 1]
  }

  if (!config?.fid) {
    return { color: '#FFFFFF', ...getDefaultStyle() }
  }

  return {
    backgroundImage: `url(${cdnAssetsPrefix}${isAr.value ? config.ar_fid : config.fid})`,
    color: config.text_color || '#FFFFFF',
    ...getStyleFromConfig(config)
  }
})

/* ============================================================
   生命周期
============================================================ */
onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
/* ============================================================
   容器样式
============================================================ */
.honor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  .icon {
    height: 0.64rem;
    line-height: 0.64rem;
  }

  &.top {
    margin: 0 auto;
    justify-content: center;

    .icon {
      height: 0.4rem;
      line-height: 0.4rem;
    }
  }
}

/* ============================================================
   魅力/财富图标样式
============================================================ */
.icon-wrap {
  direction: ltr;
  flex-shrink: 0;

  &.text {
    font-size: 0.2rem;
    font-weight: bold;
    font-style: italic;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 0.42rem;
    background-size: 100% 100% !important;

    &:not(.text_ar) {
      padding-right: 0 !important;
    }

    span {
      font-size: inherit;
      transform: translateX(-50%);
    }
  }

  &.text_ar {
    padding-left: 0 !important;
    justify-content: flex-end;

    span {
      transform: translateX(50%);
    }
  }
}

/* ============================================================
   VIP 图标样式
============================================================ */
.vip-icon-wrap {
  position: relative;
  z-index: 1;
  width: 0.64rem;
  height: 0.28rem;
  flex-shrink: 0;
  padding-right: 0.05rem;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
  }

  .level {
    font-size: 0.17rem !important;
    text-align: center;
    width: 100%;
    font-family: SF UI Text;
    font-weight: 700;
    line-height: normal;
    color: transparent;
    background: linear-gradient(
      180deg,
      #fcf6d2 22.59%,
      #fcf6d2 52.94%,
      #edd9ad 53.35%,
      #edd9ad 81.42%
    );
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
}
</style>
