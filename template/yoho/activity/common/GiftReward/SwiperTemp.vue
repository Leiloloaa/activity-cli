<template>
  <div class="swiper-component-container-wrap-rew" v-if="isShowSwiper && list.length > 0">
    <Swiper
      id="swiperGift"
      :style="SwiperSelfStyle"
      class="swiper-self"
      :class="`swiper-self-${list.length > 1 && list.length < maxNumber ? 'center' : 'auto'}`"
      v-bind="swiper_options"
      :observer="true"
      :observeParents="true"
    >
      <SwiperSlide class="swiper-slide-self" v-for="(item, index) in list || []" :key="index">
        <slot name="default" :item="item" :index="index" />
      </SwiperSlide>
    </Swiper>

    <slot name="navigation" :navigationList="navigationList" />
  </div>
</template>

<script lang="ts" setup name="GiftSwiperFrame">
import injectTool from '@publicComponents/injectTool'

const ossUrl: any = inject('ossUrl')
const { TOOL_countryCode } = injectTool()

import 'swiper/swiper-bundle.css'
import { Swiper, SwiperSlide } from 'swiper/vue'
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper'
SwiperCore.use([Navigation, Pagination, Autoplay])

const props = defineProps({
  SwiperSelfStyle: {
    type: Object,
    default: () => ({ width: '7.5rem' })
  },
  list: {
    type: Array,
    default: []
  },
  isShowArrow: {
    type: Boolean,
    default: true
  },
  maxNumber: {
    type: Number,
    default: 5
  },
  speed: {
    type: Number,
    default: 800
  },
  navigation: {
    type: Object,
    default: () => ({ nextEl: '.next-rew', prevEl: '.prev-rew' })
  },
  delay: {
    type: Number,
    default: 1150
  },
  initialSlide: {
    type: Number,
    default: 1
  },
  centeredSlides: {
    type: Boolean,
    default: true
  }
})

const navigationList = computed(() => [
  props.navigation.nextEl.replace('.', ''),
  props.navigation.prevEl.replace('.', '')
])

const shouldRoll = computed(() => props.list?.length >= props.maxNumber && props.list?.length > 1)
const actualNumber = computed(() => (props.list?.length == 1 ? 1 : props.maxNumber))

const isShowSwiper = ref(false)
const swiper_options: any = ref({})
const setSwiperOptions = () => {
  let baseOptions = {
    speed: props.speed, // 轮播速度
    initialSlide: props.initialSlide, // 初始轮播位置
    centeredSlides: props.centeredSlides, // 轮播居中
    navigation: props.navigation, // 轮播箭头
    slidesPerView: actualNumber.value, // 轮播数量
    allowTouchMove: shouldRoll.value, // 是否允许滑动
    loop: shouldRoll.value // 是否循环轮播
  }

  swiper_options.value = {
    ...baseOptions,
    autoplay:
      props.list?.length < props.maxNumber
        ? false
        : {
            delay: props.delay, // 轮播延迟时间
            reverseDirection: TOOL_countryCode == 'EG' ? true : false // 轮播方向
          }
  }
  isShowSwiper.value = true
}

watch(
  () => props,
  () => {
    setSwiperOptions()
  },
  { immediate: true, deep: true }
)
</script>

<style lang="scss" scoped>
.swiper-self {
  direction: ltr;
  width: 7.5rem;
  position: relative;
}

// swiper
:deep(.swiper-container) {
}

:deep(.swiper-wrapper) {
}

.swiper-self-center {
  :deep(.swiper-wrapper) {
    transform: initial !important;

    width: 100%;
    margin: 0 auto;

    display: flex;
    justify-content: center;
    // align-items: center;
  }

  :deep(.swiper-slide) {
    margin: 0 0.26rem;
  }
}

// 内容包裹层，内容居中
:deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  // align-items: center;
}

:deep(.swiper-slide-active) {
}

:deep(.swiper-slide-prev) {
}

:deep(.swiper-slide-next) {
}
</style>
