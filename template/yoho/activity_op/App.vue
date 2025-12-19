<template>
  <div class="op-wrap" id="op-wrap" :class="{ oldversiton: isOldVersion }">
    <img
      class="default"
      v-show="!isActing"
      :src="`${ossUrl}/head-${Lang}.png${resize_op_default}`"
      alt=""
    />
    <div class="panel" v-show="isActing"><Home /></div>
  </div>
</template>

<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool'
import { searchActivityTime } from '@hooks/useHeadUtils'
import { getRewFunc } from '@publicComponents/methods/reward/index.js'
import { getQueryString } from '@libraryParams/params'
import { config } from './config'
import Home from './Home.vue'

const { activityId } = config
const ossUrl = (window as any).hostConfig.oss + config.projectName
const { TOOL_httpClient, TOOL_TEXT, TOOL_countryCode } = injectTool()

const resize_op_default = '?x-oss-process=image/format,webp/quality,Q_80/resize,w_200'

const enList = ['IN', 'PK', 'BD', 'MY', 'ID']
const Lang = enList.includes(TOOL_countryCode) ? 'EN' : TOOL_countryCode // 使用英文的大区，命名为 head-EN

const getRew = (reward: object) => getRewFunc(reward, TOOL_TEXT, TOOL_countryCode)
watchEffect(() => (document.title = TOOL_TEXT[2] || 'Loading...')) // DOCUMENT TITLE
document.documentElement.style.fontSize = '50vw'
const isOldVersion = ref(
  String(activityId).startsWith('1') &&
    getQueryString('version') < 4036000 &&
    getQueryString('version') != null
    ? true
    : false
)
const isActing = computed(() => info.status == 1)

const info = reactive({
  status: 1,
  timeLeft: 0,
  isEndDate: false
})
const getInfo = async () => {
  try {
    const res = await TOOL_httpClient({
      method: 'get',
      url: '/api/activity/commonBusiness/rankOperation',
      params: { activityId },
      ajaxOperation: { func: getInfo }
    })
    let { data, errorCode } = res.data
    if (errorCode != 0) throw res
    Object.assign(info, data)
  } catch (error) {}
}
getInfo()

if (activityId && ENV != 'build') {
  // 使用抽离出来的工具函数查询活动时间
  searchActivityTime(activityId, ossUrl, enList, `${ossUrl}/head-${Lang}.png`)
}

provide('getRew', getRew)
provide('activityId', activityId)
provide('ossUrl', ossUrl)
provide('imgUrl', ossUrl)
provide('showReward', () => {})
provide('info', info)
</script>

<style lang="scss">
.op-wrap {
  width: 2rem;
  height: 2.4rem;
  overflow: hidden;

  direction: ltr;
  &.oldversiton {
    margin-top: -0.2rem;
    transform: scaleY(0.84);
    .page {
      transform: scaleX(0.84);
    }
    .default {
      transform: scaleX(0.84);
    }
  }
  .default {
    width: 100%;
  }
  .my-swipe {
    width: 2rem;
    .van-swipe__track {
      display: flex;
    }
  }
  .panel {
    width: 2rem;
    height: 2.4rem;
  }
}
#op-wrap {
}

@media screen and (max-width: 70px) {
  #op-wrap {
    .default {
      display: block !important;
    }
    .panel {
      display: none;
    }
  }
}
</style>
