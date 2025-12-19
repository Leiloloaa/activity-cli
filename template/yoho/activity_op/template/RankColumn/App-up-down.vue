<template>
  <div class="wrap" id="wrap" :class="{ oldversiton: isOldVersion }">
    <img class="default" v-show="!isActing"
      :src="`${imgUrl}/head-${TOOL_countryCode}${PROJECT == 2 ? '-chatchill' : ''}.png`" alt="" />
    <div class="panel" v-show="isActing">
      <van-swipe class="my-swipe" autoplay="2500" ref="swiper">
        <van-swipe-item>
          <div class="page">
            <!-- content -->
            <div class="title fc">
              <Outline :color="1 ? '0.02rem #FFFD7C' : '0.05rem #581604'" :text="TOOL_TEXT[104]" />
            </div>
            <Space :val="0.24" h />
            <OptAvatar style="pointer-events: none" :data="pageInfo?.senderInfo || {}" :option="{
              w: 1.04,
              h: 1.04,
              adorns: [
                {
                  img: `avatar`,
                  w: '100%',
                  h: '100%'
                }
              ],
              avatar: {
                w: 0.71,
                h: 0.71
              },
              live: {
                display: 'none'
              }
            }" />
            <div class="content">
              <Space :val="0.2" h />
              <!-- 日榜 -->
              <div class="content-title">{{ TOOL_TEXT[107] }}</div>
              <div class="info fc">
                <div class="score fc"><span>{{ pageInfo.userInfo?.score || '--' }}</span></div>
                <Space :val="0.08" />
                <div class="rank">{{ pageInfo.userInfo?.rank || '--' }}</div>
              </div>

              <!-- 总榜 -->
              <div class="content-title">{{ TOOL_TEXT[108] }}</div>
              <div class="info fc">
                <div class="score fc"><span>{{ pageInfo.userInfo?.score || '--' }}</span></div>
                <Space :val="0.08" />
                <div class="rank">{{ pageInfo.userInfo?.rank || '--' }}</div>
              </div>
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
const { TOOL_httpClient, TOOL_TEXT, TOOL_countryCode, TOOL_NUM } = injectTool()

// DOCUMENT TITLE
watchEffect(() => (document.title = TOOL_TEXT[2] || 'Loading...'))

const pageInfo = reactive({
  status: 1,
  timeLeft: 0
})

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

    .my-swipe {
      .page {
        width: 2rem;
        height: 2.4rem;
        @include bg('op-bg');

        margin: 0 auto;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        position: relative;


        .title {
          width: 1.68rem;
          height: 0.32rem;

          position: absolute;
          top: 0.16rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;

          span {
            color: #FF5629;
            text-align: center;
            -webkit-text-stroke-width: 1;
            -webkit-text-stroke-color: #FFFD7C;
            font-family: Arial;
            font-size: 0.16rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.16rem;
            /* 100% */
          }
        }

        .content {
          width: 1.92rem;
          height: 1.28rem;
          flex-shrink: 0;

          margin-top: -0.24rem;
          border-radius: 0.16rem;
          border: 0.01rem solid #78FF78;
          background: linear-gradient(180deg, #3EE5FF 0%, #00EAAB 100%);

          .content-title {
            margin-bottom: 0.04rem;
            color: #005967;
            text-align: center;
            font-family: "Geeza Pro";
            font-size: 0.14rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.16rem;
            /* 114.286% */
          }

          .info {
            margin-bottom: 0.1rem;

            .score {
              width: 0.96rem;
              height: 0.24rem;
              flex-shrink: 0;

              border-radius: 0.8rem;
              border: 0.01rem solid #FF9D00;
              background: linear-gradient(180deg, #EDFF4C 0%, #FFBA17 100%);

              span {
                color: #C74200;
                text-align: center;
                font-family: Arial;
                font-size: 0.14rem;
                font-style: normal;
                font-weight: 700;
                line-height: 0.24rem;
              }
            }

            .rank {
              width: 0.58rem;
              color: #FF5900;
              text-align: center;
              font-family: Arial;
              font-size: 0.2rem;
              font-style: normal;
              font-weight: 700;
              line-height: normal;
            }
          }
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
