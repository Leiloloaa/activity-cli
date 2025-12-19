<template>
  <div class="head-avatar" :class="{ 'is-home': isHome, 'is-hot': !isHome }">
    <div class="mate-avatar" v-for="(item, key) in avatarConfig" :key="key">
      <Avatar
        :data="item.data"
        :pic="{ sofa: 'sofa', frame: `a`, live: 'live' }"
        :option="{ radius: 1, live: 1, alwaysLive: 0, jump: 1 }"
        :styleConfig="{
          frame: {
            width: '1.68rem',
            height: '1.68rem'
          },
          avatar: {
            width: '1.24rem',
            height: '1.24rem'
          }
        }"
      />

      <div class="desc fc">
        <img class="hot-name-bg" :src="`${ossUrl}/hot-title.png`" alt="" />
        <Outline color="0.05rem #FF2AFB" :text="TOOL_TEXT[item.text]" noColor />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="head-avatar">
import injectTool from '@publicComponents/injectTool'

const ossUrl = inject('ossUrl')
const activityId = inject('activityId')
const isHome = !window.location.href.includes('_op_hot')
const { TOOL_BPFunc, TOOL_countryCode, TOOL_TEXT, TOOL_httpClient } = injectTool()

const pageInfo = reactive({ cpInfos: [] })

const avatarConfig = computed(() => {
  return {
    sender: {
      desc: '送礼榜 TOP1',
      data: pageInfo?.senderInfo,
      text: 112, // 文案
      userName: '' // 用户名称
    },
    receiver: {
      desc: '收礼榜 TOP1',
      data: pageInfo?.receiverInfo,
      text: 113, // 文案
      userName: '' // 用户名称
    },
    newSender: {
      desc: '新人榜 TOP1',
      data: pageInfo?.newSenderInfo,
      text: 114, // 文案
      userName: '' // 用户名称
    }
  }
})

const getInfo = () => {
  const url = '/api/activity/commonBusiness/hotBanner'
  TOOL_httpClient({
    url,
    params: { activityId },
    method: 'get'
  })
    .then((response) => {
      let {
        data: { data, errorCode }
      } = response
      if (errorCode != 0) throw response
      Object.assign(pageInfo, data)
    })
    .catch(() => {})
}
getInfo()
</script>

<style lang="scss" scoped>
.head-avatar {
  // margin-top: 0.4rem;

  display: flex;
  justify-content: center;
  align-items: center;

  .mate-avatar {
    margin: 0 0.035rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .desc {
      width: 2.245rem;
      height: 0.48rem;
      flex-shrink: 0;

      margin: 0 auto;
      margin-top: -0.4rem;

      display: flex;
      justify-content: center;
      align-items: center;

      position: relative;
      z-index: 10;

      .hot-name-bg {
        width: 100%;
        height: 100%;

        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
      }

      span {
        color: #faffd3;
        text-align: center;
        font-family: 'SF UI Text';
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.28rem; /* 116.667% */
      }
    }
  }
}
</style>
