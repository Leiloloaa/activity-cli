<template>
  <div id="wrap">
    <div class="head">
      <Head />
      <!-- <div v-bg="'head-mask'" class="head-mask"></div> -->
    </div>
    <div v-show="Loading" class="load-wrap">
      <YohoLoading v-if="projectType == 1" />
      <PageLoading v-else />
    </div>
    <!-- 活动下线显示结束页  yoho、hiyoo -->
    <Soon end v-if="appInfo.activityDownStatus === 0" />
    <router-view v-else />

    <!-- 全局组件: 奖励展示弹框 -->
    <Dialog
      v-model="appInfo.isShowReward"
      :hasMaskClose="true"
      :frame="false"
      :closeOpt="{
        width: '0.72rem',
        height: '0.72rem',
        top: '0.32rem',
        right: '0.32rem',
        left: 'auto'
      }"
      isVideo
    >
      <GRPreview :resource="appInfo.rewardResource" />
    </Dialog>
  </div>
</template>

<script lang="ts" setup name="App">
import injectTool from '@publicComponents/injectTool'
import { reactive, provide, watchEffect, watch, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRewFunc } from '@publicComponents/methods/reward/index.js'
import { useTimer } from '@hooks/useTimer'
import useActivityStatus from '@hooks/useActivityStatus'
import { config } from './config'

const { TOOL_TEXT, TOOL_BPFunc, TOOL_countryCode } = injectTool()
TOOL_BPFunc({ desc: 'Default page', action: 'show' }) // 总页面曝光
const route = useRoute()
const router = useRouter()

// 获取项目类型
const projectType = (window as any).PROJECT

const getRew = (reward: any) => getRewFunc(reward, TOOL_TEXT, TOOL_countryCode)
const showReward = (item: any) => {
  appInfo.rewardResource = item
  appInfo.isShowReward = true
}
// 公共常量+变量 放置在 appInfo 下面，方便全局使用
const appInfo = reactive({
  activityDownStatus: 1, // 活动是否下线 1 未下线 0 下线
  routerHistory: [] as string[], // 页面路由历史
  loadMp4list: [] as string[], // 页面加载的 mp4 列表
  loadMp4FirstKey: null as string | null, // 页面加载的 mp4 列表的第一个 key
  historyBack: 'home' as string | null, // 历史返回
  // 奖励弹框相关
  isShowReward: false,
  rewardResource: {} as any,
  get backgroundColor() {
    return config.backgroundColor
  },
  get defaultSofa() {
    return (config as any).defaultSofa || ''
  },
  yohoUi: (window as any).hostConfig.oss + '/activity/yoho-ui',
  domain: projectType == 2 ? 'chatchill' : (window as any).hostConfig.domain,
  oss: (window as any).hostConfig.oss,
  showReward: showReward
})

// 检查活动状态 下线活动则显示结束页
useActivityStatus(config.activityId, appInfo)

provide('ossUrl', (window as any).hostConfig.oss + config.projectName)
provide('activityId', config.activityId)
provide('appInfo', appInfo)
provide('getRew', getRew)

watchEffect(() => {
  const title = TOOL_TEXT[2]
  document.title = title || 'Loading...'
})

watch(
  () => route.path,
  () => {
    appInfo.routerHistory.push(route.path)
    // 页面切换，置为空
    appInfo.loadMp4list = []
    appInfo.loadMp4FirstKey = null
  }
)

const Loading = ref(true)
const { startTimer } = useTimer()

onMounted(async () => {
  startTimer(() => {
    Loading.value = false
  }, 1000)
})
</script>

<style lang="scss" scoped>
#wrap {
  width: 7.5rem;
  height: auto;
  min-height: 100vh;
  margin: 0 auto;
  background: v-bind('appInfo.backgroundColor');

  position: relative;

  .head {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);

    .head-mask {
      width: 7.5rem;
      height: 3.83rem;
      flex-shrink: 0;

      position: absolute;
      bottom: -1.15rem;
      left: 0;
      z-index: 21;
    }
  }

  .load-wrap {
    width: 100vw;
    height: 100vh;
    background: v-bind('appInfo.backgroundColor');

    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;

    display: flex;
    justify-content: center;
    align-items: center;

    .load {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }

    img {
      width: 48px;
      height: 48px;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
  }
}
</style>
