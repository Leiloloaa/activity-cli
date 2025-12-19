<template>
  <div class="hot-banner">
    <!-- 送礼 -->
    <div class="avatar-container">
      <OptAvatar
        style="pointer-events: none"
        :data="pageInfo?.senderInfo || {}"
        :option="{
          w: 2.38,
          h: 2.38,
          adorns: [
            {
              img: `avatar-f`,
              w: '100%',
              h: '100%'
            }
          ],
          avatar: {
            w: 1.36,
            h: 1.36
          },
          live: {
            display: 'none'
          }
        }"
      />
      <div class="name-wrap fc">
        <span class="name ov">{{ pageInfo?.senderInfo?.name || '---' }}</span>
      </div>
      <div class="nickname">
        <Outline :color="`0.02rem #FF066F`" :text="TOOL_TEXT[115]" />
      </div>
    </div>
    <div
      :style="{
        width: '0.48rem'
      }"
    ></div>

    <!-- 收礼 -->
    <div class="avatar-container">
      <OptAvatar
        style="pointer-events: none"
        :data="pageInfo?.receiverInfo || {}"
        :option="{
          w: 2.38,
          h: 2.38,
          adorns: [
            {
              img: `avatar-f`,
              w: '100%',
              h: '100%'
            }
          ],
          avatar: {
            w: 1.36,
            h: 1.36
          },
          live: {
            display: 'none'
          }
        }"
      />
      <div class="name-wrap fc">
        <span class="name ov">{{ pageInfo?.receiverInfo?.name || '---' }}</span>
      </div>
      <div class="nickname">
        <Outline :color="`0.02rem #FF066F`" :text="TOOL_TEXT[116]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="App">
import injectTool from '@publicComponents/injectTool'
import { config } from './config'

const { imgUrl, activityId } = config
provide('imgUrl', imgUrl)

const { TOOL_httpClient, TOOL_BPFunc, TOOL_countryCode, TOOL_TEXT } = injectTool()

// DOCUMENT TITLE
watchEffect(() => (document.title = TOOL_TEXT[2] || 'Loading...'))

const pageInfo = reactive({
  senderInfo: {},
  timeLeft: 303588316,
  receiverInfo: {},
  status: 1
})

document.documentElement.style.fontSize = '13.3333vw'

const getInfo = () => {
  const url = '/api/activity/commonBusiness/hotBanner'
  TOOL_httpClient({
    url,
    method: 'get',
    params: { activityId },
    ajaxOperation: { func: getInfo }
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
@import './scss/public_mixin.scss';

.hot-banner {
  width: 7.5rem;
  height: 2.5rem;
  @include bg('hot-banner');

  direction: ltr;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  .avatar-container {
    margin-top: -0.12rem;

    display: flex;
    align-items: center;
    flex-direction: column;

    position: relative;

    .avatar-wrap {
      position: relative;
      z-index: 2;
    }
    .nickname {
      width: 2.55rem;
      height: 0.48rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        color: #effaff;
        text-align: center;
        font-family: Arial;
        font-size: 0.2rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.22rem; /* 110% */
      }
    }

    .name-wrap {
      position: relative;
      z-index: 30;
      margin-top: -0.67rem;
      @include bg('hot-name-bg2');
      width: 2.24rem;
      height: 0.48rem;
      .name {
        flex-shrink: 0;
        color: #fff;
        text-align: center;
        font-family: Arial;
        font-size: 0.24rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.32rem; /* 133.333% */
      }
    }
  }
}
</style>
