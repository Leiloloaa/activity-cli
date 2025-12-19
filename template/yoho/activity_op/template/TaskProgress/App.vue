<template>
  <div class="wrap" id="wrap" :class="{ oldversiton: isOldVersion }">
    <img class="default" v-show="!isActing" :src="`${imgUrl}/op2-df.png`" alt="" />
    <div class="panel" v-show="isActing">
      <van-swipe class="my-swipe" autoplay="2500" ref="swiper">
        <van-swipe-item>
          <div class="page" :class="TOOL_countryCode">
            <div class="v-bar">
              <div class="bar-wrap">
                <div class="bar" :style="{ height: barHeight }"></div>
              </div>
            </div>

            <div class="score1">
              {{ pageInfo?.task?.[currentLevel]?.required || 0 }}
              <img class="coin" :src="`${imgUrl}/coin.png`" alt="" />
            </div>

            <div class="score2">
              {{ pageInfo?.task?.[currentLevel]?.progress || 0 }}
              <img class="coin" :src="`${imgUrl}/coin.png`" alt="" />
            </div>

            <div class="title">
              <Outline :color="1 ? '0.02rem #971403' : '0.05rem #581604'" :text="TOOL_TEXT[70]" />

              <span class="span1">{{ pageInfo?.task?.[currentLevel]?.required -
                pageInfo?.task?.[currentLevel]?.progress || 0 }}</span>

              <!-- <Rep :content="TOOL_TEXT[70]" :rule="[
                {
                  reg: 's%',
                  eg: true,
                  val:
                    pageInfo?.task?.[currentLevel]?.required -
                    pageInfo?.task?.[currentLevel]?.progress || 0,
                  type: 'text',
                  options: { color: '#FFDC26', fontSize: 0.2, gap: 0.02 }
                }
              ]" /> -->
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
      url: '/api/activity/commonBusiness/sendTasks',
      params: { activityId: config.activityId },
      ajaxOperation: { func: getInfo }
    })
    let { data, errorCode } = res.data
    if (errorCode != 0) throw res
    Object.assign(pageInfo, data)
  } catch (error) { }
}

getInfo()

const rList = computed(() => {
  return [...pageInfo?.task]
  // return [...pageInfo?.taskInfos].reverse()
})

const currentLevel = computed(() => {
  let curLv = 0
  let list = pageInfo?.task || []
  let listLength = Number(list?.length) || 0
  list?.forEach((item, index) => {
    if (item.progress >= item.required && curLv + 1 < listLength) curLv++
  })
  console.log('当前进行等级==', curLv)
  return curLv
})

