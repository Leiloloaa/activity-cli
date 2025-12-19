<template>
  <van-swipe class="my-swipe" autoplay="12500" ref="swiper">
    <!-- 动图 -->
    <van-swipe-item>
      <div class="page page-1">
        <img :src="`${ossUrl}/op1.png`" alt="" />
      </div>
    </van-swipe-item>

    <!-- 用户榜、主播榜 -->
    <van-swipe-item>
      <OssImg src="op-bg" class="page page-2">
        <Space :val="0.26" h />
        <JumpAvatar
          :data="info?.userInfo"
          :pic="avatarConfig.pic"
          :option="avatarConfig.option"
          :styleConfig="avatarConfig.style"
        />
        <Space :val="0.05" h />
        <div class="msg-container">
          <OssImg
            src="op-content"
            class="msg"
            v-for="(item, index) in [
              info?.isEndDate ? getInfo('user')?.total : getInfo('user')?.daily,
              info?.isEndDate ? getInfo('anchor')?.total : getInfo('anchor')?.daily
            ]"
            :key="'msg' + index"
          >
            <div class="rank-container">
              <span class="rank-text"> {{ TOOL_TEXT[item.textKey] }} </span>
              <div class="rank-right">
                <div class="rank fc">
                  <img class="op-rank" :src="`${ossUrl}/op-rank.png`" alt="" />
                  <Space :val="0.02" />
                  {{ item?.rank || '99+' }}
                </div>

                <div class="score">
                  <img class="obg" :src="`${ossUrl}/op-score.png`" alt="" />
                  <span class="text">{{ item?.score || '--' }}</span>
                </div>
              </div>
            </div>
          </OssImg>
        </div>
      </OssImg>
    </van-swipe-item>

    <!-- 新人榜 -->
    <van-swipe-item>
      <OssImg src="op-bg" class="page page-2">
        <Space :val="0.26" h />
        <JumpAvatar
          :data="info?.userInfo"
          :pic="avatarConfig.pic"
          :option="avatarConfig.option"
          :styleConfig="avatarConfig.style"
        />
        <Space :val="0.05" h />
        <div class="msg-container">
          <OssImg
            src="op-content"
            class="msg"
            v-for="(item, index) in [
              info?.isEndDate ? getInfo('newUser')?.total : getInfo('newUser')?.daily
            ]"
            :key="'msg' + index"
          >
            <div class="rank-container">
              <span class="rank-text"> {{ TOOL_TEXT[item.textKey] }} </span>

              <div class="rank-right">
                <div class="rank fc">
                  <img class="op-rank" :src="`${ossUrl}/op-rank.png`" alt="" />
                  <Space :val="0.02" />
                  {{ item?.rank || '99+' }}
                </div>

                <div class="score">
                  <img class="obg" :src="`${ossUrl}/op-score.png`" alt="" />
                  <span class="text">{{ item?.score || '--' }}</span>
                </div>
              </div>
            </div>
          </OssImg>
        </div>
      </OssImg>
    </van-swipe-item>
  </van-swipe>
</template>

<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool'

const ossUrl = inject('ossUrl')
const info: any = inject('info')
const { TOOL_TEXT } = injectTool()

// 头像配置
const avatarConfig = {
  style: {
    frame: {
      width: '0.81219rem',
      height: '0.81938rem'
    },
    avatar: {
      width: '0.575rem',
      height: '0.575rem'
    }
  },
  pic: { sofa: 'sofa', frame: 'a', live: 'live' },
  option: { radius: 1, live: 1, alwaysLive: 0, jump: 0 }
}

// 配置映射
const infoConfig = {
  user: {
    daily: { key: 'userInfoDaily', textKey: 148 },
    total: { key: 'userInfoTotal', textKey: 150 }
  },
  anchor: {
    daily: { key: 'anchorInfoDaily', textKey: 149 },
    total: { key: 'anchorInfoTotal', textKey: 151 }
  },
  newUser: {
    daily: { key: 'newUserInfoDaily', textKey: 152 },
    total: { key: 'newUserInfoTotal', textKey: 153 }
  }
}

const getInfo = (type) => {
  const config = infoConfig[type]
  if (!config) {
    return {
      daily: { rank: '99+', score: '--', textKey: null },
      total: { rank: '99+', score: '--', textKey: null }
    }
  }

  return {
    daily: {
      rank: info?.[config.daily.key]?.rank,
      score: info?.[config.daily.key]?.score,
      textKey: config.daily.textKey
    },
    total: {
      rank: info?.[config.total.key]?.rank,
      score: info?.[config.total.key]?.score,
      textKey: config.total.textKey
    }
  }
}
</script>

<style lang="scss">
.page-1 {
  width: 2rem;
  height: 2.4rem;
  margin: 0 auto;

  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.page-2 {
  width: 2rem;
  height: 2.4rem;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;

  .msg-container {
    .msg {
      width: 2rem;
      height: 0.48rem;
      flex-shrink: 0;

      margin-bottom: 0.12rem;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      position: relative;
      z-index: 1;

      .rank-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.08rem;

        position: relative;
        z-index: 1;
        .rank-text {
          color: #f7ff5b;
          text-align: center;
          font-family: Arial;
          font-size: 0.12rem;
          font-style: normal;
          font-weight: 700;
          line-height: 0.12rem; /* 100% */
        }
        .rank-right {
          display: flex;
          flex-direction: column;
        }

        .rank {
          color: #ecff1f;
          text-align: center;
          font-family: 'SF UI Text';
          font-size: 0.14rem;
          font-style: normal;
          font-weight: 700;

          .op-rank {
            width: 0.16rem;
            height: 0.12rem;
            flex-shrink: 0;
          }
        }

        .score {
          width: 0.88rem;
          height: 0.22rem;
          flex-shrink: 0;
          margin-top: -0.01rem;

          display: flex;
          justify-content: center;
          align-items: center;

          position: relative;
          z-index: 1;
          img {
            width: 100%;
            height: 100%;
          }
          span {
            color: #ffe598;
            text-align: center;
            font-family: 'SF UI Text';
            font-size: 0.12rem;
            font-style: normal;
            font-weight: 700;
            line-height: 0.22rem; /* 266.667% */

            position: relative;
            z-index: 2;
          }
        }
      }
    }
  }
}
</style>
