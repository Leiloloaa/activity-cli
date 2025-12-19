<template>
  <div class="avatar-component-wrap">
    <div
      v-if="option.jumpType == 'family'"
      v-jump.family="option.jump ? data : {}"
      :class="`avatar-component avatar-component-${pic.type || 'normal'}`"
      :style="_sc.frame"
    >
      <cdnImage
        class="user-img"
        :info="data || {}"
        :defaultImg="_sofa"
        :style="{ borderRadius: option.radius ? '50%' : '0', ..._sc.avatar }"
      ></cdnImage>

      <img class="frame" :src="_frame" :style="_sc.frame" alt="" />

      <div v-if="isLive" class="live" :style="_sc.live">
        <img class="live-bg" :src="_live" alt="" />
        <img class="live-icon" :src="liveIcon" :style="_sc.liveIcon" />
      </div>
    </div>
    <div
      v-else
      v-jump="option.jump ? data : {}"
      :class="`avatar-component avatar-component-${pic.type || 'normal'}`"
      :style="_sc.frame"
    >
      <cdnImage
        class="user-img"
        :info="data || {}"
        :defaultImg="_sofa"
        :style="{ borderRadius: option.radius ? '50%' : '0', ..._sc.avatar }"
      ></cdnImage>

      <img class="frame" :src="_frame" :style="_sc.frame" alt="" />

      <div v-if="isLive" class="live" :style="_sc.live">
        <img class="live-bg" :src="_live" alt="" />
        <img class="live-icon" :src="liveIcon" :style="_sc.liveIcon" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { avatarTypeToConfig } from './avatarTypeToConfig'
import CdnImage from './CdnImage.vue'

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
      jump: true,
      jumpType: null
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
  let _type = avatarTypeToConfig(props.type)
  let _style = props.styleConfig
  let res = {
    frame: { ..._type.frame, ..._style.frame },
    avatar: { ..._type.avatar, ..._style.avatar },
    live: { ..._type.live, ..._style.live },
    liveIcon: { ..._type.liveIcon, ..._style.liveIcon }
  }
  return res
})

const ossUrl = inject('ossUrl')
const liveIcon = '//image.waka.media/static/icon/liveIcon.png'

const isLive = computed(() => {
  return props?.option?.alwaysLive || (props?.option?.live && props?.data?.liveStatus == 1)
})

const generateImageUrl = (imageName: string, defaultName: string): string => {
  const afterFix = imageName?.includes('.') ? '' : '.png'
  if (imageName) {
    return imageName?.includes('http')
      ? `${imageName}${afterFix}`
      : `${ossUrl}/${imageName}${afterFix}`
  }
  return `${ossUrl}/${defaultName}.png`
}

const _sofa = computed(() => generateImageUrl(props?.pic?.sofa, 'sofa'))
const _frame = computed(() => generateImageUrl(props?.pic?.frame, 'a'))
const _live = computed(() => generateImageUrl(props?.pic?.live, 'live'))
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