const barHeight = computed(() => {
  //type 1: 当前等级 curProgress/curRequired
  //type 2: 所有等级 curProgress/totalRequired
  //type 3: 分段计算 第一段是长度特殊设置, 后续段均等分
  //type 4: 分段计算 所有等级均等分
  const type = 1

  // type 3 时, 请设置第一段长度
  let Len1 = 0
  // type 3/4 时, 请设置进度条总长度
  let totalLen = 6.1

  let list = pageInfo?.task || []
  let listLength = Number(list?.length) || 0
  // let listLength = 4 //mock数据

  let curProgress = list?.[currentLevel.value]?.progress || 0
  let curRequired = list?.[currentLevel.value]?.required || 0

  let totalRequired = list?.[listLength - 1]?.required || 0

  if (type == 1) {
    return (curProgress / curRequired) * 100 + '%'
  } else if (type == 2) {
    return (curProgress / totalRequired) * 100 + '%'
  } else if (type == 3 || type == 4) {
    let avgLen = Number(
      type == 3 ? (totalLen - Len1) / (listLength - 1) : totalLen / listLength
    ).toFixed(5) // 平均长度
    console.log('平均长度', avgLen)

    let resLen = 0 // 实际长度

    list?.forEach((item, index) => {
      let percent = Number((item?.progress / item?.required) * 100).toFixed(5)
      let lvLen = Math.floor((percent * (index == 0 && type == 3 ? Len1 : avgLen)) / 100)
      resLen += lvLen
      console.log('percent==' + percent, 'index==' + index, 'type==' + type, 'lvLen==', lvLen)
    })

    console.log('resLen', resLen)
    return resLen + 'rem'
  }
})
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
        @include bg('op2-bg');

        margin: 0 auto;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        position: relative;

        .timer-wrapper {
          width: 1.92rem;
          height: 0.44rem;
          flex-shrink: 0;
          @include bg('op-time-bg');

          display: flex;
          justify-content: center;
          align-items: center;
        }

        .tips {
          width: 2rem;
          margin: 0 auto;
          margin-top: 0.12rem;

          display: flex;
          justify-content: center;
          align-items: center;

          span {
            width: 1.8rem;

            color: #fff6ae;
            text-align: center;
            font-family: 'Geeza Pro';
            font-size: 0.24rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.32rem;
            /* 133.333% */
          }
        }

        .rank {
          height: 0.32rem;
          margin-top: 0.17rem;

          display: flex;
          justify-content: center;
          align-items: center;

          .rank-icon {
            width: 0.25rem;
            height: 0.22rem;
            flex-shrink: 0;
            margin: 0 0.05rem;
            transform: translateY(-0.03rem);
          }

          span {
            color: #ffdc26;
            text-align: center;
            font-family: 'Geeza Pro';
            font-size: 0.22rem;
            font-style: normal;
            font-weight: 400;
            line-height: 0.32rem;
            /* 145.455% */
          }
        }

        .score {
          width: 1.76rem;
          height: 0.44rem;
          line-height: 0.44rem;
          /* 170% */
          flex-shrink: 0;
          @include bg('op-score');

          margin-top: 0.16rem;

          color: #FFEC41;
          text-align: center;
          font-family: Arial;
          font-size: 0.28rem;
          font-style: normal;
          font-weight: 700;
          line-height: 0.28rem;
          /* 100% */
        }

        .score1 {
          width: 1.56rem;

          color: #fff6ae;
          font-family: Arial;
          font-size: 0.24rem;
          font-style: normal;
          font-weight: 400;
          line-height: 0.28rem;
          /* 116.667% */

          position: absolute;
          top: 0.31rem;
          left: 0.69rem;
        }

        .score2 {
          width: 1.56rem;

          color: #fff6ae;
          font-family: Arial;
          font-size: 0.24rem;
          font-style: normal;
          font-weight: 400;
          line-height: 0.28rem;
          /* 116.667% */

          position: absolute;
          top: 0.96rem;
          left: 0.69rem;
        }

        .coin {
          width: 0.24rem;
          height: 0.24rem;
          transform: translateY(0.03rem);
        }

        .v-bar {
          width: 0.2rem;
          height: 0.98rem;
          flex-shrink: 0;

          position: absolute;
          top: 0.29rem;
          left: 0.24rem;
          z-index: 1;

          .bar-wrap {
            width: 0.2rem;
            height: 0.98rem;
            flex-shrink: 0;

            flex-shrink: 0;
            overflow: hidden;

            // border-radius: 0.8rem;
            // border: 2px solid #dc9f6e;
            @include bg('op-pre');

            position: relative;

            .bar {
              width: 0.26rem;

              border-radius: 0.2rem;
              background: linear-gradient(359deg, #FB2CFF 24%, #54FFCC 98.96%);

              position: absolute;
              bottom: 0rem;
            }
          }
        }

        .title {
          width: 1.8rem;
          height: 0.75rem;
          flex-shrink: 0;
          margin: 0 auto;
          margin-top: 1.57rem;

          border-radius: 0.1rem;
          // background: rgba(17, 29, 21, 0.66);


          span {
            width: 1.51rem;
            display: block;
            margin: 0 auto;

            color: #FFFFEA;
            text-align: center;
            -webkit-text-stroke-width: 1;
            -webkit-text-stroke-color: #971403;
            font-family: Arial;
            font-size: 0.16rem;
            font-style: normal;
            font-weight: 700;
            line-height: normal;
          }

          .span1 {
            margin-top: 0.06rem;
            color: #FFEC41;
            text-align: center;
            font-family: Arial;
            font-size: 0.28rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.28rem;
            /* 100% */
          }
        }

        &.EG {
          .v-bar {
            position: absolute;
            top: 0.24rem;
            left: 1.62rem;
            z-index: 1;
          }

          .score1 {
            direction: rtl;

            position: absolute;
            top: 0.24rem;
            left: 0rem;

            text-align: right;
          }

          .score2 {
            direction: rtl;

            position: absolute;
            top: 1.16rem;
            left: 0rem;

            text-align: right;
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
