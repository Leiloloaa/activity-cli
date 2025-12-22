<template>
  <div
    v-bg="`${isUser ? '' : info.idx <= 3 ? 'card1' : 'card'}`"
    :class="[
      'card',
      { 'card-top': isTop3, isUser: isUser, bInfo: config.showBottomInfo },
      `top${info.idx}`
    ]"
  >
    <div class="top-info" :style="{ height: info.idx >= 4 && !isUser ? '100%' : '' }">
      <img v-if="shouldShowStamp" class="stamp" :src="`${ossUrl}/stamp.png`" v-EG />

      <Space :val="isTop3 ? 0.42 : 0.52" />

      <div class="num fc">
        <img v-if="config.showTop3NumIcon && isTop3" :src="`${ossUrl}/num${info.idx}.png`" alt="" />
        <Outline v-else :color="`0.05rem #DA00B9`" :text="info.idx || info.rank || '99+'" noColor />
      </div>

      <Space :val="isTop3 ? 0.06 : 0" />
      <!-- <OptA :data="info || {}" :option="option" /> -->
      <Space :val="isTop3 ? 0 : 0" />

      <!-- 没有荣誉勋章 -->
      <template v-if="!config.showHonor || isUser">
        <Outline class="name ov" :color="'0.05rem #7D2759'" :text="info.name || '--'" noColor />
        <Space :val="0.2" />
        <div v-bg="'score'" class="score ov">{{ TOOL_NUM(info.score) || '--' }}</div>
      </template>

      <!-- 有荣誉勋章 -->
      <template v-else>
        <div>
          <div class="fc">
            <div class="name ov">{{ info.name || '---' }}</div>
            <Space :val="0.06" />
            <div v-bg="'score'" class="score ov">{{ TOOL_NUM(info.score) || '---' }}</div>
          </div>

          <div class="honor-bg fc" v-if="info?.name">
            <Honor :data="info" />
          </div>
        </div>
      </template>

      <!-- 层叠头像组件 -->
      <!-- <div class="superpose-avatar">
      <SuperposeAvatar :overlap="0.16">
        <div class="avatar-wrap" v-for="tp in 3">
          <cdnImg class="avatar" :fid="info?.top3?.[tp - 1] || ''"></cdnImg>
        </div>
      </SuperposeAvatar>
      </div> -->
    </div>

    <!-- 奖励信息 -->
    <div v-bg="'b-info'" class="bottom-info fc" v-if="shouldShowReward">
      <Space :val="0.3" />
      <img :src="`${yohoUi}/b-icon.png`" class="b-icon shake" />
      <Space :val="0.09" />
      <NoticeBar :w="6" :h="0.8">
        <template v-for="rewardObj in info.reward">
          <template v-if="info.idx >= rewardObj?.start && info.idx <= rewardObj?.end">
            <div class="rew-wrap fc" v-for="gift in rewardObj?.rewards">
              <Space :val="0.05" />
              <div v-bg="'b-rew'" class="rew fc">
                <cdnImg :info="gift" />
              </div>
              <Space :val="0.12" />
              <div class="text-wrap">
                <div class="text text-name">{{ getRew(gift)?.name }}</div>
                <div class="text text-days">{{ getRew(gift)?.num }}</div>
              </div>
            </div>
          </template>
        </template>
      </NoticeBar>
    </div>
  </div>
</template>

<script lang="ts" setup name="Card">
import injectTool from '@publicComponents/injectTool'

const props = withDefaults(
  defineProps<{
    info: any
    isUser?: boolean
    type?: number | string // card 类型，不同背景
    isDailyRank?: boolean // 日榜/总榜
  }>(),
  {
    info: () => ({
      idx: 0,
      rank: 0,
      name: '--',
      score: 0,
      isNewUser: false,
      isReturnUser: false,
      status: 0,
      stamp: false,
      reward: []
    }),
    isUser: false,
    isDailyRank: true
  }
)

// 1. 配置
const config = {
  showBottomInfo: 1, // 是否显示奖励信息？
  showTop3NumIcon: 1, // 是否显示前三名次图标？
  bInfoNum: 3, // 前几名奖励信息？
  showHonor: 0, // 是否显示荣誉勋章？
  showNewOrBack: 0 // 是否显示新人或回流标识？
}

// 2. 配置对象优化 - 保持灵活性
const optionList = {
  1: {
    styles:
      '' ||
      `width: 1.9775rem;
height: 1.995rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a1' }],
    avatar:
      `` ||
      `width: 1.4rem;
height: 1.4rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.3rem;`,
    liveIcon: `width: 0.196rem;`
  },
  2: {
    styles:
      `` ||
      `width: 1.9775rem;
height: 1.995rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a2' }],
    avatar:
      `` ||
      `width: 1.4rem;
height: 1.4rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.3rem;`,
    liveIcon: `width: 0.196rem;`
  },
  3: {
    styles:
      `` ||
      `width: 1.9775rem;
height: 1.995rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a3' }],
    avatar:
      `` ||
      `width: 1.4rem;
height: 1.4rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.3rem;`,
    liveIcon: `width: 0.196rem;`
  },
  0: {
    styles:
      `` ||
      `width: 1.80094rem;
height: 1.81688rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a' }],
    avatar:
      `` ||
      `width: 1.275rem;
height: 1.275rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.3rem;`,
    liveIcon: `width: 0.196rem;`
  }
}

