<template>
  <div class="swiper-container-wrap-rew">
    <!-- <img class="obg" :src="`${ossUrl}/gr-bg.png`" alt="" /> -->
    <SwiperTemp
      :SwiperSelfStyle="{ width: '7.5rem' }"
      :list="list"
      :maxNumber="5"
      :isShowArrow="true"
      :speed="800"
      :delay="1150"
      :navigation="{ nextEl: '.g-left-arrow', prevEl: '.g-right-arrow' }"
    >
      <template #default="{ item, index }">
        <div class="reward-wrap">
          <Rew
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
              playMp4Status: item.playMp4Status // null 为初始转态， 1 为 loading 状态, 2 代表可以播放
            }"
          />
        </div>
      </template>

      <template #navigation="{ navigationList }">
        <img
          v-for="(item, index) in navigationList"
          :key="item"
          :class="`swiper-btn ${index == 0 ? 'left task-arrow-left' : 'right task-arrow-right'}`"
          style="display: block"
          :src="`${ossUrl}/${item}.png`"
          alt=""
        />
      </template>
    </SwiperTemp>
  </div>
</template>

<script lang="ts" setup name="GiftSwiperFrame">
import injectTool from '@publicComponents/injectTool'
import { handleLoadMp4 } from '@publicComponents/shared'
import { getRewardList } from '../../tools/getRewardList'
import SwiperTemp from './SwiperTemp.vue'

const ossUrl = inject('ossUrl')
const activityId = inject('activityId')
const appInfo: any = inject('appInfo')
const showReward = appInfo.showReward
const { TOOL_countryCode, TOOL_TEXT, TOOL_httpClient, TOOL_BPFunc, TOOL_NUM } = injectTool()

const props = defineProps({
  listConfig: {
    type: Array,
    default: []
  },
  listValue: {
    type: Array,
    default: []
  },
  type: {
    type: String,
    default: 'reward'
  }
})

const list: any = ref([])

const getGiftList = async () => {
  let url, params
  url = '/api/activity/commonBusiness/gifts'
  params = { activityId }
  try {
    const res = await TOOL_httpClient({ method: 'get', url, params })
    let { data, errorCode } = res.data
    if (errorCode != 0) throw res
    return data
  } catch (error) {
  } finally {
  }
}

const look = (item) => {
  if (item.playIcon) {
    if (item.playMp4Status == 2) {
      showReward(item)
      return
    }
    const src = `${ossUrl}/${item.src.split('.')[0]}.mp4`
    handleLoadMp4(item, src, appInfo, () => showReward(item))
  } else if (props.type == 'reward') {
    showReward(item)
  }
}

const getList = async () => {
  if (props.type == 'gift') {
    const res = await getGiftList()
    list.value = res
  } else {
    if (props?.listValue?.length > 0) {
      list.value = props?.listValue
    } else {
      const res = await getRewardList(props.listConfig)
      list.value = res
    }
  }
  console.log('list', list.value)
}

watch(
  () => props.type,
  () => {
    getList()
  }
)

onMounted(async () => {
  await getList()
})
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

    width: 7rem;
    margin: 0 auto;
    margin-top: 0.8rem;

    // background-color: bisque; // 轮播层

    position: relative;

    .reward-wrap {
      margin: 0 0.15rem;
    }
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
