<template>
  <img
    v-if="imageFid"
    v-bind="$attrs"
    :src="imageSrc"
    :alt="alt"
    @load="handleLoad"
    @error="handleError"
  />
  <img v-else :src="defaultImageUrl" :alt="alt" />
</template>

<script setup>
import { computed, inject } from 'vue'

// 注入响应式状态
const webpSupported = inject('webpSupported')

// 组件属性定义
const props = defineProps({
  // 图片信息对象，包含fid、avatar、cover等字段
  info: {
    type: Object,
    default: null
  },
  // 图片文件ID
  fid: {
    type: String,
    default: undefined
  },
  // 图片alt属性
  alt: {
    type: String,
    default: ''
  },
  // 默认图片URL
  defaultImg: {
    type: String,
    default: undefined
  },
  // 自定义后缀 默认为undefined
  suffix: {
    type: String,
    default: undefined
  },
  w: {
    type: Number,
    default: 250
  },
  h: {
    type: Number,
    default: 250
  },
  quality: {
    type: Number,
    default: 75
  },
  // 定时关闭动图
  closeActive: {
    type: Boolean,
    default: true
  }
})

// 注入全局配置
const imgUrl = inject('imgUrl', '')

// FID
const imageFid = computed(() => {
  let REAL_FID = ''
  if (props.info === null) {
    REAL_FID = props.fid // 没传入 info 对象, 使用 props.fid
  } else {
    const { fid, avatar, cover } = props.info // 传入 info 对象, 使用 info.fid > info.avatar > info.cover > props.fid
    REAL_FID = fid || avatar || cover || props.fid
  }
  if (REAL_FID === '') console.log('⚠️ CdnImage: fid is empty')
  return REAL_FID
})

// CDN域名
const cdnDomain = computed(() => {
  // 示例: https://cdn-test.yoko.media/ , 协议：https, 域名环境：cdn-test, 域名关键词：yoko, 域名后缀：media, 路径：/
  // 域名关键词
  const hostname = window.location.hostname
  const domainMatch = hostname.match(/(\w+)\.(?:media|com)$/)
  const DOMAIN_KEYWORD = domainMatch?.[1] ?? 'yoko'
  // 域名环境
  const DOMAIN_PREFIX = ENV === 'build' ? 'cdn' : 'cdn-test'
  // 拼接
  const REAL_DOMAIN = `https://${DOMAIN_PREFIX}.${DOMAIN_KEYWORD}.media/`
  console.log(`🌽 [关键词:${DOMAIN_KEYWORD}] [环境:${DOMAIN_PREFIX}] [域名:${REAL_DOMAIN}]`)
  return REAL_DOMAIN
})

const compressParams = ref('') // 阿里云图片处理参数

const setCompressParams = () => {
  // 1.缩放操作 x-oss-process=image/resize
  // 模式: /resize,w_800,h_600,m_lfit  # 等比缩放至800x600内
  // 模式: /resize,w_250,h_200,m_fill  # 填充模式生成250x200缩略图
  // 2.智能裁剪 crop
  // 模式: /crop,w_250,h_250,g_center  # 中心点裁剪
  // 模式: /crop,w_200,h_200,g_nw      # 从左上角开始裁剪
  // 3.格式转换 format
  // /format,webp               # 转换为WebP格式（节省30%流量）
  // /format,jpg,interlace,1    # 渐进式JPEG加载
  // 4.自适应参数（按设备优化）
  // /resize,w_750,limit_0/format,webp  # 移动端适配（750px宽+WebP）
  // /quality,Q_80/dpr_2                # 高清屏适配（2倍屏压缩质量）

  // let _p = `?x-oss-process=image/resize,w_250,h_250,image/format,webp/quality,Q_75` // 默认参数
  let _p = `` // 默认参数

  // 如果w或h为auto,则找到,w_XXX或,h_XXX并删除
  if (props.w === 'auto') _p = _p.replace(/,w_\d+/, '')
  if (props.h === 'auto') _p = _p.replace(/,h_\d+/, '')

  // 如果提供了quality参数，则替换quality参数
  if (props.quality !== '') _p = _p.replace(/,Q_\d+/, `,Q_${props.quality}`)

  // 如果浏览器不支持WebP，则删除 WebP 格式参数
  if (!webpSupported.value) _p = _p.replace(',image/format,webp', '')

  // 添加自定义后缀
  if (props.suffix !== undefined) _p = props.suffix

  console.log('🌽 _p:', _p)

  compressParams.value = _p
}

const imageSrc = computed(() => {
  console.log('imageSrc=====', imageFid.value, compressParams.value)
  if (imageFid.value) {
    // 如果存在图片ID，返回 CDN 域名图片
    return `${cdnDomain.value}${imageFid.value}${compressParams.value}`
  }
})

const defaultImageUrl = computed(() => {
  console.log('defaultImageUrl=====', props.defaultImg, compressParams.value)
  // 如果没有图片ID，返回默认图片
  const defaultImageUrl = props.defaultImg || `${imgUrl}/sofa.png`
  return `${defaultImageUrl}${compressParams.value}`
})

const handleLoad = () => {
  if (props.closeActive) {
    // console.log('CdnImage loaded ---- 5s 后转换为静图', compressParams.value)
    setTimeout(() => {
      const _p_png = '?x-oss-process=image/resize,m_fill,w_250,h_250,image/format,png/quality,Q_75' // 转换为静图
      compressParams.value = _p_png
      // console.log('🌽 转换为静图后:', compressParams.value)
    }, 5000)
  }
}

const handleError = (event) => {
  console.log('CdnImage error', event)
  compressParams.value = ''
}

onMounted(() => {
  setCompressParams()
})
</script>