const getRew = inject('getRew')
const ossUrl = inject('ossUrl')
const yohoUi = inject('yohoUi')
const { TOOL_countryCode, TOOL_NUM, TOOL_TEXT } = injectTool()

// 计算属性优化
const isTop3 = computed(() => Number(props.info.idx) <= 3 && !props?.isUser)
// 本地环境，直接显示
const shouldShowStamp = computed(
  () => ENV == 'develop' || (props.info.status === 0 && props.info.stamp)
)
const shouldShowNewOrBack = computed(
  () => (props.info.isNewUser || props.info.isReturnUser) && !props?.isUser && config.showNewOrBack
)
const shouldShowReward = computed(
  () => props?.isDailyRank && !props?.isUser && Number(props.info.idx) <= config.bInfoNum
)

const option = computed(() => {
  let baseOption
  if (isTop3.value && !props.isUser) {
    baseOption = optionList[props.info.idx]
  } else {
    baseOption = optionList['0']
  }

  // 处理 adorns 中的 styles，如果没有值则使用上层的 styles
  const processedOption = {
    ...baseOption,
    adorns: baseOption.adorns.map((adorn) => ({
      ...adorn,
      styles: adorn.styles || baseOption.styles
    }))
  }

  return processedOption
})
</script>

<style lang="scss" scoped>
.card {
  width: 7.18rem;
  height: 1.98rem;
  flex-shrink: 0;
  aspect-ratio: 359/99;

  margin: 0 auto;
  margin-bottom: 0.08rem;

  display: flex;
  align-items: center;

  position: relative;

  &.card-top {
    width: 7.18rem;
    height: 2.6rem;
    flex-shrink: 0;
    margin-bottom: 0.14rem;

    .top-info {
      margin-top: -0.06rem;

      .name {
      }

      .score {
      }

      .stamp {
        top: -0.8rem;
      }
    }

    .bottom-info {
    }
  }

  .top-info {
    width: 100%;
    display: flex;
    align-items: center;

    .stamp {
      width: 2.28rem;
      height: 1.86rem;

      object-fit: contain;

      position: absolute;
      top: -0.8rem;
      right: -0.2rem;
      z-index: 48;
    }

    .num {
      width: 0.5rem;
      height: 0.4rem;

      img {
        width: 100%;
        height: 100%;
      }

      span {
        color: #ffc889;
        text-align: right;
        font-family: 'SF UI Text';
        font-size: 0.26rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.28rem; /* 107.692% */
      }
    }

    .name {
      width: 1.95rem;
      height: 0.31rem;

      color: #ffedbd;
      font-family: 'SF UI Text';
      font-size: 0.26rem;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }

    .new-or-back {
      width: 1.3rem;
      height: 0.32rem;
      flex-shrink: 0;
      position: relative;
      margin-left: 0.05rem;

      img {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }

      span {
        position: relative;
        z-index: 2;
        color: #ffe89a;
        text-align: center;
        font-family: Arial;
        font-size: 0.18rem;
        font-style: normal;
        font-weight: 700;
        line-height: 0.28rem; /* 155.556% */
      }
    }

    .score {
      width: 1.76rem;
      height: 0.56rem;
      flex-shrink: 0;

      color: #ffc889;
      text-align: right;
      font-family: 'SF UI Text';
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 500;
      line-height: 0.28rem; /* 116.667% */

      text-align: center;
      line-height: 0.56rem !important;
    }

    .honor-bg {
      width: 4.12rem;
      height: 0.4rem;
      flex-shrink: 0;

      margin-top: 0.16rem;
    }
  }

  .bottom-info {
    width: 6.4rem;
    height: 0.8rem;
    display: flex;
    align-items: center;

    margin-top: -0.28rem;

    .b-icon {
      width: 0.70057rem;
      height: 0.69818rem;
      flex-shrink: 0;
    }

    .rew-wrap {
      .rew {
        width: 0.64rem;
        height: 0.64rem;
        flex-shrink: 0;

        img {
          width: 0.56rem;
          height: 0.56rem;
          flex-shrink: 0;
          object-fit: contain;
        }
      }

      .text-wrap {
        min-width: 0.56rem;

        display: flex;
        justify-content: center;
        flex-direction: column;
        .text {
          color: #fff29d;
          text-align: right;
          font-family: 'SF UI Text';
          font-size: 0.22rem;
          font-style: normal;
          font-weight: 400;
          line-height: 0.28rem; /* 127.273% */
        }
      }
    }
  }

  &.top1 {
    .top-info {
      margin-top: -0.1rem;
      .num {
        span {
        }
      }

      .name {
      }

      .score {
      }
    }
  }

  &.top2 {
    .top-info {
      .num {
        span {
        }
      }

      .name {
      }

      .score {
      }
    }
  }

  &.top3 {
    .top-info {
      .num {
        span {
        }
      }

      .name {
      }

      .score {
      }
    }
  }

  &.isUser {
    .top-info {
      .num {
        span {
        }
      }

      .name {
      }

      .score {
      }
    }
  }

  &.bInfo {
    flex-direction: column;
  }
}
</style>
