<template>
  <div class="reward-preview" @click="close">
    <div class="preview-img" v-show="isLoadSuccess">
      <video v-if="resource?.playIcon || resource?.src?.endsWith('.mp4')"
        :src="`${ossUrl}/${resource?.src?.replace(/\.(png|webp|jpg|jpeg)$/i, '.mp4')}`" class="video" loop muted
        autoplay playsinline x5-playsinline preload="true" webkit-playsinline x5-video-player-type="h5"
        x5-video-player-fullscreen="false" @error="onVideoError" @canplay="onVideoCanPlay"></video>
      <img v-else-if="suffixArray.some((ext) => props?.resource?.src?.endsWith(ext))" class="webp"
        :src="`${ossUrl}/${resource?.src}`" alt="" compress="false" @load="onImageCanPlay" @error="onImageError" />
      <cdnImg v-else class="webp" :info="resource"></cdnImg>
    </div>
    <YohoLoading v-show="!isLoadSuccess" />
  </div>
</template>

<script lang="ts" setup name="Toast">
import injectTool from '@publicComponents/injectTool'
import { inject } from 'vue'

const close = inject('close')
const ossUrl = inject('ossUrl')

const props = defineProps({
  resource: {
    type: Object,
    default: () => ({
      src: '', // 图片/视频资源路径，如 reward.png/reward.mp4
      playIcon: false // 如果设置为true,将把图片资源(.png/.webp)替换成视频资源(.mp4)
    })
  }
})
console.log('正在查看的资源:', toRaw(props.resource))

const suffixArray = ['webp', 'png', 'jpg', 'jpeg', 'gif']

const isLoadSuccess = ref(false)
// 视频
const onVideoCanPlay = () => {
  isLoadSuccess.value = true
  console.log('Video加载完成')
}
const onVideoError = () => {
  isLoadSuccess.value = true
  console.error('Video加载失败')
}
// 图片
const onImageCanPlay = () => {
  isLoadSuccess.value = true
  console.log('Image加载完成')
}
const onImageError = () => {
  isLoadSuccess.value = true
  console.log('Image加载失败')
}

onMounted(() => {
  if (!suffixArray.some((ext) => props?.resource?.src?.endsWith(ext))) isLoadSuccess.value = true
})
</script>

<style lang="scss">
.reward-preview {
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  .preview-img {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    text-align: center;

    .video {
      align-self: end;
      width: 100%;
      object-fit: contain;
    }

    .webp {
      width: 3.2rem;
      height: 80%;
      object-fit: contain;
    }

    img {
      width: 3.2rem;
      height: 80%;
      object-fit: contain;
    }
  }
}
</style>
