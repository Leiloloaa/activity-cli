<template>
  <div class="wrap" id="wrap" :class="{ oldversiton: isOldVersion }">
    <img class="default" v-show="!isActing"
      :src="`${imgUrl}/head-${TOOL_countryCode}${PROJECT == 2 ? '-chatchill' : ''}.png`" alt="" />
    <div class="panel" v-show="isActing">
      <van-swipe class="my-swipe" autoplay="2500" ref="swiper">
        <!-- 送礼日榜 -->
        <van-swipe-item>
          <div class="page">
            <Timer :timeLeft="pageInfo.timeLeft" :status="pageInfo.status" :style="{ 'margin-top': '0rem' }" />
            <div class="info fc">
              <Outline :color="1 ? '0.02rem #971403' : '0.05rem #581604'" :text="TOOL_TEXT[36]" />
            </div>

            <div class="rank fc">
              <img :src="`${imgUrl}/op-top.png`" class="op-top">
              <Space :val="0.03" />
              <Outline :color="1 ? '0.05rem #971403' : '0.05rem #581604'" :text="pageInfo.userInfoDaily?.rank" />
            </div>

            <div class="score fc">
              <span>{{ pageInfo.userInfoDaily?.score }}</span>
            </div>
          </div>
        </van-swipe-item>
        <!-- 收礼日榜 -->
        <van-swipe-item>
          <div class="page">
            <Timer :timeLeft="pageInfo.timeLeft" :status="pageInfo.status" :style="{ 'margin-top': '0rem' }" />
            <div class="info fc">
              <Outline :color="1 ? '0.02rem #971403' : '0.05rem #581604'" :text="TOOL_TEXT[37]" />
            </div>

            <div class="rank fc">
              <img :src="`${imgUrl}/op-top.png`" class="op-top">
              <Space :val="0.03" />
              <Outline :color="1 ? '0.05rem #971403' : '0.05rem #581604'" :text="pageInfo.anchorInfoDaily?.rank" />
            </div>

            <div class="score fc">
              <span>{{ pageInfo.anchorInfoDaily?.score }}</span>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool'
import { getQueryString } from '@libraryParams/params'
import { config } from './config'

const { imgUrl, activityId } = config
provide('imgUrl', imgUrl)
provide('activityId', activityId)
let { TOOL_httpClient, TOOL_TEXT, TOOL_countryCode, TOOL_NUM } = injectTool()

// DOCUMENT TITLE
watchEffect(() => (document.title = TOOL_TEXT[2] || 'Loading...'))

document.documentElement.style.fontSize = '50vw'
const isOldVersion = ref(
  String(activityId).startsWith('1') &&
    getQueryString('version') < 4036000 &&
    getQueryString('version') != null
    ? true
    : false
)

const isActing = computed(() => {
  return pageInfo.status == 1
})

const pageInfo = reactive({
  status: 1,
  timeLeft: 0
})

const getInfo = async () => {
  try {
    const res = await TOOL_httpClient({
      method: 'get',
      url: '/api/activity/commonBusiness/rankOperation',
      params: { activityId: config.activityId },
      ajaxOperation: { func: getInfo }
    })
    let { data, errorCode } = res.data
    if (errorCode != 0) throw res
    Object.assign(pageInfo, data)
  } catch (error) { }
}

getInfo()
</script>

<style lang="scss">
@import './scss/public_mixin.scss';

.wrap {
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

    .page {
      width: 2rem;
      height: 2.4rem;
      @include bg('op1-bg');

      margin: 0 auto;

      display: flex;
      flex-direction: column;
      // justify-content: center;
      align-items: center;

      .timer-wrap {
        margin-top: 0;
        margin-bottom: 0.1rem;
      }

      .info {
        width: 1.29rem;
        height: 0.46rem;

        margin-top: 0.15rem;

        margin-bottom: 0.1rem;

        color: #FFFFEA;
        text-align: center;
        -webkit-text-stroke-width: 1;
        -webkit-text-stroke-color: #971403;
        font-family: Arial;
        font-size: 0.2rem;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
      }

      .rank {
        img {
          width: 0.56rem;
          height: 0.53rem;
          flex-shrink: 0;
        }

        span {
          color: #FFF854;
          text-align: center;
          -webkit-text-stroke-width: 1;
          -webkit-text-stroke-color: #971403;
          font-family: Arial;
          font-size: 0.48rem;
          font-style: normal;
          font-weight: 700;
          line-height: normal;
        }
      }

      .score {
        width: 1.68rem;
        height: 0.4rem;
        flex-shrink: 0;
        @include bg('op-score');
        margin-top: 0.04rem;

        span {
          color: #FFF8D3;
          text-align: center;
          font-family: Arial;
          font-size: 0.26rem;
          font-style: normal;
          font-weight: 400;
          line-height: 0.34rem;
          /* 130.769% */
        }
      }
    }
  }
}

#wrap {}

@media screen and (max-width: 70px) {
  #wrap {
    .default {
      display: block !important;
    }

    .panel {
      display: none;
    }
  }
}
</style>
