<template>
  <div
    class="swiper-container-wrap-rew"
    v-bg="`gr-bg`"
    v-if="isShowSwiper && list.length > 0"
  >
    <Swiper
      id="swiperGift"
      :style="{ width: '7.5rem' }"
      class="swiper-self"
      :class="`swiper-self-${
        list.length > 1 && list.length < maxNumber ? 'center' : 'auto'
      }`"
      v-bind="swiperOptions"
      :observer="true"
      :observeParents="true"
    >
      <SwiperSlide
        class="swiper-slide-self"
        v-for="(item, index) in list"
        :key="index"
      >
        <div class="reward-wrap">
          <!-- <Rew
            :reward="item"
            :options="{
              size: props.type == 'gift' ? 'gr' : 'gr',
              num: false,
              name: false,
              corner: false,
              effectFid: false,
              coin: props.type == 'gift',
              playIcon: item?.playIcon,
              lazy: true,
              playMp4Status: item.playMp4Status, // null 为初始转态， 1 为 loading 状态, 2 代表可以播放
            }"
          /> -->
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 导航按钮 -->
    <img
      class="swiper-btn left task-arrow-left g-left-arrow"
      style="display: block"
      :src="`${ossUrl}/g-left-arrow.png`"
      alt=""
    />
    <img
      class="swiper-btn right task-arrow-right g-right-arrow"
      style="display: block"
      :src="`${ossUrl}/g-right-arrow.png`"
      alt=""
    />
  </div>
</template>

<script lang="ts" setup name="GiftSwiperFrame">
import injectTool from "@publicComponents/injectTool";
import { handleLoadMp4 } from "@publicComponents/shared";
import { getRewardList } from "../../tools/tools.js";
import { useAppStore } from "../../store";

// Swiper 原生导入
import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/vue";
import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
SwiperCore.use([Navigation, Pagination, Autoplay]);

const ossUrl = inject("ossUrl");
const activityId = inject("activityId");
const appStore = useAppStore();
const { TOOL_countryCode, TOOL_TEXT, TOOL_httpClient, TOOL_BPFunc, TOOL_NUM } =
  injectTool();

const props = defineProps({
  listConfig: {
    type: Array,
    default: [],
  },
  listValue: {
    type: Array,
    default: [],
  },
  type: {
    type: String,
    default: "reward",
  },
});

// Swiper 配置
const maxNumber = 5;
const speed = 800;
const delay = 1150;
const navigation = { nextEl: ".g-left-arrow", prevEl: ".g-right-arrow" };

const list: any = ref([]);
const isShowSwiper = ref(false);
const swiperOptions: any = ref({});

// 计算属性
const shouldRoll = computed(
  () => list.value?.length >= maxNumber && list.value?.length > 1
);
const actualNumber = computed(() => (list.value?.length == 1 ? 1 : maxNumber));

// 设置 Swiper 配置
const setSwiperOptions = () => {
  const baseOptions = {
    speed: speed,
    initialSlide: 1,
    centeredSlides: true,
    navigation: navigation,
    slidesPerView: actualNumber.value,
    allowTouchMove: shouldRoll.value,
    loop: shouldRoll.value,
  };

  swiperOptions.value = {
    ...baseOptions,
    autoplay:
      list.value?.length < maxNumber
        ? false
        : {
            delay: delay,
            reverseDirection: TOOL_countryCode == "EG" ? true : false,
          },
  };
  isShowSwiper.value = true;
};

const getGiftList = async () => {
  let url, params;
  url = "/api/activity/commonBusiness/gifts";
  params = { activityId };
  try {
    const res = await TOOL_httpClient({ method: "get", url, params });
    let { data, errorCode } = res.data;
    if (errorCode != 0) throw res;
    return data;
  } catch (error) {
  } finally {
  }
};

const look = (item) => {
  if (item.playIcon) {
    if (item.playMp4Status == 2) {
      appStore.showReward(item);
      return;
    }
    const src = `${ossUrl}/${item.src.split(".")[0]}.mp4`;
    handleLoadMp4(item, src, appStore, () => appStore.showReward(item));
  } else if (props.type == "reward") {
    appStore.showReward(item);
  }
};

const getList = async () => {
  if (props.type == "gift") {
    const res = await getGiftList();
    list.value = res;
  } else {
    if (props?.listValue?.length > 0) {
      list.value = props?.listValue;
    } else {
      const res = await getRewardList(props.listConfig);
      list.value = res;
    }
  }
  console.log("list", list.value);
  setSwiperOptions();
};

watch(
  () => props.type,
  () => {
    getList();
  }
);

onMounted(async () => {
  await getList();
});
</script>

<style lang="scss" scoped>
.swiper-container-wrap-rew {
  width: 7rem;
  height: 1.5rem;
  flex-shrink: 0;

  margin: 0 auto;
  margin-top: 0.23rem;

  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  .swiper-self {
    direction: ltr;
    width: 7.5rem;
    position: relative;

    .reward-wrap {
      margin: 0 0.15rem;
    }
  }

  // swiper 居中模式（数量少于 maxNumber 时）
  .swiper-self-center {
    :deep(.swiper-wrapper) {
      transform: initial !important;
      width: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: center;
    }

    :deep(.swiper-slide) {
      margin: 0 0.26rem;
    }
  }

  // 内容包裹层，内容居中
  :deep(.swiper-slide) {
    display: flex;
    justify-content: center;
  }

  // 轮播按钮
  .swiper-btn {
    width: 0.54rem;
    height: 0.54rem;

    position: absolute;
    top: 0.46rem;
    z-index: 1;

    &.left {
      left: -0.2rem;
    }
    &.right {
      right: -0.2rem;
    }
  }
}
</style>
