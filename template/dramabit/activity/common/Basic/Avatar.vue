<template>
  <div
    v-jump="option.jump ? data : {}"
    :class="`avatar-component avatar-component-${pic.type || 'normal'}`"
    :style="{
      width: _sc?.frame?.width || 'auto',
      height: _sc?.frame?.height || 'auto'
    }"
  >
    <cdnImg
      class="user-img"
      :info="data || {}"
      :defaultImg="_sofa"
      :style="{ borderRadius: option.radius ? '50%' : '0', ..._sc.avatar }"
    ></cdnImg>

    <img class="frame" :src="_frame" :style="_sc.frame" alt="" />

    <div v-if="isLive" class="live" :style="_sc.live">
      <img class="live-bg" :src="_live" alt="" />
      <img class="live-icon" :src="liveIcon" :style="_sc.liveIcon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { opt } from '../avatarOpt'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  option: {
    type: Object,
    default: () => ({
      radius: true,
      live: false,
      alwaysLive: false,
      jump: true
    })
  },
  pic: {
    type: Object,
    default: () => ({
      type: 'card',
      sofa: 'sofa',
      frame: 'a',
      live: 'live'
    })
  },
  styleConfig: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: ''
  }
})

const _sc = computed(() => {
  if (props.type) {
    if (props?.type && opt?.[props?.type]) {
      // console.log('🙋🙋🙋 opt?.[props.type]================', opt?.[props.type])
      return opt?.[props.type]
    } else {
      console.log('🙅🙅🙅 ❌❌❌ rewConfig 样式配置不存在================')
      return opt?.normal
    }
  } else {
    return props.styleConfig
  }
})

const ossUrl = inject('ossUrl')
const liveIcon = '//image.waka.media/static/icon/liveIcon.png'

const isLive = computed(() => {
  return props?.option?.alwaysLive || (props?.option?.live && props?.data?.liveStatus == 1)
})

const _sofa = computed(() => {
  let sofa = props?.pic?.sofa
  let afterFix = sofa?.includes('.') ? '' : '.png'
  if (sofa) {
    return sofa?.includes('http') ? `${sofa}${afterFix}` : `${ossUrl}/${sofa}${afterFix}`
  } else {
    return `${ossUrl}/sofa.png`
  }
})

const _frame = computed(() => {
  let frame = props?.pic?.frame
  let afterFix = frame?.includes('.') ? '' : '.png'
  if (frame) {
    return frame?.includes('http') ? `${frame}${afterFix}` : `${ossUrl}/${frame}${afterFix}`
  } else {
    return `${ossUrl}/a.png`
  }
})

const _live = computed(() => {
  let live = props?.pic?.live
  let afterFix = live?.includes('.') ? '' : '.png'
  if (live) {
    return live?.includes('http') ? `${live}${afterFix}` : `${ossUrl}/${live}${afterFix}`
  } else {
    return `${ossUrl}/live.png`
  }
})
</script>

<style lang="scss" scoped>
.avatar-component {
  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;

  .frame {
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;

    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .user-img {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    object-fit: cover;
  }

  .live {
    width: 0.4rem;
    height: 0.24rem;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    bottom: 0rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;

    .live-bg {
      width: 100%;
      height: 100%;
      object-fit: contain;
      flex-shrink: 0;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .live-icon {
      width: 96%;
      height: 93%;
      object-fit: contain;
      flex-shrink: 0;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
    }
  }
}
</style>
