<template>
  <div class="popup-content">
    <div class="title fc">
      <span>{{ TOOL_TEXT[41] }}</span>
    </div>
    <div class="tip fc">
      <span>{{ TOOL_TEXT[42] }}</span>
    </div>
    <div class="reward-wrap fc">
      <div class="item fc" v-for="item in rewardList">
        <cdnImg
          :fid="item?.dynamicImage || item?.staticImage"
          class="reward-img"
        />
        <div class="reward-count fc">
          <span>{{ getRewardNum(item) }}</span>
        </div>
      </div>
    </div>

    <div class="btn fc" @click="close">
      <span>{{ TOOL_TEXT[43] }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import injectTool from "@publicComponents/injectTool";
import useReward from "../hooks/useReward";

const { TOOL_TEXT } = injectTool();
const { getRewardNum } = useReward();

const props = defineProps<{ rewardList: any[] }>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const close = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
@import "../scss/public_mixin.scss";

.popup-content {
  width: 6.69rem;
  height: 6.96rem;
  @include bg("d-bg");

  .title {
    width: 4.18rem;
    height: 1.06rem;
    @include bg("d-title");
    margin: 0 auto;

    span {
      color: #702b09;
      text-align: center;
      font-family: "SF Arabic";
      font-size: 0.26rem;
      font-style: normal;
      font-weight: 711;
      line-height: 0.28rem; /* 107.692% */
    }
  }

  .tip {
    width: 5.45rem;
    margin: 0 auto;
    margin-top: 0.8rem;
    span {
      color: #ffebce;
      text-align: center;
      font-family: "SF Arabic";
      font-size: 0.32rem;
      font-style: normal;
      font-weight: 400;
      line-height: 0.4rem; /* 125% */
    }
  }

  .reward-wrap {
    width: 5.45rem;
    margin: 0 auto;
    margin-top: 0.3rem;
    gap: 0.86rem;

    .item {
      width: 1.28rem;
      height: 1.28rem;
      @include bg("login-rew");

      // margin-left: 0.43rem;
      // margin-right: 0.43rem;

      position: relative;

      .reward-img {
        width: 1.04rem;
        height: 1.04rem;
        object-fit: contain;
      }

      .reward-count {
        width: 0.86rem;
        height: 0.24rem;
        @include bg("login-corner");

        position: absolute;
        bottom: -0.3rem;
        left: 50%;
        transform: translateX(-50%);

        span {
          color: #702b09;
          text-align: center;
          font-family: Arial;
          font-size: 0.2rem;
          font-style: normal;
          font-weight: 700;
          line-height: 0.28rem; /* 140% */
        }
      }
    }
  }

  .btn {
    width: 1.54rem;
    height: 0.48rem;
    @include bg("d-close-btn");
    margin: 0 auto;
    margin-top: 1.5rem;

    span {
      color: #fffdd0;
      text-align: center;
      font-family: Arial;
      font-size: 0.24rem;
      font-style: normal;
      font-weight: 700;
      line-height: 0.32rem; /* 133.333% */
    }
  }
}
</style>
