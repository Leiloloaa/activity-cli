<template>
  <div class="header-image">
    <!-- <div class="head-deco">
      <img :src="`${ossUrl}/head-deco.png`" alt="" />
    </div> -->

    <div class="quality-static" v-show="quality == 'low' || quality == 'high'">
      <img
        v-show="quality == 'low'"
        class="head head-static head-static-low"
        :src="_pic('low')"
        alt=""
      />
      <img
        v-show="quality == 'high'"
        class="head head-static head-static-high"
        :src="_pic('high')"
        alt=""
      />
    </div>

    <div class="quality-dynamic" v-if="quality == 'high' || quality == 'dynamic'">
      <template v-if="dynamicType === 1">
        <img
          class="head head-dynamic head-dynamic-webp"
          :src="_pic('webp')"
          alt=""
          @load="onImageCanPlay"
          @error="onImageError"
        />
      </template>

      <template v-if="dynamicType === 2">
        <video
          ref="videoElement"
          id="myVideo"
          :src="_pic('mp4')"
          class="head-dynamic head-dynamic-video"
          autoplay
          loop
          :muted="isMuted"
          preload="true"
          x5-video-player-type="h5"
          x5-playsinline
          playsinline
          webkit-playsinline
          x5-video-player-fullscreen="false"
          @play="onVideoCanPlay"
          @error="onVideoError"
        ></video>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup name="Head">
import injectTool from '@publicComponents/injectTool'
import { isWebView } from '../tools/plat.js'
// import { searchActivityTime } from '@hooks/useHeadUtils'

const ossUrl = inject('ossUrl')
const { TOOL_countryCode } = injectTool()

const dynamicType = 2 // 是否使用  1动态图片、2视频

const quality = ref('low')
const enList = ['IN', 'PK', 'BD', 'MY']
const titleLang = enList?.includes(TOOL_countryCode) ? 'EN' : TOOL_countryCode
const useHiyoo = false // yoho 和 hiyoo 活动共用，头图区分

const _pic = (quality: string) => {
  const headName = `head-${titleLang}`
  const PJName = PROJECT == 2 ? (useHiyoo ? '-hiyoo' : '') : ''
  const notWebp = '?x-oss-process=image/format,png/resize,m_lfit,w_27,h_67'
  switch (quality) {
    case 'low':
      return `${ossUrl}/${headName}${PJName}.png${notWebp}` //  低质量静态图
    case 'high':
      return `${ossUrl}/${headName}${PJName}.png` //  高质量静态图
    case 'webp':
      return `${ossUrl}/${headName}${PJName}.png` //  webp
    case 'mp4':
      return `${ossUrl}/${headName}${PJName}.mp4` //  mp4
  }
}

let timer1, timer2, timer3

// 视频
const dynamicDone = ref(false)
const onVideoCanPlay = () => {
  if (dynamicDone.value) return
  console.log('Video Done.')
  dynamicDone.value = true
  timer1 = setTimeout(() => {
    console.log('关闭静态图遮罩')
    quality.value = 'dynamic'
  }, 2200) // 延迟关闭遮罩,防止闪屏
}

const onVideoError = () => {
  if (dynamicDone.value) return
  console.log('video加载失败.')
}

// webp
const onImageCanPlay = () => {
  if (dynamicDone.value) return
  console.log('Webp Done.')
  dynamicDone.value = true
  timer2 = setTimeout(() => {
    console.log('关闭静态图遮罩')
    quality.value = 'dynamic'
  }, 2200) // 延迟关闭遮罩,防止闪屏
}
const onImageError = () => {
  if (dynamicDone.value) return
  console.log('Webp加载失败')
}

const isMuted = computed(() => {
  return PROJECT == 2 || (isWebView ? false : true)
})

const isWebp = '?x-oss-process=image/format,webp/quality,Q_80'
onMounted(() => {
  const img = new Image()
  img.src = _pic('high') + isWebp
  console.log('头图onMounted.')
  img.onload = function () {
    console.log('高质量静态Done.', new Date().getTime())
    timer3 = setTimeout(() => {
      console.log('关闭低质量遮罩.', new Date().getTime())
      quality.value = 'high'
    }, 600) // 延迟关闭遮罩,防止闪屏
  }
  setTimeout(() => {
    if (!dynamicDone.value) quality.value = 'high' // 保底逻辑
  }, 5000)
})

onBeforeUnmount(() => {
  clearTimeout(timer1)
  clearTimeout(timer2)
  clearTimeout(timer3)
})

// const activityId = inject('activityId')
// if (activityId && ENV != 'build') {
//   // 使用抽离出来的工具函数查询活动时间
//   searchActivityTime(activityId, ossUrl, enList, _pic('high'))
// }
</script>

<style lang="scss" scoped>
.header-image {
  width: 7.5rem;
  height: 13.34rem;

  position: relative;

  .head-deco {
    width: 7.5rem;
    height: 2.04rem;
    background: linear-gradient(178deg, rgba(133, 24, 193, 0) -2.8%, #8415bc 93.73%);

    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .head {
    width: 7.5rem;
    height: 13.34rem;

    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
  }

  .quality-static {
    .head-static-low {
      z-index: 13;
    }

    .head-static-high {
      z-index: 12;
    }
  }

  .quality-dynamic {
    width: 7.5rem;
    height: 13.34rem;

    .head-dynamic {
      z-index: 2;
    }

    .head-dynamic-webp {
      width: 7.5rem;
    }

    .head-dynamic-video {
      width: 7.5rem;
    }
  }
}
</style>
