<template>
  <div
    v-bg="'info'"
    class="info fc"
    :class="{ 'card-user': isCardStyle, 'normal-user': !isCardStyle }"
  >
    <Card :info="{ ...info, idx: info.rank }" isUser v-if="isCardStyle" />
    <div class="cards" v-else>
      <Space :val="0.24" />
      <div class="num fc">
        <span>{{ info.rank }}</span>
      </div>
      <Space :val="0.24" />
      <!-- <OptA :data="info || {}" :option="option" /> -->
      <Space :val="0.24" />

      <!-- 没有荣誉勋章的情况 -->
      <div class="name ov">{{ info.name || '---' }}</div>
      <div class="score ov">
        {{ TOOL_NUM(info.score) || '---' }}
      </div>

      <!-- 有荣誉勋章的情况 -->
      <!-- <div :style="{ marginTop: info.selDate != 999 && Number(info.idx) <= 3 ? '0.42rem' : '0.24rem' }">
      <div class="fc">
        <div class="name ov">{{ info.name || '---' }}</div>
        <div class="score ov">
          {{ TOOL_NUM(info.score) || '---' }}
        </div>
      </div>

      <div class="honor-bg fc">
        <Honor :data="info" />
      </div>
      </div> -->

      <!-- 层叠头像组件 -->
      <!-- <div class="superpose-avatar">
      <SuperposeAvatar :overlap="0.16">
        <div class="avatar-wrap" v-for="tp in 3">
          <cdnImg class="avatar" :fid="info?.top3[tp - 1] || ''"></cdnImg>
        </div>
      </SuperposeAvatar>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup name="userInfo">
import injectTool from '@publicComponents/injectTool'
import Card from './Card.vue'

const { TOOL_countryCode, TOOL_NUM } = injectTool()
const imgUrl = inject('imgUrl')

defineProps({
  info: {
    type: Object,
    default: () => {}
  },
  isCardStyle: {
    type: Boolean,
    default: false
  }
})

const option = {
  styles: `width: 1.55375rem;
height: 1.5675rem;
flex-shrink: 0;`,
  adorns: [
    {
      img: 'a',
      styles: `width: 1.55375rem;
height: 1.5675rem;
flex-shrink: 0;`
    }
  ],
  avatar: `width: 1.1rem;
height: 1.1rem;`,
  live: `width: 0.41rem;height: 0.24rem;bottom: 0.2rem;`,
  liveIcon: `width: 0.18rem;`
}
</script>

<style lang="scss" scoped>
.info {
  width: 7.5rem;
  height: 1.68rem;
  flex-shrink: 0;

  position: fixed;
  left: 0rem;
  bottom: -0.01rem;
  z-index: 49;

  :deep(.card) {
    background: none !important;
    margin-bottom: 0rem !important;
    .top-info {
      height: 100%;
      margin-top: 0.21rem;

      .stamp {
        display: none !important;
      }
    }
  }

  .normal-user {
    &::after {
      z-index: -1;
      position: absolute;
      content: '';
      width: 100%;
      height: 100%;
    }

    .cards {
      display: flex;
      align-items: center;
      width: 6.5rem;

      margin: 0 auto;

      position: relative;

      .num {
        width: 0.6rem;
        height: 0.74rem;

        span {
          color: #fff;
          text-align: center;
          font-family: Arial;
          font-size: 0.32rem;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      }

      .name {
        width: 2.01rem;
        height: 0.4rem;
        color: #fff;
        font-family: Arial;
        font-size: 0.35rem;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        text-align: center;
        margin-left: 0.2rem;
        margin-right: 0.5rem;
      }

      .score {
        width: 1.72rem;
        height: 0.42rem;
        flex-shrink: 0;

        color: #fff;
        font-family: Arial;
        font-size: 0.32rem;
        font-style: normal;
        font-weight: 400;

        // 行高要注意和 height 保持，有时还得 padding-top
        line-height: 0.42rem;

        text-align: center;
      }
    }
  }
}
</style>
