<template>
  <!-- 前三名 -->
  <div class="top-three" :class="TOOL_countryCode">
    <img :src="`${ossUrl}/top3-bg${TOOL_countryCode == 'EG' ? '' : ''}.png`" class="top3-bg" />
    <template v-for="item in [1, 0, 2]" :key="'top' + info.idx">
      <div :class="['top-item', `top${item + 1}`]">
        <img
          :src="`${ossUrl}/stamp.png`"
          v-if="info.status == 0 && info.list[item] && info.list[item].stamp"
          class="stamp"
        />

        <!-- <OptA :data="info.list?.[item] || {}" :option="getOption(item)" /> -->

        <Outline
          class="name ov"
          :color="'0.05rem #7F0505'"
          :text="(info.list[item] && info.list[item].name) || '--'"
        />

        <!-- 荣誉组件 -->
        <!-- <div class="honor-wrap fc">
          <Honor :data="info.list[item] || {}" top3 />
        </div> -->

        <div v-bg="'score'" class="score ov">
          {{ (info.list[item] && TOOL_NUM(info.list[item].score)) || '---' }}
        </div>

        <!-- 新人或回流标识 -->
        <div
          class="new-or-back fc"
          v-if="
            info.list[item] &&
            (info.list[item].isNewUser || info.list[item].isReturnUser) &&
            showNewOrBack
          "
        >
          <img :src="`${ossUrl}/${info.list?.[item]?.isNewUser ? 'n1' : 'n1'}.png`" />
          <NoticeBar :w="1.3" :h="0.32">
            <span style="min-width: 1.3rem">{{
              TOOL_TEXT[info?.list?.[item]?.isNewUser ? 107 : 107]
            }}</span>
          </NoticeBar>
        </div>

        <!-- 层叠头像组件 -->
        <!-- <div class="superpose-avatar">
          <SuperposeAvatar :overlap="0.16">
            <div class="avatar-wrap" v-for="tp in 3">
              <cdnImg class="avatar" :fid="info?.list?.[item].top3?.[tp - 1] || ''"></cdnImg>
            </div>
          </SuperposeAvatar>
        </div> -->
      </div>

      <!-- 第一名和二三名的间距 -->
      <Space :val="-0.75" v-if="item !== 2" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import injectTool from '@publicComponents/injectTool'

const ossUrl = inject('ossUrl')
const { TOOL_countryCode, TOOL_NUM, TOOL_TEXT } = injectTool()

const props = withDefaults(defineProps<{ info: any }>(), {})

const showNewOrBack = 0 // 是否显示新人或回流标识？

const option = {
  0: {
    styles:
      `` ||
      `width: 3.53125rem;
height: 3.5625rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a1' }],
    avatar:
      `` ||
      `width: 2.5rem;
height: 2.5rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.5rem;`,
    liveIcon: `width: 0.196rem;`
  },
  1: {
    styles:
      `` ||
      `width: 2.825rem;
height: 2.85rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a2' }],
    avatar:
      `` ||
      `width: 2rem;
height: 2rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.5rem;`,
    liveIcon: `width: 0.196rem;`
  },
  2: {
    styles:
      `` ||
      `width: 2.825rem;
height: 2.85rem;
flex-shrink: 0;`,
    adorns: [{ img: 'a3' }],
    avatar:
      `` ||
      `width: 2rem;
height: 2rem;
flex-shrink: 0;`,
    live: `width: 0.4rem; height: 0.24rem; bottom: 0.5rem;`,
    liveIcon: `width: 0.196rem;`
  }
}

const getOption = (item) => {
  let baseOption = option[item]
  // 处理 adorns 中的 styles，如果没有值则使用上层的 styles
  const processedOption = {
    ...baseOption,
    adorns: baseOption.adorns.map((adorn) => ({
      ...adorn,
      styles: adorn.styles || baseOption.styles
    }))
  }

  return processedOption
}
</script>

<style lang="scss" scoped>
// top3 的起始位置由 top1 头像的位置决定
.top-three {
  width: 7.5rem;
  margin: 0 auto;
  margin-top: 0.02rem;
  margin-bottom: 0.4rem;

  display: flex;
  justify-content: center;
  position: relative;

  .top3-bg {
    width: 7.5rem;
    height: 9.16rem;
    flex-shrink: 0;

    position: absolute;
    top: -1.4rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
  }

  .top-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;

    .desc {
      position: absolute;
      top: -0.25rem;
      left: 50%;
      transform: translateX(-50%);

      width: 0.8rem;
      height: 0.8rem;
      flex-shrink: 0;
      z-index: 9;
    }

    .stamp {
      width: 2.28rem;
      height: 1.86rem;

      object-fit: contain;

      position: absolute;
      top: -0.4rem;
      right: -0.5rem;
      z-index: 4;

      &.EG {
        left: -0.5rem;
        right: auto;
      }
    }

    .name {
      width: 1.84rem;
      height: 0.3rem;
      flex-shrink: 0;

      margin-top: -0.4rem;

      color: #ffedbd;
      text-align: center;
      -webkit-text-stroke-width: 2px;
      -webkit-text-stroke-color: #7f0505;
      font-family: 'SF UI Text';
      font-size: 0.28rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.28rem; /* 100% */

      text-align: center;

      position: relative;
      z-index: 5;
    }

    .score {
      width: 1.76rem;
      height: 0.56rem;
      flex-shrink: 0;

      margin-top: 0.08rem;

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

    .new-or-back {
      width: 1.3rem;
      height: 0.32rem;
      flex-shrink: 0;
      position: relative;
      margin-top: 0.08rem;

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
    .honor-wrap {
      width: 2rem;
      min-height: 0.86rem;
      flex-shrink: 0;
    }
  }

  .top1 {
    z-index: 3;

    .desc {
      right: 0.16rem;
    }

    .stamp {
      // top: 0.28rem;
    }

    .name {
    }
  }

  .top2,
  .top3 {
    margin-top: 1.8rem;

    .stamp {
      right: -0.4rem;
    }

    .name {
    }
  }
}
</style>
