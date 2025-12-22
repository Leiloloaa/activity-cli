<template>
  <div class="rank-template">
    <RankLoad
      ref="loadRef"
      :api="api"
      :apiParams="apiParams"
      :rankIndex="rankIndex"
      :frameType="frameType"
      :paddingBottom="paddingBottom"
    >
      <template #outFrame="{ info }">
        <img
          v-if="!isDaily"
          class="reward-icon shake"
          :src="`${ossUrl}/reward-icon.png`"
          @click="toRewardPage"
        />
      </template>

      <template #info="{ info }">
        <div class="timer-wrap">
          <Timer :timeLeft="info?.timeLeft" :status="info?.status" />
        </div>

        <div class="rank-info fc">
          <span> {{ TOOL_TEXT[infoText] }} </span>
        </div>
      </template>

      <template #top3="{ info }">
        <component
          :is="componentMap.topThree"
          :info="info"
          :key="route?.path"
          v-if="isShowComp(info, 'top3')"
        />
      </template>

      <template #card="{ info }">
        <component
          :is="componentMap.card"
          :info="info"
          :isDaily="isDaily"
          :key="route?.path"
          v-show="isShowComp(info, 'card')"
        />
        <!-- <div
          v-if="(isDaily && info?.idx == 3) || (!isDaily && info?.idx == 10)"
          class="safetyLine"
          :key="route?.path"
        >
          {{ TOOL_TEXT[616] || 'The above can be rewarded' }}
        </div> -->
      </template>

      <template #userInfo="{ info }">
        <teleport to="body">
          <component
            v-show="showUserInfo && info.isOnTheRank"
            :is="componentMap.userInfo"
            :info="info"
            :isDaily="isDaily"
            :key="route?.path"
            isCardStyle
          />
        </teleport>
      </template>
    </RankLoad>
  </div>
</template>

<script lang="ts" setup name="Rank">
import injectTool from '@publicComponents/injectTool'
import RankLoad from '../../common/Basic/RankLoad.vue'
import useUserInfo from '@hooks/useUserInfo'
// 榜单
import TopThree from '../Rank/TopThree.vue'
import Card from '../Rank/Card.vue'
import UserInfo from '../Rank/UserInfo.vue'
// 榜单cp
import CpTopThree from '../RankCp/TopThree.vue'
import CpCard from '../RankCp/Card.vue'
import CpUserInfo from '../RankCp/UserInfo.vue'
// 榜单家族
import FamilyTopThree from '../RankFamily/TopThree.vue'
import FamilyCard from '../RankFamily/Card.vue'
import FamilyUserInfo from '../RankFamily/UserInfo.vue'
// 榜单子榜单
import FamilyDialog from '../RankFamily/DialogRank/DialogRank.vue'

const route = useRoute()
const router = useRouter()
const isData = inject('isData')
const activityId = inject('activityId')
const ossUrl = inject('ossUrl')
const { TOOL_TEXT, TOOL_BPFunc, TOOL_countryCode } = injectTool()

const { showUserInfo } = useUserInfo(700)

const props = defineProps({
  url: { type: String, default: '' },
  params: { type: Object, default: () => ({}) },
  infoText: { type: Number, default: 1 },
  frameType: { type: String, default: '' },
  dayTotal: { type: Number, default: 0 },
  selDate: { type: String, default: '' },
  paddingBottom: { type: String, default: '' },
  rankType: { type: String, default: '' }
})

const showDialog = (info) => {
  rankTempInfo.isDaily = isDaily.value
  rankTempInfo.selDate = props.selDate
  rankTempInfo.curInfo = info
  if (info.familyInfo) {
    rankTempInfo.showFamilyDialog = true
  }
}

const rankTempInfo = reactive({
  showFamilyDialog: false,
  isDaily: true,
  selDate: '',
  curInfo: {},
  showDialog
})
provide('rankTempInfo', rankTempInfo)

const rankIndex = ref(0) // 手动触发榜单更新
const isDaily = computed(() => {
  return props.url.includes('Day') || props.url.includes('Daily')
})

const isOnShowCard = props.rankType == 'cp' ? 1 : 0 // 是否只显示card，不显示top3
const isShowComp = (info, comp) => {
  if (isOnShowCard == 1) {
    return comp === 'top3' ? false : true // 只显示card，不显示top3
  } else if (isOnShowCard == 0) {
    if (comp === 'top3') {
      return isDaily.value ? false : true // 日榜，不显示top3
    } else if (comp === 'card') {
      return !isDaily.value && Number(info?.idx) <= 3 ? false : true // 总榜且前三，显示card
    }
  }
}
const api = computed(() => {
  return props?.url
})
const apiParams = computed(() => {
  const dateObj = isDaily.value ? { date: props.selDate } : {}
  return { activityId, ...dateObj, ...props.params }
})

const componentMap = computed(() => {
  const map = {
    cp: {
      card: CpCard,
      userInfo: CpUserInfo,
      topThree: CpTopThree
    },
    family: {
      card: FamilyCard,
      userInfo: FamilyUserInfo,
      topThree: FamilyTopThree
    },
    default: {
      card: Card,
      userInfo: UserInfo,
      topThree: TopThree
    }
  }
  return map[props.rankType] || map.default
})

const toRewardPage = () => {
  TOOL_BPFunc({ desc: 'rewards_icon_click', action: 'click' })
  router.replace(
    '/home/rule/' +
      (route.path.includes('rankuser') ? 2 : route.path.includes('rankanchor') ? 3 : 4)
  )
}
</script>

<style lang="scss" scoped>
.rank-template {
  margin-bottom: 1.5rem;
  position: relative;

  .reward-icon {
    width: 1.34rem;
    height: 1.3rem;
    flex-shrink: 0;

    position: absolute;
    top: -0.2rem;
    right: 0.2rem;
    z-index: 20;
  }

  .timer-wrap {
    margin-top: 1.25rem;
  }

  .rank-info {
    width: 6.4rem;

    margin: 0 auto;
    margin-top: 0.24rem;
    margin-bottom: 0.16rem;

    span {
      color: #fff4a4;
      text-align: center;
      font-family: 'SF UI Text';
      font-size: 0.28rem;
      font-style: normal;
      font-weight: 400;
      line-height: 0.32rem; /* 114.286% */
    }
  }
}
</style>
